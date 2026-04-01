import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, Badge, EmptyState } from '@/components/ui';
import { ProductModal } from './ProductModal';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

interface Props {
  products: Product[];
  isAdmin:  boolean;
}

export function AdminTab({ products, isAdmin }: Props) {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState<Product | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  /* 非管理員攔截 */
  if (!isAdmin) {
    return (
      <EmptyState
        icon={Settings}
        title="需要管理員權限"
        description="請點擊左側側欄底部的「管理員登入」按鈕，以 Google 帳號登入後方可存取。"
      />
    );
  }

  const openNew  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditTarget(p); setModalOpen(true); };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`確定要刪除「${p.name}」嗎？此操作無法復原。`)) return;
    setDeletingId(p.id);
    try {
      await deleteDoc(doc(db, 'products', p.id));
      toast.success(`「${p.name}」已刪除`);
    } catch (err) {
      toast.error(`刪除失敗：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* ── 標題列 ─────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">競品資料管理</h2>
            <p className="text-sm text-slate-400 mt-0.5">共 {products.length} 筆競品資料</p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm
                       font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200/50
                       transition-all"
          >
            <Plus size={16} /> 新增競品
          </button>
        </div>

        {/* ── 產品列表 ───────────────────────────── */}
        {products.length === 0 ? (
          <EmptyState
            icon={Settings}
            title="尚無競品資料"
            description="點擊右上角「新增競品」開始建立資料庫。"
            action={
              <button
                onClick={openNew}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                新增第一筆
              </button>
            }
          />
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['產品名稱', '品牌', '類別', '價格', '規格群組', '操作'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => {
                    const groupCount   = Object.keys(p.specGroups ?? {}).length;
                    const isBeingDeleted = deletingId === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/60 transition-colors ${isBeingDeleted ? 'opacity-40' : ''}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {p.thumbnail ? (
                              <img
                                src={p.thumbnail}
                                alt={p.name}
                                className="w-9 h-9 rounded-lg object-contain bg-slate-100 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-slate-900">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{p.brand}</td>
                        <td className="px-5 py-3.5">
                          {p.category
                            ? <Badge variant="default">{p.category}</Badge>
                            : <span className="text-slate-300">—</span>
                          }
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">
                          {p.price ? `$${p.price.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {groupCount > 0
                            ? <span className="text-indigo-600 font-semibold">{groupCount} 個群組</span>
                            : <span className="text-slate-300 text-xs">未設定</span>
                          }
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              title="編輯"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              disabled={isBeingDeleted}
                              title="刪除"
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* ── 新增 / 編輯 Modal ─────────────────────── */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editTarget}
      />
    </>
  );
}
