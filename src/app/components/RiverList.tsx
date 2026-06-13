import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertTriangle, AlertCircle, CheckCircle, MapPin, ChevronDown, ChevronRight, Waves, History } from 'lucide-react';
import { River } from '../App';
import type { RecentRiver } from '../utils/recentRivers';

interface RiverListProps {
  selectedRegion: string;
  searchQuery: string;
  selectedArea: string;
  selectedPrefecture: string;
  areaToRegionMap: { [key: string]: string[] };
  onSelectRiver: (river: River) => void;
  onSelectPrefecture: (prefecture: string) => void;
  selectedRiverId?: string;
  rivers: River[];
  recentRivers: RecentRiver[];
  isLoadingRivers: boolean;
}

const ITEMS_PER_PAGE = 20;

// 都道府県の正規順序（北→南 / JIS X 0401 準拠）。
// データ側の表記揺れ（「長野」「熊県」等）は prefectureRank で吸収する。
const PREFECTURE_ORDER = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

const PREFECTURE_RANK = new Map(PREFECTURE_ORDER.map((p, i) => [p, i]));

// 都道府県名から並び順インデックスを返す。表記揺れは双方向 includes で吸収。不明は末尾。
function prefectureRank(pref: string): number {
  if (!pref) return PREFECTURE_ORDER.length;
  const exact = PREFECTURE_RANK.get(pref);
  if (exact !== undefined) return exact;
  for (let i = 0; i < PREFECTURE_ORDER.length; i++) {
    const canonical = PREFECTURE_ORDER[i];
    if (pref.includes(canonical) || canonical.includes(pref)) return i;
  }
  return PREFECTURE_ORDER.length;
}

// 都道府県順（北→南）→ 同一県内は川名の50音順で安定ソート。
function sortRivers(list: River[]): River[] {
  return [...list].sort((a, b) => {
    const ra = prefectureRank(a.prefecture);
    const rb = prefectureRank(b.prefecture);
    if (ra !== rb) return ra - rb;
    return (a.name || '').localeCompare(b.name || '', 'ja');
  });
}

function RiverCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse rounded-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full" />
            <div className="h-5 w-32 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 rounded-full" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-6 w-12 bg-slate-200 rounded-full" />
      </div>
    </Card>
  );
}

