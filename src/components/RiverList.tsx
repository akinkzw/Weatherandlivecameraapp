import { useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
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
  const filteredRivers = useMemo(() => {
    return rivers.filter(river => {
      // 地方フィルタリング
      let matchesArea = true;
      if (selectedArea !== 'all') {
        const prefectures = areaToRegionMap[selectedArea] || [];
        matchesArea = prefectures.some(pref => river.prefecture.includes(pref));
      }

      // 都道府県フィルタリング
      const matchesPrefecture = selectedPrefecture === 'all' || river.prefecture === selectedPrefecture;

      // 地域フィルタリング
      const matchesRegion = selectedRegion === 'all' || river.region === selectedRegion;
      
      // ��索クエリフィルタリング
      const matchesSearch = river.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           river.prefecture.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesArea && matchesPrefecture && matchesRegion && matchesSearch;
    });
  }, [rivers, selectedRegion, searchQuery, selectedArea, selectedPrefecture, areaToRegionMap]);

  const isSearching = selectedRegion !== 'all' || searchQuery.trim() !== '' || selectedArea !== 'all' || selectedPrefecture !== 'all';

  const getStatusIcon = (status: River['currentStatus']) => {
    switch (status) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'caution':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusBadge = (status: River['currentStatus']) => {
    switch (status) {
      case 'warning':
        return <Badge variant="destructive">警戒</Badge>;
      case 'caution':
        return <Badge className="bg-amber-500 hover:bg-amber-600">注意</Badge>;
      default:
        return <Badge className="bg-green-500 hover:bg-green-600">正常</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {isSearching && (
        <div className="bg-white rounded-lg border border-slate-200 p-3 mb-3">
          <p className="text-slate-600">
            {filteredRivers.length}件の川が見つかりました
          </p>
        </div>
      )}
      
      {!isSearching ? (
        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {rivers.slice(0, 10).map((river) => (
            <Card
              key={river.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedRiverId === river.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onSelectRiver(river)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(river.currentStatus)}
                    <h3 className="text-slate-900">{river.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{river.prefecture}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">水位: {river.waterLevel.toFixed(2)}m</span>
                    <span className="text-slate-400">/ {river.warningLevel.toFixed(2)}m</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(river.currentStatus)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {filteredRivers.map((river) => (
            <Card
              key={river.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedRiverId === river.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onSelectRiver(river)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(river.currentStatus)}
                    <h3 className="text-slate-900">{river.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{river.prefecture}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">水位: {river.waterLevel.toFixed(2)}m</span>
                    <span className="text-slate-400">/ {river.warningLevel.toFixed(2)}m</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(river.currentStatus)}
                </div>
              </div>
            </Card>
          ))}
          
          {filteredRivers.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <p className="text-slate-500">該当する川が見つかりませんでした</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}