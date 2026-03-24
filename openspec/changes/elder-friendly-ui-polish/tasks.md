## 1. P0 - 對比度與可讀性

- [x] 1.1 修改 `:root` 中 `--color-primary` 為 `#3d7000`，`--color-primary-hover` 同步調整為 `rgba(61, 112, 0, 0.18)`
- [x] 1.2 修改 `:root` 中 `--text-muted` 為 `#555555`
- [x] 1.3 為 `.budgee-table tbody tr:nth-child(even)` 加入斑馬紋背景色
- [x] 1.4 為 `.expense-row:nth-child(even)` 加入斑馬紋背景色
- [x] 1.5 費用表格的 `.icon-btn` icon 尺寸從 16px 改為 20px，兩按鈕 gap >= 12px

## 2. P1 - 圓角與陰影系統

- [x] 2.1 修改 `--radius-md: 10px`、`--radius-lg: 14px`，新增 `--radius-xl: 20px`
- [x] 2.2 新增 `--shadow-sm`、`--shadow-md`、`--shadow-lg` 設計令牌
- [x] 2.3 將 `--shadow-sm` 套用至 `.budgee-table-container` 和 `.expense-table-wrap`
- [x] 2.4 將 `--shadow-md` 套用至 `.trip-card`、`.summary-card` 等卡片元件
- [x] 2.5 將 `--shadow-lg` 套用至 `.budgee-dialog`

## 3. P1 - 按鈕回饋與 Focus

- [x] 3.1 為 `.budgee-btn:active` 加入 `transform: scale(0.97)` + 背景色加深
- [x] 3.2 在 `prefers-reduced-motion: reduce` 下覆寫 active 狀態為僅背景色變化
- [x] 3.3 為 `.budgee-btn:focus-visible` 加入 `outline: 2px solid var(--color-primary); outline-offset: 2px`
- [x] 3.4 為 `.budgee-tab a:focus-visible`、`.btn-ghost:focus-visible` 等互動元素加入同樣的 focus ring

## 4. P2 - 字體與防誤觸

- [x] 4.1 在 `index.html` 的 `<head>` 加入 Google Fonts Noto Sans TC 的 `<link>` 標籤
- [x] 4.2 修改 `--font-sans` 為 `'Noto Sans TC', system-ui, -apple-system, sans-serif`
- [x] 4.3 旅伴列表的刪除按鈕與名稱之間加大間距

## 5. 驗證

- [x] 5.1 以 agent-browser 截圖比對改動前後各頁面視覺效果
- [x] 5.2 確認 `prefers-reduced-motion` 下按鈕不使用 transform 動畫
