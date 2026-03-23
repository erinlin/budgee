## Context

Budgee 是一個全新的旅行團體預算管理工具，目標使用者為學校旅遊、社區出遊或老人機構的旅行團，使用者年齡層較高，對操作複雜度敏感。整個應用程式需要在無網路環境下正常運作（巴士上、山區景點等），資料完全儲存於使用者裝置的瀏覽器 IndexedDB 中，無後端伺服器依賴。

角色情境：通常由主辦人（如老師）先代墊花費並記錄，旅行結束後將資料匯出 JSON，移交給指定的會計繼續結算與收款，最後封存旅行。

## Goals / Non-Goals

**Goals:**
- 離線優先（PWA）
- 多旅行管理（首頁列表）
- 完整的花費分攤計算（多類型、多票種、代墊追蹤）
- 收款流程（預收 / 逐筆收 / 每人即時餘額）
- JSON 匯出/匯入（含封存狀態判斷）與 PDF 資料表格匯出
- 跨旅行快取：成員暱稱與花費類型（除餐費外）儲存於 localStorage，供下次旅行快速建立
- 老年友好 UI（大字體、高對比、簡易操作、深色模式）
- TypeScript 強型別

**Non-Goals:**
- 多人即時同步（無後端，不支援 WebSocket 或雲端同步）
- 使用者帳號 / 登入機制
- 多幣別即時匯率抓取（MVP 僅支援單一幣別，預設 TWD）
- 原生 iOS/Android App（以 PWA 取代）
- 複雜的報表圖表（MVP 以表格呈現為主）

## Decisions

### 1. 本地資料庫：IndexedDB + Dexie.js

**決策**：使用 Dexie.js 作為 IndexedDB 的抽象層。

**理由**：
- IndexedDB 是瀏覽器內建的 NoSQL 儲存，容量遠大於 localStorage
- Dexie.js 提供乾淨的 Promise/async API 與完整的 TypeScript 型別支援
- 相較於 PouchDB，Dexie.js 更輕量，不需要 CouchDB 同步功能
- 相較於 RxDB，學習曲線低，不過度設計

**快取層（localStorage）**：
- 跨旅行的成員暱稱清單與花費類型（除餐費）儲存於 localStorage
- 資料量小（純字串清單），不需要 IndexedDB 的複雜查詢

---

### 2. 前端框架：React + Vite + TypeScript

**決策**：React 18 + Vite 5 + TypeScript 5

**理由**：
- Vite 開發速度快、PWA 插件成熟（`vite-plugin-pwa`）
- React 生態豐富，TanStack Table、React Router 均有優良支援
- TypeScript 確保花費計算邏輯的型別安全，減少結算錯誤

---

### 3. 狀態管理：Zustand

**決策**：使用 Zustand 管理 UI 層狀態（當前旅行、選中成員等），資料層直接透過 Dexie.js 存取。

---

### 4. 花費計算模型

花費類型分三大計算模式：

**均攤型（split）**：由參與人員平均分攤一筆固定總金額
- 住房（一間房 ÷ 住房人員）
- 租車（預設全員均攤，可指定人員）
- 導覽費（預設全員均攤，可指定人員）

**選項型（per-item）**：每人各自選擇品項，金額依品項定價計算
- 餐費（A/B/C 套餐各有定價）
- 門票（全票 / 敬老 / 志工）
- 高鐵/火車（全票 / 敬老）

**通用型（general）**：適用於單一費用，可選擇性附加品項選項（全票/半票等）
- 若無品項選項，則視為固定金額由指定成員分攤
- 自訂類型預設為通用型，使用者可決定是否加入品項選項

每人待收金額公式：
```
待收 = 分攤總額 - 代墊總額 - 已收款總額
正值 = 應繳給會計
負值 = 會計要退還
```

---

### 5. 資料模型設計

