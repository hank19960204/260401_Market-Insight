/**
 * App.tsx — 根元件
 *
 * 職責：
 *  1. 組合 useAuth + useFirestore 兩個 Hook
 *  2. 控制當前分頁狀態
 *  3. 渲染 Sidebar + Header + 各功能頁面
 *
 * 所有頁面邏輯已拆分至 src/components/features/ 下
 */
import { useState, useMemo } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Sidebar } from '@/components/features/Sidebar';
import { DashboardTab }  from '@/components/features/DashboardTab';
import { ComparisonTab } from '@/components/features/ComparisonTab';
import { StrategyTab }   from '@/components/features/StrategyTab';
import { NewsTab }       from '@/components/features/NewsTab';
import { AdminTab }      from '@/components/features/AdminTab';
import { Spinner }       from '@/components/ui';
import { useAuth }       from '@/hooks/useAuth';
import { useFirestore }  from '@/hooks/useFirestore';
import type { TabId }    from '@/types';

/* 分頁標題 / 描述對照表 */
const PAGE_META: Record<TabId, { title: string; desc: string }> = {
  dashboard:  { title: '市場趨勢與需求看板', desc: '即時追蹤市場動態與使用者核心痛點。' },
  comparison: { title: '競品規格深度對比',   desc: '標準化對比電子裝置規格，提煉差異化優勢。' },
  strategy:   { title: '設計策略與洞察藍圖', desc: '基於數據提煉的產品開發與設計方向。' },
  news:       { title: '競品動態與新品預告', desc: '蒐集並彙整競品最新的產品發佈與市場消息。' },
  admin:      { title: '系統後台管理',       desc: '維護競品資料庫與趨勢報告。' },
};

export default function App() {
  const [activeTab,    setActiveTab]    = useState<TabId>('dashboard');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [dbError,      setDbError]      = useState<string | null>(null);

  const { user, isAdmin, authLoading, login, logout } = useAuth();
  const { products, trends, news, dbLoading }         = useFirestore();

  /* 全域搜尋（對產品名稱 / 品牌進行過濾） */
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  /* 全頁 Loading（首次 Auth 狀態確認） */
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Spinner className="w-10 h-10 text-indigo-600" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">ProAnalyst 載入中...</p>
      </div>
    );
  }

  const meta = PAGE_META[activeTab];

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── 側欄 ─────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        isAdmin={isAdmin}
        onLogin={login}
        onLogout={logout}
      />

      {/* ── 主內容區 ─────────────────────────────── */}
      <main className="flex-1 ml-60 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200/70 px-8 py-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{meta.desc}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* 搜尋框（競品對比頁時特別有用） */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜尋競品..."
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400
                             transition w-52"
                />
              </div>

              {/* DB 載入指示 */}
              {dbLoading && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Spinner className="w-3.5 h-3.5 text-indigo-400" />
                  同步中
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 頁面內容 */}
        <div className="flex-1 p-8">
          {/* Firestore 錯誤提示 */}
          {dbError && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={17} className="flex-shrink-0" />
              <p className="flex-1">{dbError}</p>
              <button onClick={() => setDbError(null)} className="text-xs underline hover:no-underline">
                關閉
              </button>
            </div>
          )}

          {/* 分頁渲染（加入 key 讓換頁時觸發進場動畫） */}
          <div key={activeTab} className="animate-page">
            {activeTab === 'dashboard'  && <DashboardTab  products={products} trends={trends} />}
            {activeTab === 'comparison' && <ComparisonTab products={filteredProducts} />}
            {activeTab === 'strategy'   && <StrategyTab />}
            {activeTab === 'news'       && <NewsTab news={news} />}
            {activeTab === 'admin'      && <AdminTab products={products} isAdmin={isAdmin} />}
          </div>
        </div>
      </main>
    </div>
  );
}
