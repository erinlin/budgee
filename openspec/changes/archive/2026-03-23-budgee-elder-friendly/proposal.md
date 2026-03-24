## Why

旅行團體（如學校旅遊、社區出遊、老人機構的旅行團）在出遊過程中，往往需要追蹤住房、交通、餐費、門票等多種花費，並進行個人分攤與收款管理。現有通用記帳工具無法處理「多人分攤、多票種、代墊與收款追蹤」的複雜場景，且介面對年長使用者不友善。Budgee 旨在提供一套專為旅行團體設計、可離線使用、老年友好的預算管理工具。

## What Changes

- 建立全新的 Web App（PWA，可離線使用）
- 支援多旅行管理（首頁列表）
- 支援多種花費類型：住房、租車、餐費、導覽費、門票、高鐵/火車票，並允許自訂類型
- 每筆花費可指定代墊人（paidBy）及分攤對象/品項
- 支援收款記錄（預收 / 逐筆收），追蹤每位成員的待收/待付金額
- 成員角色分為「主辦人」與「會計」
- 跨旅行快取成員暱稱與花費類型（除餐費外），供下次快速建立使用
- 旅行結束後可封存（唯讀），封存前可匯出 JSON 供會計接手編輯
- 支援匯入 JSON：未封存者可繼續編輯，已封存者為唯讀檢視
- 支援匯出 PDF（全部資料表格）
- UI 設計遵循老年友好原則：大字體、高對比、操作簡易、深色模式支援
- 預設幣別為台幣（TWD），未來可擴充多幣別

## Capabilities

### New Capabilities

- `trip-management`：旅行建立、列表、封存與刪除；包含標題、描述、日期、幣別設定
- `member-management`：成員暱稱管理及角色指派（主辦人 / 會計）
- `expense-tracking`：多類型花費新增、編輯、刪除；支援代墊人、分攤明細、花費日期、備註
- `expense-types`：內建花費類型（住房、租車、餐費、導覽、門票、高鐵/火車）及使用者自訂類型管理
- `collection-tracking`：收款記錄管理（預收 / 逐筆收）；每人即時餘額計算
- `personal-budget-view`：個人預算頁面，顯示該成員所有分攤明細、代墊紀錄與收款狀態
- `data-export-import`：JSON 完整匯出/匯入（含封存狀態判斷）、PDF 資料表格匯出
- `ui-elder-friendly`：老年友好 UI 設計系統（字體/對比/佈局/深色模式規範）
- `quick-start-template`：跨旅行快取成員暱稱與花費類型（除餐費外），供下次旅行快速建立

### Modified Capabilities

（無，此為全新專案）

## Impact

- **前端框架**：React + Vite + TypeScript
- **本地資料庫**：IndexedDB（透過 Dexie.js）
- **狀態管理**：Zustand
- **離線支援**：Vite PWA Plugin（Service Worker）
- **表格元件**：TanStack Table
- **匯出**：File API（JSON）、jsPDF（PDF）
- **路由**：React Router
- **UI 元件**：Vanilla CSS
- **快取**：localStorage（成員暱稱與花費類型快取）
- **無後端依賴**：所有資料儲存於使用者瀏覽器本地
