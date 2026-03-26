## Why

目前所有花費都是「個人分攤 + 代墊」模式，無法處理團體預收公費的場景（例如旅程開始前統一收取公費，再從公費支付共同開銷）。團體旅遊中預收公費是常見需求，缺少此功能會導致帳務記錄不完整，結算時無法正確反映每人的公費餘額。

## What Changes

- 新增花費類別 `public-fund`（公費），下分兩種用途：
  - **預收公費**：記錄向成員預收的公費金額（統一金額，可排除特定成員），支援多次預收
  - **從公費支出**：記錄從公費池支付的花費，自動均攤給所有有預收紀錄的成員，無代墊人概念
- 餘額總表新增「公費」欄位，餘額欄顯示公費餘額（正數=需補繳，負數=可退）
- 個人明細頁新增公費區塊：預繳總額 / 公費支出分攤 / 剩餘公費
- PDF 匯出加入公費相關欄位
- 花費類型管理新增「公費」類別選項
- 公費相關表格僅在有「預收公費」紀錄時才顯示

## Capabilities

### New Capabilities
- `public-fund`: 公費預收與支出管理，包含預收公費建立、從公費支出建立、公費餘額計算、公費資訊顯示

### Modified Capabilities
- `expense-tracking`: 花費類別新增 `public-fund`，Expense 資料結構需擴充支援公費類型
- `expense-types`: 花費類型新增「公費」類別，內建「預收公費」與「從公費支出」兩個預設類型
- `collection-tracking`: 餘額計算需分離一般餘額與公費餘額，餘額總表新增公費欄位
- `personal-budget-view`: 個人頁面新增公費摘要區塊
- `data-export-import`: PDF 匯出需包含公費欄位

## Impact

- **Types**: `ExpenseCategory` 新增 `'public-fund'`，`Expense` 需支援新類別欄位
- **Stores**: `expenseStore` 新增公費分攤計算、`collectionStore.calcBalances` 需輸出公費餘額
- **UI**: `ExpenseForm` 新增公費模式、`Collections` 表格新增欄位、`Personal` 頁面新增區塊
- **PDF**: `pdfExport.ts` 內的獨立 `calcBalances` 需同步更新
- **DB**: 不需要 schema 變更（公費資料以 Expense 型態儲存）
- **預設資料**: `defaultExpenseTypes` 新增公費類型
