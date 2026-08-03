# PrintOS — 3D 列印管理平台

**規格書 12 大功能模組已全數完成。** 從這裡開始是最後的收尾：完整測試、Firebase Storage 正式啟用（若尚未開通）、正式部署。

## 功能完成清單

| # | 功能 | 狀態 |
|---|------|------|
| 1 | 首頁 Dashboard | ✅ 統計卡片、每日列印量/每月收入/耗材使用圖表、耗材與設備保養提醒橫幅 |
| 2 | 列印作品管理 | ✅ 完整 CRUD、搜尋/排序/篩選、照片上傳、可從耗材庫存帶入材料成本 |
| 3 | 耗材管理 | ✅ 庫存 CRUD、低庫存自動提醒 |
| 4 | 成本計算 | ✅ 材料/電費/折舊/人工/包材/運費/抽成/稅金試算，依利潤率建議售價 |
| 5 | 客戶管理 | ✅ CRM，歷史訂單數與總消費即時計算 |
| 6 | 訂單管理 | ✅ 完整 CRUD，可列印報價單/出貨單/發票 |
| 7 | 作品展示 | ✅ 可從列印作品一鍵匯入，支援收藏、分享、縮時影片連結 |
| 8 | 列印失敗資料庫 | ✅ 可搜尋、可分類，供 AI 助手引用 |
| 9 | AI 助手 | ✅ 規則式問答（知識庫 + 使用者失敗案例），保留串接 OpenAI API 的擴充空間 |
| 10 | 數據分析 | ✅ 收入/成本/利潤趨勢、成功率趨勢、熱門產品、耗材/客戶排行、月度/年度比較 |
| 11 | 通知 | ✅ 列印完成、耗材不足、訂單未付款、交貨提醒、保養提醒；支援瀏覽器桌面通知（分頁開啟時） |
| 12 | 設備管理 | ✅ 印表機/噴嘴/PEI板/熱端/AMS，保養週期提醒、累積時數（印表機類型會額外顯示平台自動統計的列印時數） |

## 誠實的技術限制說明

- **通知**是「應用內即時通知 + 瀏覽器桌面通知」，不是背景推播（背景推播需要 Service Worker + Firebase Cloud Messaging + 後端排程，屬於很大的額外基礎建設，規格書沒有明確要求一定要背景推播；若你需要這個功能，跟我說一聲我可以加上）。目前的通知只在你開著這個分頁時才會運作。
- **AI 助手**是規則式關鍵字比對，不是真正的大型語言模型。程式碼已經把邏輯封裝在 `src/services/aiService.ts`，未來要串接 OpenAI API，只需要改這一個檔案。
- **作品照片上傳**需要 Firebase Storage 為 Blaze（隨用隨付）方案，若你之前選擇跳過，這些欄位可以先用貼網址的方式使用，或之後升級方案再啟用檔案上傳。

## 一、本機安裝

```bash
npm install
cp .env.example .env.local
# 打開 .env.local，填入你的 Firebase 專案金鑰（見下方步驟二）
npm run dev
```

## 二、建立 Firebase 專案

1. 前往 https://console.firebase.google.com ，點「新增專案」
2. 專案建立後，進入「建構」>「Authentication」>「開始使用」
   - 啟用「Email/密碼」登入方式
   - 啟用「Google」登入方式
3. 進入「建構」>「Firestore Database」>「建立資料庫」
   - 選擇「以正式環境模式啟動」（正式規則會由本專案的 `firestore.rules` 覆蓋）
   - 選擇離你最近的地區（如 `asia-east1`）
4. 進入「建構」>「Storage」>「開始使用」（需升級 Blaze 方案，若要用照片上傳功能才需要這步）
5. 進入「專案設定」>「一般」，往下捲到「你的應用程式」，點網頁圖示 `</>` 新增網頁應用程式
6. 複製畫面上顯示的 `firebaseConfig` 數值，填入 `.env.local` 對應欄位

## 三、部署安全規則（需要 Firebase CLI）

```bash
npm install -g firebase-tools
firebase login
firebase init   # 選擇 Firestore、Storage，並指定你剛建立的專案（其餘設定可略過，本專案已提供設定檔）
firebase deploy --only firestore:rules,storage:rules
```

`firestore.rules` 採用通用隔離設計：`users/{uid}/{任何子集合}` 都只有該使用者本人能讀寫，新增集合（如這次的 `equipment`）不需要額外修改規則檔案。

## 四、上傳到 GitHub

```bash
git init
git add .
git commit -m "PrintOS: 12 大功能模組完成"
gh repo create printos --private --source=. --push
# 若沒有安裝 gh CLI，改用：
# 1. 到 https://github.com/new 建立空的 repository
# 2. git remote add origin https://github.com/<你的帳號>/printos.git
# 3. git branch -M main
# 4. git push -u origin main
```

> `.env.local` 已被 `.gitignore` 排除，不會被上傳，Firebase 金鑰不會外洩。

## 五、部署到 Vercel

```bash
npm install -g vercel
vercel login
vercel
```

部署過程中：
- Framework Preset 選擇 **Vite**
- Build Command：`npm run build`
- Output Directory：`dist`
- 在 Vercel 專案設定的「Environment Variables」，把 `.env.local` 內的六個 `VITE_FIREBASE_*` 變數一一貼上

完成後執行 `vercel --prod` 部署正式版。

> 若在 Safari 遇到 CLI 的 OAuth 登入視窗卡住的問題，可改用瀏覽器直接到 https://vercel.com/new 匯入 GitHub repository 部署，效果相同且更穩定。

## 六、部署到 Render（可選）

1. 到 https://dashboard.render.com/ 建立「Static Site」
2. 連接你的 GitHub repository
3. Build Command：`npm run build`
4. Publish Directory：`dist`
5. 在「Environment」加入六個 `VITE_FIREBASE_*` 變數

## 七、下一步

全部功能都測試沒問題、也部署上線後，接下來可以視需求擴充：
- AI 助手串接 OpenAI API（真正的自然語言回答）
- 通知改為真正的背景推播（需要 Service Worker + FCM）
- 更細緻的權限管理（如多人協作、唯讀分享連結）

如果測試過程中發現任何功能跟預期不符，直接告訴我狀況（最好附截圖），我可以針對性修正。

## 專案結構

```
src/
  components/
    layout/     # Sidebar、Header、DashboardLayout、ProtectedRoute
    ui/         # Button、Card、Input、Select、Textarea、ConfirmDialog 等共用元件
    jobs/       # 列印作品相關元件
    filaments/  # 耗材相關元件
    customers/  # 客戶相關元件
    orders/     # 訂單與列印文件相關元件
    showcase/   # 作品展示相關元件
    failures/   # 失敗案例相關元件
    equipment/  # 設備相關元件
  contexts/     # AuthContext、ThemeContext
  data/         # AI 助手知識庫
  firebase/     # Firebase 初始化設定
  hooks/        # 各模組的自訂 hook（資料訂閱、統計計算）
  pages/        # 各功能模組頁面
  services/     # Firestore/Storage/AI 邏輯封裝
  types/        # 全域 TypeScript 型別
  utils/        # 共用工具函式（格式化、Chart.js 設定等）
```
