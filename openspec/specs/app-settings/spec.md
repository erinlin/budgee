## Purpose
管理 App 全域設定，包含預設花費類型等非旅行特定資料的儲存與管理。

## Requirements

### Requirement: App 設定儲存
系統 SHALL 在 IndexedDB 的 `appSettings` table 中以單筆 `id: 'global'` 儲存全域 App 設定，首次啟動時自動 seed 預設值。

#### Scenario: 首次啟動 seed
- **WHEN** 使用者首次開啟 App（或 DB 升級後 `appSettings` 尚不存在）
- **THEN** 系統將 `createDefaultExpenseTypes()` 產生的內容寫入 `appSettings.defaultExpenseTypes`

#### Scenario: 設定持久化
- **WHEN** 使用者修改全域預設花費類型並儲存
- **THEN** 系統將更新後的 `defaultExpenseTypes` 寫回 IndexedDB，重新整理頁面後仍保留

---

### Requirement: 首頁 App 設定入口
首頁 SHALL 提供「App 設定」入口，讓使用者管理全域預設花費類型。

#### Scenario: 進入 App 設定頁
- **WHEN** 使用者在首頁點擊「App 設定」入口
- **THEN** 系統導向 `/settings` 頁面，顯示目前的全域預設花費類型列表

---

### Requirement: 全域預設花費類型管理
使用者 SHALL 能在 App 設定頁新增、編輯、刪除全域預設花費類型，規則與旅行內花費類型管理相同（內建類型不可刪除）。

#### Scenario: 新增全域自訂花費類型
- **WHEN** 使用者在 App 設定頁新增自訂花費類型
- **THEN** 系統將新類型加入 `appSettings.defaultExpenseTypes` 並儲存

#### Scenario: 刪除全域自訂花費類型
- **WHEN** 使用者刪除全域自訂花費類型
- **THEN** 系統從 `appSettings.defaultExpenseTypes` 移除該類型，不影響已建立旅行的花費類型

#### Scenario: 無法刪除全域內建花費類型
- **WHEN** 使用者嘗試刪除 `builtIn: true` 的全域花費類型
- **THEN** 系統不提供刪除選項
