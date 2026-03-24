## MODIFIED Requirements

### Requirement: 內建花費類型
系統 SHALL 在建立新旅行時，從 `appSettings.defaultExpenseTypes`（IndexedDB）讀取預設花費類型套用至新旅行；若 `appSettings` 尚未初始化，則 fallback 至 `createDefaultExpenseTypes()` hardcode 值。使用者不可刪除 `builtIn: true` 的類型。

#### Scenario: 顯示內建類型
- **WHEN** 使用者在新增花費時選擇費用類型
- **THEN** 系統顯示所有內建類型供選擇，並標示「內建」

#### Scenario: 無法刪除內建類型
- **WHEN** 使用者嘗試刪除內建花費類型
- **THEN** 系統不提供刪除選項

#### Scenario: 建立旅行套用全域預設
- **WHEN** 使用者建立新旅行
- **THEN** 系統從 `appSettings.defaultExpenseTypes` 讀取預設類型套用至新旅行；若讀取失敗則 fallback 至 hardcode 預設值
