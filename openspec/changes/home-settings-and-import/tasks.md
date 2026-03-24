## 1. 資料層：AppSettings（IndexedDB）

- [ ] 1.1 在 `src/types/index.ts` 新增 `AppSettings` interface（`id: 'global'`, `defaultExpenseTypes: ExpenseType[]`）
- [ ] 1.2 升級 `src/db/index.ts` 至 version 2：新增 `appSettings` table（primary key: `id`），upgrade callback 中 seed 初始 `defaultExpenseTypes`
- [ ] 1.3 建立 `src/stores/appSettingsStore.ts`（Zustand）：`loadSettings`、`updateDefaultExpenseTypes` actions

## 2. 旅行建立：改讀全域預設花費類型

- [ ] 2.1 修改 `src/stores/tripStore.ts` 的 `createTrip`：從 `appSettingsStore` 讀取 `defaultExpenseTypes`，fallback 至 `createDefaultExpenseTypes()`

## 3. 首頁匯入旅行

- [ ] 3.1 修改 `src/utils/exportImport.ts`：`importTripFromJson` 回傳值加入 `localExportedAt`、`localExpenseCount`、`importExpenseCount` 供衝突比對使用
- [ ] 3.2 擴充 `src/components/ui/ConfirmDialog.tsx`：`description` prop 型別改為 `string | React.ReactNode`
- [ ] 3.3 修改 `src/pages/Home.tsx`：新增「匯入旅行」按鈕（`Upload` icon，secondary variant），處理檔案選擇、衝突 modal（含版本比對表格）、匯入後導向旅行頁

## 4. App 設定頁：全域預設花費類型管理

- [ ] 4.1 建立 `src/pages/AppSettings.tsx`：顯示並可管理 `appSettings.defaultExpenseTypes`，UI 邏輯與旅行內 `ExpenseTypes.tsx` 一致
- [ ] 4.2 在 `src/main.tsx`（或 Router 設定）新增 `/settings` 路由指向 `AppSettings`
- [ ] 4.3 修改 `src/pages/Home.tsx`：新增「App 設定」入口（`Settings` icon），導向 `/settings`

## 5. 驗收檢查

- [ ] 5.1 首次開啟（或清空 IndexedDB 後）：`appSettings` 自動 seed，建立旅行套用全域預設花費類型
- [ ] 5.2 修改全域預設花費類型後建立新旅行：新旅行使用修改後的類型；既有旅行不受影響
- [ ] 5.3 首頁匯入無衝突 JSON：成功匯入並導向旅行頁
- [ ] 5.4 首頁匯入有衝突 JSON：顯示版本比對資訊（時間戳、費用筆數），可選覆蓋或並存
- [ ] 5.5 `ConfirmDialog` 既有使用（傳字串）不受影響
