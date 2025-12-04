import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Camera, MapPin, Droplet, CloudRain, Calendar, X, Droplets, Thermometer, Cloud, Video, ExternalLink, Shield } from "lucide-react";
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
  const waterLevelPercentage = (river.waterLevel / river.warningLevel) * 100;
  const [observationStations, setObservationStations] = useState<ObservationStation[]>([]);
  const [apiCameras, setApiCameras] = useState<RiverCameraData[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [apiWeather, setApiWeather] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [realtimeWaterLevel, setRealtimeWaterLevel] = useState<any>(null);
  const [loadingWaterLevel, setLoadingWaterLevel] = useState(false);

  // リアルタイム水位データを取得
  useEffect(() => {
    const fetchWaterLevel = async () => {
      // DPF観測所IDが設定されている場合のみ取得
      if (!river.dpfObservationId) {
        console.log('DPF観測所IDが設定されていません');
        return;
      }

      setLoadingWaterLevel(true);
      try {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/realtime-water-level/${river.dpfObservationId}${
          river.observatoryName ? `?observatory=${encodeURIComponent(river.observatoryName)}` : ''
        }`;
        
        console.log('Fetching realtime water level:', url);
        
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
  }, [river.dpfObservationId, river.observatoryName]);

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

        {/* Water Level */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="text-slate-900">現在の水位</h3>
            {loadingWaterLevel && (
              <Badge variant="outline" className="ml-2">読み込み中...</Badge>
            )}
            {realtimeWaterLevel && (
              <Badge variant="outline" className="ml-2" style={{ backgroundColor: '#effcff', borderColor: '#0372ac', color: '#0372ac' }}>
                リアルタイムデータ
              </Badge>
            )}
          </div>
          
          {realtimeWaterLevel ? (
            // リアルタイム水位データを表示
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-900">{realtimeWaterLevel.observationName}</span>
                <Badge 
                  variant={realtimeWaterLevel.status === 'danger' ? 'destructive' : 'default'}
                  className={
                    realtimeWaterLevel.status === 'warning' ? 'bg-red-500' : 
                    realtimeWaterLevel.status === 'caution' ? 'bg-amber-500' : 
                    'bg-green-500'
                  }
                >
                  {realtimeWaterLevel.status === 'danger' ? '氾濫発生' : 
                   realtimeWaterLevel.status === 'warning' ? '警戒' : 
                   realtimeWaterLevel.status === 'caution' ? '注意' : 
                   '正常'}
                </Badge>
              </div>
              
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">観測時刻:</span>
                  <span className="text-slate-900">{realtimeWaterLevel.observationTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">現在水位:</span>
                  <span className="text-slate-900">{realtimeWaterLevel.currentWaterLevel.toFixed(2)}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">水防団待機水位:</span>
                  <span className="text-slate-700">{realtimeWaterLevel.warningLevel.toFixed(2)}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">氾濫危険水位:</span>
                  <span className="text-amber-700">{realtimeWaterLevel.dangerLevel.toFixed(2)}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">氾濫発生水位:</span>
                  <span className="text-red-700">{realtimeWaterLevel.floodLevel.toFixed(2)}m</span>
                </div>
              </div>
              
              {river.waterLevelUrl && (
                <a 
                  href={river.waterLevelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 transition-colors p-2 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>詳細な水位情報を見る</span>
                </a>
              )}
            </div>
          ) : (
            // デフォルトの水位表示（観測所IDが未設定の場合）
            <div className="space-y-2">
              {river.waterLevel != null && river.warningLevel != null ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">現在: {river.waterLevel.toFixed(2)}m</span>
                    <span className="text-slate-600">警戒水位: {river.warningLevel.toFixed(2)}m</span>
                  </div>
                  <Progress value={waterLevelPercentage} className="h-3" />
                  <p className="text-slate-500">警戒水位まで: {(river.warningLevel - river.waterLevel).toFixed(2)}m</p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500">この川の水位データは準備中です</p>
                  {river.waterInfoUrl && (
                    <a 
                      href={river.waterInfoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      国土交通省のサイトで確認する →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
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
                          <span>ライブカメ���を見る</span>
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
            
            {cameras.length > 0 ? (
              cameras.map((camera) => (
                <Card key={camera.id} className="overflow-hidden">
                  <a 
                    href={camera.webUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="aspect-video bg-slate-200 relative overflow-hidden">
                      <img
                        src={camera.imageUrl}
                        alt={camera.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs z-10">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>LIVE</span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <div className="bg-white text-slate-900 px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-100 scale-95">
                          国土交通省サイトで確認
                        </div>
                      </div>
                    </div>
                  </a>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4 text-slate-600" />
                          <h3 className="text-slate-900">{camera.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{camera.location}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{camera.lastUpdated}</Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="space-y-4">
                {/* メインCTA - 国土交通省 */}
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
                      href={`https://www.river.go.jp/portal/#80&navi=search&keyword=${encodeURIComponent(river.name)}`}
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

                {/* サブリンク - 都道府県・地域の防災情報 */}
                <Card className="p-6">
                  <h3 className="text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-600" />
                    その他の情報源
                  </h3>
                  <div className="grid gap-3">
                    {/* 都道府県の河川カメラページ */}
                    <a 
                      href={getPrefectureCameraUrl(river.prefecture)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Camera className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                        <div>
                          <p className="text-slate-900">{river.prefecture}の河川監視カメラ</p>
                          <p className="text-slate-500">{river.prefecture}が提供する河川情報</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </a>

                    {/* 地域の防災情報 */}
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(river.prefecture + ' ' + river.name + ' ライブカメラ')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                        <div>
                          <p className="text-slate-900">その他のカメラ映像を検索</p>
                          <p className="text-slate-500">地域の防災サイトや自治体情報</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </div>
                </Card>

                {/* 情報提供の案内 */}
                <Card className="p-6 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-500 p-2 rounded-lg flex-shrink-0">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-900 mb-1">カメラ設置状況について</p>
                      <p className="text-slate-600">河川のライブカメラは、国や自治体によって設置・管理されています。設置状況は河川や地域によって異なります。</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}