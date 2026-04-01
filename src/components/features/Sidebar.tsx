import {
  LayoutDashboard, TableProperties, FileText,
  TrendingUp, Settings, LogIn, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabId } from '@/types';
import type { User } from 'firebase/auth';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  user:    User | null;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: TabId; icon: React.ElementType; label: string; adminOnly?: boolean }[] = [
  { id: 'dashboard',  icon: LayoutDashboard,  label: '趨勢總覽' },
  { id: 'comparison', icon: TableProperties,  label: '競品對比' },
  { id: 'strategy',   icon: FileText,         label: '策略藍圖' },
  { id: 'news',       icon: TrendingUp,       label: '最新消息' },
  { id: 'admin',      icon: Settings,         label: '資料管理', adminOnly: true },
];

export function Sidebar({ activeTab, onTabChange, user, isAdmin, onLogin, onLogout }: SidebarProps) {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <TrendingUp size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-900 leading-tight">ProAnalyst</h1>
            <p className="text-[10px] text-slate-400 font-medium">競品分析平台</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* 管理員標籤 */}
        {isAdmin && (
          <div className="px-3 pb-2">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
              管理員模式
            </span>
          </div>
        )}

        {NAV_ITEMS.map(item => {
          /* 非管理員隱藏 adminOnly 頁面 */
          if (item.adminOnly && !isAdmin) return null;

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium transition-all rounded-lg text-left',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 sidebar-active'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <item.icon size={17} className={isActive ? 'text-indigo-600' : ''} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 使用者區塊 */}
      <div className="px-3 py-4 border-t border-slate-100">
        {user ? (
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ''}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                  {user.displayName?.charAt(0) ?? 'U'}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {user.displayName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isAdmin ? '✦ 管理員' : '一般訪客'}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="登出"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-semibold"
          >
            <LogIn size={15} />
            管理員登入
          </button>
        )}
      </div>
    </aside>
  );
}
