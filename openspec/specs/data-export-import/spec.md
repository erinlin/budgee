## Purpose
支援旅行資料的 JSON 匯入/匯出與 PDF 報表產製，確保資料在不同裝置間的可攜性與結算報表的呈現。

## Requirements

### Requirement: JSON 完整匯出
使用者 SHALL 能夠將旅行的完整資料匯出為單一 JSON 檔案。

#### Scenario: 匯出 JSON
- **WHEN** 使用者點擊「匯出 JSON」
- **THEN** 系統產生完整資料的 JSON 檔案並觸發瀏覽器下載，檔名格式為 `budgee-{旅行標題}-{日期}.json`

---

### Requirement: JSON 匯入（可編輯）
使用者 SHALL 能夠匯入一個未封存（`archived: false`）的 JSON 旅行檔案，匯入後可繼續編輯。

#### Scenario: 匯入未封存旅行
- **WHEN** 使用者選擇匯入一個 `archived: false` 的 JSON 檔案
- **THEN** 系統建立一筆可編輯的旅行紀錄，並顯示所有花費與收款資料

#### Scenario: 匯入時 id 衝突處理
- **WHEN** 匯入的旅行 id 與本地現現旅行重複
- **THEN** 系統提示使用者選擇「覆蓋現有旅行」或「以新旅行匯入（並存）」

---

### Requirement: JSON 匯入（唯讀）
使用者 SHALL 能夠匯入一個已封存（`archived: true`）的 JSON 旅行檔案，匯入後為唯讀檢視模式。

#### Scenario: 匯入已封存旅行
- **WHEN** 使用者選擇匯入一個 `archived: true` 的 JSON 檔案
- **THEN** 系統建立一筆唯讀旅行紀錄，所有編輯功能停用，僅可檢視與匯出

---

### Requirement: PDF 資料表格匯出
使用者 SHALL 能夠匯出包含所有花費與收款資料的 PDF 報告，內容以表格為主。

#### Scenario: 匯出 PDF
- **WHEN** 使用者點擊「匯出 PDF」
- **THEN** 系統產生 PDF 檔案並觸發下載，內容包含：
  1. 旅行基本資訊（標題、日期、幣別）
  2. 花費明細表格（日期、類型、標題、總金額、代墊人、分攤人）
  3. 每人收款摘要表格（成員、分攤總計、代墊總計、已收總計、餘額）

#### Scenario: PDF 支援繁體中文
- **WHEN** 使用者匯出 PDF
- **THEN** PDF 中的繁體中文字元正確顯示，不出現亂碼
