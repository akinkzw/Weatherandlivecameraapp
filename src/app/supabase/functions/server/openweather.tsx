// OpenWeather API クライアント
// https://openweathermap.org/api

const OPENWEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  date: string;
  temp: number;
  condition: string;
  precipitation: number;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

interface OpenWeatherResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
      pressure?: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number; // Probability of precipitation (0-1)
    wind: {
      speed: number;
      deg?: number;
    };
  }>;
}

/**
 * OpenWeather APIアイコンを日本語の天気状態に変換
 */
function mapWeatherIcon(iconCode: string): { condition: string; icon: string } {
  const code = iconCode.substring(0, 2); // 01d -> 01
  
  const mapping: Record<string, { condition: string; icon: string }> = {
    '01': { condition: '晴れ', icon: 'sun' },
    '02': { condition: '晴れ時々曇り', icon: 'cloud-sun' },
    '03': { condition: '曇り', icon: 'cloud' },
    '04': { condition: '曇り', icon: 'cloud' },
    '09': { condition: '小雨', icon: 'cloud-drizzle' },
    '10': { condition: '雨', icon: 'rain' },
    '11': { condition: '雷雨', icon: 'cloud-lightning' },
    '13': { condition: '雪', icon: 'snow' },
    '50': { condition: '霧', icon: 'fog' }
  };
  
  return mapping[code] || { condition: '晴れ', icon: 'sun' };
}

/**
 * 緯度経度から5日間の天気予報を取得
 */
export async function getWeatherForecast(
  latitude: number, 
  longitude: number
): Promise<WeatherData[]> {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
  
  console.log('OpenWeather API Key status:', apiKey ? `Set (length: ${apiKey.length})` : 'NOT SET');
  
  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY is not set, returning mock data');
    return getMockWeatherData();
  }

  try {
    // 5日間の3時間ごとの予報を取得
    const url = `${OPENWEATHER_ENDPOINT}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;
    
    console.log(`Fetching weather for lat=${latitude}, lon=${longitude}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenWeather API error: ${response.status}`, errorText);
      return getMockWeatherData();
    }
    
    let data: OpenWeatherResponse;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse OpenWeather API response:', jsonError);
      return getMockWeatherData();
    }
    
    // 1日1つのデータに集約（正午のデータを使用）
    const dailyForecasts: WeatherData[] = [];
    const processedDates = new Set<string>();
    
    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // 正午（12時）前後のデータを優先
      const hour = date.getHours();
      if (hour >= 11 && hour <= 13 && !processedDates.has(dateKey)) {
        const weatherInfo = mapWeatherIcon(item.weather[0].icon);
        const dayLabel = getDayLabel(date);
        
        dailyForecasts.push({
          date: dayLabel,
          temp: Math.round(item.main.temp),
          condition: weatherInfo.condition,
          precipitation: Math.round(item.pop * 100), // Convert to percentage
          icon: weatherInfo.icon,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 10) / 10
        });
        
        processedDates.add(dateKey);
        
        // 4日分取得したら終了
        if (dailyForecasts.length >= 4) {
          break;
        }
      }
    }
    
    console.log(`Fetched ${dailyForecasts.length} daily forecasts`);
    return dailyForecasts.length > 0 ? dailyForecasts : getMockWeatherData();
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData();
  }
}

/**
 * 日付ラベルを生成
 */
function getDayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '明日';
  if (diffDays === 2) return '明後日';
  return `${diffDays}日後`;
}

/**
 * モックデータ（APIキーがない場合のフォールバック）
 */
function getMockWeatherData(): WeatherData[] {
  return [
    { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
    { date: '明日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
    { date: '明後日', temp: 13, condition: '雨', precipitation: 60, icon: 'rain' },
    { date: '3日後', temp: 11, condition: '曇り', precipitation: 20, icon: 'cloud' }
  ];
}

/**
 * 現在の天気を取得
 */
export async function getCurrentWeather(
  latitude: number,
  longitude: number
): Promise<{ temp: number; condition: string; humidity: number; pressure: number | null; windSpeed: number; windDeg: number | null; precipitation: number } | null> {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
  
  console.log('OpenWeather API Key status (current):', apiKey ? `Set (length: ${apiKey.length})` : 'NOT SET');
  
  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY is not set');
    return null;
  }

  try {
    const url = `${OPENWEATHER_ENDPOINT}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenWeather API error: ${response.status}`, errorText);
      return null;
    }
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse current weather response:', jsonError);
      return null;
    }
    const weatherInfo = mapWeatherIcon(data.weather[0].icon);
    
    return {
      temp: Math.round(data.main.temp),
      condition: weatherInfo.condition,
      humidity: data.main.humidity,
      pressure: typeof data.main.pressure === 'number' ? data.main.pressure : null, // hPa
      windSpeed: Math.round((data.wind?.speed ?? 0) * 10) / 10,                       // m/s
      windDeg: typeof data.wind?.deg === 'number' ? data.wind.deg : null,             // 0-360°
      precipitation: Math.round(((data.rain?.['1h'] ?? 0) as number) * 10) / 10,      // mm/h
    };

  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

/**
 * 気圧傾向を取得（5日3時間予報の直近スロットを比較）。
 * 近い将来（約6時間）で上昇/下降/横ばいを判定。
 */
export async function getPressureTrend(
  latitude: number,
  longitude: number
): Promise<{ trend: 'rising' | 'falling' | 'steady'; deltaHpa: number } | null> {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
  if (!apiKey) return null;

  try {
    const url = `${OPENWEATHER_ENDPOINT}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data: OpenWeatherResponse = await response.json();
    const list = data.list;
    if (!list || list.length < 3) return null;
    const p0 = list[0]?.main?.pressure;
    const pLater = list[2]?.main?.pressure; // 約6時間後（3hごと × 2）
    if (typeof p0 !== 'number' || typeof pLater !== 'number') return null;
    const delta = Math.round(pLater - p0);
    const trend = delta >= 2 ? 'rising' : delta <= -2 ? 'falling' : 'steady';
    return { trend, deltaHpa: delta };
  } catch (error) {
    console.error('Error fetching pressure trend:', error);
    return null;
  }
}

