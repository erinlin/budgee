## MODIFIED Requirements

### Requirement: JSON 匯入（可編輯）
使用者 SHALL 能夠匯入一個未封存（`archived: false`）的 JSON 旅行檔案，匯入後可繼續編輯。衝突時系統 SHALL 顯示兩個版本的 `exportedAt` 時間戳與費用筆數，供使用者判斷。

#### Scenario: 匯入未封存旅行
- **WHEN** 使用者選擇匯入一個 `archived: false` 的 JSON 檔案
- **THEN** 系統建立一筆可編輯的旅行紀錄，並顯示所有花費與收款資料

#### Scenario: 匯入時 id 衝突處理
- **WHEN** 匯入的旅行 id 與本地現有旅行重複
- **THEN** 系統顯示衝突提示，內容包含本地版本與匯入版本各自的 `exportedAt` 時間戳及費用筆數，並提供「覆蓋現有旅行」與「建立副本（並存）」兩個選項
