# Vercel + Supabase 部署指南

這份文件將教你如何將此專案部署到 Vercel，並連接 Supabase 資料庫。

## 1. 準備工作

確保你已經完成：
1.  擁有 GitHub 帳號，並將此專案 Push 到 GitHub。
2.  擁有 [Vercel](https://vercel.com) 帳號 (建議直接用 GitHub 登入)。
3.  擁有 [Supabase](https://supabase.com) 帳號並已建立專案 (參考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))。

## 2. 部署到 Vercel

1.  登入 **Vercel Dashboard**。
2.  點擊 **Add New...** -> **Project**。
3.  在 "Import Git Repository" 列表中，找到你的 `badminton-flow` 專案，點擊 **Import**。
4.  **設定環境變數 (Environment Variables)**：
    *   展開 **Environment Variables** 選項。
    *   參照你的 `.env` 檔案，依序新增以下變數：
        *   Key: `VITE_SUPABASE_URL`, Value: (你的 Supabase Project URL)
        *   Key: `VITE_SUPABASE_ANON_KEY`, Value: (你的 Anon Key)
5.  點擊 **Deploy**。

## 3. 驗證

部署完成後，Vercel 會給你一個網址 (例如 `badminton-flow.vercel.app`)。
點擊該網址，你的網站應該就能正常運作並連線到資料庫了！

## 常見問題

*   **Q: 如果我更新了程式碼怎麼辦？**
    *   A: 只要你 `git push` 到 GitHub 的 `main` 分支，Vercel 會自動偵測並重新部署，你不需要做任何事。
*   **Q: 資料庫連不上？**
    *   A: 請檢查 Vercel 專案設定裡的 Environment Variables 是否填寫正確，特別是 Key 有沒有多複製了空白鍵。
