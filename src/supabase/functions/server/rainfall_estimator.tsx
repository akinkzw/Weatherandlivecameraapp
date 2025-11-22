// 降水量ベースの河川危険度推定システム
// OpenWeather APIから降水量データを取得し、川の状態を推定

import { fetchWeatherData } from './openweather.tsx';

export interface RainfallEstimation {
  status: 'normal' | 'caution' | 'warning';
  totalRainfall: number; // mm
  currentRainfall: number; // mm
  forecastRainfall: number; // mm
  message: string;
  dataSource: 'rainfall-estimation';
  timestamp: string;
}

export interface RiverScale {
  type: 'large' | 'medium' | 'small';
  thresholds: {
    caution: number;  // 注意レベルの降水量（mm）
    warning: number;  // 警戒レベルの降水量（mm）
  };
}

// 川の規模別の閾値設定
const RIVER_SCALES: Record<string, RiverScale> = {
  large: {
    type: 'large',
    thresholds: {
      caution: 30,  // 大きな川：30mm以上で注意
      warning: 60,  // 大きな川：60mm以上で警戒
    }
  },
  medium: {
    type: 'medium',
    thresholds: {
      caution: 20,  // 中規模の川：20mm以上で注意
      warning: 50,  // 中規模の川：50mm以上で警戒
    }
  },
  small: {
    type: 'small',
    thresholds: {
      caution: 15,  // 渓流・小河川：15mm以上で注意（増水しやすい）
      warning: 40,  // 渓流・小河川：40mm以上で警戒
    }
  }
};

/**
 * 降水量から河川の危険度を推定
 * @param latitude 緯度
 * @param longitude 経度
 * @param riverScale 川の規模（'large' | 'medium' | 'small'）
 * @returns 推定結果
 */
export async function estimateRiverStatusFromRainfall(
  latitude: number,
  longitude: number,
  riverScale: 'large' | 'medium' | 'small' = 'medium'
): Promise<RainfallEstimation> {
  console.log(`=== Rainfall Estimation for river at (${latitude}, ${longitude}), scale: ${riverScale} ===`);
  
  try {
    // OpenWeather APIから天気データ取得
    const weatherData = await fetchWeatherData(latitude, longitude);
    
    if (!weatherData || !weatherData.current) {
      throw new Error('Weather data not available');
    }
    
    // 現在の降水量を取得（過去1時間）
    const currentRainfall = weatherData.current.rain?.['1h'] || 0;
    console.log(`Current rainfall (1h): ${currentRainfall}mm`);
    
    // 今後6時間の予報降水量を計算
    let forecastRainfall = 0;
    if (weatherData.hourly && weatherData.hourly.length > 0) {
      // 今後6時間分の降水量を合計
      const next6Hours = weatherData.hourly.slice(0, 6);
      forecastRainfall = next6Hours.reduce((sum, hour) => {
        const rain = hour.rain?.['1h'] || 0;
        return sum + rain;
      }, 0);
      console.log(`Forecast rainfall (next 6h): ${forecastRainfall}mm`);
    }
    
    // 総降水量（現在 + 予報）
    const totalRainfall = currentRainfall + forecastRainfall;
    console.log(`Total rainfall (current + forecast): ${totalRainfall}mm`);
    
    // 川の規模に応じた閾値を取得
    const scale = RIVER_SCALES[riverScale];
    console.log(`Thresholds for ${riverScale} river: caution=${scale.thresholds.caution}mm, warning=${scale.thresholds.warning}mm`);
    
    // ステータス判定
    let status: 'normal' | 'caution' | 'warning';
    let message: string;
    
    if (totalRainfall >= scale.thresholds.warning) {
      status = 'warning';
      message = `警戒：降雨量が多く、増水の危険性が高いです（${totalRainfall.toFixed(1)}mm）`;
    } else if (totalRainfall >= scale.thresholds.caution) {
      status = 'caution';
      message = `注意：降雨により水位上昇の可能性があります（${totalRainfall.toFixed(1)}mm）`;
    } else {
      status = 'normal';
      message = `正常：降雨量は少なく、水位は安定しています（${totalRainfall.toFixed(1)}mm）`;
    }
    
    console.log(`Estimated status: ${status} - ${message}`);
    
    return {
      status,
      totalRainfall: Math.round(totalRainfall * 10) / 10, // 小数第1位まで
      currentRainfall: Math.round(currentRainfall * 10) / 10,
      forecastRainfall: Math.round(forecastRainfall * 10) / 10,
      message,
      dataSource: 'rainfall-estimation',
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Error estimating river status from rainfall:', error);
    
    // エラー時はデフォルト値を返す（正常扱い、ただし不明として）
    return {
      status: 'normal',
      totalRainfall: 0,
      currentRainfall: 0,
      forecastRainfall: 0,
      message: 'データ取得エラー：降水量データを取得できませんでした',
      dataSource: 'rainfall-estimation',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 川の規模を判定するヘルパー関数
 * @param riverName 川の名前
 * @returns 川の規模
 */
export function detectRiverScale(riverName: string): 'large' | 'medium' | 'small' {
  // 一級河川の主要な川（大規模）
  const largeRivers = [
    '利根川', '信濃川', '石狩川', '北上川', '木曽川', '天竜川', '阿賀野川',
    '最上川', '富士川', '淀川', '吉野川', '筑後川', '九頭竜川', '荒川', '多摩川',
    '相模川', '那珂川', '久慈川', '鬼怒川', '小貝川', '利根川', '江戸川'
  ];
  
  // 中規模の川（二級河川や一級河川の支流）
  const mediumRivers = [
    '笛吹川', '桂川', '日川', '雨畑川', '早川', '釜無川', '塩川',
    '秋川', '浅川', '境川', '鶴見川', '引地川', '柏尾川'
  ];
  
  // 川の名前から規模を判定
  if (largeRivers.some(large => riverName.includes(large))) {
    return 'large';
  }
  
  if (mediumRivers.some(medium => riverName.includes(medium))) {
    return 'medium';
  }
  
  // デフォルトは小規模（渓流・支流）
  return 'small';
}
