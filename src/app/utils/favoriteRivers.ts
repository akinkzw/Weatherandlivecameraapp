// お気に入りの川を localStorage に保持する。表示用の最小情報のみ保存し、
// クリック時の詳細表示は rivers から id で最新データを解決する（recentRivers と同方針）。

export interface FavoriteRiver {
  id: string;
  name: string;
  prefecture: string;
  currentStatus?: 'normal' | 'caution' | 'warning';
  observatoryName?: string;
}

const STORAGE_KEY = 'favoriteRivers';

export function getFavoriteRivers(): FavoriteRiver[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((r) => r && typeof r.id === 'string') : [];
  } catch {
    return [];
  }
}

function save(list: FavoriteRiver[]): FavoriteRiver[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
  return list;
}

export function isFavoriteRiver(id: string): boolean {
  return getFavoriteRivers().some((r) => r.id === id);
}

// 登録済みなら解除、未登録なら先頭に追加。更新後の配列を返す。
export function toggleFavoriteRiver(river: FavoriteRiver): FavoriteRiver[] {
  const current = getFavoriteRivers();
  const exists = current.some((r) => r.id === river.id);
  const next = exists ? current.filter((r) => r.id !== river.id) : [river, ...current];
  return save(next);
}

export function removeFavoriteRiver(id: string): FavoriteRiver[] {
  return save(getFavoriteRivers().filter((r) => r.id !== id));
}
