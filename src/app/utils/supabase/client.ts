import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// 認証後の戻り先。将来の独自ドメイン移行に備え環境変数で上書き可能。
// 未設定時は実行中のオリジン（localhost / netlify / 将来ドメイン いずれも自動追従）。
export const authRedirectUrl =
  ((import.meta as any).env?.VITE_AUTH_REDIRECT_URL as string | undefined) ??
  (typeof window !== 'undefined' ? window.location.origin : '');

// アプリ全体で共有する単一のブラウザクライアント。
// persistSession/autoRefreshToken でセッション永続化、
// detectSessionInUrl で Magic Link コールバックを自動処理する。
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
