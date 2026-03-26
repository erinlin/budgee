## MODIFIED Requirements

### Requirement: 內建花費類型
系統 SHALL 在建立新旅行時，從 `appSettings.defaultExpenseTypes`（IndexedDB）讀取預設花費類型套用至新旅行；若 `appSettings` 尚未初始化，則 fallback 至 `createDefaultExpenseTypes()` hardcode 值。使用者不可刪除 `builtIn: true` 的類型。

| 類型名稱   | 計算模式       | 預設人員 | 說明                        |
|-----------|---------------|---------|---------------------------|
| 住房       | split         | 必選    | 一筆 = 一間房，分攤給住房人員 |
| 租車       | split         | 全員    | 可調整參與人員               |
| 餐費       | per-item      | 必選    | 每人各選套餐選項             |
| 導覽費     | split         | 全員    | 可調整參與人員               |
| 門票       | per-item      | 必選    | 每人各選票種                 |
| 高鐵/火車  | per-item      | 必選    | 每人各選票種                 |
| 預收公費   | public-fund   | 全員    | 統一金額，可排除特定成員       |
| 從公費支出 | public-fund   | 自動    | 自動均攤給有預收紀錄的成員     |

#### Scenario: 顯示內建類型
- **WHEN** 使用者在新增花費時選擇費用類型
- **THEN** 系統顯示所有內建類型供選擇，並標示「內建」

#### Scenario: 無法刪除內建類型
- **WHEN** 使用者嘗試刪除內建花費類型
- **THEN** 系統不提供刪除選項

#### Scenario: 建立旅行套用全域預設
- **WHEN** 使用者建立新旅行
- **THEN** 系統從 `appSettings.defaultExpenseTypes` 讀取預設類型套用至新旅行；若讀取失敗則 fallback 至 hardcode 預設值

---

### Requirement: 自訂花費類型
使用者 SHALL 能夠新增自訂花費類型，並設定計算模式（split / per-item / general / public-fund）。per-item 與 general 類型 SHALL 允許設定品項選項（名稱與單價）。public-fund 類型 SHALL 要求指定 `fundSubType`（預收公費 / 從公費支出）。

#### Scenario: 新增 per-item 自訂類型（如單一票種）
- **WHEN** 使用者建立自訂類型，選擇 per-item，並加入品項（如「全票 / 半票」及各自單價）
- **THEN** 系統儲存該類型，之後新增花費時可讓每位成員選擇品項

#### Scenario: 新增 split 自訂類型
- **WHEN** 使用者建立自訂類型，選擇 split（固定金額均攤）
- **THEN** 系統儲存該類型，新增花費時輸入總金額並指定分攤人員

#### Scenario: 編輯自訂類型
- **WHEN** 使用者編輯已有花費紀錄的自訂類型（如修改品項價格）
- **THEN** 系統顯示警告：已記錄的花費金額不會自動更新，需手動調整

#### Scenario: 刪除有花費紀錄的自訂類型
- **WHEN** 使用者嘗試刪除已有花費紀錄的自訂類型
- **THEN** 系統阻擋並提示需先刪除相關花費紀錄

## ADDED Requirements

### Requirement: ExpenseType 支援公費子類型
`ExpenseType` 介面 SHALL 新增可選欄位 `fundSubType?: 'pre-collect' | 'expense'`，僅在 `category === 'public-fund'` 時有意義。`ExpenseCategory` 型別 SHALL 新增 `'public-fund'` 值。

#### Scenario: 公費類型攜帶 fundSubType
- **WHEN** 系統載入內建的「預收公費」花費類型
- **THEN** 該類型的 `category` 為 `'public-fund'`、`fundSubType` 為 `'pre-collect'`

#### Scenario: 花費類型管理顯示公費類別
- **WHEN** 使用者查看花費類型管理頁面
- **THEN** 公費類型顯示「公費」標籤，計算模式欄顯示「預收公費」或「從公費支出」
