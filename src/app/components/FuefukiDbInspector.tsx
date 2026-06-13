import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BannerData {
  pc_image: {
    url: string;
  };
  sp_image: {
    url: string;
  };
  icon: {
    url: string;
  };
  icon_2?: {
    url: string;
  };
  icon_3?: {
    url: string;
  };
  url?: string;
  description?: string;
}

export function FuefukiDbInspector() {
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  
  // microCMSからバナーデータを取得
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/banner`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setBannerData(data.success && data.data ? data.data : data);
        }
      } catch (error) {
        console.error('バナーデータの取得エラー:', error);
      }
    };

    fetchBanner();
  }, []);
  
  // データベースから直接データを取得
  const inspectDatabase = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 データベースから笛吹川を直接検索...');
      
      // まず既存のエンドポイントを試す
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/debug/find-fuefuki`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTPエラー: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('✅ データベース検索結果:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'データの取得に失敗しました');
      }
      
      // データを変換して詳細情報を追加
      const detailedRivers = data.rivers.map((river: any) => ({
        dbKey: river.key,
        id: river.id,
        name: river.name,
        prefecture: river.prefecture,
        municipality: river.municipality || '未設定',
        basinName: river.basinName || '未設定',
        stationName: river.stationName || '未設定',
        observatoryName: river.observatoryName || '未設定',
        waterLevelUrl: river.waterLevelUrl,
        dpfObservationId: river.dpfObservationId,
        latitude: river.latitude,
        longitude: river.longitude,
        rawData: river
      }));
      
      setDbData(detailedRivers);
      
      if (detailedRivers.length === 0) {
        setError('笛吹川のデータが見つかりませんでした');
      }
    } catch (err) {
      console.error('❌ エラー:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* ヘッダー */}
      <header 
        className="relative shadow-md border-b-4" 
        style={{ borderColor: '#0372ac' }}
      >
        <div style={{
          background: 'linear-gradient(to bottom, #97d0ed 0%, #97d0ed 60%, rgba(151, 208, 237, 0.3) 100%)'
        }}>
          {/* Background Image */}
          <div className="relative pt-[165px] md:pt-[160px]">
            {bannerData && (
              <>
                {/* PC用画像 */}
                <div className="hidden md:block absolute top-0 left-0 w-full h-[220px]">
                  <ImageWithFallback
                    src={bannerData.pc_image?.url}
                    alt="川の風景"
                    className="w-full h-full object-contain object-top"
                  />
                </div>
                {/* SP用画像 */}
                <div className="block md:hidden absolute top-0 left-0 w-full h-[190px]">
                  <ImageWithFallback
                    src={bannerData.sp_image?.url}
                    alt="川の風景"
                    className="w-full h-full object-contain object-top"
                  />
                </div>
              </>
            )}
          </div>

          {/* Header Content */}
          <div className="relative py-6">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                {bannerData?.icon?.url && (
                  <ImageWithFallback
                    src={bannerData.icon.url}
                    alt="装飾アイコン"
                    className="w-8 h-8 object-contain"
                  />
                )}
                <h1 className="font-bold" style={{ fontFamily: 'Noto Sans JP, sans-serif', color: '#0372ac' }}>
                  笛吹川データベース診断ツール
                </h1>
                {bannerData?.icon?.url && (
                  <ImageWithFallback
                    src={bannerData.icon.url}
                    alt="装飾アイコン"
                    className="w-8 h-8 object-contain"
                  />
                )}
              </div>
              <p className="text-sm" style={{ color: '#204670' }}>
                データベース内の笛吹川データを詳細に確認します
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="p-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#0372ac' }} className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              笛吹川 データベース診断ツール
            </CardTitle>
            <CardDescription>
              データベース内の笛吹川データを直接確認し、水位情報URLを更新します
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button
                onClick={inspectDatabase}
                disabled={loading}
                style={{ backgroundColor: '#0372ac' }}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    検査中...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    データベースを検査
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <Alert className="border-red-500">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {dbData.length > 0 && (
              <div className="space-y-4">
                <Alert className="border-blue-500">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-600">
                    笛吹川のデータが {dbData.length} 件見つかりました
                  </AlertDescription>
                </Alert>
                
                {dbData.map((river, index) => (
                  <Card key={index} className="p-6 bg-slate-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xl">
                          {river.name}
                        </h3>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                          ID: {river.id}
                        </span>
                      </div>
                      
                      {/* 基本情報 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded border">
                          <span className="text-gray-600 text-sm block mb-1">Database Key:</span>
                          <span className="font-mono text-xs break-all">{river.dbKey}</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <span className="text-gray-600 text-sm block mb-1">都道府県:</span>
                          <span className="font-semibold">{river.prefecture}</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <span className="text-gray-600 text-sm block mb-1">市区町村:</span>
                          <span className="font-semibold">{river.municipality || '未設定'}</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <span className="text-gray-600 text-sm block mb-1">水系:</span>
                          <span className="font-semibold">{river.basinName || '未設定'}</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <span className="text-gray-600 text-sm block mb-1">観測所名:</span>
                          <span className="font-semibold">{river.stationName || '未設定'}</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <span className="text-gray-600 text-sm block mb-1">観測所名（CSV）:</span>
                          <span className="font-semibold">{river.observatoryName || '未設定'}</span>
                        </div>
                      </div>
                      
                      {/* 水位情報URL */}
                      <div className="bg-white p-4 rounded border">
                        <span className="text-gray-600 text-sm block mb-2">現在の水位情報URL:</span>
                        {river.waterLevelUrl ? (
                          <div className="space-y-2">
                            <div className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
                              {river.waterLevelUrl}
                            </div>
                            <Button
                              onClick={() => window.open(river.waterLevelUrl, '_blank')}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              URLをテスト（新しいタブで開く）
                            </Button>
                          </div>
                        ) : (
                          <span className="text-red-500 font-semibold">未設定</span>
                        )}
                      </div>
                      
                      {/* マッチングキー */}
                      <div className="bg-amber-50 p-4 rounded border border-amber-300">
                        <span className="text-amber-800 text-sm block mb-2 font-semibold">
                          🔍 サーバーのマッチングキー:
                        </span>
                        <div className="font-mono text-sm bg-white p-2 rounded break-all">
                          {river.name}:{river.stationName || river.observatoryName || '観測所名なし'}
                        </div>
                        <p className="text-xs text-amber-700 mt-2">
                          ※ CSV更新時は、このキー形式でマッチングされます
                        </p>
                      </div>
                      
                      {/* 生データ */}
                      <details className="bg-gray-100 p-4 rounded">
                        <summary className="cursor-pointer font-semibold text-sm text-gray-700">
                          生データ（JSON）を表示
                        </summary>
                        <pre className="mt-2 text-xs overflow-auto bg-white p-3 rounded border max-h-64">
                          {JSON.stringify(river.rawData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}