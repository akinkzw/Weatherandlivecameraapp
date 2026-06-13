// 最近見た川を localStorage に保持する。表示用の最小情報のみ保存し、
// 実データ（詳細取得に使う各フィールド）はクリック時に rivers から id で解決する。

export interface RecentRiver {
  id: string;
  name: string;
  prefecture: string;
  currentStatus?: 'normal' | 'caution' | 'warning';
  observatoryName?: string;
}

const STORAGE_KEY = 'recentRivers';
const MAX_ITEMS = 6;

export function getRecentRivers(): RecentRiver[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((r) => r && typeof r.id === 'string') : [];
  } catch {
    return [];
  }
}

// 同じ川は先頭に繰り上げ、最大件数で打ち切り。更新後の配列を返す。
export function addRecentRiver(river: RecentRiver): RecentRiver[] {
  try {
    const current = getRecentRivers().filter((r) => r.id !== river.id);
    const next = [river, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentRivers();
  }
}

export function clearRecentRivers(): RecentRiver[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
  return [];
}
