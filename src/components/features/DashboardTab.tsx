import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { TableProperties, Filter, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import type { Product, Trend } from '@/types';

interface Props {
  products: Product[];
  trends:   Trend[];
}

export function DashboardTab({ products, trends }: Props) {
  const marketShareData = trends.filter(t => t.type === 'market_share');
  const painPoints      = trends
    .filter(t => t.type === 'pain_point')
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

  /* 取前兩個不重複的分類 */
  const categories = [...new Set(products.map(p => p.category))].slice(0, 2).join(', ') || 'N/A';

  return (
    <div className="space-y-6">
      {/* ── KPI 卡片 ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-1">
                總競品數量
              </p>
              <p className="text-4xl font-bold">{products.length}</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <TableProperties size={20} />
            </div>
          </div>
        </div>

        <Card className="!p-0">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                  主要市場類別
                </p>
                <p className="text-lg font-bold text-slate-800 leading-tight">{categories}</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <Filter size={20} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="!p-0">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                  最新趨勢洞察
                </p>
                <p className="text-lg font-bold text-slate-800 leading-tight">
                  {trends.length > 0 ? trends[0].label : '尚無資料'}
                </p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 圖表 ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="市場佔有率趨勢">
          {marketShareData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">尚無市場數據</p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketShareData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8" fontSize={11}
                    tickLine={false} axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8" fontSize={11}
                    tickLine={false} axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px', border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone" dataKey="value"
                    stroke="#4f46e5" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#4f46e5', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="使用者痛點分析">
          {painPoints.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">尚無痛點資料</p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={painPoints} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="label" type="category"
                    stroke="#64748b" fontSize={11}
                    width={90} tickLine={false} axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                  />
                  <Bar dataKey="weight" radius={[0, 5, 5, 0]} maxBarSize={22}>
                    {painPoints.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.sentiment === 'negative' ? '#f87171' : '#34d399'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
