## Why

目前 UI 功能完整但視覺質感偏平淡，經截圖逐頁審查後發現數個影響老年使用者體驗的問題：主色對比度未通過 WCAG AA、表格行難以追蹤、操作按鈕間距不足容易誤觸、整體缺乏層次感與回饋感。這些都是可以透過 CSS 層級改動快速提升的項目，不涉及功能邏輯變更。

## What Changes

### P0（對比度與可讀性）
- 主色 `--color-primary` 從 `#4d8c0a`（對比 4.6:1）加深至 `#3d7000`（目標 >=7:1），同步調整 hover 色
- 表格加入斑馬紋（zebra striping），交錯行使用淡背景色，幫助長者橫向追蹤
- 費用表格的編輯/刪除按鈕 icon 從 16px 放大至 20px，兩按鈕間距加大避免誤觸
- `--text-muted` 從 `#666666`（5.7:1）加深至 `#555555`（目標 >=7:1）

### P1（層次感與回饋）
- 圓角系統升級：`--radius-md: 4px` → `10px`、`--radius-lg: 6px` → `14px`，新增 `--radius-xl: 20px`
- 新增陰影設計令牌：`--shadow-sm/md/lg`，套用在卡片、表格容器、modal
- 所有按鈕加上 `:active` 狀態（`scale(0.97)` + 背景加深），提供「按到了」的觸覺回饋
- focus 狀態強化：所有可互動元素（按鈕、連結、tab）加上明顯的 focus-visible ring

### P2（字體與防誤觸）
- 引入 Google Fonts Noto Sans TC，改善中文排版品質
- 旅伴列表的刪除按鈕已有二次確認對話框（現有行為保留），但視覺上加大與名稱的間距

## Capabilities

### New Capabilities

_無新增功能模組_

### Modified Capabilities

- `ui-elder-friendly`: 強化現有色彩對比度、圓角、陰影、按鈕回饋等視覺規範要求

## Impact

- **CSS 變數系統** (`src/index.css`)：主要改動集中於此，修改設計令牌值與新增令牌
- **元件樣式**：表格斑馬紋、按鈕 active 狀態、focus ring — 皆為 CSS 層級，不影響元件邏輯
- **外部依賴**：新增 Google Fonts (Noto Sans TC) CDN 引用於 `index.html`
- **無破壞性變更**：所有改動皆為純視覺層，不影響資料邏輯或 API
