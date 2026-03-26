## MODIFIED Requirements

### Requirement: 新增花費（split 型）
使用者 SHALL 能夠新增均攤型花費，需填寫標題、日期、代墊人、總金額、分攤人員。系統自動計算每位成員應付金額 = 總金額 / 分攤人數。公費類型花費（`category: 'public-fund'`）不在此模式中處理。

#### Scenario: 新增住房花費
- **WHEN** 使用者選擇「住房」類型，填寫總金額，選擇住房人員並送出
- **THEN** 系統建立花費紀錄，每位住房成員分攤 = 總金額 / 人數

#### Scenario: 租車預設全員分攤
- **WHEN** 使用者選擇「租車」類型
- **THEN** 系統預設勾選所有成員，使用者可取消特定成員

---

### Requirement: 花費列表表格
旅行詳情頁 SHALL 以表格形式呈現所有花費（含公費類型），欄位包含：日期、類型、標題、總金額、代墊人、分攤人數。公費類型花費的代墊人欄位顯示「公費」。

#### Scenario: 依日期排序花費
- **WHEN** 使用者查看花費列表
- **THEN** 系統預設以花費日期升冪排列

#### Scenario: 點選花費查看明細
- **WHEN** 使用者點選某筆花費
- **THEN** 系統顯示該筆花費的完整分攤明細（每人名稱、選擇品項、應付金額）

#### Scenario: 公費花費顯示
- **WHEN** 花費列表中包含公費類型花費
- **THEN** 代墊人欄位顯示「公費」而非成員名稱

## ADDED Requirements

### Requirement: Expense 資料結構支援公費
`Expense` 介面 SHALL 擴充以下欄位：
- `category` 新增 `'public-fund'` 值
- `fundSubType?: 'pre-collect' | 'expense'`（僅 `category === 'public-fund'` 時有意義）

#### Scenario: 預收公費資料結構
- **WHEN** 系統建立預收公費紀錄
- **THEN** Expense 的 `category` 為 `'public-fund'`、`fundSubType` 為 `'pre-collect'`、`paidBy` 為 `null`

#### Scenario: 從公費支出資料結構
- **WHEN** 系統建立從公費支出紀錄
- **THEN** Expense 的 `category` 為 `'public-fund'`、`fundSubType` 為 `'expense'`、`paidBy` 為 `null`
