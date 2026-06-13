import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Camera, MapPin, Droplet, CloudRain, Calendar, X, Droplets, Thermometer, Cloud, Video, ExternalLink, Shield, AlertCircle } from "lucide-react";
import { River } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getRiverCameras, getUpdatedCameraUrl } from '../utils/riverCameras';
import { getPrefectureCameraUrl } from '../utils/prefectureLinks';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RiverDetailProps {
  river: River;
}

interface ObservationStation {
  id?: string;
  stationId?: string;
  title?: string;
  stationName?: string;
  observationPlaceName?: string;
  riverName?: string;
  prefecture?: string;
  municipalityName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lon?: number;
  cameraUrl?: string;
  url?: string;
  waterLevelUrl?: string;
  lastUpdateDateTime?: string;
  hasCameraUrl?: boolean;
  hasWaterLevelUrl?: boolean;
}

interface RiverCameraData {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  detailUrl: string;
  cameraUrl: string;
  hasCameraUrl: boolean;
  lastUpdated: string;
}

export function RiverDetail({ river }: RiverDetailProps) {
  const [observationStations, setObservationStations] = useState<ObservationStation[]>([]);
  const [apiCameras, setApiCameras] = useState<RiverCameraData[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [apiWeather, setApiWeather] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [realtimeWaterLevel, setRealtimeWaterLevel] = useState<any>(null);
  const [loadingWaterLevel, setLoadingWaterLevel] = useState(false);

  // 🔍 デバッグ: 利用可能なデータを確認
  useEffect(() => {
    console.log('🔍 [RiverDetail] Available data for:', river.name);
    console.log('  - dpfObservationId:', river.dpfObservationId);
    console.log('  - waterLevelUrl:', river.waterLevelUrl);
    console.log('  - latitude:', river.latitude);
    console.log('  - longitude:', river.longitude);
  }, [river]);

  // 🔥 ダミー水位データを検出する関数
  const isDummyWaterLevel = () => {
    // nullまたはundefinedの場合は有効なデータとして扱う
    if (river.waterLevel == null || river.warningLevel == null) {
      return false;
    }
    
    // パターン1: 5.00m / 3.50m（最も一般的なダミー値）
    if (
      (river.waterLevel === 5.00 || river.waterLevel === 5 || river.waterLevel === '5.00' || river.waterLevel === '5') &&
      (river.warningLevel === 3.50 || river.warningLevel === 3.5 || river.warningLevel === '3.50' || river.warningLevel === '3.5')
    ) {
      return true;
    }
    
    // パターン2: 5.00m / 3.20m（別のダミー値パターン）
    if (
      (river.waterLevel === 5.00 || river.waterLevel === 5 || river.waterLevel === '5.00' || river.waterLevel === '5') &&
      (river.warningLevel === 3.20 || river.warningLevel === 3.2 || river.warningLevel === '3.20' || river.warningLevel === '3.2')
    ) {
      return true;
    }
    
    // パターン3: 0値（初期値）
    if (
      river.waterLevel === 0 || river.waterLevel === '0' || river.waterLevel === 0.0 || river.waterLevel === '0.0' ||
      river.warningLevel === 0 || river.warningLevel === '0' || river.warningLevel === 0.0 || river.warningLevel === '0.0'
    ) {
      return true;
    }
    
    return false;
  };
  
  const hasDummyData = isDummyWaterLevel();
  
  // 水位パーセンテージの計算（ダミーデータの場合は0にする）
  const waterLevelPercentage = hasDummyData ? 0 : (river.waterLevel / river.warningLevel) * 100;

  // リアルタイム水位を取得
  useEffect(() => {
    // 🚫 リアルタイム水位APIは有料のため、現在は無効化
    // 代わりに「リアルタイム水位を確認」ボタンで国土交通省サイトへ誘導
    console.log('リアルタイム水位API呼び出しは無効化されています（有料APIのため）');
    return;
    
    /* 以下のコードは無効化
    const fetchWaterLevel = async () => {
      // DPF観測所IDまたは市区町村コードがない場合はスキップ
      if (!river.municipalityCode && !river.dpfObservationId) {
        console.log('市区町村コードまたはDPF観測所IDが設定されていません');
        return;
      }

      setLoadingWaterLevel(true);
      try {
        // 市区町村コードを優先的に使用
        const idParam = river.municipalityCode || river.dpfObservationId;
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/realtime-water-level/${idParam}${
          river.observatoryName ? `?observatory=${encodeURIComponent(river.observatoryName)}` : ''
        }`;
        
        console.log('Fetching realtime water level with municipality code:', idParam);
        
        // タイムアウト付きfetch（10秒に設定）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          try {
            const data = await response.json();
            console.log('Realtime water level response:', data);
            
            if (data.success && data.data && data.data.length > 0) {
              // 複数の観測所がある場合は最初のものを使用
              setRealtimeWaterLevel(data.data[0]);
            } else {
              console.warn('No water level data in response:', data.error);
            }
          } catch (jsonError) {
            console.error('Failed to parse water level response as JSON:', jsonError);
          }
        } else {
          console.error('Failed to fetch realtime water level:', response.status, response.statusText);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.error('⏱️ Request timeout while fetching water level (10 seconds)');
          } else {
            console.error('❌ Error fetching realtime water level:', error.message);
          }
        } else {
          console.error('❌ Unknown error:', error);
        }
        // エラー時は何も表示しない（デフォルトの水位表示にフォールバック）
      } finally {
        setLoadingWaterLevel(false);
      }
    };

    fetchWaterLevel();
    */
  }, [river.municipalityCode, river.dpfObservationId, river.observatoryName]);

  // 国土交通省DPF GraphQL APIから観測所データとカメラ情報を取得
  useEffect(() => {
    const fetchObservationData = async () => {
      setLoadingStations(true);
      try {
        // まずDPF GraphQL APIを試す
        const dpfResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/river-observations/${encodeURIComponent(river.name)}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (dpfResponse.ok) {
          const data = await dpfResponse.json();
          console.log('DPF GraphQL API response:', data);
          
          if (data.hasData) {
            // observations を stations として設定
            if (data.observations) {
              setObservationStations(data.observations);
            }
            if (data.cameras) {
              setApiCameras(data.cameras);
            }
            if (data.source) {
              setDataSource(data.source);
            }
            if (data.weather && data.weather.length > 0) {
              setApiWeather(data.weather);
            }
            if (data.currentWeather) {
              setCurrentWeather(data.currentWeather);
            }
            return; // 成功したら終了
          }
        }
        
        // フォールバック: HTMLスクレイピング
        console.log('Falling back to HTML scraping...');
        const fallbackResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/river-info/${encodeURIComponent(river.name)}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          console.log('Fallback scraping response:', data);
          
          if (data.hasData) {
            if (data.stations) {
              setObservationStations(data.stations);
            }
            if (data.cameras) {
              setApiCameras(data.cameras);
            }
            if (data.source) {
              setDataSource(data.source + ' (Fallback)');
            }
          }
        }
      } catch (error) {
        console.error('観測所データの取得に失敗:', error);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchObservationData();
  }, [river.name]);
  
  // 天気データを取得（緯度経度がある場合）
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!river.latitude || !river.longitude) {
        console.log('No coordinates available for weather fetch');
        return;
      }
      
      try {
        console.log(`Fetching weather for ${river.name} at ${river.latitude}, ${river.longitude}`);
        
        const weatherResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/weather?lat=${river.latitude}&lon=${river.longitude}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (weatherResponse.ok) {
          const data = await weatherResponse.json();
          console.log('Weather API response:', data);
          console.log('Forecast array length:', data.forecast?.length);
          console.log('First forecast item:', data.forecast?.[0]);
          
          if (data.success && data.forecast && data.forecast.length > 0) {
            console.log(`✅ Setting ${data.forecast.length} forecast items`);
            setApiWeather(data.forecast);
          } else {
            console.warn('⚠️ No forecast data in response');
          }
          if (data.success && data.current) {
            console.log('✅ Setting current weather');
            setCurrentWeather(data.current);
          }
        } else {
          console.error('Weather API error:', weatherResponse.status);
          const errorText = await weatherResponse.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('天気データの取得に失敗:', error);
      }
    };

    fetchWeatherData();
  }, [river.latitude, river.longitude, river.name]);
  
  // 国土交通省の川の防災情報からカメラデータを取得
  const nationalCameras = getRiverCameras(river.name);
  const cameras = nationalCameras.length > 0 ? nationalCameras : river.cameras || [];
  
  // 天気データ（APIからの取得を優先、なければデフォルト）
  const weather = apiWeather.length > 0 ? apiWeather : 
    (river.weather && river.weather.length > 0) ? river.weather : [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 11, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ];

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('晴')) return '☀️';
    if (condition.includes('曇')) return '☁️';
    if (condition.includes('雨')) return '🌧️';
    if (condition.includes('雪')) return '❄️';
    return '🌤️';
  };

  return (
    <div className="space-y-4">
      {/* River Info Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-slate-900 mb-2">{river.name}</h2>
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{river.prefecture}</span>
            </div>
            <p className="text-slate-500">延長: {river.length}km</p>
          </div>
          <Badge 
            variant={river.currentStatus === 'warning' ? 'destructive' : 'default'}
            className={river.currentStatus === 'caution' ? 'bg-amber-500' : river.currentStatus === 'normal' ? 'bg-green-500' : ''}
          >
            {river.currentStatus === 'warning' ? '警戒' : river.currentStatus === 'caution' ? '注意' : '正常'}
          </Badge>
        </div>

        {/* Water Level - 一時非表示 */}
      </Card>

      {/* Tabs for Weather and Cameras */}
      <Tabs defaultValue="weather" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weather">
            <CloudRain className="w-4 h-4 mr-2" />
            天気予報
          </TabsTrigger>
          <TabsTrigger value="cameras">
            <Video className="w-4 h-4 mr-2" />
            ライブカメラ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weather" className="mt-4">
          <Card className="p-6">
            {/* 現在の天気 */}
            {currentWeather && (
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <CloudRain className="w-5 h-5 text-blue-600" />
                  <h3 className="text-slate-900">現在の天気</h3>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-around gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-slate-600 text-sm">気温</p>
                        <p className="text-slate-900">{currentWeather.temp}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-slate-600 text-sm">天気</p>
                        <p className="text-slate-900">{currentWeather.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-slate-600 text-sm">湿度</p>
                        <p className="text-slate-900">{currentWeather.humidity}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 予報 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weather.map((day, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <p className="text-slate-600">{day.date}</p>
                  </div>
                  <div className="mb-3">{getWeatherIcon(day.condition)}</div>
                  <p className="text-slate-900 mb-1">{day.condition}</p>
                  <p className="text-slate-700 mb-2">{day.temp}°C</p>
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="text-slate-600">{day.precipitation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cameras" className="mt-4">
          <div className="grid gap-4">
            {/* GraphQL/スクレイピングAPIから取得したライブカメラ情報 */}
            {apiCameras.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Shield className="w-5 h-5" style={{ color: '#0372ac' }} />
                  <h3 className="text-slate-900">ライブカメラ</h3>
                  <Badge variant="outline" className="ml-2">
                    {dataSource.includes('GraphQL') ? 'DPF GraphQL API' : dataSource.includes('HTML') ? 'HTML Scraping' : '公式データ'}
                  </Badge>
                </div>
                
                {apiCameras.map((camera) => (
                  <Card key={camera.id} className="overflow-hidden border-0" style={{ backgroundColor: '#effcff' }}>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#0372ac' }}>
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-slate-900 mb-1">{camera.name}</h4>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-3 h-3" />
                            <span>{camera.location}</span>
                          </div>
                        </div>
                        <Badge variant="outline">{camera.lastUpdated}</Badge>
                      </div>
                      
                      <a 
                        href={camera.cameraUrl || camera.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-white py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                        style={{ backgroundColor: '#0372ac' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#025a87'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0372ac'}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Video className="w-4 h-4" />
                          <span>ライブカメを見る</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* 国土交通省DPF APIから取得た観測所情報 */}
            {observationStations.length > 0 && observationStations.some(s => s.hasCameraUrl) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Shield className="w-5 h-5" style={{ color: '#0372ac' }} />
                  <h3 className="text-slate-900">観測所カメラ</h3>
                  <Badge variant="outline" className="ml-2">
                    {dataSource.includes('GraphQL') ? 'DPF API' : '公式データ'}
                  </Badge>
                </div>
                
                {observationStations.filter(s => s.hasCameraUrl).map((station) => (
                  <Card key={station.id || station.stationId} className="overflow-hidden border-0" style={{ backgroundColor: '#effcff' }}>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#0372ac' }}>
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-slate-900 mb-1">
                            {station.observationPlaceName || station.stationName}観測所
                          </h4>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-3 h-3" />
                              <span>{station.prefecture} {station.municipalityName || station.location}</span>
                            </div>
                            {station.lastUpdateDateTime && (
                              <span className="text-slate-500">
                                更新: {new Date(station.lastUpdateDateTime).toLocaleString('ja-JP')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <a 
                        href={station.cameraUrl || station.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-white py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                        style={{ backgroundColor: '#0372ac' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#025a87'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0372ac'}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Video className="w-4 h-4" />
                          <span>観測所情報を見る</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="space-y-4">
              {/* 観測所カメラカード（静的マッピング） */}
              {cameras.map((camera) => (
                <Card key={camera.id} className="overflow-hidden border-0" style={{ backgroundColor: '#effcff' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#0372ac' }}>
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-slate-900 mb-1">{camera.name}</h4>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-3 h-3" />
                          <span>{camera.location}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{camera.lastUpdated}</Badge>
                    </div>
                    <a
                      href={
                        river.latitude && river.longitude
                          ? `https://www.river.go.jp/kawabou/pc/tm?zm=14&clat=${river.latitude}&clon=${river.longitude}&fld=0&mapType=0&itmkndCd=8`
                          : `https://www.river.go.jp/kawabou/pc/th?fld=0&mapType=0&itmkndCd=8&searchWd=${encodeURIComponent(river.name)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-white py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                      style={{ backgroundColor: '#0372ac' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#025a87'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0372ac'}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>国土交通省 川の防災情報で確認</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  </div>
                </Card>
              ))}

              {/* カメラ情報がない場合のメインCTA */}
              {cameras.length === 0 && (
                <Card className="overflow-hidden border-0" style={{ backgroundColor: '#effcff' }}>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#0372ac' }}>
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 mb-1">ライブカメラ映像を確認</h3>
                        <p className="text-slate-600">国土交通省の川の防災情報サイトでご確認いただけます</p>
                      </div>
                    </div>
                    <a
                      href={
                        river.latitude && river.longitude
                          ? `https://www.river.go.jp/kawabou/pc/tm?zm=13&clat=${river.latitude}&clon=${river.longitude}&fld=0&mapType=0&itmkndCd=8`
                          : `https://www.river.go.jp/kawabou/pc/th?fld=0&mapType=0&itmkndCd=8&searchWd=${encodeURIComponent(river.name)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-white py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      style={{ backgroundColor: '#0372ac' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#025a87'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0372ac'}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span>国土交通省 川の防災情報で確認</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  </div>
                </Card>
              )}

              {/* その他の情報源（常に表示） */}
              <Card className="p-3">
                <h3 className="text-slate-900 mt-1 mb-0 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-600" />
                  その他の情報源
                </h3>
                <div className="grid gap-3">
                  <a
                    href={getPrefectureCameraUrl(river.prefecture)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <div>
                        <p className="text-slate-900">{river.prefecture}の河川カメラを検索</p>
                        <p className="text-slate-500">Google で{river.prefecture}の河川情報を探す</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}