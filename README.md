# ProAnalyst — 產品競品分析平台

一個協助產品團隊探索電子裝置設計趨勢與規格制定的分析平台。  
支援跨品類動態規格對比（手機 / RFID 裝置 / 掃描儀器等），基於 **Vite + React + Firebase** 構建。

---

## ✨ 功能特色

- **訪客模式**：無需登入，可瀏覽競品對比、趨勢圖表、最新消息
- **管理員模式**：Google 登入後解鎖完整 CRUD，管理競品資料庫
- **動態規格群組**：自由定義規格維度（如「電池」「RFID讀頭」），不受固定欄位限制
- **水平捲動對比表**：凍結首欄，支援多品比較
- **即時同步**：Firestore `onSnapshot`，資料改動立即反映在所有分頁

---

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Firebase 專案

前往 [Firebase Console](https://console.firebase.google.com)：

1. **建立新專案**（或使用現有的）
2. 新增 **Web App**，取得 `firebaseConfig`
3. 啟用 **Authentication** → Sign-in method → **Google**
4. 啟用 **Firestore Database**（選擇你的地區）
5. 複製 Firestore Security Rules（見下方）

### 3. 設定環境變數

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入你的 Firebase 設定：

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
VITE_ADMIN_EMAIL=your-admin@gmail.com
```

### 4. 部署 Firestore Security Rules

```bash
# 安裝 Firebase CLI（如果還沒有）
npm install -g firebase-tools

firebase login
firebase init firestore   # 選擇你的專案
firebase deploy --only firestore:rules
```

> ⚠️ **重要**：記得將 `firestore.rules` 中的 `"your-admin@gmail.com"` 替換成你真實的 Gmail 地址！

### 5. 本地啟動

```bash
npm run dev
# 開啟 http://localhost:5173
```

---

## 📦 部署到 Vercel

### 方式一：GitHub 連動（建議）

1. 將此專案推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "init: ProAnalyst"
   git remote add origin https://github.com/你的帳號/proanalyst.git
   git push -u origin main
   ```

2. 前往 [Vercel](https://vercel.com) → **Add New Project** → 匯入 GitHub repo

3. 在 Vercel 的 **Environment Variables** 頁面填入 `.env.local` 中所有 `VITE_` 開頭的變數

4. Framework Preset 選 **Vite**（Vercel 通常會自動偵測）

5. 點 **Deploy** 🎉

### 方式二：Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

> SPA 路由問題已由 `vercel.json` 的 rewrite 規則處理，所有路徑都會指向 `index.html`。

---

## 🗂️ 專案結構

```
proanalyst/
├── src/
│   ├── App.tsx                    # 根元件（精簡，只負責組合）
│   ├── main.tsx                   # 進入點（含 Toast Provider）
│   ├── index.css                  # 全域樣式 + Tailwind
│   ├── types/
│   │   └── index.ts               # 核心型別（含 SpecGroups）
│   ├── lib/
│   │   ├── firebase.ts            # Firebase 初始化
│   │   └── utils.ts               # cn() 工具函式
│   ├── hooks/
│   │   ├── useAuth.ts             # Firebase Auth 狀態
│   │   └── useFirestore.ts        # Firestore 即時訂閱
│   └── components/
│       ├── ui/                    # 通用 UI 元件
│       │   ├── Card.tsx
│       │   ├── Badge.tsx
│       │   ├── Spinner.tsx
│       │   ├── EmptyState.tsx
│       │   └── Modal.tsx
│       └── features/              # 功能頁面元件
│           ├── Sidebar.tsx
│           ├── DashboardTab.tsx
│           ├── ComparisonTab.tsx
│           ├── StrategyTab.tsx
│           ├── NewsTab.tsx
│           ├── AdminTab.tsx
│           └── ProductModal.tsx   # 動態規格編輯 Modal
├── firestore.rules                # Security Rules
├── vercel.json                    # SPA 路由設定
├── .env.example                   # 環境變數範本
└── .gitignore
```

---

## 🔐 Firestore Security Rules 說明

| 集合 | 讀取 | 寫入 |
|------|------|------|
| `products` | 任何人 | 僅管理員 |
| `trends`   | 任何人 | 僅管理員 |
| `news`     | 任何人 | 僅管理員 |
| 其他       | 拒絕   | 拒絕    |

管理員判定條件：
1. Firebase Auth 已登入
2. email 符合 rules 中設定的管理員 email
3. Google 帳號的 `email_verified = true`

---

## 📊 Firestore Schema

### `products/{productId}`

```json
{
  "name":        "ZQ630",
  "brand":       "Zebra Technologies",
  "category":    "行動列印機",
  "releaseDate": "2024-01-15",
  "price":       599,
  "thumbnail":   "https://...",
  "website":     "https://...",
  "tags":        ["Bluetooth", "WiFi", "ZPL"],
  "specGroups": {
    "無線通訊": [
      { "label": "WiFi 標準", "value": "802.11ax",   "unit": "" },
      { "label": "藍牙版本", "value": "5.0",         "unit": "" }
    ],
    "電池": [
      { "label": "電池容量", "value": "2580",        "unit": "mAh" },
      { "label": "續航時間", "value": "8",           "unit": "小時" }
    ],
    "印表機規格": [
      { "label": "列印寬度", "value": "104",         "unit": "mm" },
      { "label": "解析度",  "value": "203",          "unit": "dpi" }
    ]
  }
}
```

`specGroups` 的 key（群組名）完全由管理員自訂，可跨品類使用不同的維度。
