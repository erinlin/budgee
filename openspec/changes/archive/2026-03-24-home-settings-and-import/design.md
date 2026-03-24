## Context

首頁目前只有「新增旅行」一個動作，匯入旅行藏在旅行設定頁內，使用者必須先進入某個旅行才能匯入另一個旅行，流程不合理。預設花費類型目前是 `createDefaultExpenseTypes()` hardcode，每次建立旅行都套用相同內容，無法客製。

本次變更引入兩個新功能：**首頁匯入旅行**（含版本比對衝突解決）與 **App 層級全域設定**（初期範疇：預設花費類型），以 IndexedDB `appSettings` table 儲存。

## Goals / Non-Goals

**Goals:**
- 首頁可直接匯入旅行 JSON
- 衝突時顯示兩個版本的 `exportedAt` 與費用筆數，讓使用者有資訊可判斷
- 新增 `appSettings` IndexedDB table，儲存全域預設花費類型
- 首頁提供「App 設定」入口，可管理預設花費類型
- 建立旅行時從 `appSettings` 讀取預設花費類型，hardcode 僅作 fallback（首次啟動寫入）

**Non-Goals:**
- 多裝置同步（純本地 IndexedDB，無 backend）
- `appSettings` 的匯出/匯入（本次不包含）
- 衝突的自動 merge（只提示使用者選擇，不做 diff merge）

## Decisions

### 1. AppSettings 用單筆 key-value 還是獨立欄位？

**決定：單筆 key-value record，`id = 'global'`**

```ts
interface AppSettings {
  id: 'global';
  defaultExpenseTypes: ExpenseType[];
}
```

- 優：schema 簡單，未來擴充其他設定只需在同一筆加欄位
- 劣：所有設定每次都整包寫入，但資料量極小，無效能疑慮
- 捨棄方案：每個 key 獨立一筆（`{ id: 'defaultExpenseTypes', value: [...] }`）— 較碎片化，查詢也沒有效率優勢

### 2. Dexie schema 版本升級策略

目前 Dexie DB 版本未知，需確認後遞增。`appSettings` 僅需 `id` 作 primary key，無需其他索引。

升級時在 `upgrade()` callback 中寫入初始 `appSettings`（從 `createDefaultExpenseTypes()` 產生），確保現有使用者升級後有預設值。

### 3. 首次啟動的 Seed 時機

**決定：Dexie `upgrade()` 內 seed**，而非 App 啟動時動態檢查。

- 優：只執行一次，不需每次啟動都查 IndexedDB
- 捨棄方案：`appSettingsStore` 初始化時判斷是否存在再寫入 — 有 race condition 風險且邏輯分散

### 4. 衝突 UI 擴充方式

現有 `ConfirmDialog` 只支援純文字 `description`。版本比對需要顯示表格式資訊。

**決定：擴充 `ConfirmDialog` 接受 `description` 為 `string | React.ReactNode`**，讓衝突 modal 可傳入自訂 JSX 顯示比對表格，而不是新建獨立 Dialog 元件。

### 5. 匯入入口位置

**決定：首頁 header 旁加「匯入」按鈕（secondary variant）**，與「新增旅行」並列。

旅行設定頁的匯入功能保留不動（使用情境不同：在設定頁匯入是「用新資料覆蓋/更新當前旅行」的語意），兩者並存。

## Risks / Trade-offs

- **Dexie schema 版本衝突** → 確認現有版本號後嚴格遞增，upgrade callback 要做 defensive check（`appSettings` 不存在才 seed）
- **ConfirmDialog 擴充破壞現有使用** → `description` 改為 `string | React.ReactNode` 是向後相容的，既有傳字串的地方不受影響
- **首頁 UI 空間增加** → 匯入按鈕與設定入口需評估長者友善佈局，確保觸控目標 ≥ 48px
