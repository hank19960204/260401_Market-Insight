/**
 * useAuth — Firebase Auth 認證狀態管理 Hook
 *
 * 管理員判定邏輯：
 *   1. 使用者必須以 Google 帳號登入（Firebase Auth）
 *   2. 其 email 必須符合環境變數 VITE_ADMIN_EMAIL 的值
 *   3. 此 email 必須已通過 Google 驗證（email_verified = true）
 *
 * 這樣即使別人登入，也不會取得管理員權限。
 * Firestore Security Rules 也有同等的 server-side 驗證（雙重保護）。
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

interface AuthState {
  user:       User | null;
  isAdmin:    boolean;
  authLoading: boolean;
}

export function useAuth(): AuthState & {
  login:  () => Promise<void>;
  logout: () => Promise<void>;
} {
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  /** 判斷是否為管理員：email 必須完全符合且已驗證 */
  const isAdmin = Boolean(
    user &&
    user.email === ADMIN_EMAIL &&
    user.emailVerified
  );

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('登入成功');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登入失敗';
      // 使用者手動關閉視窗不算錯誤
      if (!msg.includes('popup-closed')) {
        toast.error(`登入失敗：${msg}`);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('已登出');
  };

  return { user, isAdmin, authLoading, login, logout };
}
