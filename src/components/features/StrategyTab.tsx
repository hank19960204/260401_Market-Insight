import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui';

export function StrategyTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="2024 Q2 設計趨勢洞察">
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            根據數據顯示，<strong className="text-slate-900">「極致輕薄」</strong>與
            <strong className="text-slate-900">「長效續航」</strong>依然是使用者的核心關注點。
            然而，<strong className="text-slate-900">「永續材質」</strong>的提及頻次在過去三個月增長了 45%。
          </p>
          <ul className="space-y-3">
            {[
              '建議採用回收鋁材作為外殼主要材質。',
              '優化內部堆疊結構，厚度目標控制在 7.5mm 以內。',
              '電池容量維持 5000mAh 以上，同時搭配快充方案。',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="技術演進路徑">
        <div className="space-y-3">
          {[
            { year: '2022', tech: '傳統堆疊結構',     status: '已淘汰', color: 'text-red-400' },
            { year: '2023', tech: '高密度電池封裝',   status: '主流',   color: 'text-emerald-500' },
            { year: '2024', tech: '固態電池試產',     status: '研發中', color: 'text-amber-500' },
            { year: '2025', tech: 'AI 電量管理晶片', status: '預測',   color: 'text-indigo-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="font-mono font-bold text-indigo-600 text-sm w-12 flex-shrink-0">
                {item.year}
              </div>
              <div className="flex-1 font-medium text-slate-800 text-sm">{item.tech}</div>
              <div className={`text-xs font-semibold ${item.color}`}>{item.status}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="競爭力矩陣" className="md:col-span-2">
        <p className="text-sm text-slate-400 text-center py-6">
          管理員可在此頁面新增自訂策略報告（開發中）
        </p>
      </Card>
    </div>
  );
}
