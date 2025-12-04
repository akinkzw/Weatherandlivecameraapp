// 手動で川を追加・管理するエンドポイント

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { estimateRiverStatusFromRainfall, detectRiverScale } from './rainfall_estimator.tsx';

// 都道府県から地方を判定するヘルパー関数
export function getPrefectureRegion(prefecture: string): string {
  const regionMap: Record<string, string> = {
    '北海道': 'hokkaido-tohoku',
    '青森県': 'hokkaido-tohoku', '岩手県': 'hokkaido-tohoku', '宮城県': 'hokkaido-tohoku',
    '秋田県': 'hokkaido-tohoku', '山形県': 'hokkaido-tohoku', '福島県': 'hokkaido-tohoku',
    '茨城県': 'kanto', '栃木県': 'kanto', '群馬県': 'kanto',
    '埼玉県': 'kanto', '千葉県': 'kanto', '東京都': 'kanto', '神奈川県': 'kanto',
    '新潟県': 'chubu', '富山県': 'chubu', '石川県': 'chubu',
    '福井県': 'chubu', '山梨県': 'chubu', '長野県': 'chubu',
    '岐阜県': 'chubu', '静岡県': 'chubu', '愛知県': 'chubu',
    '三重県': 'kinki', '滋賀県': 'kinki', '京都府': 'kinki',
    '大阪府': 'kinki', '兵庫県': 'kinki', '奈良県': 'kinki', '和歌山県': 'kinki',
    '鳥取県': 'chugoku', '島根県': 'chugoku', '岡山県': 'chugoku',
    '広島県': 'chugoku', '山口県': 'chugoku',
    '徳島県': 'shikoku', '香川県': 'shikoku', '愛媛県': 'shikoku', '高知県': 'shikoku',
    '福岡県': 'kyushu', '佐賀県': 'kyushu', '長崎県': 'kyushu',
    '熊本県': 'kyushu', '大分県': 'kyushu', '宮崎県': 'kyushu',
    '鹿児島県': 'kyushu', '沖縄県': 'kyushu',
  };
  return regionMap[prefecture] || 'kanto';
}

export async function addManualRiver(c: any) {
  try {
    const body = await c.req.json();
    const { name, prefecture, municipality, latitude, longitude, scale, region, basinName, stationName } = body;
    
    console.log('=== Adding Manual River ===');
    console.log('River name:', name);
    console.log('Prefecture:', prefecture);
    console.log('Scale:', scale);
    
    if (!name || !prefecture || !latitude || !longitude) {
      return c.json({
        success: false,
        error: '必須フィールドが不足しています（川の名前、都道府県、緯度、経度が必要です）'
      }, 400);
    }
    
    // パフォーマンス改善：maxIdをKVに保存して再利用
    let maxIdRecord = await kv.get('river_max_id');
    let maxId = maxIdRecord ? parseInt(maxIdRecord) : 0;
    
    // 初回のみ、既存の川をスキャンしてmaxIdを取得
    if (maxId === 0) {
      const existingRivers = await kv.getByPrefix('river:');
      maxId = existingRivers.reduce((max, river) => {
        const id = parseInt(river.id);
        return id > max ? id : max;
      }, 0);
    }
    
    const newId = maxId + 1;
    
    // 緯度経度を小数点以下6桁に丸める（約10cm精度）
    const roundedLat = Math.round(parseFloat(latitude) * 1000000) / 1000000;
    const roundedLon = Math.round(parseFloat(longitude) * 1000000) / 1000000;
    
    // 規模が未指定または空の場合は自動検出
    const riverScale = (scale && ['large', 'medium', 'small'].includes(scale.toLowerCase()))
      ? scale.toLowerCase()
      : detectRiverScale(name);
    const riverRegion = region || getPrefectureRegion(prefecture);
    
    const riverRecord = {
      id: newId.toString(),
      name: name,
      region: riverRegion,
      prefecture: prefecture,
      municipality: municipality || '',
      basinName: basinName || '',
      stationName: stationName || '',
      latitude: roundedLat,
      longitude: roundedLon,
      length: 0,
      waterLevel: 0,
      warningLevel: 0,
      currentStatus: 'normal' as const,
      cameras: [],
      weather: [],
      dataSource: 'manual' as const,
      scale: riverScale,
      observationCount: 0,
      dpfStations: []
    };
    
    await kv.set(`river:${newId}`, riverRecord);
    
    // maxIdを更新
    await kv.set('river_max_id', newId.toString());
    
    console.log(`✅ Successfully added manual river: ${name} (${prefecture})`);
    
    return c.json({
      success: true,
      message: `川「${name}」を追加しました`,
      river: riverRecord
    });
    
  } catch (error) {
    console.error('Error adding manual river:', error);
    return c.json({
      success: false,
      error: '川の追加に失敗しました',
      details: String(error)
    }, 500);
  }
}

