import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Camera, MapPin, Droplets, Video, CloudRain, Calendar } from 'lucide-react';
import { River } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getRiverCameras, getUpdatedCameraUrl } from '../utils/riverCameras';

interface RiverDetailProps {
  river: River;
}

export function RiverDetail({ river }: RiverDetailProps) {
  const waterLevelPercentage = (river.waterLevel / river.warningLevel) * 100;

  // 国土交通省の川の防災情報からカメラデータを取得
  const nationalCameras = getRiverCameras(river.name);
  const cameras = nationalCameras.length > 0 ? nationalCameras : river.cameras || [];
  
  // 天気データ（空配列の場合もデフォルトデータを使用）
  const weather = (river.weather && river.weather.length > 0) ? river.weather : [
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
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">現在: {river.waterLevel.toFixed(2)}m</span>
              <span className="text-slate-600">警戒水位: {river.warningLevel.toFixed(2)}m</span>
            </div>
            <Progress value={waterLevelPercentage} className="h-3" />
            <p className="text-slate-500">警戒水位まで: {(river.warningLevel - river.waterLevel).toFixed(2)}m</p>
          </div>
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
                    <span className="text-slate-600">{day.precipitation}mm</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cameras" className="mt-4">
          <div className="grid gap-4">
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
              <Card className="p-8 text-center">
                <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">現在、ライブカメラの設置はありません</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}