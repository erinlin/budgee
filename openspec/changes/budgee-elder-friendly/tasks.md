## 1. 專案初始化

- [ ] 1.1 使用 `create-vite` 建立 React + TypeScript 專案，設定目錄結構（components / pages / stores / db / types）
- [ ] 1.2 安裝核心依賴：dexie、zustand、react-router-dom、@tanstack/react-table
- [ ] 1.3 安裝匯出依賴：jspdf、jspdf-autotable（PDF）
- [ ] 1.4 安裝 PWA 插件：vite-plugin-pwa，設定 Service Worker 與 manifest
- [ ] 1.5 建立 TypeScript 型別定義（Trip、Member、ExpenseType、Expense、Split、Collection）
- [ ] 1.6 初始化 Dexie 資料庫 schema（trips、expenses、collections 資料表）

## 2. UI 設計系統（老年友好）

- [ ] 2.1 建立 CSS 全域設計 token（字體大小、行距、顏色語意、間距、圓角）
- [ ] 2.2 設定深色模式（`prefers-color-scheme` + 手動切換，儲存至 localStorage）
- [ ] 2.3 建立基礎元件：Button（最小 48×48px）、Input（最小高度 48px）、Label
- [ ] 2.4 建立 ConfirmDialog 元件（重要操作的二次確認，支援無障礙）
- [ ] 2.5 建立 Table 元件（基於 TanStack Table，支援排序，老年友好行距）
- [ ] 2.6 建立 Badge 元件（角色標籤：主辦人 / 會計 / 一般成員）
- [ ] 2.7 建立 AmountDisplay 元件（正值顯示紅色系、負值顯示綠色系）
- [ ] 2.8 確認所有文字對比度符合 WCAG AA 標準（≥ 4.5:1）

## 3. 旅行管理（trip-management）

- [ ] 3.1 建立首頁（旅行列表）：卡片式列表、空狀態畫面、「新增旅行」按鈕
- [ ] 3.2 建立新增/編輯旅行表單（標題、描述、日期範圍、幣別）
- [ ] 3.3 實作 Dexie 旅行 CRUD（createTrip、updateTrip、deleteTrip）
- [ ] 3.4 實作封存功能（setArchived）及封存後 UI 全面切換唯讀模式

## 4. 成員管理（member-management）

- [ ] 4.1 建立成員管理頁面（列表 + 新增/編輯/刪除）
- [ ] 4.2 實作成員 CRUD（memberId 使用 uuid）
- [ ] 4.3 角色選擇器（主辦人 / 會計 / 一般成員）
- [ ] 4.4 刪除有花費紀錄的成員時，顯示警告對話框

## 5. 花費類型管理（expense-types）

- [ ] 5.1 建立內建花費類型初始資料（住房 split、租車 split defaultAll、餐費 per-item、導覽費 split defaultAll、門票 per-item、高鐵/火車 per-item）
- [ ] 5.2 建立花費類型管理頁面（顯示內建類型 + 自訂類型列表）
- [ ] 5.3 實作自訂類型 CRUD（支援 split / per-item，per-item 可新增品項 options）
- [ ] 5.4 刪除有花費紀錄的自訂類型時，顯示阻擋提示

## 6. 花費紀錄（expense-tracking）

- [ ] 6.1 建立花費列表頁面（TanStack Table，欄位：日期、類型、標題、總金額、代墊人、分攤人）
- [ ] 6.2 建立新增花費 Modal/頁面，根據類型動態切換表單：
  - split：總金額輸入 + 成員多選（含「全選」捷徑）
  - per-item：每位成員各選一個品項（Select）
- [ ] 6.3 實作 split 金額計算（totalAmount ÷ 選中人數）
- [ ] 6.4 實作 per-item 金額計算（每人 = 其選項 price，total = 加總）
- [ ] 6.5 代墊人選擇器（從成員列表選擇，可選「無代墊」）
- [ ] 6.6 花費日期選擇器（預設今日，限旅行日期範圍）
- [ ] 6.7 備註欄位
- [ ] 6.8 實作花費編輯與刪除功能
- [ ] 6.9 點選花費列顯示分攤明細（每人名稱、品項、金額）

## 7. 收款管理（collection-tracking）

- [ ] 7.1 建立收款頁面：上方為每人餘額摘要表格，下方為收款紀錄列表
- [ ] 7.2 實作餘額計算函式（分攤總額 - 代墊總額 - 已收款總額）
- [ ] 7.3 建立新增收款紀錄表單（成員、金額、類型 pre-collect/collect、備註）
- [ ] 7.4 餘額顯示：正值紅色系（待繳）、負值綠色系（待退）、零值中性色

## 8. 個人預算頁面（personal-budget-view）

- [ ] 8.1 建立個人頁面：成員選擇器（Dropdown）
- [ ] 8.2 顯示該成員的花費分攤明細表格（花費標題、品項、日期、分攤金額）
- [ ] 8.3 顯示該成員的代墊紀錄表格
- [ ] 8.4 顯示該成員的收款紀錄表格
- [ ] 8.5 顯示餘額摘要（分攤總計、代墊總計、已收總計、最終待收/待退）

## 9. 資料匯出匯入（data-export-import）

- [ ] 9.1 實作 JSON 匯出（File API + Blob），檔名格式：`budgee-{title}-{date}.json`
- [ ] 9.2 實作 JSON 匯入：解析檔案 → 判斷 `archived` → 決定可編輯或唯讀
- [ ] 9.3 匯入 id 衝突處理（提示覆蓋或並存）
- [ ] 9.4 實作 PDF 匯出（jsPDF + jsPDF-AutoTable），含繁體中文字型嵌入
- [ ] 9.5 PDF 內容：旅行基本資訊 + 花費明細表格 + 每人收款摘要表格

## 10. PWA 離線設定

- [ ] 10.1 設定 vite-plugin-pwa（manifest：App 名稱 Budgee、icon、主題色）
- [ ] 10.2 設定 Service Worker Workbox 策略（靜態資源 CacheFirst）
- [ ] 10.3 驗證離線情境：斷網後重新整理，App 正常顯示且資料完整
- [ ] 10.4 App icon 生成（至少 192×192 與 512×512）

## 11. 收尾與驗證

- [ ] 11.1 驗證所有花費計算邏輯（split、per-item、餘額計算）正確性
- [ ] 11.2 驗證封存後所有編輯入口均不可操作
- [ ] 11.3 驗證 JSON 匯出→匯入→再匯出的資料一致性
- [ ] 11.4 在行動裝置模擬器上驗證觸控點擊區域（≥ 48×48px）
- [ ] 11.5 驗證深色模式切換，確認視覺正確
- [ ] 11.6 更新 openspec/config.yaml，加入專案技術棧與慣例說明