/**
 * 詳細な天気データを取得（降水量データを含む）
 * OneCall API 3.0を使用
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<any> {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
  
  console.log('=== fetchWeatherData ===');
  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);
  console.log('API Key status:', apiKey ? `Set (length: ${apiKey.length})` : 'NOT SET');
  
  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY is not set');
    throw new Error('OPENWEATHER_API_KEY is not configured');
  }

  try {
    // OneCall API 3.0を使用
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;
    
    console.log('Fetching from OneCall API 3.0:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OneCall API error: ${response.status}`, errorText);
      
      // OneCall 3.0が利用できない場合、無料版のAPIを使用
      console.log('Falling back to free tier API endpoints');
      return await fetchWeatherDataFallback(latitude, longitude, apiKey);
    }
    
    const data = await response.json();
    console.log('OneCall API response received');
    console.log('Current data available:', !!data.current);
    console.log('Hourly data count:', data.hourly?.length || 0);
    
    return data;
    
  } catch (error) {
    console.error('Error fetching weather data from OneCall API:', error);
    console.log('Attempting fallback to free tier API');
    
    // フォールバック
    return await fetchWeatherDataFallback(latitude, longitude, apiKey);
  }
}

/**
 * OneCall APIが利用できない場合のフォールバック
 * 無料APIエンドポイントを組み合わせて同様のデータを取得
 */
async function fetchWeatherDataFallback(
  latitude: number,
  longitude: number,
  apiKey: string
): Promise<any> {
  console.log('Using fallback weather data fetch');
  
  try {
    // 現在の天気を取得
    const currentUrl = `${OPENWEATHER_ENDPOINT}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;
    const currentResponse = await fetch(currentUrl);
    
    if (!currentResponse.ok) {
      throw new Error(`Current weather API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // 予報データを取得
    const forecastUrl = `${OPENWEATHER_ENDPOINT}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // OneCall API形式に変換
    const result = {
      lat: latitude,
      lon: longitude,
      timezone: 'Asia/Tokyo',
      current: {
        dt: currentData.dt,
        temp: currentData.main.temp,
        humidity: currentData.main.humidity,
        wind_speed: currentData.wind?.speed || 0,
        weather: currentData.weather,
        rain: currentData.rain || {},
      },
      hourly: forecastData.list.slice(0, 48).map((item: any) => ({
        dt: item.dt,
        temp: item.main.temp,
        humidity: item.main.humidity,
        wind_speed: item.wind?.speed || 0,
        weather: item.weather,
        rain: item.rain || {},
        pop: item.pop || 0,
      })),
    };
    
    console.log('Fallback data constructed successfully');
    console.log('Current rain data:', result.current.rain);
    console.log('Hourly forecasts:', result.hourly.length);
    
    return result;
    
  } catch (error) {
    console.error('Error in fallback weather fetch:', error);
    throw error;
  }
}