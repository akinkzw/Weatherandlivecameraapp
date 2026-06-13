import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, AlertCircle, CheckCircle, MapPin, ChevronDown, ChevronRight, Waves } from 'lucide-react';
import { River } from '../App';

interface RiverListProps {
  selectedRegion: string;
  searchQuery: string;
  selectedArea: string;
  selectedPrefecture: string;
  areaToRegionMap: { [key: string]: string[] };
  onSelectRiver: (river: River) => void;
  selectedRiverId?: string;
  rivers: River[];
  isLoadingRivers: boolean;
}

const ITEMS_PER_PAGE = 20;

function RiverCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
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
  selectedRiverId,
  rivers,
  isLoadingRivers
}: RiverListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

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

  const displayedRivers = isSearching ? filteredRivers : rivers;
  const visibleRivers = displayedRivers.slice(0, visibleCount);
  const hasMore = visibleCount < displayedRivers.length;
  const remainingCount = displayedRivers.length - visibleCount;

  // Empty state when no rivers at all
  if (rivers.length === 0 && !isLoadingRivers) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
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

  return (
    <div className="space-y-3">
      {/* Results count */}
      {isSearching && (
        <div className="flex items-center gap-2 py-2 px-1">
          <Waves className="w-4 h-4" style={{ color: '#0372ac' }} />
          <p className="text-slate-600 text-sm font-medium" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
            <span style={{ color: '#0372ac' }} className="font-bold">{filteredRivers.length}</span>件の川が見つかりました
          </p>
        </div>
      )}

      {!isSearching && (
        <div className="flex items-center gap-2 py-2 px-1">
          <Waves className="w-4 h-4" style={{ color: '#0372ac' }} />
          <p className="text-slate-600 text-sm font-medium" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
            地方を選択して川を絞り込めます（全<span style={{ color: '#0372ac' }} className="font-bold">{rivers.length}</span>件）
          </p>
        </div>
      )}
      
      {/* River cards */}
      <div className="space-y-2" role="list" aria-label="川のリスト">
        {visibleRivers.map((river) => (
          <Card
            key={river.id}
            role="listitem"
            tabIndex={0}
            aria-label={`${river.name} - ${river.prefecture} - ${river.currentStatus === 'warning' ? '警戒' : river.currentStatus === 'caution' ? '注意' : '正常'}`}
            className={`p-4 cursor-pointer transition-all duration-150 border-l-4 hover:shadow-md active:scale-[0.99] active:shadow-none ${
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
                  <h3 className="text-slate-900 font-medium text-base truncate" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
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
        ))}
        
        {/* Empty search results */}
        {isSearching && filteredRivers.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
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
            className="w-full h-12 text-sm font-semibold shadow-sm"
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            さらに表示する（残り{remainingCount > ITEMS_PER_PAGE ? ITEMS_PER_PAGE : remainingCount}件 / 全{displayedRivers.length}件）
          </Button>
        </div>
      )}
    </div>
  );
}
