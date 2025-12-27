# Badminton Flow

Badminton Flow 是一個羽球相關的應用程式專案，採用現代化的技術堆疊：
- **Frontend**: React (Vite + TypeScript)
- **Database**: Supabase
- **Deployment**: Vercel

## 🚀 快速開始

### 1. 安裝與執行 (Local)

**前置需求：** 需要安裝 [Node.js](https://nodejs.org/) (v20+)。

1. **複製專案與安裝套件**
   ```bash
   git clone <your-repo-url>
   cd badminton-flow
   npm install
   ```

2. **設定環境變數**
   複製 `.env.example` 為 `.env`，並填入你的 Supabase 金鑰 (請參考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))。

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

## 📚 詳細指南

我們準備了詳細的圖文教學文件幫助你上手：

- **資料庫設定**：請閱讀 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 了解如何申請與設定 Supabase。
- **網站部署**：請閱讀 [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) 了解如何將網站發布到 Vercel。

## 📝 專案結構

- `src/` - 原始碼目錄
  - `components/` - UI 元件
  - `services/` - 邏輯與服務
  - `lib/` - 第三方套件設定 (如 supabase.ts)
