import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import type { Product } from '@/types';

interface Props { products: Product[] }

export function ComparisonTab({ products }: Props) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="尚無競品資料"
        description="請由管理員登入後在「資料管理」頁面新增競品。"
      />
    );
  }

  /*
   * 動態收集所有規格欄位
   * 輸出格式：Map<groupName, Set<label>>
   * 讓對比表依群組分段顯示
   */
  const groupMap = new Map<string, Set<string>>();
  products.forEach(p => {
    Object.entries(p.specGroups ?? {}).forEach(([group, items]) => {
      if (!groupMap.has(group)) groupMap.set(group, new Set());
      items.forEach(item => groupMap.get(group)!.add(item.label));
    });
  });

  const colCount = products.length;

  return (
    /* 外層 wrapper 控制水平捲動 */
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          style={{ minWidth: `${200 + colCount * 220}px` }}
        >
          {/* ── 產品標頭行 ─────────────────────────────── */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {/* 凍結首欄：規格標籤欄 */}
              <th className="sticky left-0 z-10 bg-slate-50 w-[200px] px-5 py-4 text-left
                             text-[11px] font-bold text-slate-400 uppercase tracking-wider
                             border-r border-slate-200">
                規格項目
              </th>

              {products.map(p => (
                <th key={p.id} className="px-5 py-4 text-left border-l border-slate-200 min-w-[220px]">
                  <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden w-full">
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={e => { (e.target as HTMLImageElement).src = ''; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <FileText size={22} />
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.brand}</p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ── 固定欄位：售價 ───────────────────────── */}
            <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td className="sticky left-0 z-10 bg-white px-5 py-3 font-semibold text-slate-600
                             border-r border-slate-200 text-[13px]">
                建議售價
              </td>
              {products.map(p => (
                <td key={p.id} className="px-5 py-3 border-l border-slate-100 font-mono font-bold text-indigo-600">
                  {p.price ? `$${p.price.toLocaleString()}` : '—'}
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td className="sticky left-0 z-10 bg-white px-5 py-3 font-semibold text-slate-600
                             border-r border-slate-200 text-[13px]">
                發布日期
              </td>
              {products.map(p => (
                <td key={p.id} className="px-5 py-3 border-l border-slate-100 text-slate-700">
                  {p.releaseDate || '—'}
                </td>
              ))}
            </tr>

            {/* ── 動態規格群組 ─────────────────────────── */}
            {groupMap.size === 0 ? (
              <tr>
                <td
                  colSpan={products.length + 1}
                  className="px-5 py-8 text-center text-slate-400 text-sm"
                >
                  此競品尚無規格資料
                </td>
              </tr>
            ) : (
              Array.from(groupMap.entries()).map(([group, labels], gi) => (
                <>
                  {/* 群組標題行 */}
                  <tr key={`group-${gi}`} className="bg-indigo-50/60">
                    <td
                      colSpan={products.length + 1}
                      className="sticky left-0 px-5 py-2 text-[11px] font-bold text-indigo-600 uppercase tracking-wider"
                    >
                      {group}
                    </td>
                  </tr>

                  {/* 該群組的每一條規格 */}
                  {Array.from(labels).map((label, li) => (
                    <tr
                      key={`${gi}-${li}`}
                      className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                        li % 2 === 1 ? 'bg-slate-50/30' : ''
                      }`}
                    >
                      <td className="sticky left-0 z-10 bg-inherit px-5 py-3 text-[13px]
                                     font-medium text-slate-600 border-r border-slate-100">
                        {label}
                      </td>

                      {products.map(p => {
                        /* 在對應群組裡找這個 label 的值 */
                        const spec = (p.specGroups?.[group] ?? []).find(s => s.label === label);
                        return (
                          <td
                            key={p.id}
                            className="px-5 py-3 border-l border-slate-100 text-[13px] text-slate-700"
                          >
                            {spec
                              ? `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`
                              : <span className="text-slate-300">—</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
