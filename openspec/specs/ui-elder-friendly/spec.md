## Purpose
建立符合年長使用者需求的介面規範，包含大字體、高對比、手擊區域規格以及深色模式支援。

## Requirements

### Requirement: 老年友好字體與間距
系統 SHALL 使用對年長使用者友善的字體大小與行距規範：
- body 字體最小 18px，標題 24px 以上，行距 1.6 以上
- 按鈕最小點擊區域 48×48px，輸入框高度最小 48px

#### Scenario: 字體大小驗證
- **WHEN** 使用者在任意頁面查看內容
- **THEN** 所有正文字體不小於 18px，標題不小於 24px

---

### Requirement: 高對比色彩系統
系統 SHALL 確保所有文字與背景的對比度符合 WCAG AA 標準（>= 4.5:1），主色目標 >= 5.5:1。主色 `--color-primary` SHALL 為 `#437d00`，`--text-muted` SHALL 為 `#555555`。語義化顏色維持不變：紅色系 = 待付餘額/錯誤、綠色系 = 已結清/待退。

#### Scenario: 主色對比度驗證
- **WHEN** 使用者在白色背景上檢視主色文字或按鈕
- **THEN** 主色 `#437d00` 與白色背景的對比度 >= 7:1

#### Scenario: muted 文字對比度驗證
- **WHEN** 使用者在白色背景上檢視次要文字（如標籤、說明文字）
- **THEN** `--text-muted` (#555555) 與白色背景的對比度 >= 4.5:1

#### Scenario: 待收金額顯示警示色
- **WHEN** 某成員待收金額為正值（需繳錢）
- **THEN** 金額以紅色系顯示

#### Scenario: 待退金額顯示正向色
- **WHEN** 某成員餘額為負值（需退款）
- **THEN** 金額以綠色系顯示

---

### Requirement: 深色模式
系統 SHALL 支援深色模式，自動跟隨系統設定，使用者亦可手動切換並記住選擇。

#### Scenario: 自動跟隨系統設定
- **WHEN** 使用者的系統設為深色模式
- **THEN** App 自動切換至深色主題

#### Scenario: 手動切換
- **WHEN** 使用者在設定中手動切換深色/淺色模式
- **THEN** App 即時套用並記住設定

---

### Requirement: 簡易操作設計
關鍵操作 SHALL 遵循簡易操作原則：重要操作（封存、刪除）需二次確認；錯誤訊息使用完整文字說明；支援 `prefers-reduced-motion`。

#### Scenario: 封存操作需確認
- **WHEN** 使用者點擊「封存旅行」
- **THEN** 系統顯示確認對話框，說明封存後不可編輯，需使用者明確確認

#### Scenario: 動畫偏好設定
- **WHEN** 使用者系統設定 `prefers-reduced-motion: reduce`
- **THEN** App 停用所有非必要過渡動畫

---

### Requirement: 表格斑馬紋
系統 SHALL 在所有資料表格中使用交錯行背景色（zebra striping），幫助使用者橫向追蹤資料列。偶數行 SHALL 使用淡背景色，奇數行保持透明。

#### Scenario: 費用表格斑馬紋
- **WHEN** 使用者檢視費用列表頁面，且有 2 筆以上費用
- **THEN** 表格偶數行顯示淡灰色背景，奇數行為透明背景

#### Scenario: 結算表格斑馬紋
- **WHEN** 使用者檢視結算餘額表格
- **THEN** 表格偶數行顯示淡灰色背景，奇數行為透明背景

---

### Requirement: 圓角與陰影層次系統
系統 SHALL 使用加大的圓角與分級陰影令牌，營造視覺層次感。圓角令牌：`--radius-md: 10px`、`--radius-lg: 14px`、`--radius-xl: 20px`。陰影令牌：`--shadow-sm`（表格容器）、`--shadow-md`（卡片）、`--shadow-lg`（modal）。

#### Scenario: 卡片具有中等陰影
- **WHEN** 使用者檢視首頁的旅行卡片或個人頁的統計卡片
- **THEN** 卡片具有 `--shadow-md` 陰影效果與 `--radius-lg` 圓角

#### Scenario: Modal 具有大陰影
- **WHEN** 系統顯示對話框（新增費用、確認刪除等）
- **THEN** 對話框具有 `--shadow-lg` 陰影效果

#### Scenario: 表格容器具有小陰影
- **WHEN** 使用者檢視包含表格的頁面
- **THEN** 表格外框容器具有 `--shadow-sm` 陰影效果

---

### Requirement: 按鈕觸覺回饋
系統 SHALL 為所有按鈕提供 `:active` 狀態視覺回饋，讓使用者明確感知「已按下」。回饋方式為 `scale(0.97)` 縮小效果搭配背景色加深。當使用者啟用 `prefers-reduced-motion` 時，SHALL 僅使用背景色加深（不使用 transform）。

#### Scenario: 按鈕按壓回饋（一般模式）
- **WHEN** 使用者按下任何按鈕
- **THEN** 按鈕出現輕微縮小（scale 0.97）與背景色加深效果

#### Scenario: 按鈕按壓回饋（減少動態模式）
- **WHEN** 使用者系統設定 `prefers-reduced-motion: reduce` 且按下按鈕
- **THEN** 按鈕僅顯示背景色加深，不使用 transform 動畫

---

### Requirement: Focus 可見性強化
系統 SHALL 為所有可互動元素（按鈕、連結、tab）加上 `:focus-visible` 外框，使用主色半透明 ring（`outline: 2px solid var(--color-primary); outline-offset: 2px`）。滑鼠點擊時 SHALL NOT 顯示 focus ring（僅鍵盤導航觸發）。

#### Scenario: 鍵盤導航顯示 focus ring
- **WHEN** 使用者使用 Tab 鍵切換到按鈕或連結
- **THEN** 該元素顯示主色外框 ring

#### Scenario: 滑鼠點擊不顯示 focus ring
- **WHEN** 使用者以滑鼠點擊按鈕
- **THEN** 該按鈕不顯示額外的 focus ring

---

### Requirement: 中文排版字體
系統 SHALL 載入 Google Fonts Noto Sans TC 作為主要字體，`--font-sans` 令牌值為 `'Noto Sans TC', system-ui, -apple-system, sans-serif`。字體載入失敗時 SHALL 自動 fallback 至系統字體，不影響功能使用。

#### Scenario: 字體正常載入
- **WHEN** 使用者在有網路的環境下首次開啟 App
- **THEN** 頁面文字使用 Noto Sans TC 字體渲染

#### Scenario: 字體離線 fallback
- **WHEN** 使用者在離線環境且字體未被快取
- **THEN** 頁面文字使用 system-ui fallback 字體渲染，版面不破版

---

### Requirement: 操作按鈕防誤觸間距
費用表格的編輯/刪除 icon 按鈕 SHALL 從 16px 放大至 20px，兩按鈕之間間距 SHALL >= 12px。旅伴列表的刪除按鈕與名稱之間 SHALL 保持足夠間距避免誤觸。

#### Scenario: 費用操作按鈕尺寸與間距
- **WHEN** 使用者檢視費用列表中的編輯/刪除按鈕
- **THEN** icon 尺寸為 20px，兩按鈕間距 >= 12px

#### Scenario: 旅伴刪除按鈕間距
- **WHEN** 使用者檢視旅伴列表中的刪除按鈕
- **THEN** 刪除按鈕與旅伴名稱之間有足夠間距，不易誤觸