```
Trip
├── id (uuid)
├── title
├── description
├── startDate / endDate
├── currency (預設 "TWD")
├── archived (boolean)
├── createdAt / updatedAt
├── members[]
│   ├── id (uuid)
│   ├── nickname
│   └── role: "organizer" | "accountant" | "member"
└── expenseTypes[]
    ├── id (uuid)
    ├── name
    ├── category: "split" | "per-item" | "general"
    │   split    → 固定總金額平均分攤給指定人員
    │   per-item → 每人各選品項，依品項單價計算
    │   general  → 單一費用，可選擇性附加品項選項（全票/半票等）
    ├── defaultAll: boolean (租車/導覽預設全員，其餘預設必選)
    ├── builtIn: boolean
    └── options[]? { id, label, price }

Expense
├── id (uuid)
├── tripId
├── typeId
├── title (備註)
├── date
├── totalAmount
├── paidBy (memberId，代墊人，可為 null)
└── splits[]
    ├── memberId
    ├── optionId? (選項型才有)
    └── amount

Collection
├── id (uuid)
├── tripId
├── memberId (收款對象)
├── amount
├── type: "pre-collect" | "collect"
├── note
└── collectedAt
```

---

### 6. 匯入/匯出策略

- **匯出 JSON**：Trip + Expense + Collection 完整資料，包含 `archived` 狀態
- **匯入 JSON**：
  - `archived: false` → 允許繼續編輯
  - `archived: true` → 僅建立唯讀檢視副本
- **匯出 PDF**：jsPDF + jsPDF-AutoTable，含繁體中文字型嵌入

---

### 7. 跨旅行快取設計

```
localStorage key: "budgee_member_cache"
value: string[]  // 歷史成員暱稱清單（去重）

localStorage key: "budgee_expense_type_cache"
value: CustomExpenseTypeTemplate[]  // 排除餐費類型
```

- 每次旅行結束或新增成員/類型時自動更新快取
- 建立新旅行時，UI 提供「從歷史記錄選取」區塊

---

### 8. 老年友好 UI 設計系統

| 項目 | 規範 |
|------|------|
| 基礎字體大小 | 18px（body），標題 24px 以上 |
| 行距 | 1.6 以上 |
| 按鈕最小點擊區域 | 48×48px |
| 色彩對比 | WCAG AA 等級（對比度 ≥ 4.5:1） |
| 顏色語意 | 紅 = 待付/警示、綠 = 已收/完成、藍 = 主要操作 |
| 深色模式 | 系統偏好自動切換，可手動覆蓋 |
| 表單輸入 | 輸入框高度 ≥ 48px，label 明顯 |
| 錯誤提示 | 全文字說明（不依賴圖示顏色） |
| 動畫 | 僅使用必要的過渡動畫，尊重 `prefers-reduced-motion` |

---

### 9. 離線支援（PWA）

- 使用 `vite-plugin-pwa` 自動生成 Service Worker
- 策略：`CacheFirst` for 靜態資源
- App Shell 架構：所有畫面在首次載入後即可離線使用

## Risks / Trade-offs

| 風險 | 緩解策略 |
|------|---------|
| IndexedDB 資料儲存於特定瀏覽器，換裝置或清快取會遺失資料 | 明顯提示使用者定期匯出 JSON 備份；封存前強制提示匯出 |
| jsPDF 的中文字型支援需額外嵌入字型檔，增加檔案大小 | 嵌入 NotoSansCJK 子集，或改用 html2canvas + jsPDF |
| 多次匯入/匯出後可能產生 id 衝突 | 每次匯入時以 uuid 重新分配 id，保留 `exportedFrom` 欄位追蹤來源 |
| 大型旅行資料（100+ 筆花費）的表格效能 | TanStack Table 虛擬滾動處理大量資料 |

## Open Questions

1. **PDF 字型**：嵌入 NotoSansCJK 子集 vs. html2canvas 截圖方案？
2. **PWA 安裝引導**：是否需要專屬的 onboarding 畫面？
