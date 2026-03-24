## Context

Budgee 使用純 CSS 變數系統（`src/index.css`），所有設計令牌集中在 `:root` 區塊。目前沒有陰影令牌、沒有表格斑馬紋、按鈕缺少 `:active` 回饋狀態。深色模式僅有 2 處零散覆寫（`.member-delete:hover` 和 `.icon-btn.danger:hover`），不影響本次改動範圍。

外部字體目前未引用，`index.html` 極為精簡（無 `<link>` 標籤）。

## Goals / Non-Goals

**Goals:**
- 將主色與 muted 文字對比度提升至 WCAG AA（>=4.5:1），主色目標 >=5.5:1
- 透過斑馬紋、陰影、圓角、按鈕回饋提升視覺層次感
- 引入 Noto Sans TC 改善中文排版品質
- 所有改動限於 CSS 層級 + `index.html` 字體引用，零邏輯變更

**Non-Goals:**
- 不重構元件 JSX 或 TypeScript 邏輯
- 不建立完整深色模式令牌系統（留給後續獨立改動）
- 不新增 CSS 框架或 CSS-in-JS 方案
- 不調整字體大小或 touch target 尺寸（現有 18px/48px 已合規）

## Decisions

### D1: 色彩令牌值直接修改，不新增語義層

**選擇**: 直接修改 `--color-primary` 和 `--text-muted` 的值。

**替代方案**: 新增 `--color-primary-accessible` 等平行令牌，讓舊值保留。

**理由**: 現有令牌只有單一引用語境，不存在「需要低對比主色」的場景。直接改值最簡潔，不產生令牌膨脹。hover 色同步調整為新主色的 18% 透明度。

### D2: 陰影令牌使用三級系統

**選擇**: 新增 `--shadow-sm`、`--shadow-md`、`--shadow-lg` 三個令牌。

**套用對策**:
| 令牌 | 用途 |
|------|------|
| `--shadow-sm` | 表格容器、badge hover |
| `--shadow-md` | 卡片（trip card、summary card） |
| `--shadow-lg` | modal / dialog |

**理由**: 三級足以覆蓋所有 Z 軸層次需求，避免過度設計。值使用柔和的 `rgba(0,0,0,0.06~0.15)` 範圍，配合加大圓角營造「浮起」感。

### D3: 圓角升級策略

**選擇**: `--radius-md: 10px`、`--radius-lg: 14px`，新增 `--radius-xl: 20px`。

**理由**: 現有 4px/6px 在 48px 高度的按鈕上視覺比例過小（不到 10%），10px 約為 20% 比例，視覺上明顯柔和。`--radius-xl` 供 pill 型按鈕或特殊容器使用。

### D4: 按鈕回饋使用 transform + 背景加深

**選擇**: 所有 `.budgee-btn:active` 套用 `transform: scale(0.97)` + 背景色加深。

**替代方案**: 使用 `box-shadow: inset` 模擬按壓凹陷。

**理由**: `scale` 變化更直覺，老年使用者能明確感受「按到了」。配合 `prefers-reduced-motion` — 減少動態偏好時改為僅背景色變化（不使用 transform）。

### D5: 表格斑馬紋使用 CSS nth-child

**選擇**: `.budgee-table tbody tr:nth-child(even)` 和 `.expense-row:nth-child(even)` 套用淡背景。

**理由**: 純 CSS 實作，不需修改任何 React 元件。交錯色使用 `var(--bg-card)` 的半透明版本，與現有配色系統一致。

### D6: Google Fonts 引用方式

**選擇**: 在 `index.html` 的 `<head>` 加入 Google Fonts `<link>` 標籤載入 Noto Sans TC。

**替代方案**: 下載字體檔案 self-host。

**理由**: Noto Sans TC 是 CJK 字體，檔案極大（~7MB），self-host 增加建置複雜度。Google Fonts CDN 已做 unicode-range 分割與快取最佳化，首次載入只下載實際使用到的字元子集。`--font-sans` 令牌改為 `'Noto Sans TC', system-ui, -apple-system, sans-serif`，字體載入失敗時自動 fallback。

### D7: focus-visible ring 統一規範

**選擇**: 為所有可互動元素加上 `:focus-visible` outline，使用主色半透明 ring。

**理由**: 現有 `.budgee-input:focus` 已有 box-shadow ring，但按鈕和連結沒有。統一使用 `outline: 2px solid var(--color-primary); outline-offset: 2px` 配合 `:focus-visible`（非 `:focus`），避免滑鼠點擊時顯示 ring。

## Risks / Trade-offs

**[風險] Google Fonts CDN 離線不可用** -> PWA 離線時字體可能未快取，回退至 system-ui。Workbox 的 CacheFirst 策略理論上會快取字體，但首次離線訪問前需至少一次線上載入。可接受，因為 fallback 字體仍可用。

**[風險] 圓角加大後邊界裁切** -> 表格容器的 `overflow: hidden` 配合 `border-radius: 10px` 可能裁切表格內容邊緣。需測試確認，若有問題可針對表格容器保持較小圓角。

**[取捨] 主色加深後視覺「活力感」降低** -> 最終採用 `#437d00` 作為折衷（原提案 `#3d7000` 使用者反映偏暗），對比度從 4.6:1 提升至 ~5.8:1（穩過 AA），兼顧活力感與可讀性。

**[取捨] 陰影在深色模式下效果不明顯** -> 目前深色模式尚未完整建立，陰影在深色背景上視覺效果較弱。待深色模式重構時再調整陰影值。
