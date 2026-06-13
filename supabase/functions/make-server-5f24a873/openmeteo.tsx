// Open-Meteo API - 過去の天気データ取得
// 完全無料、APIキー不要

/**
 * 昨日の天気データを取得
 */
export async function getYesterdayWeatherFromOpenMeteo(lat: number, lon: number) {
  try {
    console.log(`🌤️ [Open-Meteo] Fetching yesterday's weather for lat: ${lat}, lon: ${lon}`);
    
    // 昨日の日付を取得（JST タイムゾーン）
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`📅 [Open-Meteo] Yesterday's date: ${yesterdayStr}`);
    
    // Open-Meteo Archive API URL（過去のデータ専用）
    const url = `https://archive-api.open-meteo.com/v1/archive?` +
      `latitude=${lat}&longitude=${lon}` +
      `&start_date=${yesterdayStr}&end_date=${yesterdayStr}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=Asia/Tokyo`;
    
    console.log(`📡 [Open-Meteo] Archive API Request URL: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DPF-River-App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📡 [Open-Meteo] Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Open-Meteo] API error: ${response.status}`, errorText);
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ [Open-Meteo] Response received:`, JSON.stringify(data, null, 2));
    
    // データが存在するか確認
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.warn(`⚠️ [Open-Meteo] No data available for ${yesterdayStr}`);
      console.warn(`⚠️ [Open-Meteo] Response data:`, data);
      return null;
    }
    
    // 昨日のデータを抽出
    const weatherCode = data.daily.weather_code[0];
    const tempMax = data.daily.temperature_2m_max[0];
    const tempMin = data.daily.temperature_2m_min[0];
    const precipitation = data.daily.precipitation_sum[0];
    
    console.log(`📊 [Open-Meteo] Raw data - weatherCode: ${weatherCode}, tempMax: ${tempMax}, tempMin: ${tempMin}, precipitation: ${precipitation}`);
    
    // 天気コードを天気アイコンに変換
    const weatherIcon = mapWeatherCodeToIcon(weatherCode);
    const weatherDescription = mapWeatherCodeToDescription(weatherCode);
    
    console.log(`✅ [Open-Meteo] Yesterday's weather: ${weatherDescription}, ${tempMax}°C / ${tempMin}°C`);
    
    const result = {
      date: yesterdayStr,
      tempMax: Math.round(tempMax),
      tempMin: Math.round(tempMin),
      precipitation: precipitation || 0,
      weatherCode,
      weatherIcon,
      weatherDescription,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ [Open-Meteo] Returning result:`, JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ [Open-Meteo] Error fetching yesterday weather:', error);
    console.error('❌ [Open-Meteo] Error details:', error instanceof Error ? error.message : String(error));
    console.error('❌ [Open-Meteo] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return null;
  }
}

/**
 * Open-Meteo天気コードをアイコンにマッピング
 * https://open-meteo.com/en/docs
 */
function mapWeatherCodeToIcon(code: number): string {
  // WMO天気コード
  if (code === 0) return '01d'; // Clear sky
  if (code === 1) return '02d'; // Mainly clear
  if (code === 2) return '03d'; // Partly cloudy
  if (code === 3) return '04d'; // Overcast
  if (code === 45 || code === 48) return '50d'; // Fog
  if (code === 51 || code === 53 || code === 55) return '09d'; // Drizzle
  if (code === 56 || code === 57) return '13d'; // Freezing Drizzle
  if (code === 61 || code === 63 || code === 65) return '10d'; // Rain
  if (code === 66 || code === 67) return '13d'; // Freezing Rain
  if (code === 71 || code === 73 || code === 75) return '13d'; // Snow fall
  if (code === 77) return '13d'; // Snow grains
  if (code === 80 || code === 81 || code === 82) return '09d'; // Rain showers
  if (code === 85 || code === 86) return '13d'; // Snow showers
  if (code === 95) return '11d'; // Thunderstorm
  if (code === 96 || code === 99) return '11d'; // Thunderstorm with hail
  
  return '01d'; // Default
}

/**
 * Open-Meteo天気コードを日本語説明にマッピング
 */
function mapWeatherCodeToDescription(code: number): string {
  if (code === 0) return '快晴';
  if (code === 1) return '晴れ';
  if (code === 2) return '一部曇り';
  if (code === 3) return '曇り';
  if (code === 45 || code === 48) return '霧';
  if (code === 51 || code === 53 || code === 55) return '霧雨';
  if (code === 56 || code === 57) return '凍結霧雨';
  if (code === 61) return '小雨';
  if (code === 63) return '雨';
  if (code === 65) return '大雨';
  if (code === 66 || code === 67) return '凍雨';
  if (code === 71) return '小雪';
  if (code === 73) return '雪';
  if (code === 75) return '大雪';
  if (code === 77) return '霰';
  if (code === 80) return 'にわか雨';
  if (code === 81) return '強いにわか雨';
  if (code === 82) return '激しいにわか雨';
  if (code === 85) return 'にわか雪';
  if (code === 86) return '強いにわか雪';
  if (code === 95) return '雷雨';
  if (code === 96 || code === 99) return '雹を伴う雷雨';
  
  return '不明';
}