# Supabase 設定指南

這份指南將協助你建立並連接 Supabase 資料庫。由於你是初學者，我會一步步詳細說明。

## 1. 建立 Supabase 帳號與專案
1.前往 [Supabase 官網](https://supabase.com/) 並註冊帳號。
2. 登入後，點擊 "New project"。
3. 填寫專案資訊：
   - **Name**: 專案名稱 (例如：`badminton-flow`)
   - **Database Password**: 設定一個強密碼 (**務必記住這個密碼！**)
   - **Region**: 選擇離你最近的區域 (例如：`Northeast Asia (Tokyo)` 或 `Singapore`)
4. 點擊 "Create new project"。等待幾分鐘讓資料庫初始化。

## 2. 取得 API 金鑰
專案建立完成後，你需要取得連接所需的金鑰：
1. 在左側選單點擊 **Project Settings** (齒輪圖示)。
2. 點擊 **API**。
3. 找到 `Project URL` 和 `anon` / `public` key。
   - `Project URL`: 你的專案網址
   - `anon key`: 公開的 API 金鑰 (前端用)

## 3. 設定環境變數
在你的專案根目錄中，已經有一個 `.env.example` (或者自建一個)。請建立一個名為 `.env` 的檔案，內容如下：

```env
VITE_SUPABASE_URL=你的_Project_URL
VITE_SUPABASE_ANON_KEY=你的_anon_key
```

> ⚠️ **注意**：絕對不要將 `service_role` key (密鑰) 放在前端程式碼或 `.env` 中，那擁有最高權限！前端只需要 `anon` key。

## 4. 安裝 Supabase Client
回到你的專案，開啟終端機 (Terminal) 並執行：

```bash
npm install @supabase/supabase-js
```

## 5. 建立 Supabase Client 程式
在專案 `src` 資料庫下建立一個 `lib` 資料夾，並新增 `supabase.ts`：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

現在你就可以在其他元件中 `import { supabase } from '@/lib/supabase'` 來使用了！

## 6. 下一步
- 學習如何使用 Supabase 的 Table Editor 建立資料表。
- 學習如何設定 Row Level Security (RLS) 來保護資料。
- 閱讀 [Supabase 官方文件](https://supabase.com/docs) (英文) 或詢問我更多細節。
