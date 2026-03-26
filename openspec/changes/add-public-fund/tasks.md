## 1. 型別與資料結構

- [x] 1.1 `src/types/index.ts`: `ExpenseCategory` 新增 `'public-fund'`，`Expense.category` 同步擴充，`Expense` 新增 `fundSubType?: 'pre-collect' | 'expense'`
- [x] 1.2 `src/types/index.ts`: `ExpenseType` 新增 `fundSubType?: 'pre-collect' | 'expense'`
- [x] 1.3 `src/stores/collectionStore.ts`: `MemberBalance` 新增 `fundPrepaid`、`fundExpenseShare`、`fundBalance` 欄位

## 2. 預設花費類型

- [x] 2.1 `src/data/defaultExpenseTypes.ts`: 新增「預收公費」（category: public-fund, fundSubType: pre-collect, defaultAll: true）和「從公費支出」（category: public-fund, fundSubType: expense）兩個內建類型

## 3. 餘額計算核心

- [x] 3.1 抽取 `src/utils/balanceCalc.ts`: 將 `collectionStore.calcBalances` 邏輯抽為獨立共用函式
- [x] 3.2 `calcBalances` 新增公費計算: 一般餘額排除 `category: 'public-fund'`，新增 `fundPrepaid`/`fundExpenseShare`/`fundBalance` 計算
- [x] 3.3 `src/stores/collectionStore.ts`: 改為呼叫共用的 `balanceCalc`
- [x] 3.4 `src/utils/pdfExport.ts`: 改為呼叫共用的 `balanceCalc`，移除內部複製的計算邏輯

## 4. 花費表單 - 公費模式

- [x] 4.1 `src/components/expenses/ExpenseForm.tsx`: 新增公費模式切換（分攤型 / 選項型 / 公費）
- [x] 4.2 公費 - 預收公費表單: 輸入統一金額 + 勾選成員，paidBy 固定 null
- [x] 4.3 公費 - 從公費支出表單: 輸入標題 + 金額，分攤成員自動帶入所有有預收紀錄的成員，paidBy 固定 null
- [x] 4.4 從公費支出: 若無預收公費紀錄，顯示提示訊息阻止建立

## 5. 花費列表顯示

- [x] 5.1 `src/pages/trip/Expenses.tsx`: 公費類型花費的代墊人欄位顯示「公費」

## 6. 收款總覽表格

- [x] 6.1 `src/pages/trip/Collections.tsx`: 餘額表格新增「公費」欄位（顯示 fundPrepaid），僅在有預收公費時顯示
- [x] 6.2 餘額欄改為「餘額(公費餘額)」格式顯示，如 `1,000(-500)`
- [x] 6.3 收款新增表單: 當成員有預繳公費時，備註欄自動預填「含公費 {金額}」

## 7. 個人頁面

- [x] 7.1 `src/pages/trip/Personal.tsx`: 新增公費摘要區塊（預繳總額 / 公費支出分攤 / 剩餘公費），僅在有預收公費時顯示

## 8. PDF 匯出

- [x] 8.1 `src/utils/pdfExport.ts`: 每人收款摘要表格新增公費欄位與餘額(公費)格式，僅在有預收公費時顯示
- [x] 8.2 花費明細表中公費類型的代墊人欄顯示「公費」

## 9. 花費類型管理

- [x] 9.1 `src/pages/trip/ExpenseTypes.tsx`: 支援顯示公費類別，計算模式欄顯示「預收公費」或「從公費支出」
- [x] 9.2 自訂類型新增表單: 類別選項新增「公費」，選擇後需指定 fundSubType
