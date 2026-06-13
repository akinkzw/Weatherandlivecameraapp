// 手動で川を追加・管理するエンドポイント

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

export async function addManualRiver(body: any) {
  try {
    const { name, prefecture, municipality, latitude, longitude, scale, region, basinName, stationName } = body;

    console.log('=== Adding Manual River ===');
    console.log('River name:', name);
    console.log('Prefecture:', prefecture);
    console.log('Scale:', scale);

    if (!name || !prefecture || !latitude || !longitude) {
      return {
        success: false,
        error: '必須フィールドが不足しています（川の名前、都道府県、緯度、経度が必要です）'
      };
    }

    // パフォーマンス改善：maxIdをKVに保存して再利用
    let maxIdRecord = await kv.get('river_max_id');
    let maxId = maxIdRecord ? parseInt(maxIdRecord) : 0;

    // 初回のみ、既存の川をスキャンしてmaxIdを取得
    if (maxId === 0) {
      const existingRivers = await kv.getByPrefix('river:');
      maxId = existingRivers.reduce((max: number, river: any) => {
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

    return {
      success: true,
      message: `川「${name}」を追加しました`,
      river: riverRecord
    };

  } catch (error) {
    console.error('Error adding manual river:', error);
    return {
      success: false,
      error: '川の追加に失敗しました',
      details: String(error)
    };
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
 * 重複チェック機能付き
 */
export async function addRiversBulk(rivers: any[]) {
  try {
    console.log('=== Bulk Adding Rivers ===');
    console.log('Number of rivers to add:', rivers?.length || 0);
    
    if (!rivers || !Array.isArray(rivers) || rivers.length === 0) {
      return {
        success: false,
        error: '川のデータが不正です。配列形式で送信してください。'
      };
    }
    
    // 既存の川の数を取得してIDを決定
    console.log('📥 Loading existing rivers from database...');
    const existingRivers = await kv.getByPrefix('river:');
    console.log(`✅ Loaded ${existingRivers.length} existing rivers`);
    
    let maxId = existingRivers.reduce((max, river) => {
      const id = parseInt(river.id);
      return id > max ? id : max;
    }, 0);
    
    // 重複チェック用のマップを作成（川名 + 都道府県 + 位置で判定）
    const existingRiverMap = new Map<string, any>();
    for (const river of existingRivers) {
      const key = `${river.name}|${river.prefecture}|${Math.round(river.latitude * 100)},${Math.round(river.longitude * 100)}`;
      existingRiverMap.set(key, river);
    }
    console.log(`📊 Created duplicate check map with ${existingRiverMap.size} entries`);
    
    // CSV内での重複チェック用のセット（同じ川を複数回登録しない）
    const csvRiverSet = new Set<string>();
    
    const results = {
      success: [] as any[],
      errors: [] as any[],
      total: rivers.length,
      stats: {
        success: 0,
        failed: 0,
        skipped: 0
      }
    };
    
    // バッチサイズを小さくして処理（レート制限を避ける）
    const BATCH_SIZE = 10;
    
    for (let batchStart = 0; batchStart < rivers.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, rivers.length);
      const batchRivers = rivers.slice(batchStart, batchEnd);
      
      console.log(`Processing batch ${batchStart + 1}-${batchEnd} of ${rivers.length}...`);
      
      const batchRecords: Array<{ key: string; value: any }> = [];
      
      for (let i = 0; i < batchRivers.length; i++) {
        const riverData = batchRivers[i];
        const { name, prefecture, municipality, latitude, longitude, scale, region, basinName, stationName, dpfObservatoryId, waterLevelUrl, municipalityCode } = riverData;
        
        try {
          // 必須フィールドのバリデーション
          if (!name || !prefecture || !latitude || !longitude) {
            results.errors.push({
              index: batchStart + i + 1,
              name: name || '不明',
              error: '必須フィールドが不足しています（川の名前、都道府県、緯度、経度が必要です）'
            });
            results.stats.failed++;
            continue;
          }
          
          // 緯度経度の数値チェック
          const lat = parseFloat(latitude);
          const lon = parseFloat(longitude);
          
          if (isNaN(lat) || isNaN(lon)) {
            results.errors.push({
              index: batchStart + i + 1,
              name: name,
              error: '緯度または経度が数値ではありません'
            });
            results.stats.failed++;
            continue;
          }
          
          // 緯度経度を小数点以下6桁に丸める（約10cm精度）
          const roundedLat = Math.round(lat * 1000000) / 1000000;
          const roundedLon = Math.round(lon * 1000000) / 1000000;
          
          // 重複チェック：既存データとの照合
          const duplicateKey = `${name}|${prefecture}|${Math.round(roundedLat * 100)},${Math.round(roundedLon * 100)}`;
          if (existingRiverMap.has(duplicateKey)) {
            console.log(`⏭️ Skipped duplicate: ${name} (${prefecture}) - already exists in DB`);
            results.stats.skipped++;
            continue;
          }
          
          // 重複チェック：CSV内での重複
          if (csvRiverSet.has(duplicateKey)) {
            console.log(`⏭️ Skipped duplicate: ${name} (${prefecture}) - already in current CSV batch`);
            results.stats.skipped++;
            continue;
          }
          
          // 重複チェックセットに追加
          csvRiverSet.add(duplicateKey);
          
          maxId++;
          
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
            municipalityCode: municipalityCode || '', // 🆕 市区町村コードを追加
            latitude: roundedLat,
            longitude: roundedLon,
            length: 0,
            waterLevel: null,
            warningLevel: null,
            currentStatus: 'normal' as const,
            cameras: [],
            weather: [],
            dataSource: 'manual' as const,
            scale: riverScale,
            observationCount: 0,
            dpfStations: [],
            dpfObservationId: dpfObservatoryId || '',
            waterLevelUrl: waterLevelUrl || ''
          };
          
          batchRecords.push({
            key: `river:${maxId}`,
            value: riverRecord
          });
          
          results.success.push({
            index: batchStart + i + 1,
            name: name,
            prefecture: prefecture,
            id: maxId
          });
          results.stats.success++;
          
          console.log(`✅ Prepared: ${name} (${prefecture}) - ID: ${maxId}`);
          
        } catch (error) {
          console.error(`Error preparing river ${name}:`, error);
          results.errors.push({
            index: batchStart + i + 1,
            name: name || '不明',
            error: String(error)
          });
          results.stats.failed++;
        }
      }
      
      // バッチをまとめてDB保存
      if (batchRecords.length > 0) {
        try {
          console.log(`💾 Saving batch of ${batchRecords.length} rivers to DB...`);
          
          // kv.msetは2つの配列（keys, values）を期待している
          const keys = batchRecords.map(r => r.key);
          const values = batchRecords.map(r => r.value);
          await kv.mset(keys, values);
          
          console.log(`✅ Batch saved successfully`);
          
          // レート制限を避けるため少し待機
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error saving batch:`, error);
          // バッチ保存に失敗した場合、個別に再試行
          for (const record of batchRecords) {
            try {
              await kv.set(record.key, record.value);
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (individualError) {
              console.error(`❌ Error saving individual river ${record.key}:`, individualError);
              // 既にsuccessに追加したものをエラーに移動
              const successIndex = results.success.findIndex(s => `river:${s.id}` === record.key);
              if (successIndex !== -1) {
                const failedRiver = results.success.splice(successIndex, 1)[0];
                results.errors.push({
                  index: failedRiver.index,
                  name: failedRiver.name,
                  error: String(individualError)
                });
                results.stats.success--;
                results.stats.failed++;
              }
            }
          }
        }
      }
    }
    
    console.log(`✅ Bulk registration complete: ${results.stats.success} success, ${results.stats.failed} failed, ${results.stats.skipped} skipped`);
    
    return {
      success: true,
      message: `${results.stats.success}件の川を追加しました（${results.stats.skipped}件スキップ）`,
      results: results,
      stats: results.stats
    };
    
  } catch (error) {
    console.error('Error in bulk river registration:', error);
    return {
      success: false,
      error: '一括登録に失敗しました',
      details: String(error)
    };
  }
}