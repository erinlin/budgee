# Budgee

旅行團體費用分攤管理工具，專為長者友善設計。支援離線使用，資料儲存於本機瀏覽器。

**Online Demo:** https://budgee-iota.vercel.app/

## 功能

- **旅程管理** - 建立多個旅程，支援封存
- **旅伴管理** - 新增旅伴，常用旅伴快速選取
- **花費紀錄** - 分攤型（均攤）與選項型（各選品項）兩種模式
- **收款管理** - 記錄收款，自動計算每人餘額
- **個人明細** - 查看單一旅伴的分攤、代墊、付款紀錄
- **匯出** - JSON 備份、PDF 列印報表
- **PWA** - 可安裝至手機主畫面，支援離線使用

## 技術棧

| 類別 | 技術 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 建置工具 | Vite |
| 本地資料庫 | Dexie.js（IndexedDB） |
| 狀態管理 | Zustand |
| 表格 | TanStack Table v8 |
| PWA | vite-plugin-pwa + Workbox |
| 樣式 | Vanilla CSS 變數（設計令牌系統） |

## 本地開發

```bash
npm install
npm run dev
```

## 部署

```bash
npm run build
# dist/ 資料夾上傳至靜態托管服務（Vercel / Netlify）
```

## 資料儲存

所有資料存於使用者瀏覽器的 IndexedDB，不上傳至任何伺服器。清除瀏覽器資料會一併清除旅程紀錄，建議定期使用 JSON 匯出備份。
