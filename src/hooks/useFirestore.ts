/**
 * useFirestore — 從 Firestore 即時訂閱三個集合的資料
 * 使用 onSnapshot 讓資料異動時自動更新 UI，無需手動 refresh
 */
import { useEffect, useState } from 'react';
import {
  collection, onSnapshot,
  query, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Trend, NewsItem } from '@/types';
import toast from 'react-hot-toast';

export function useFirestore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [trends,   setTrends]   = useState<Trend[]>([]);
  const [news,     setNews]     = useState<NewsItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    let loadCount = 0;
    const onLoad = () => { loadCount++; if (loadCount >= 3) setDbLoading(false); };

    // ── products：依名稱排序 ─────────────────────────────
    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('name')),
      (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        onLoad();
      },
      (err) => {
        toast.error(`載入競品資料失敗：${err.message}`);
        onLoad();
      }
    );

    // ── trends ───────────────────────────────────────────
    const unsubTrends = onSnapshot(
      query(collection(db, 'trends')),
      (snap) => {
        setTrends(snap.docs.map(d => ({ id: d.id, ...d.data() } as Trend)));
        onLoad();
      },
      (err) => {
        toast.error(`載入趨勢資料失敗：${err.message}`);
        onLoad();
      }
    );

    // ── news：依日期倒序 ─────────────────────────────────
    const unsubNews = onSnapshot(
      query(collection(db, 'news'), orderBy('date', 'desc')),
      (snap) => {
        setNews(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem)));
        onLoad();
      },
      (err) => {
        toast.error(`載入新聞資料失敗：${err.message}`);
        onLoad();
      }
    );

    return () => {
      unsubProducts();
      unsubTrends();
      unsubNews();
    };
  }, []);

  return { products, trends, news, dbLoading };
}
