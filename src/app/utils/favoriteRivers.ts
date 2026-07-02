// お気に入りの川。ログイン時は Supabase の favorites テーブル（RLSで本人限定）、
// 未ログイン時は localStorage にフォールバックする非同期サービス。
// サーバは river_id のみ保持し、表示情報は呼び出し側が rivers[] から id で解決する。

import { supabase } from './supabase/client';

const STORAGE_KEY = 'favoriteRivers';

// 表示用（呼び出し側が rivers[] から組み立てる際の型。保存はしない）
export interface FavoriteRiver {
  id: string;
  name: string;
  prefecture: string;
  currentStatus?: 'normal' | 'caution' | 'warning';
  observatoryName?: string;
}

// ---- localStorage（未ログイン用。id配列で保持。旧・オブジェクト配列形式も読める）----
function getLocalIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // 新形式（string[]）と旧形式（{id,...}[]）の両対応
    return arr
      .map((x) => (typeof x === 'string' ? x : x && typeof x.id === 'string' ? x.id : null))
      .filter((v): v is string => !!v);
  } catch {
    return [];
  }
}

function saveLocalIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* noop */
  }
}

function clearLocalIds(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

// ---- 現在のユーザー ----
async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

// ---- 公開API（すべて Promise）----

// お気に入りの river_id 一覧（新しい順）。
export async function getFavoriteIds(): Promise<string[]> {
  const uid = await currentUserId();
  if (!uid) return getLocalIds();

  const { data, error } = await supabase
    .from('favorites')
    .select('river_id')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('getFavoriteIds failed:', error.message);
    return [];
  }
  return (data ?? []).map((r) => r.river_id as string);
}

export async function addFavorite(riverId: string): Promise<void> {
  const uid = await currentUserId();
  if (!uid) {
    saveLocalIds([riverId, ...getLocalIds().filter((i) => i !== riverId)]);
    return;
  }
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: uid, river_id: riverId }, { onConflict: 'user_id,river_id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeFavorite(riverId: string): Promise<void> {
  const uid = await currentUserId();
  if (!uid) {
    saveLocalIds(getLocalIds().filter((i) => i !== riverId));
    return;
  }
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', uid)
    .eq('river_id', riverId);
  if (error) throw error;
}

// Step 5 用（初回ログイン時に localStorage → サーバへ統合）。ここでは export のみ、配線は Step 5。
export async function mergeLocalFavoritesToServer(userId: string): Promise<void> {
  const localIds = getLocalIds();
  if (localIds.length === 0) return;
  const rows = localIds.map((river_id) => ({ user_id: userId, river_id }));
  const { error } = await supabase
    .from('favorites')
    .upsert(rows, { onConflict: 'user_id,river_id', ignoreDuplicates: true });
  if (error) {
    console.warn('mergeLocalFavoritesToServer failed:', error.message);
    return; // 失敗時は localStorage を残す（次回再試行）
  }
  clearLocalIds(); // 成功したらログイン中はサーバを正とする
}
