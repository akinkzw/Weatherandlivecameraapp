// DPF APIから観測所情報を取得して、川データを補完する機能
// 観測所IDを使って、国土交通省「川の防災情報」の水位ページURLを生成

import { fetchAllRiverObservations, RiverObservationMetadata } from './dpf_graphql.tsx';
import * as kv from './kv_store.tsx';
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Supabaseクライアントを取得
function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );
}

// データベースから全ての川データを取得（キーと値のペアで）
async function getAllRiversWithPagination() {
  const supabase = getSupabaseClient();
  const allData: any[] = [];
  let offset = 0;
  const BATCH_SIZE = 500;
  const MAX_RETRIES = 3;
  
  try {
    while (true) {
      let retries = 0;
      let success = false;
      let data = null;
      
      while (retries < MAX_RETRIES && !success) {
        try {
          const result = await supabase
            .from("kv_store_5f24a873")
            .select("key, value")
            .like("key", "river:%")
            .order("key")
            .range(offset, offset + BATCH_SIZE - 1);
          
          if (result.error) throw result.error;
          
          data = result.data;
          success = true;
        } catch (error) {
          retries++;
          console.error(`❌ Error fetching batch (attempt ${retries}/${MAX_RETRIES}):`, error);
          if (retries >= MAX_RETRIES) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (!data || data.length === 0) break;
      
      allData.push(...data);
      offset += BATCH_SIZE;
      
      if (data.length < BATCH_SIZE) break;
    }
    
    return allData;
  } catch (error) {
    console.error('❌ Error in getAllRiversWithPagination:', error);
    throw error;
  }
}

/**
 * 観測所情報から水位ページのURLを生成
 * 
 * URLパターン:
 * https://www.river.go.jp/kawabou/mb/tm?
 *   zm=14
 *   &clat={緯度}
 *   &clon={経度}
 *   &fld=0
 *   &mapType=0
 *   &viewGrpStg=0
 *   &viewRd=0
 *   &viewRW=1
 *   &viewRiver=1
 *   &viewPoint=1
 *   &ext=0
 *   &ofcCd={事務所コード}
 *   &itmkndCd=4          # 水位情報
 *   &obsCd={観測所コード}
 */
export function generateWaterLevelUrl(observation: RiverObservationMetadata): string | null {
  const { id, latitude, longitude, ofcCd, obsCd, url, rawMetadata } = observation;
  
  // 🔑 最優先: DPF APIから取得したURLが ipSuiiKobetu.do を含む場合、そのまま使用
  if (url && url.includes('ipSuiiKobetu.do')) {
    console.log(`✅ Using DPF URL (ipSuiiKobetu.do) for ${observation.riverName}:`, url);
    return url;
  }
  
  // 🔑 次に優先: DPF APIから取得したURLが水位情報を含む場合、そのまま使用
  if (url) {
    try {
      const urlObj = new URL(url);
      
      // 水位ページのURLか確認（itmkndCdパラメータがあるか、obsCdパラメータがある）
      const hasWaterLevelUrl = urlObj.searchParams.has('itmkndCd') || 
                               urlObj.searchParams.has('obsCd');
      
      if (hasWaterLevelUrl) {
        console.log(`✅ Using existing URL from DPF for ${observation.riverName}:`, url);
        return url;
      }
    } catch (e) {
      console.warn(`⚠️ Failed to parse URL for ${observation.riverName}:`, url);
    }
  }
  
  // URLが使えない場合は、ofcCdとobsCdを抽出して生成
  let extractedOfcCd = ofcCd;
  let extractedObsCd = obsCd;
  
  // 既存のURLから ofcCd と obsCd を抽出
  if (url) {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      // URLパラメータから ofcCd と obsCd を抽出
      if (params.has('ofcCd')) {
        extractedOfcCd = params.get('ofcCd') || extractedOfcCd;
      }
      if (params.has('obsCd')) {
        extractedObsCd = params.get('obsCd') || extractedObsCd;
      }
      
      console.log(`🔍 Extracted from URL for ${observation.riverName}:`, {
        ofcCd: extractedOfcCd,
        obsCd: extractedObsCd,
        originalUrl: url
      });
    } catch (e) {
      console.warn(`⚠️ Failed to parse URL for ${observation.riverName}:`, url);
    }
  }
  
  // デバッグ: 利用可能なメタデータをログ出力
  if (rawMetadata) {
    const codeKeys = Object.keys(rawMetadata).filter(k => 
      k.toLowerCase().includes('code') || 
      k.toLowerCase().includes('office') || 
      k.toLowerCase().includes('obs')
    );
    
    if (codeKeys.length > 0) {
      console.log(`🔍 Code-related metadata for ${observation.riverName}:`, 
        codeKeys.map(k => `${k}: ${rawMetadata[k]}`).join(', ')
      );
    }
  }
  
  // 緯度経度が必須
  if (!latitude || !longitude) {
    console.warn(`⚠️ Missing coordinates for ${observation.riverName}`);
    return null;
  }
  
  // URLを生成
  const baseUrl = 'https://www.river.go.jp/kawabou/mb/tm';
  const params = new URLSearchParams({
    zm: '14',
    clat: latitude.toString(),
    clon: longitude.toString(),
    fld: '0',
    mapType: '0',
    viewGrpStg: '0',
    viewRd: '0',
    viewRW: '1',
    viewRiver: '1',
    viewPoint: '1',
    ext: '0',
    itmkndCd: '4', // 水位情報（7ではなく4）
  });
  
  // ofcCd が利用可能な場合は追加
  if (extractedOfcCd) {
    params.set('ofcCd', extractedOfcCd);
    console.log(`✅ Added ofcCd=${extractedOfcCd} for ${observation.riverName}`);
  } else {
    console.warn(`⚠️ No ofcCd found for ${observation.riverName}`);
  }
  
  // obsCd が利用可能な場合は追加
  if (extractedObsCd) {
    params.set('obsCd', extractedObsCd);
    console.log(`✅ Added obsCd=${extractedObsCd} for ${observation.riverName}`);
  } else {
    console.warn(`⚠️ No obsCd found for ${observation.riverName}`);
  }
  
  const finalUrl = `${baseUrl}?${params.toString()}`;
  console.log(`🔗 Generated URL for ${observation.riverName}: ${finalUrl}`);
  
  return finalUrl;
}

/**
 * カメラページのURLを生成
 * observation.url は水位ページのURLのため、カメラには使用しない
 */
export function generateCameraUrl(observation: RiverObservationMetadata): string | null {
  // 明示的なカメラURLがあればそれを優先
  if (observation.cameraUrl && observation.cameraUrl.includes('Camera')) {
    return observation.cameraUrl;
  }

  // 座標があれば川の防災情報のカメラマップURLを生成（itmkndCd=8 がカメラ）
  if (observation.latitude && observation.longitude) {
    return `https://www.river.go.jp/kawabou/pc/tm?zm=14&clat=${observation.latitude}&clon=${observation.longitude}&fld=0&mapType=0&itmkndCd=8`;
  }

  // 川名で検索
  if (observation.riverName) {
    return `https://www.river.go.jp/kawabou/pc/th?fld=0&mapType=0&itmkndCd=8&searchWd=${encodeURIComponent(observation.riverName)}`;
  }

  return null;
}

/**
 * 川名に一致する観測所情報を取得
 */
export async function getObservationsByRiverName(riverName: string): Promise<RiverObservationMetadata[]> {
  console.log(`🔍 Fetching observations for river: ${riverName}`);
  
  try {
    const allObservations = await fetchAllRiverObservations();
    
    // 川名で完全一致または部分一致でフィルタ
    const matchedObservations = allObservations.filter(obs => {
      const obsRiverName = obs.riverName || '';
      
      // 完全一致
      if (obsRiverName === riverName) {
        return true;
      }
      
      // 部分一致（両方向）
      if (obsRiverName.includes(riverName) || riverName.includes(obsRiverName)) {
        return true;
      }
      
      return false;
    });
    
    console.log(`✅ Found ${matchedObservations.length} observations for ${riverName}`);
    
    return matchedObservations;
    
  } catch (error) {
    console.error(`❌ Error fetching observations for ${riverName}:`, error);
    return [];
  }
}

/**
 * データベース内の全ての川データを補完
 * DPF APIから観測所情報を取得し、waterLevelUrlとdpfObservationIdを更新
 */
export async function enrichAllRiversWithDpfData(options?: {
  forceUpdate?: boolean; // 既存データも強制的に更新
}): Promise<{
  success: boolean;
  enrichedCount: number;
  skippedCount: number;
  errorCount: number;
  details: string[];
}> {
  console.log('🚀 Starting DPF data enrichment for all rivers...');
  const forceUpdate = options?.forceUpdate || false;
  
  if (forceUpdate) {
    console.log('⚠️ Force update mode: existing data will be overwritten');
  }
  
  const details: string[] = [];
  let enrichedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  try {
    // 1. DPF APIから全観測所データを取得
    console.log('📡 Fetching all observation data from DPF API...');
    const allObservations = await fetchAllRiverObservations();
    console.log(`✅ Fetched ${allObservations.length} observations from DPF API`);
    details.push(`DPF APIから ${allObservations.length} 件の観測所データを取得`);
    
    // 川名でグループ化
    const observationsByRiver = new Map<string, RiverObservationMetadata[]>();
    for (const obs of allObservations) {
      const riverName = obs.riverName;
      if (!observationsByRiver.has(riverName)) {
        observationsByRiver.set(riverName, []);
      }
      observationsByRiver.get(riverName)!.push(obs);
    }
    
    console.log(`📊 Grouped into ${observationsByRiver.size} unique river names`);
    details.push(`${observationsByRiver.size} の川に分類`);
    
    // 2. データベースから全ての川データを取得
    console.log('📂 Fetching all rivers from database...');
    const allRiverKeys = await getAllRiversWithPagination();
    console.log(`✅ Found ${allRiverKeys.length} rivers in database`);
    details.push(`データベースに ${allRiverKeys.length} 件の川データが存在`);
    
    // 3. 各川データを補完
    for (const riverKey of allRiverKeys) {
      try {
        // valueが存在しない場合はスキップ
        if (!riverKey || !riverKey.value) {
          console.log(`⚠️ Skipping riverKey with no value:`, riverKey);
          skippedCount++;
          continue;
        }
        
        const riverData = typeof riverKey.value === 'string' 
          ? JSON.parse(riverKey.value) 
          : riverKey.value;
        
        // nameフィールドが存在しない場合もスキップ
        if (!riverData || !riverData.name) {
          console.log(`⚠️ Skipping riverData with no name:`, riverData);
          skippedCount++;
          continue;
        }
        
        const riverName = riverData.name;
        
        // DPF観測所データが既に設定されている場合はスキップ
        if (riverData.waterLevelUrl && riverData.dpfObservationId && !forceUpdate) {
          skippedCount++;
          continue;
        }
        
        // 川名に一致する観測所を検索
        const matchedObservations = observationsByRiver.get(riverName) || [];
        
        if (matchedObservations.length === 0) {
          // 完全一致しない場合は部分一致で検索
          const partialMatches = allObservations.filter(obs => 
            obs.riverName.includes(riverName) || riverName.includes(obs.riverName)
          );
          
          if (partialMatches.length > 0) {
            matchedObservations.push(...partialMatches);
          }
        }
        
        if (matchedObservations.length > 0) {
          // 最も近い観測所を選択（緯度経度が最も近い）
          let selectedObservation = matchedObservations[0];
          
          if (riverData.latitude && riverData.longitude && matchedObservations.length > 1) {
            // 距離計算で最も近い観測所を選択
            let minDistance = Number.MAX_VALUE;
            
            for (const obs of matchedObservations) {
              const distance = Math.sqrt(
                Math.pow(obs.latitude - riverData.latitude, 2) +
                Math.pow(obs.longitude - riverData.longitude, 2)
              );
              
              if (distance < minDistance) {
                minDistance = distance;
                selectedObservation = obs;
              }
            }
          }
          
          // 水位URLを生成
          const waterLevelUrl = generateWaterLevelUrl(selectedObservation);
          
          // カメラURLを取得
          const cameraUrl = generateCameraUrl(selectedObservation);
          
          // データを更新
          const updatedRiverData = {
            ...riverData,
            dpfObservationId: selectedObservation.id,
            waterLevelUrl: waterLevelUrl || riverData.waterLevelUrl,
            cameraUrl: cameraUrl || riverData.cameraUrl,
            // 既存の緯度経度がない場合は観測所の位置を使用
            latitude: riverData.latitude || selectedObservation.latitude,
            longitude: riverData.longitude || selectedObservation.longitude,
          };
          
          // データベースに保存（JSON.stringifyは不要、kv.setがJSONBとして保存する）
          await kv.set(riverKey.key, updatedRiverData);
          
          enrichedCount++;
          details.push(`✅ ${riverName}: 観測所データを追加 (${selectedObservation.observationPlaceName})`);
          console.log(`✅ Enriched ${riverName} with observation ${selectedObservation.id}`);
          
        } else {
          skippedCount++;
          details.push(`⚠️ ${riverName}: 一致する観測所が見つかりません`);
          console.log(`⚠️ No observation found for ${riverName}`);
        }
        
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        details.push(`❌ ${riverKey.key}: エラー - ${errorMessage}`);
        console.error(`❌ Error enriching ${riverKey.key}:`, error);
      }
    }
    
    console.log(`✅ Enrichment completed!`);
    console.log(`   - Enriched: ${enrichedCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
    return {
      success: true,
      enrichedCount,
      skippedCount,
      errorCount,
      details
    };
    
  } catch (error) {
    console.error('❌ Fatal error during enrichment:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    details.push(`❌ 致命的エラー: ${errorMessage}`);
    
    return {
      success: false,
      enrichedCount,
      skippedCount,
      errorCount,
      details
    };
  }
}

/**
 * 特定の川のデータを補完
 */
export async function enrichSingleRiver(riverName: string): Promise<{
  success: boolean;
  message: string;
  observation?: RiverObservationMetadata;
  waterLevelUrl?: string;
  cameraUrl?: string;
  updated?: boolean;
}> {
  try {
    console.log(`🔍 Enriching river: ${riverName}`);
    
    // DPF APIから観測所データを取得
    const observations = await getObservationsByRiverName(riverName);
    
    if (observations.length === 0) {
      return {
        success: false,
        message: `観測所データが見つかりませんでした: ${riverName}`
      };
    }
    
    // 最初の観測所を使用（複数ある場合は改善の余地あり）
    const observation = observations[0];
    
    // URLを生成
    const waterLevelUrl = generateWaterLevelUrl(observation);
    const cameraUrl = generateCameraUrl(observation);
    
    // データベースから川データを取得して更新
    let updated = false;
    try {
      const allRivers = await kv.getByPrefix('river:');
      const riverData = allRivers.find(r => {
        const data = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
        return data?.name === riverName;
      });
      
      if (riverData) {
        const existingData = typeof riverData.value === 'string' 
          ? JSON.parse(riverData.value) 
          : riverData.value;
        
        // データを更新
        const updatedData = {
          ...existingData,
          dpfObservationId: observation.id,
          waterLevelUrl: waterLevelUrl || existingData.waterLevelUrl,
          cameraUrl: cameraUrl || existingData.cameraUrl,
          latitude: existingData.latitude || observation.latitude,
          longitude: existingData.longitude || observation.longitude,
        };
        
        // データベースに保存
        await kv.set(riverData.key, updatedData);
        updated = true;
        console.log(`✅ Updated database for ${riverName}`);
      } else {
        console.warn(`⚠️ River not found in database: ${riverName}`);
      }
    } catch (dbError) {
      console.error(`⚠️ Failed to update database for ${riverName}:`, dbError);
      // データベース更新に失敗しても、観測所情報は返す
    }
    
    return {
      success: true,
      message: `観測所データを取得しました: ${observation.observationPlaceName}`,
      observation,
      waterLevelUrl: waterLevelUrl || undefined,
      cameraUrl: cameraUrl || undefined,
      updated
    };
    
  } catch (error) {
    console.error(`❌ Error enriching river ${riverName}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      success: false,
      message: `エラー: ${errorMessage}`
    };
  }
}