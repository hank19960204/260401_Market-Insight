/**
 * ProductModal — 新增 / 編輯競品資料
 *
 * 【動態規格設計】
 * specGroups 的資料結構：Record<groupName, SpecItem[]>
 *
 * 編輯介面操作流程：
 *   1. 點「+ 新增規格群組」→ 輸入群組名稱（例如：「處理器」「電池」「RFID 讀頭」）
 *   2. 在每個群組內點「+ 新增規格項目」→ 填入 label / value / unit
 *   3. 儲存時整個 specGroups Map 直接寫入 Firestore，保持彈性
 */
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Modal, Spinner } from '@/components/ui';
import toast from 'react-hot-toast';
import type { Product, SpecGroups, SpecItem } from '@/types';

/* 空白產品模板 */
const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name:        '',
  brand:       '',
  category:    '',
  releaseDate: '',
  price:       0,
  thumbnail:   '',
  website:     '',
  tags:        [],
  specGroups:  {},
};

interface Props {
  open:     boolean;
  onClose:  () => void;
  initial?: Product | null; // null = 新增模式
}

export function ProductModal({ open, onClose, initial }: Props) {
  const [form,    setForm]    = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [saving,  setSaving]  = useState(false);
  /* 各群組的展開/收合狀態 */
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  /* 切換新增/編輯時重設表單 */
  useEffect(() => {
    if (initial) {
      const { id: _id, ...rest } = initial;
      setForm(rest);
      /* 預設全部展開 */
      const expanded: Record<string, boolean> = {};
      Object.keys(rest.specGroups ?? {}).forEach(g => { expanded[g] = true; });
      setOpenGroups(expanded);
    } else {
      setForm(EMPTY_PRODUCT);
      setOpenGroups({});
    }
  }, [initial, open]);

  /* ── 通用欄位更新 ─────────────────────────────── */
  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  /* ── 新增規格群組 ─────────────────────────────── */
  const addGroup = () => {
    const name = prompt('請輸入規格群組名稱（例如：處理器、電池、RFID讀頭）：');
    if (!name?.trim()) return;
    if (form.specGroups[name]) {
      toast.error('群組名稱已存在');
      return;
    }
    setForm(prev => ({
      ...prev,
      specGroups: { ...prev.specGroups, [name]: [] },
    }));
    setOpenGroups(prev => ({ ...prev, [name]: true }));
  };

  /* ── 刪除規格群組 ─────────────────────────────── */
  const removeGroup = (group: string) => {
    setForm(prev => {
      const next: SpecGroups = { ...prev.specGroups };
      delete next[group];
      return { ...prev, specGroups: next };
    });
  };

  /* ── 重新命名群組 ─────────────────────────────── */
  const renameGroup = (oldName: string) => {
    const newName = prompt('請輸入新的群組名稱：', oldName);
    if (!newName?.trim() || newName === oldName) return;
    setForm(prev => {
      const next: SpecGroups = {};
      Object.entries(prev.specGroups).forEach(([k, v]) => {
        next[k === oldName ? newName : k] = v;
      });
      return { ...prev, specGroups: next };
    });
  };

  /* ── 新增規格項目 ─────────────────────────────── */
  const addItem = (group: string) => {
    setForm(prev => ({
      ...prev,
      specGroups: {
        ...prev.specGroups,
        [group]: [
          ...(prev.specGroups[group] ?? []),
          { label: '', value: '', unit: '' },
        ],
      },
    }));
  };

  /* ── 更新規格項目欄位 ─────────────────────────── */
  const updateItem = useCallback((
    group: string,
    idx: number,
    field: keyof SpecItem,
    value: string
  ) => {
    setForm(prev => {
      const items = [...(prev.specGroups[group] ?? [])];
      items[idx] = { ...items[idx], [field]: value };
      return {
        ...prev,
        specGroups: { ...prev.specGroups, [group]: items },
      };
    });
  }, []);

  /* ── 刪除規格項目 ─────────────────────────────── */
  const removeItem = (group: string, idx: number) => {
    setForm(prev => ({
      ...prev,
      specGroups: {
        ...prev.specGroups,
        [group]: prev.specGroups[group].filter((_, i) => i !== idx),
      },
    }));
  };

  /* ── 儲存 ─────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.name.trim() || !form.brand.trim()) {
      toast.error('請填寫產品名稱與品牌');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        tags: typeof form.tags === 'string'
          ? (form.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean)
          : form.tags,
      };

      if (initial?.id) {
        await updateDoc(doc(db, 'products', initial.id), payload);
        toast.success('競品資料已更新');
      } else {
        await addDoc(collection(db, 'products'), payload);
        toast.success('競品已新增至資料庫');
      }
      onClose();
    } catch (err) {
      toast.error(`儲存失敗：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `編輯：${initial.name}` : '新增競品資料'}
      size="xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm
                       font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200
                       disabled:opacity-50 transition-all"
          >
            {saving && <Spinner className="text-white w-4 h-4" />}
            {saving ? '儲存中...' : '儲存資料'}
          </button>
        </>
      }
    >
      <div className="space-y-8">

        {/* ── 基本資訊 ─────────────────────────────── */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            基本資訊
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="品牌 *">
              <input className={inputCls}
                placeholder="例如：Apple、Zebra Technologies"
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
              />
            </Field>
            <Field label="產品名稱 *">
              <input className={inputCls}
                placeholder="例如：iPhone 16 Pro、ZQ630"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </Field>
            <Field label="產品類別">
              <input className={inputCls}
                placeholder="例如：智慧型手機、RFID 手持機"
                value={form.category}
                onChange={e => set('category', e.target.value)}
              />
            </Field>
            <Field label="建議售價（USD）">
              <input className={inputCls} type="number" min={0}
                placeholder="例如：999"
                value={form.price || ''}
                onChange={e => set('price', Number(e.target.value))}
              />
            </Field>
            <Field label="發布日期">
              <input className={inputCls} type="date"
                value={form.releaseDate}
                onChange={e => set('releaseDate', e.target.value)}
              />
            </Field>
            <Field label="Tags（逗號分隔）">
              <input className={inputCls}
                placeholder="例如：5G, NFC, Android"
                value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              />
            </Field>
          </div>
        </section>

        {/* ── 媒體與連結 ───────────────────────────── */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            媒體與連結
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="縮圖 URL">
              <input className={inputCls}
                placeholder="https://..."
                value={form.thumbnail}
                onChange={e => set('thumbnail', e.target.value)}
              />
            </Field>
            <Field label="官方網站">
              <input className={inputCls}
                placeholder="https://..."
                value={form.website ?? ''}
                onChange={e => set('website', e.target.value)}
              />
            </Field>
          </div>
          {form.thumbnail && (
            <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={form.thumbnail}
                alt="preview"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </section>

        {/* ── 動態規格群組 ─────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                動態規格群組
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                可自由新增群組（如「電池」、「RFID讀頭」）與規格項目，不受固定欄位限制
              </p>
            </div>
            <button
              onClick={addGroup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold
                         text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Plus size={13} /> 新增群組
            </button>
          </div>

          {Object.keys(form.specGroups).length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-400">點擊「新增群組」開始建立規格資料</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(form.specGroups).map(([group, items]) => (
                <div key={group} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* 群組標題列 */}
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <button
                      onClick={() => setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }))}
                      className="flex items-center gap-2 font-semibold text-sm text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      {openGroups[group] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      {group}
                      <span className="text-[11px] text-slate-400 font-normal ml-1">
                        {items.length} 項
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => renameGroup(group)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
                      >
                        重新命名
                      </button>
                      <button
                        onClick={() => addItem(group)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                      >
                        <Plus size={12} /> 新增項目
                      </button>
                      <button
                        onClick={() => removeGroup(group)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 群組內容（可折疊） */}
                  {openGroups[group] && (
                    <div className="p-3 space-y-2">
                      {items.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-3">
                          點上方「新增項目」按鈕加入規格
                        </p>
                      ) : (
                        items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-center">
                            <input
                              className={inputSmCls}
                              placeholder="規格名稱（例如：CPU型號）"
                              value={item.label}
                              onChange={e => updateItem(group, idx, 'label', e.target.value)}
                            />
                            <input
                              className={inputSmCls}
                              placeholder="數值（例如：Snapdragon 8 Gen 3）"
                              value={item.value}
                              onChange={e => updateItem(group, idx, 'value', e.target.value)}
                            />
                            <input
                              className={inputSmCls}
                              placeholder="單位（mAh）"
                              value={item.unit}
                              onChange={e => updateItem(group, idx, 'unit', e.target.value)}
                            />
                            <button
                              onClick={() => removeItem(group, idx)}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

/* ── 小工具 ───────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls = `
  w-full px-3 py-2 text-sm rounded-lg border border-slate-200
  focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400
  transition placeholder:text-slate-300
`.trim();

const inputSmCls = `
  w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200
  focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400
  transition placeholder:text-slate-300
`.trim();
