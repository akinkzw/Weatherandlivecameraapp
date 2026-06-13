// Weather API クライアント (https://www.weatherapi.com/)
// 無料プランで過去7日間のデータ取得が可能

const WEATHERAPI_ENDPOINT = 'https://api.weatherapi.com/v1';

export interface WeatherData {
  date: string;
  temp: number;
  condition: string;
  precipitation: number;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

/**
 * Weather APIアイコンを日本語の天気状態に変換
 */
function mapWeatherCondition(conditionText: string, conditionCode: number): { condition: string; icon: string } {
  // Weather API Condition Codes
  // https://www.weatherapi.com/docs/weather_conditions.json
  
  if (conditionCode === 1000) {
    return { condition: '晴れ', icon: 'sun' };
  } else if ([1003, 1006, 1009].includes(conditionCode)) {
    return { condition: '曇り', icon: 'cloud' };
  } else if (conditionCode === 1030 || conditionCode === 1135 || conditionCode === 1147) {
    return { condition: '霧', icon: 'fog' };
  } else if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1198, 1201, 1240, 1243, 1246].includes(conditionCode)) {
    return { condition: '雨', icon: 'rain' };
  } else if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) {
    return { condition: '雷雨', icon: 'cloud-lightning' };
  } else if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(conditionCode)) {
    return { condition: '雪', icon: 'snow' };
  } else if (conditionCode === 1003) {
    return { condition: '晴れ時々曇り', icon: 'cloud-sun' };
  } else if ([1192, 1195].includes(conditionCode)) {
    return { condition: '小雨', icon: 'cloud-drizzle' };
  }
  
  // デフォルト
  return { condition: conditionText || '晴れ', icon: 'sun' };
}

/**
 * 昨日の天気を取得（Weather API History）
 */
export async function getYesterdayWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  const apiKey = Deno.env.get('WEATHERAPI_KEY');
  
  console.log('🌦️ getYesterdayWeather called for:', latitude, longitude);
  console.log('Weather API Key status (yesterday):', apiKey ? `Set (length: ${apiKey.length})` : 'NOT SET');
  
  if (!apiKey) {
    console.error('❌ WEATHERAPI_KEY is not set. Cannot fetch yesterday\'s weather.');
    return null;
  }

  try {
    // 昨日の日付を取得 (YYYY-MM-DD形式)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Weather API History endpoint
    const url = `${WEATHERAPI_ENDPOINT}/history.json?key=${apiKey}&q=${latitude},${longitude}&dt=${dateStr}`;
    
    console.log(`📡 Fetching yesterday's weather for ${latitude},${longitude} on ${dateStr}`);
    console.log(`📡 API URL: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    
    console.log(`📡 Weather API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Weather API error: ${response.status}`, errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 Weather API raw response:', JSON.stringify(data, null, 2));
    
    // データ構造を確認
    if (!data.forecast || !data.forecast.forecastday || data.forecast.forecastday.length === 0) {
      console.error('❌ Weather API returned no forecast data. Response structure:', Object.keys(data));
      return null;
    }
    
    const dayData = data.forecast.forecastday[0].day;
    console.log('📊 Day data:', dayData);
    
    const weatherInfo = mapWeatherCondition(
      dayData.condition.text,
      dayData.condition.code
    );
    
    const result = {
      date: '昨日',
      temp: Math.round(dayData.avgtemp_c),
      condition: weatherInfo.condition,
      precipitation: Math.round(dayData.daily_chance_of_rain || 0),
      icon: weatherInfo.icon,
      humidity: dayData.avghumidity,
      windSpeed: Math.round(dayData.maxwind_kph / 3.6 * 10) / 10 // kph to m/s
    };
    
    console.log('✅ Yesterday weather data prepared:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error fetching yesterday weather from Weather API:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}