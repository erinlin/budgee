## Context

Budgee 目前的花費模型只有 `split`（均攤）和 `per-item`（選項型）兩種類別，所有花費都有明確的「代墊人」和「分攤成員」。現在需要加入「公費」概念：成員預繳公費到共同池，之後從池中支出的花費自動均攤給預繳成員，不需要代墊人。

現有資料結構：
- `Expense.category` 只允許 `'split' | 'per-item'`（與 `ExpenseCategory` type 不同步，後者多了 `'general'`）
- `Expense.paidBy` 指向代墊人 memberId，可為 null
- `MemberBalance` 只有一般餘額，無公費維度
- `pdfExport.ts` 內有獨立複製的 `calcBalances` 邏輯

## Goals / Non-Goals

**Goals:**
- 支援公費預收與公費支出的完整生命週期
- 餘額總表、個人頁面、PDF 正確呈現公費資訊
- 公費與現有分攤/選項型花費互不干擾
- 不需要 DB schema 變更（Dexie 版本不升級）

**Non-Goals:**
- 公費支出不支援「代墊人」概念
- 不做公費的按比例分攤（統一均攤）
- 不做公費的獨立管理頁面（融入現有花費列表）
- 不做公費的跨旅程結轉

## Decisions

### D1: 公費作為 Expense category，不新增資料表

**選擇**: 將公費視為 `Expense` 的新 category `'public-fund'`，透過 `title` 或新增欄位區分「預收公費」與「從公費支出」。

**替代方案**: 新增獨立的 `PublicFund` 資料表。
**為何不選**: 增加 DB schema 複雜度，需要 Dexie 版本升級，且匯出入需額外處理。公費本質上就是一種花費紀錄，共用 `Expense` 表格更自然。

### D2: 用 `fundSubType` 欄位區分預收與支出

**選擇**: 在 `Expense` 新增可選欄位 `fundSubType?: 'pre-collect' | 'expense'`，僅在 `category === 'public-fund'` 時有意義。

- 預收公費：`category: 'public-fund'`, `fundSubType: 'pre-collect'`, `paidBy: null`, `splits` 記錄每位繳費成員（金額統一）
- 從公費支出：`category: 'public-fund'`, `fundSubType: 'expense'`, `paidBy: null`, `splits` 記錄均攤成員（自動計算為所有有預收紀錄的成員）

**替代方案**: 用 `title` 字串判斷（如「預收公費」開頭）。
**為何不選**: 字串比對脆弱，使用者可能修改標題。結構化欄位更可靠。

### D3: 公費納入統一餘額，公費餘額獨立顯示

**選擇**: `MemberBalance` 新增 `fundPrepaid`（預繳總額）、`fundExpenseShare`（公費支出分攤）、`fundBalance`（公費餘額 = 公費支出分攤 - 預繳總額）三個欄位。

計算邏輯：
- `splitTotal`: 一般分攤（不含公費支出）
- `fundPrepaid`: 加總該成員在所有 `fundSubType: 'pre-collect'` 花費中的 split amount
- `fundExpenseShare`: 加總該成員在所有 `fundSubType: 'expense'` 花費中的 split amount
- `balance = (splitTotal + fundPrepaid) - paidTotal - collectedTotal`（公費支出不影響餘額，從公費池出）
- `fundBalance = fundExpenseShare - fundPrepaid`（負數=公費池有剩餘可退，正數=需補繳）

**關鍵**: 餘額包含預收公費但不含公費支出（公費支出從公費池扣，不影響個人應繳）。公費餘額獨立追蹤公費池使用狀態。

### D4: 「從公費支出」的分攤成員 = 所有有預收紀錄的成員

**選擇**: 建立「從公費支出」時，自動從該旅程所有 `fundSubType: 'pre-collect'` 的花費中收集不重複的 memberIds 作為分攤對象。

使用者不需要手動選擇分攤成員，系統自動判定。

### D5: 預設花費類型新增「預收公費」與「從公費支出」

**選擇**: 在 `defaultExpenseTypes` 新增兩個 `category: 'public-fund'` 的內建類型。`ExpenseType` 需新增可選欄位 `fundSubType?: 'pre-collect' | 'expense'` 以對應 Expense 的欄位。

### D6: 餘額總表改為 Tab 佈局

收款頁面的餘額摘要改為 Tab 切換，無公費時不顯示 Tab。

**Tab 1 - 每人餘額**：`成員 | 分攤 | 公費 | 代墊 | 已收 | 餘額`
- 「公費」欄（= `fundPrepaid`）僅在 `hasFund` 時顯示
- 餘額 = (分攤 + 公費) - 代墊 - 已收

**Tab 2 - 公費支出**（僅在 `hasFund` 時出現）：
- 摘要：每人預收金額、已收取總額、未收齊金額
- 表格（僅列有參與公費成員）：`成員 | 公費分攤 | 公費餘額`
- 公費餘額 = 公費分攤 - 公費（= `fundBalance`）

### D8: PDF 依封存狀態顯示不同表格

**未封存**（簡化版）：`成員 | 分攤 | 公費 | 代墊 | 已收 | 餘額`
- 「公費」欄僅在 `hasFund` 時顯示

**已封存**（完整結算版）：`成員 | 分攤 | 公費分攤 | 公費 | 代墊 | 已收 | 餘額 | 公費餘額 | 最終結算`
- 最終結算 = 餘額 + 公費餘額（即 `balance + fundBalance`）
- 公費餘額為負時（公費剩餘），加上負數 = 實質退更多

### D7: pdfExport 的 calcBalances 同步策略

**選擇**: 將 `collectionStore.calcBalances` 抽為共用工具函式（`src/utils/balanceCalc.ts`），`collectionStore` 和 `pdfExport` 都引用同一份。

**為何**: 目前 pdfExport 獨立複製了 calcBalances 邏輯，新增公費後維護兩份會非常容易出錯。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Dexie 不 migrate 可能導致舊資料缺少 `fundSubType` 欄位 | `fundSubType` 是可選欄位，舊資料自然為 `undefined`，不影響現有功能 |
| pdfExport 重構可能影響現有 PDF 輸出 | 抽共用函式時確保輸出格式不變，僅新增公費欄位 |
| `calcSplitAmounts` 的無條件進位用於公費均攤可能多收 | 公費均攤沿用同樣邏輯，與一般分攤一致，使用者已習慣 |
| ExpenseForm 新增公費模式增加表單複雜度 | 公費模式 UI 相對簡單（金額 + 勾選成員），不會顯著增加複雜度 |
