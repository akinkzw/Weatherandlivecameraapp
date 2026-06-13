import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Search, MapPin } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DuplicateAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [riverName, setRiverName] = useState('笛吹川');
  const [results, setResults] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  const analyzeRiver = async () => {
    if (!riverName.trim()) {
      setError('川名を入力してください');
      return;
    }
    
    setLoading(true);
    setError('');
    setResults([]);
    setAnalysis(null);
    
    try {
      console.log(`🔍 「${riverName}」を分析中...`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.rivers) {
        throw new Error('データの取得に失敗しました');
      }
      
      // 指定された川名で絞り込み
      const matchingRivers = data.rivers.filter((river: any) => 
        river.name && river.name.includes(riverName.trim())
      );
      
      if (matchingRivers.length === 0) {
        setError(`「${riverName}」が見つかりませんでした`);
        return;
      }
      
      console.log(`✅ ${matchingRivers.length} 件見つかりました`);
      
      // IDでソート
      matchingRivers.sort((a: any, b: any) => parseInt(a.id) - parseInt(b.id));
      
      // 重複分析
      const uniqueByLocation = new Map<string, any[]>();
      const uniqueByStationName = new Map<string, any[]>();
      
      matchingRivers.forEach((river: any) => {
        // 緯度・経度でグループ化
        const locationKey = `${river.latitude?.toFixed(6)},${river.longitude?.toFixed(6)}`;
        if (!uniqueByLocation.has(locationKey)) {
          uniqueByLocation.set(locationKey, []);
        }
        uniqueByLocation.get(locationKey)!.push(river);
        
        // 観測所名でグループ化
        const stationKey = river.stationName || river.observatoryName || '不明';
        if (!uniqueByStationName.has(stationKey)) {
          uniqueByStationName.set(stationKey, []);
        }
        uniqueByStationName.get(stationKey)!.push(river);
      });
      
      // 分析結果
      const analysisResult = {
        total: matchingRivers.length,
        uniqueLocations: uniqueByLocation.size,
        uniqueStations: uniqueByStationName.size,
        locationGroups: Array.from(uniqueByLocation.entries()).map(([key, rivers]) => ({
          location: key,
          count: rivers.length,
          isDuplicate: rivers.length > 1,
          rivers: rivers
        })),
        stationGroups: Array.from(uniqueByStationName.entries()).map(([key, rivers]) => ({
          stationName: key,
          count: rivers.length,
          isDuplicate: rivers.length > 1,
          rivers: rivers
        }))
      };
      
      console.log('📊 分析結果:', analysisResult);
      
      setResults(matchingRivers);
      setAnalysis(analysisResult);
      
    } catch (err) {
      console.error('❌ エラー:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#0372ac' }} className="flex items-center gap-2">
            <Search className="w-6 h-6" />
            重複分析ツール（詳細版）
          </CardTitle>
          <CardDescription>
            特定の川のデータを詳しく分析します
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="川名を入力"
              value={riverName}
              onChange={(e) => setRiverName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  analyzeRiver();
                }
              }}
            />
            <Button
              onClick={analyzeRiver}
              disabled={loading}
              style={{ backgroundColor: '#0372ac' }}
              className="flex items-center gap-2"
            >
              {loading ? '分析中...' : '分析'}
            </Button>
          </div>
          
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {analysis && (
            <div className="space-y-6">
              {/* サマリー */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-300">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.total}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      総データ数
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-green-50 border-green-300">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analysis.uniqueLocations}
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      ユニークな地点（緯度・経度）
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-purple-50 border-purple-300">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analysis.uniqueStations}
                    </div>
                    <div className="text-sm text-purple-700 mt-1">
                      ユニークな観測所名
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* 位置情報（緯度・経度）による分析 */}
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  位置情報（緯度・経度）による分析
                </h3>
                <div className="space-y-3">
                  {analysis.locationGroups.map((group: any, index: number) => (
                    <Card 
                      key={index} 
                      className={`p-4 ${
                        group.isDuplicate 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold">
                              位置: {group.location}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {group.count} 件のデータ
                              {group.isDuplicate && (
                                <span className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs">
                                  重複あり
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {group.rivers.map((river: any, idx: number) => (
                            <div 
                              key={river.id}
                              className={`p-3 rounded border ${
                                idx === 0 && group.isDuplicate
                                  ? 'bg-green-100 border-green-400' 
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <strong>ID:</strong> {river.id}
                                </div>
                                <div>
                                  <strong>都道府県:</strong> {river.prefecture || '不明'}
                                </div>
                                <div>
                                  <strong>市区町村:</strong> {river.municipality || '不明'}
                                </div>
                                <div>
                                  <strong>観測所:</strong> {river.stationName || river.observatoryName || '不明'}
                                </div>
                                <div className="col-span-2">
                                  <strong>水系:</strong> {river.basinName || river.riverSystem || '不明'}
                                </div>
                                <div className="col-span-2">
                                  <strong>DPF ID:</strong> {river.dpfObservationId || '(なし)'}
                                </div>
                                <div className="col-span-full">
                                  <strong>水位URL:</strong>{' '}
                                  {river.waterLevelUrl ? (
                                    <a 
                                      href={river.waterLevelUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-xs break-all"
                                    >
                                      {river.waterLevelUrl}
                                    </a>
                                  ) : '(なし)'}
                                </div>
                              </div>
                              {idx === 0 && group.isDuplicate && (
                                <div className="mt-2 text-xs text-green-700 font-bold">
                                  ✓ このデータを保持（最も小さいID）
                                </div>
                              )}
                              {idx !== 0 && group.isDuplicate && (
                                <div className="mt-2 text-xs text-red-700">
                                  ✗ このデータは削除候補
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* 観測所名による分析 */}
              <div>
                <h3 className="font-bold mb-4">
                  観測所名による分析
                </h3>
                <div className="space-y-3">
                  {analysis.stationGroups.map((group: any, index: number) => (
                    <Card 
                      key={index} 
                      className={`p-4 ${
                        group.isDuplicate 
                          ? 'bg-amber-50 border-amber-300' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">
                            観測所: {group.stationName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {group.count} 件のデータ
                            {group.isDuplicate && (
                              <span className="ml-2 px-2 py-1 bg-amber-600 text-white rounded text-xs">
                                同一観測所が複数存在
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* 推奨アクション */}
              <Alert className="border-blue-500 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>推奨アクション:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {analysis.uniqueLocations < analysis.total && (
                      <li>
                        同じ緯度・経度のデータが {analysis.total - analysis.uniqueLocations} 件重複しています。
                        <br />
                        <strong className="text-red-600">
                          → これらは削除しても問題ありません（同一地点の重複データ）
                        </strong>
                      </li>
                    )}
                    {analysis.uniqueLocations === analysis.total && (
                      <li className="text-green-600">
                        <strong>すべて異なる地点です。削除すべきではありません。</strong>
                      </li>
                    )}
                    {analysis.uniqueStations < analysis.total && (
                      <li>
                        同じ観測所名のデータが複数あります。
                        <br />
                        緯度・経度も同じ場合は重複、異なる場合は観測所名の誤りの可能性があります。
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
