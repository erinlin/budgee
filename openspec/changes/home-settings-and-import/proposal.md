## Why

首頁目前缺乏「匯入旅行」入口，使用者只能進到既有旅行的設定頁才能匯入，流程不直覺。此外，預設花費類型目前寫死在程式碼中，無法依個人習慣調整，每次建立新旅行都要重新手動修改類型。

## What Changes

- 首頁新增「匯入旅行」按鈕，直接在首頁觸發 JSON 匯入流程
- 匯入衝突提示升級：顯示本地版本與匯入版本的 `exportedAt` 時間戳與費用筆數，讓使用者有足夠資訊判斷
- 新增 App 層級全域「預設花費類型」設定，存於 IndexedDB（`appSettings` table）
- 首頁新增「設定」入口，可管理預設花費類型
- 建立新旅行時，改為從 IndexedDB 讀取全域預設花費類型，而非使用 hardcode

## Capabilities

### New Capabilities

- `home-import`: 首頁匯入旅行功能，含升級後的衝突解決 UI（版本資訊比對）
- `app-settings`: App 層級設定管理，初期範疇為全域預設花費類型（IndexedDB 儲存）

### Modified Capabilities

- `data-export-import`: 衝突解決流程新增版本比對資訊（`exportedAt`、費用筆數）
- `expense-types`: 建立新旅行時的預設花費類型來源，從 hardcode 改為讀取 `appSettings`

## Impact

- `src/db/` — 新增 `appSettings` table（Dexie schema 版本升級）
- `src/stores/` — 新增 `appSettingsStore`（Zustand），管理全域預設花費類型 CRUD
- `src/pages/Home.tsx` — 新增匯入按鈕與設定入口
- `src/pages/AppSettings.tsx` — 新頁面，管理預設花費類型
- `src/utils/exportImport.ts` — 衝突 modal 資料結構調整（回傳版本比對資訊）
- `src/data/defaultExpenseTypes.ts` — 降為 fallback（首次啟動時寫入 IndexedDB）
- `src/components/ui/ConfirmDialog.tsx` — 可能需要擴充以顯示更豐富的衝突比對內容