export function RiverList({
  selectedRegion,
  searchQuery,
  selectedArea,
  selectedPrefecture,
  areaToRegionMap,
  onSelectRiver,
  onSelectPrefecture,
  selectedRiverId,
  rivers,
  recentRivers,
  isLoadingRivers
}: RiverListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // データに存在する都道府県を北→南順＋件数付きで列挙（ドロップダウン用）
  // ※ 正規の47都道府県に一致するものだけを採用し、文字化けデータ（「三��県」等）は除外する
  const allPrefectures = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rivers) {
      if (r.prefecture && prefectureRank(r.prefecture) < PREFECTURE_ORDER.length) {
        counts.set(r.prefecture, (counts.get(r.prefecture) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => prefectureRank(a[0]) - prefectureRank(b[0]) || a[0].localeCompare(b[0], 'ja'))
      .map(([prefecture, count]) => ({ prefecture, count }));
  }, [rivers]);

  const filteredRivers = useMemo(() => {
    return rivers.filter(river => {
      let matchesAreaOrRegion = true;

      if (selectedRegion !== 'all') {
        const prefectures = areaToRegionMap[selectedRegion] || [];
        matchesAreaOrRegion = prefectures.some(pref => river.prefecture.includes(pref));
      } else if (selectedArea !== 'all') {
        const prefectures = areaToRegionMap[selectedArea] || [];
        matchesAreaOrRegion = prefectures.some(pref => river.prefecture.includes(pref));
      }

      const matchesPrefecture = selectedPrefecture === 'all' || river.prefecture === selectedPrefecture;

      const matchesSearch = river.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           river.prefecture.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesAreaOrRegion && matchesPrefecture && matchesSearch;
    });
  }, [rivers, selectedRegion, searchQuery, selectedArea, selectedPrefecture, areaToRegionMap]);

  // Reset visible count when filters change
  useMemo(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedRegion, searchQuery, selectedArea, selectedPrefecture]);

  const isSearching = selectedRegion !== 'all' || searchQuery.trim() !== '' || selectedArea !== 'all' || selectedPrefecture !== 'all';

  const getStatusIcon = (status: River['currentStatus']) => {
    switch (status) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />;
      case 'caution':
        return <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
    }
  };

  const getStatusBadge = (status: River['currentStatus']) => {
    switch (status) {
      case 'warning':
        return <Badge variant="destructive" className="text-xs font-semibold">警戒</Badge>;
      case 'caution':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-xs font-semibold">注意</Badge>;
      default:
        return <Badge className="bg-green-500 hover:bg-green-600 text-xs font-semibold">正常</Badge>;
    }
  };

  // Loading skeleton
  if (isLoadingRivers) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 py-3">
          <Waves className="w-5 h-5 animate-pulse" style={{ color: '#0372ac' }} />
          <span className="text-slate-600 text-sm font-medium" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
            川データを読み込み中...
          </span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <RiverCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // 都道府県順（北→南）＋川名で並べ替え（未選択時は一覧を出さないのでソート不要）
  const sortedRivers = isSearching ? sortRivers(filteredRivers) : [];
  const visibleRivers = sortedRivers.slice(0, visibleCount);
  const hasMore = visibleCount < sortedRivers.length;
  const remainingCount = sortedRivers.length - visibleCount;

  // 県ごとの総件数（見出しに表示）と、見出しを出すか（2県以上のとき）
  // ※ 早期return後のためフックは使わず通常計算する
  const prefectureCounts = new Map<string, number>();
  for (const r of sortedRivers) {
    prefectureCounts.set(r.prefecture, (prefectureCounts.get(r.prefecture) || 0) + 1);
  }
  const showGroupHeaders = prefectureCounts.size > 1;

  // Empty state when no rivers at all
  if (rivers.length === 0 && !isLoadingRivers) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Waves className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-600 text-lg mb-2" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
          川データがありません
        </p>
        <p className="text-slate-400 text-sm">
          サーバーとの接続を確認してください
        </p>
      </div>
    );
  }

  // 最近見た川をクリック：最新データを rivers から id で解決して詳細を開く
  const handleRecentClick = (rr: RecentRiver) => {
    const fresh = rivers.find((r) => r.id === rr.id);
    if (fresh) onSelectRiver(fresh);
  };

  // 未選択時は一覧を出さず、最近見た川（あれば）＋地域選択・検索へ誘導するガイドを表示
  if (!isSearching) {
    return (
      <div className="space-y-4">
        {recentRivers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <History className="w-4 h-4" style={{ color: '#0372ac' }} />
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>最近見た川</h3>
            </div>
            <div className="space-y-2">
              {recentRivers.map((rr) => (
                <Card
                  key={rr.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${rr.name} - ${rr.prefecture}`}
                  className="p-3.5 rounded-xl cursor-pointer transition-all duration-150 border-l-4 border-l-slate-300 hover:bg-slate-50 hover:shadow-md hover:-translate-y-px active:scale-[0.99]"
                  onClick={() => handleRecentClick(rr)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRecentClick(rr);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-900 font-semibold text-sm truncate" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                        {rr.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{rr.prefecture}</span>
                        {rr.observatoryName && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="truncate text-slate-400">{rr.observatoryName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#e8f4f8' }}>
          <MapPin className="w-7 h-7" style={{ color: '#0372ac' }} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
          地域を選んで川を探す
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
          上の「地方から探す」で地域を選ぶか、<br className="hidden sm:block" />
          川名で検索すると一覧が表示されます。
        </p>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-400" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>都道府県から探す</span>
          <Select value={selectedPrefecture} onValueChange={onSelectPrefecture}>
            <SelectTrigger
              aria-label="都道府県で絞り込む"
              className="h-11 w-[240px] rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-700 gap-1.5 focus:ring-2 focus:ring-[#0372ac]/30 justify-center"
              style={{ fontFamily: 'Noto Sans JP, sans-serif' }}
            >
              <MapPin className="w-4 h-4" style={{ color: '#0372ac' }} />
              <SelectValue placeholder="都道府県を選択" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {allPrefectures.map(({ prefecture, count }) => (
                <SelectItem key={prefecture} value={prefecture}>
                  {prefecture}（{count}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-6 text-xs text-slate-400" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
          全国 <span className="font-bold" style={{ color: '#0372ac' }}>{rivers.length}</span> 件の川を収録
        </p>
        </div>
      </div>
    );
  }

  let lastPrefecture: string | null = null;

  return (
    <div className="space-y-3">
      {/* 件数 + 並び順の明示 */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-1">
        <p className="flex items-center gap-2 text-slate-600 text-sm font-medium" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
          <Waves className="w-4 h-4" style={{ color: '#0372ac' }} />
          <span><span style={{ color: '#0372ac' }} className="font-bold">{filteredRivers.length}</span> 件の川が見つかりました</span>
        </p>
        <Select value={selectedPrefecture} onValueChange={onSelectPrefecture}>
          <SelectTrigger
            aria-label="都道府県で絞り込む"
            className="h-9 w-auto min-w-[180px] rounded-full bg-slate-100 border-0 text-sm text-slate-700 gap-1.5 focus:ring-2 focus:ring-[#0372ac]/30"
            style={{ fontFamily: 'Noto Sans JP, sans-serif' }}
          >
            <MapPin className="w-4 h-4" style={{ color: '#0372ac' }} />
            <SelectValue placeholder="都道府県で絞り込む" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value="all">すべての都道府県</SelectItem>
            {allPrefectures.map(({ prefecture, count }) => (
              <SelectItem key={prefecture} value={prefecture}>
                {prefecture}（{count}）
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* River cards（都道府県見出し付き） */}
      <div className="space-y-2" role="list" aria-label="川のリスト">
        {visibleRivers.map((river) => {
          const showHeader = showGroupHeaders && river.prefecture !== lastPrefecture;
          lastPrefecture = river.prefecture;
          return (
            <div key={river.id}>
              {showHeader && (
                <div className="flex items-center gap-2 px-1 pt-3 pb-1.5">
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#0372ac' }} />
                  <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                    {river.prefecture || '所在地不明'}
                  </h3>
                  <span className="text-xs text-slate-400">{prefectureCounts.get(river.prefecture)}件</span>
                  <div className="flex-1 h-px bg-slate-200 ml-1" />
                </div>
              )}
              <Card
                role="listitem"
                tabIndex={0}
                aria-label={`${river.name} - ${river.prefecture} - ${river.currentStatus === 'warning' ? '警戒' : river.currentStatus === 'caution' ? '注意' : '正常'}`}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-150 border-l-4 hover:shadow-md hover:-translate-y-px active:scale-[0.99] active:shadow-none ${
                  river.currentStatus === 'warning'
                    ? 'border-l-red-500'
                    : river.currentStatus === 'caution'
                    ? 'border-l-amber-500'
                    : 'border-l-green-500'
                } ${
                  selectedRiverId === river.id
                    ? 'bg-blue-50 shadow-md ring-1 ring-[#0372ac]/30'
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => onSelectRiver(river)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRiver(river);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getStatusIcon(river.currentStatus)}
                      <h3 className="text-slate-900 font-semibold text-base truncate" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                        {river.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{river.prefecture}</span>
                      {river.observatoryName && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="truncate text-slate-400">{river.observatoryName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {getStatusBadge(river.currentStatus)}
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        {/* Empty search results */}
        {isSearching && filteredRivers.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Waves className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
              該当する川が見つかりませんでした
            </p>
            <p className="text-slate-400 text-sm mt-1">
              検索条件を変更してお試しください
            </p>
          </div>
        )}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="pt-2 pb-4">
          <Button
            variant="default"
            className="w-full h-12 text-sm font-semibold shadow-sm rounded-xl"
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            さらに表示する（残り{remainingCount > ITEMS_PER_PAGE ? ITEMS_PER_PAGE : remainingCount}件 / 全{sortedRivers.length}件）
          </Button>
        </div>
      )}
    </div>
  );
}
