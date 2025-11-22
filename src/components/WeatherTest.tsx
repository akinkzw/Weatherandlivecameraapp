import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CloudRain, Calendar, Droplets, Wind } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// 主要な川のリスト（テスト用）
const testRivers = [
  '千曲川', '犀川', '梓川', '天竜川', '石狩川', '利根川', '信濃川',
  '最上川', '北上川', '阿武隈川', '多摩川', '相模川', '富士川',
  '黒部川', '神通川', '木曽川', '長良川', '淀川', '吉野川',
  '四万十川', '筑後川'
];

export function WeatherTest() {
  const [selectedRiver, setSelectedRiver] = useState('千曲川');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<any>(null);

  // 環境変数の状態を確認
  const checkEnvVars = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/env-check`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setEnvStatus(data);
        console.log('Environment Status:', data);
      }
    } catch (err) {
      console.error('Failed to check environment variables:', err);
    }
  };

  useEffect(() => {
    checkEnvVars();
  }, []);

  const fetchWeather = async (riverName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching weather for ${riverName}...`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/river-observations/${encodeURIComponent(riverName)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Weather API Response:', data);
      
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedRiver);
  }, [selectedRiver]);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('晴')) return '☀️';
    if (condition.includes('曇')) return '☁️';
    if (condition.includes('雨')) return '🌧️';
    if (condition.includes('雪')) return '❄️';
    return '🌤️';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-slate-900 mb-2">天気予報機能テスト</h1>
          <p className="text-slate-600">OpenWeather API統合の動作確認</p>
        </div>

        {/* Environment Status */}
        {envStatus && (
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">環境変数ステータス</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${envStatus.variables.OPENWEATHER_API_KEY === 'SET' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-slate-900 mb-1">OpenWeather API</p>
                <p className={envStatus.variables.OPENWEATHER_API_KEY === 'SET' ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.variables.OPENWEATHER_API_KEY}
                  {envStatus.variables.OPENWEATHER_API_KEY === 'SET' && ` (${envStatus.variables.OPENWEATHER_API_KEY_LENGTH} chars)`}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${envStatus.variables.DPF_API_KEY === 'SET' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-slate-900 mb-1">DPF API</p>
                <p className={envStatus.variables.DPF_API_KEY === 'SET' ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.variables.DPF_API_KEY}
                  {envStatus.variables.DPF_API_KEY === 'SET' && ` (${envStatus.variables.DPF_API_KEY_LENGTH} chars)`}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${envStatus.variables.MICROCMS_API_KEY === 'SET' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-slate-900 mb-1">microCMS API</p>
                <p className={envStatus.variables.MICROCMS_API_KEY === 'SET' ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.variables.MICROCMS_API_KEY}
                  {envStatus.variables.MICROCMS_API_KEY === 'SET' && ` (${envStatus.variables.MICROCMS_API_KEY_LENGTH} chars)`}
                </p>
              </div>
            </div>
            {(envStatus.variables.OPENWEATHER_API_KEY === 'NOT SET' || envStatus.variables.DPF_API_KEY === 'NOT SET') && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-900">
                  ⚠️ 一部のAPIキーが設定されていません。環境変数設定画面で設定してください。
                </p>
              </div>
            )}
          </Card>
        )}

        {/* River Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-slate-900 mb-2 block">川を選択</label>
              <Select value={selectedRiver} onValueChange={setSelectedRiver}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testRivers.map((river) => (
                    <SelectItem key={river} value={river}>
                      {river}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => fetchWeather(selectedRiver)}
              disabled={loading}
              className="w-full"
            >
              {loading ? '読み込み中...' : '天気予報を取得'}
            </Button>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <p className="text-red-900">エラー: {error}</p>
          </Card>
        )}

        {/* API Info */}
        {weatherData && (
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">API情報</h3>
            <div className="space-y-2 text-slate-600">
              <p><strong>データソース:</strong> {weatherData.source || 'N/A'}</p>
              <p><strong>APIエンドポイント:</strong> {weatherData.apiEndpoint || 'N/A'}</p>
              <p><strong>観測所数:</strong> {weatherData.observationCount || 0}</p>
              <p><strong>カメラ数:</strong> {weatherData.cameraCount || 0}</p>
              {weatherData.note && (
                <p className="text-amber-600"><strong>注意:</strong> {weatherData.note}</p>
              )}
            </div>
          </Card>
        )}

        {/* Current Weather */}
        {weatherData?.currentWeather && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CloudRain className="w-5 h-5 text-blue-600" />
              <h3 className="text-slate-900">現在の天気</h3>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-slate-600 mb-2">気温</p>
                  <p className="text-slate-900">{weatherData.currentWeather.temp}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 mb-2">天気</p>
                  <p className="text-slate-900">{weatherData.currentWeather.condition}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 mb-2">湿度</p>
                  <p className="text-slate-900">{weatherData.currentWeather.humidity}%</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Forecast */}
        {weatherData?.weather && weatherData.weather.length > 0 ? (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-slate-900">天気予報</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weatherData.weather.map((day: any, index: number) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <p className="text-slate-600">{day.date}</p>
                  </div>
                  <div className="text-4xl mb-3">{getWeatherIcon(day.condition)}</div>
                  <p className="text-slate-900 mb-1">{day.condition}</p>
                  <p className="text-slate-700 mb-3">{day.temp}°C</p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span className="text-slate-600">{day.precipitation}%</span>
                    </div>
                    {day.humidity && (
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-600">湿度 {day.humidity}%</span>
                      </div>
                    )}
                    {day.windSpeed && (
                      <div className="flex items-center justify-center gap-1">
                        <Wind className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-600">{day.windSpeed}m/s</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          weatherData && (
            <Card className="p-6 bg-amber-50 border-amber-200">
              <p className="text-slate-900">天気予報データが取得できませんでした</p>
            </Card>
          )
        )}

        {/* Raw Data (for debugging) */}
        {weatherData && (
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">デバッグ情報（生データ）</h3>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(weatherData, null, 2)}</pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}