export async function getRiverRainfallStatus(c: any) {
  try {
    const riverId = c.req.param('id');
    console.log(`=== Getting rainfall status for river ${riverId} ===`);
    
    const river = await kv.get(`river:${riverId}`);
    if (!river) {
      return c.json({ success: false, error: 'River not found' }, 404);
    }
    
    let lat = river.latitude;
    let lon = river.longitude;
    
    if (river.dpfStations && river.dpfStations.length > 0) {
      lat = river.dpfStations[0].lat;
      lon = river.dpfStations[0].lon;
    }
    
    if (!lat || !lon) {
      return c.json({
        success: false,
        error: '川の位置情報がありません'
      }, 400);
    }
    
    const scale = river.scale || detectRiverScale(river.name);
    const estimation = await estimateRiverStatusFromRainfall(lat, lon, scale);
    
    return c.json({
      success: true,
      river: {
        id: river.id,
        name: river.name,
        prefecture: river.prefecture
      },
      estimation: estimation
    });
    
  } catch (error) {
    console.error('Error getting rainfall status:', error);
    return c.json({
      success: false,
      error: '降水量データの取得に失敗しました',
      details: String(error)
    }, 500);
  }
}

/**
 * CSVから複数の川を一括登録するエンドポイント
 */
export async function addRiversBulk(c: any) {
  try {
    const body = await c.req.json();
    const { rivers } = body;
    
    console.log('=== Bulk Adding Rivers ===');
    console.log('Number of rivers to add:', rivers?.length || 0);
    
    if (!rivers || !Array.isArray(rivers) || rivers.length === 0) {
      return c.json({
        success: false,
        error: '川のデータが不正です。配列形式で送信してくさい。'
      }, 400);
    }
    
    // 既存の川の数を取得してIDを決定
    const existingRivers = await kv.getByPrefix('river:');
    let maxId = existingRivers.reduce((max, river) => {
      const id = parseInt(river.id);
      return id > max ? id : max;
    }, 0);
    
    const results = {
      success: [] as any[],
      errors: [] as any[],
      total: rivers.length
    };
    
    for (let i = 0; i < rivers.length; i++) {
      const riverData = rivers[i];
      const { name, prefecture, municipality, latitude, longitude, scale, region, basinName, stationName, dpfObservatoryId, waterLevelUrl } = riverData;
      
      try {
        // 必須フ��ールドのバリデーション
        if (!name || !prefecture || !latitude || !longitude) {
          results.errors.push({
            index: i + 1,
            name: name || '不明',
            error: '必須フィールドが不足しています（川の名前、都道府県、緯度、経度が必要です）'
          });
          continue;
        }
        
        // 緯度経度の数値チェック
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        
        if (isNaN(lat) || isNaN(lon)) {
          results.errors.push({
            index: i + 1,
            name: name,
            error: '緯度または経度が数値ではありません'
          });
          continue;
        }
        
        maxId++;
        // 緯度経度を小数点以下6桁に丸める（約10cm精度）
        const roundedLat = Math.round(lat * 1000000) / 1000000;
        const roundedLon = Math.round(lon * 1000000) / 1000000;
        
        // 規模が未指定または空の場合は自動検出
        const riverScale = (scale && ['large', 'medium', 'small'].includes(scale.toLowerCase()))
          ? scale.toLowerCase()
          : detectRiverScale(name);
        const riverRegion = region || getPrefectureRegion(prefecture);
        
        const riverRecord = {
          id: maxId.toString(),
          name: name,
          region: riverRegion,
          prefecture: prefecture,
          municipality: municipality || '',
          basinName: basinName || '',
          stationName: stationName || '',
          latitude: roundedLat,
          longitude: roundedLon,
          length: 0,
          waterLevel: null, // 🔄 ダミー値ではなくnullに変更
          warningLevel: null, // 🔄 ダミー値ではなくnullに変更
          currentStatus: 'normal' as const,
          cameras: [],
          weather: [],
          dataSource: 'manual' as const,
          scale: riverScale,
          observationCount: 0,
          dpfStations: [],
          dpfObservatoryId: dpfObservatoryId || '', // 🆕 DPF観測所ID
          waterLevelUrl: waterLevelUrl || '' // 🆕 水位情報URL
        };
        
        await kv.set(`river:${maxId}`, riverRecord);
        
        results.success.push({
          index: i + 1,
          name: name,
          prefecture: prefecture,
          id: maxId
        });
        
        console.log(`✅ Added: ${name} (${prefecture}) - ID: ${maxId}`);
        
      } catch (error) {
        console.error(`Error adding river ${name}:`, error);
        results.errors.push({
          index: i + 1,
          name: name || '不明',
          error: String(error)
        });
      }
    }
    
    console.log(`✅ Bulk registration complete: ${results.success.length} success, ${results.errors.length} errors`);
    
    return c.json({
      success: true,
      message: `${results.success.length}件の川を追加しました`,
      results: results
    });
    
  } catch (error) {
    console.error('Error in bulk river registration:', error);
    return c.json({
      success: false,
      error: '一括登録に失敗しました',
      details: String(error)
    }, 500);
  }
}