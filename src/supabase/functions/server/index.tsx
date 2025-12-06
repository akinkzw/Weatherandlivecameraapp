// DPFアプリ - メインサーバー（最終更新: 2025-12-04T17:24）
import * as kv from "./kv_store.tsx";
import { getRiverCoordinates } from "./river_coordinates.tsx";
import { getRiverCameraInfo } from './river_graphql.tsx';
import { findStationById } from './river_observation_data.tsx';
import { 
  fetchAllRiverObservations, 
  filterByRiverName,
  extractCameraInfo,
  type RiverObservationMetadata 
} from './dpf_graphql.tsx';
import { getWeatherForecast, getCurrentWeather } from './openweather.tsx';
import { estimateRiverStatusFromRainfall, detectRiverScale } from './rainfall_estimator.tsx';
import { addManualRiver, getRiverRainfallStatus, addRiversBulk, getPrefectureRegion } from './manual_river_endpoints.tsx';
import { fetchRealtimeWaterLevel } from './realtime_water_level.tsx';
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Supabaseクライアント作成
const getSupabaseClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(url, key);
};

// 全件取得（ページネーション）
async function getAllRiversWithPagination() {
  const supabase = getSupabaseClient();
  const allData: any[] = [];
  let offset = 0;
  const BATCH_SIZE = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from("kv_store_5f24a873")
      .select("key, value")
      .like("key", "river:%")
      .range(offset, offset + BATCH_SIZE - 1);
    
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    
    allData.push(...data);
    if (data.length < BATCH_SIZE) break;
    
    offset += BATCH_SIZE;
  }
  
  return allData;
}

// CORSヘッダー
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// JSONレスポンス作成
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// メインハンドラー
async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    // Health check
    if (path === '/make-server-5f24a873/health' && method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // 環境変数チェック
    if (path === '/make-server-5f24a873/env-check' && method === 'GET') {
      const dpfApiKey = Deno.env.get('DPF_API_KEY');
      return jsonResponse({
        message: 'Environment Variables Status',
        variables: {
          OPENWEATHER_API_KEY: Deno.env.get('OPENWEATHER_API_KEY') ? 'SET' : 'NOT SET',
          DPF_API_KEY: dpfApiKey ? 'SET' : 'NOT SET',
          MICROCMS_API_KEY: Deno.env.get('MICROCMS_API_KEY') ? 'SET' : 'NOT SET',
          SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT SET',
        },
      });
    }

    // DPF APIテスト
    if (path === '/make-server-5f24a873/test-dpf' && method === 'GET') {
      const apiKey = Deno.env.get('DPF_API_KEY');
      if (!apiKey) {
        return jsonResponse({ success: false, error: 'DPF_API_KEY not set' }, 400);
      }

      const query = `query { hwq_stage_metadata(limit: 3) { id name } }`;
      const response = await fetch('https://data-platform.mlit.go.jp/datalake/admin/api/graphql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        return jsonResponse({ success: false, error: `API error: ${response.status}` }, 500);
      }

      const result = await response.json();
      return jsonResponse({ success: true, data: result });
    }

    // DPF API検索（川の名前で検索）
    if (path === '/make-server-5f24a873/dpf-search' && method === 'GET') {
      const apiKey = Deno.env.get('DPF_API_KEY');
      if (!apiKey) {
        return jsonResponse({ success: false, error: 'DPF_API_KEY not set' }, 400);
      }

      const riverName = url.searchParams.get('river');
      if (!riverName) {
        return jsonResponse({ success: false, error: 'river parameter is required' }, 400);
      }

      // 水位データセット（hwq_stage）のメタデータを検索
      const query = `
        query {
          hwq_stage_metadata(
            where: { name: { _like: "%${riverName}%" } }
            limit: 20
          ) {
            id
            name
            river_name
            obs_name
            latitude
            longitude
          }
        }
      `;
      
      try {
        console.log('🔍 DPF API検索開始:', riverName);
        
        // カスタムHTTPクライアントを作成（SSL証明書検証の問題を回避）
        const client = Deno.createHttpClient({
          // SSL証明書検証を緩和
        });
        
        console.log('📡 リクエスト先: https://data-platform.mlit.go.jp/datalake/admin/api/graphql/execute');
        
        const response = await fetch('https://data-platform.mlit.go.jp/datalake/admin/api/graphql/execute', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'apikey': apiKey 
          },
          body: JSON.stringify({ query }),
          client, // カスタムHTTPクライアントを使用
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API error:', response.status, errorText);
          return jsonResponse({ success: false, error: `API error: ${response.status} - ${errorText}` }, 500);
        }

        const result = await response.json();
        console.log('✅ DPF API検索成功:', result);
        
        return jsonResponse({ 
          success: true, 
          query: riverName,
          data: result.data?.hwq_stage_metadata || [],
          count: result.data?.hwq_stage_metadata?.length || 0
        });
      } catch (error) {
        console.error('❌ DPF API検索エラー:', error);
        
        // エラーの詳細情報を返す
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        return jsonResponse({ 
          success: false, 
          error: errorMessage,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          stack: errorStack,
          suggestion: 'DPF APIエンドポイントまたはSSL証明書に問題がある可能性があります。'
        }, 500);
      }
    }

    // 全取得
    if (path === '/make-server-5f24a873/rivers' && method === 'GET') {
      const prefecture = url.searchParams.get('prefecture');
      const allRiversData = await getAllRiversWithPagination();
      
      const rivers = allRiversData.map(item => {
        const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
        return { ...value, _key: item.key };
      });
      
      if (prefecture && prefecture !== "すべて") {
        const filtered = rivers.filter(r => r.prefecture === prefecture);
        return jsonResponse({ success: true, rivers: filtered, count: filtered.length });
      }
      
      return jsonResponse({ success: true, rivers, count: rivers.length });
    }

    // データベース構造確認用（デバッグ）
    if (path === '/make-server-5f24a873/rivers/debug-structure' && method === 'GET') {
      const allRiversData = await getAllRiversWithPagination();
      
      if (allRiversData.length === 0) {
        return jsonResponse({ 
          success: true, 
          message: 'データベースにデータがありません',
          totalCount: 0
        });
      }
      
      const rivers = allRiversData.map(item => {
        const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
        return value;
      });
      
      // 最初の3件のサンプルデータとフィールドリストを返す
      const samples = rivers.slice(0, 3);
      const allFields = new Set<string>();
      
      rivers.forEach(river => {
        Object.keys(river).forEach(key => allFields.add(key));
      });
      
      return jsonResponse({
        success: true,
        totalCount: rivers.length,
        availableFields: Array.from(allFields).sort(),
        samples: samples,
        message: 'データベースに保存されているフィールドとサンプルデータです'
      });
    }

    // DPF観測所ID 一括更新
    if (path === '/make-server-5f24a873/rivers/update-dpf-ids' && method === 'POST') {
      try {
        const startTime = Date.now();
        const body = await req.json();
        const csvData = body.csvData;
        
        if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
          return jsonResponse({ 
            success: false, 
            error: 'csvData is required and must be a non-empty array' 
          }, 400);
        }
        
        console.log(`📊 Received ${csvData.length} CSV rows for DPF ID update`);
        
        // 既存の川データを全件取得（1回だけ！）
        const allRiversData = await getAllRiversWithPagination();
        console.log(`📊 Found ${allRiversData.length} existing rivers in database`);
        
        // データベースアクセスを高速化するために、川名でインデックスを作成
        const riversByName = new Map<string, any[]>();
        for (const item of allRiversData) {
          const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
          const dbRiverName = value.name || '';
          
          // カッコ内の観測所名を除去（例：「庄内川（枇杷島）」→「庄内川」）
          const dbRiverNameWithoutStation = dbRiverName.replace(/[（(].*?[）)]/g, '').trim();
          
          // 3つのキーでマップに登録（完全一致、カッコなし、部分一致用）
          if (!riversByName.has(dbRiverName)) riversByName.set(dbRiverName, []);
          riversByName.get(dbRiverName)!.push(item);
          
          if (dbRiverNameWithoutStation !== dbRiverName) {
            if (!riversByName.has(dbRiverNameWithoutStation)) riversByName.set(dbRiverNameWithoutStation, []);
            riversByName.get(dbRiverNameWithoutStation)!.push(item);
          }
        }
        
        console.log(`📊 Created index with ${riversByName.size} unique river names`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        const examples: any[] = [];
        const supabase = getSupabaseClient();
        
        // デバッグ：最初の3件のCSVデータをログ出力
        console.log('📊 First 3 CSV rows:', csvData.slice(0, 3));
        
        // 更新対象をメモリに蓄積（DB接続を減らすため）
        const updatesToPerform: Array<{ key: string; value: any; riverData: any }> = [];
        
        // CSVデータでループ（インデックスを使って高速検索）
        for (const csvRow of csvData) {
          const riverName = csvRow.riverName;
          const municipalityCode = csvRow.municipalityCode;
          const basinName = csvRow.basinName;
          const stationName = csvRow.stationName;
          
          if (!riverName || !municipalityCode) {
            skippedCount++;
            continue;
          }
          
          // インデックスから高速検索（O(1)）
          const matchingRivers = riversByName.get(riverName) || [];
          
          // デバッグ：最初の3件のマッチング詳細をログ出力
          const isFirstThree = (updatedCount + skippedCount) < 3;
          if (isFirstThree) {
            console.log(`🔍 CSV Row: riverName="${riverName}", matches=${matchingRivers.length}`);
          }
          
          if (matchingRivers.length === 0) {
            skippedCount++;
            continue;
          }
          
          // マッチした川データを更新準備
          for (const riverItem of matchingRivers) {
            const riverData = typeof riverItem.value === 'string' 
              ? JSON.parse(riverItem.value) 
              : riverItem.value;
            
            // DPF観測所IDと関連情報を追加
            riverData.dpfObservationId = municipalityCode;
            riverData.basinName = basinName;
            riverData.stationName = stationName;
            riverData.waterLevelUrl = `https://www.river.go.jp/kawabou/ipSuiiKobetu.do?obsrvId=${municipalityCode}`;
            
            // 更新リストに追加（まだDBには書き込まない）
            updatesToPerform.push({
              key: riverItem.key,
              value: riverData,
              riverData: riverData,
            });
            
            // 最初の3件を例として保存
            if (examples.length < 3) {
              examples.push({
                riverName: riverData.name,
                prefecture: riverData.prefecture,
                municipalityCode: municipalityCode,
                basinName: basinName,
                stationName: stationName,
              });
            }
          }
        }
        
        console.log(`📦 Prepared ${updatesToPerform.length} updates, ${skippedCount} skipped`);
        
        // まとめてデータベース更新（20件ずつバッチ処理 - 高速化）
        const DB_BATCH_SIZE = 20;
        for (let i = 0; i < updatesToPerform.length; i += DB_BATCH_SIZE) {
          const batch = updatesToPerform.slice(i, i + DB_BATCH_SIZE);
          
          // Promise.allで並列実行（20件まとめて）
          const updatePromises = batch.map(({ key, value }) =>
            supabase
              .from('kv_store_5f24a873')
              .update({ value })
              .eq('key', key)
          );
          
          try {
            const results = await Promise.all(updatePromises);
            
            // エラーチェック
            for (let j = 0; j < results.length; j++) {
              const { error } = results[j];
              if (error) {
                console.error(`❌ Failed to update ${batch[j].key}:`, error);
              } else {
                updatedCount++;
              }
            }
          } catch (error) {
            console.error(`❌ Batch update error:`, error);
          }
          
          // 進捗ログ（50件ごと）
          if ((i + DB_BATCH_SIZE) % 50 === 0 || i + DB_BATCH_SIZE >= updatesToPerform.length) {
            console.log(`⏳ Progress: ${Math.min(i + DB_BATCH_SIZE, updatesToPerform.length)}/${updatesToPerform.length} updates completed`);
          }
        }
        
        const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}秒`;
        
        console.log(`✅ Update complete: ${updatedCount} updated, ${skippedCount} skipped`);
        
        return jsonResponse({
          success: true,
          updatedCount,
          skippedCount,
          processingTime,
          examples,
          message: 'DPF観測所IDの更新が完了しました'
        });
        
      } catch (error) {
        console.error('❌ Error updating DPF IDs:', error);
        return jsonResponse({
          success: false,
          error: `${error}`
        }, 500);
      }
    }

    // 一括追加
    if (path === '/make-server-5f24a873/rivers/bulk' && method === 'POST') {
      const body = await req.json();
      const result = await addRiversBulk(body.rivers);
      return jsonResponse(result);
    }

    // バックアップ（CSV出力） - 個別取得より前に配置
    if (path === '/make-server-5f24a873/rivers-backup-csv' && method === 'GET') {
      try {
        console.log('🔍 Starting backup process...');
        
        // ページネーション対応の全件取得を使用
        const allData = await getAllRiversWithPagination();
        console.log(`📊 Backup: Retrieved ${allData.length} items from database`);
        
        // データのパース処理を改善
        const rivers = allData.map((item: any) => {
          try {
            // valueがすでにオブジェクトの場合と文字列の場合の両方に対応
            const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
            return value;
          } catch (parseError) {
            console.error('Parse error for item:', item.key, parseError);
            return item.value; // パースに失敗した場合はそのまま返す
          }
        });
        
        console.log(`📊 Backup: Parsed ${rivers.length} rivers`);
        
        // 最初の川データをサンプルとして出力（デバグ用）
        if (rivers.length > 0) {
          console.log('📋 Sample river data:', JSON.stringify(rivers[0], null, 2));
          console.log('📋 Available fields:', Object.keys(rivers[0]));
        }
        
        if (!rivers || rivers.length === 0) {
          console.log('⚠️ No rivers found in database');
          return new Response('川の名前,都府県,市区町村,水系名称,観測所名称,緯度,経度,規模,DPF観測所ID,水位情報URL\n', {
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': 'attachment; filename="rivers_backup.csv"',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        // CSVヘッダー
        let csvContent = '川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模,DPF観測所ID,水位情報URL\n';
        
        // 各川のデータを追
        let successCount = 0;
        for (const river of rivers) {
          try {
            const name = river.name || '';
            const prefecture = river.prefecture || '';
            const municipality = river.municipality || '';
            const riverSystem = river.basinName || ''; // ✅ riverSystem → basinName
            const observatoryName = river.stationName || ''; // ✅ observatoryName → stationName
            const latitude = river.latitude || '';
            const longitude = river.longitude || '';
            const scale = river.scale || '';
            
            // ✅ DPF観測IDの取得ロジック
            let dpfObservationId = '';
            if (river.dpfObservationId) {
              // 新しいフィールド名がある場合
              dpfObservationId = river.dpfObservationId;
            } else if (Array.isArray(river.dpfStations) && river.dpfStations.length > 0) {
              // dpfStationsが配列の場合は最初の要素を取得
              dpfObservationId = river.dpfStations[0];
            } else if (river.dpfStations && typeof river.dpfStations === 'string') {
              // dpfStationsが文字列の場合はそのまま使用
              dpfObservationId = river.dpfStations;
            }
            
            const waterLevelUrl = river.waterLevelUrl || '';
            
            csvContent += `${name},${prefecture},${municipality},${riverSystem},${observatoryName},${latitude},${longitude},${scale},${dpfObservationId},${waterLevelUrl}\n`;
            successCount++;
          } catch (csvError) {
            console.error('CSV generation error for river:', river.name, csvError);
          }
        }
        
        console.log(`✅ Backup CSV generated: ${successCount} rivers successfully exported`);
        
        return new Response(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="rivers_backup.csv"',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        console.error('❌ Backup error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return jsonResponse({ 
          success: false, 
          error: String(error),
          message: 'バックアップ処理中にエラーが発生しました。詳細はサーバーログを確認してください。'
        }, 500);
      }
    }

    // 川詳細取得
    const riverDetailMatch = path.match(/^\/make-server-5f24a873\/rivers\/(.+)$/);
    if (riverDetailMatch && method === 'GET') {
      const key = riverDetailMatch[1];
      const river = await kv.get(key);
      
      if (!river) {
        return jsonResponse({ success: false, error: 'River not found' }, 404);
      }
      
      return jsonResponse({ success: true, river });
    }

    // 川の追加
    if (path === '/make-server-5f24a873/rivers' && method === 'POST') {
      const body = await req.json();
      const result = await addManualRiver(body);
      return jsonResponse(result);
    }

    // 全削除
    if (path === '/make-server-5f24a873/rivers/clear-all' && method === 'DELETE') {
      try {
        const rivers = await kv.getByPrefix('river:');
        
        if (!rivers || rivers.length === 0) {
          return jsonResponse({ success: true, deletedCount: 0, message: '削除するデータがありません' });
        }
        
        const keys = rivers.map(river => {
          const key = `river:${river.prefecture}:${river.name}`;
          // 同じ都道府県・川名でも緯度経度が異なる場合は別のキーとして扱う
          if (river.latitude && river.longitude) {
            return `${key}:${river.latitude.toFixed(6)},${river.longitude.toFixed(6)}`;
          }
          return key;
        });
        
        await kv.mdel(keys);
        
        return jsonResponse({ 
          success: true, 
          deletedCount: keys.length,
          message: `${keys.length}件の川データを削除しました` 
        });
      } catch (error) {
        console.error('Clear all error:', error);
        return jsonResponse({ success: false, error: String(error) }, 500);
      }
    }

    // 川の削除
    if (riverDetailMatch && method === 'DELETE') {
      const key = riverDetailMatch[1];
      await kv.del(key);
      return jsonResponse({ success: true, message: 'River deleted' });
    }

    // リアルタイム水位取得
    if (path.startsWith('/make-server-5f24a873/realtime-water-level/') && method === 'GET') {
      const pathParts = path.split('/');
      const townCode = pathParts[pathParts.length - 1];
      
      if (!townCode) {
        return jsonResponse({ success: false, error: 'Town code is required' }, 400);
      }
      
      // オプション: 観測所名でフィルタリング
      const observatoryName = url.searchParams.get('observatory');
      
      console.log(`🌊 Fetching realtime water level for town code: ${townCode}`);
      if (observatoryName) {
        console.log(`   Filter by observatory: ${observatoryName}`);
      }
      
      const result = await fetchRealtimeWaterLevel(townCode, observatoryName || undefined);
      
      if (result.success) {
        return jsonResponse({ 
          success: true, 
          data: result.data,
          apiUrl: result.apiUrl,
          timestamp: result.timestamp
        });
      } else {
        return jsonResponse({ 
          success: false, 
          error: result.error || 'Failed to fetch water level data',
          apiUrl: result.apiUrl
        }, 404);
      }
    }

    // 天気予報
    if (path === '/make-server-5f24a873/weather' && method === 'GET') {
      const lat = parseFloat(url.searchParams.get('lat') || '0');
      const lon = parseFloat(url.searchParams.get('lon') || '0');
      
      if (!lat || !lon) {
        return jsonResponse({ success: false, error: 'Missing lat/lon' }, 400);
      }
      
      const [current, forecast] = await Promise.all([
        getCurrentWeather(lat, lon),
        getWeatherForecast(lat, lon),
      ]);
      
      return jsonResponse({ success: true, current, forecast });
    }

    // DPF観測所情報
    if (path === '/make-server-5f24a873/dpf/observations' && method === 'GET') {
      const riverName = url.searchParams.get('riverName');
      
      if (!riverName) {
        return jsonResponse({ success: false, error: 'Missing riverName' }, 400);
      }
      
      const allObservations = await fetchAllRiverObservations();
      const filtered = filterByRiverName(allObservations, riverName);
      
      return jsonResponse({ success: true, observations: filtered, count: filtered.length });
    }

    // カメラ情報
    const cameraMatch = path.match(/^\/make-server-5f24a873\/camera\/(.+)$/);
    if (cameraMatch && method === 'GET') {
      const stationId = cameraMatch[1];
      const cameraInfo = await getRiverCameraInfo(stationId);
      return jsonResponse({ success: true, data: cameraInfo });
    }

    // 降雨ステータス
    if (path === '/make-server-5f24a873/rainfall-status' && method === 'GET') {
      const lat = parseFloat(url.searchParams.get('lat') || '0');
      const lon = parseFloat(url.searchParams.get('lon') || '0');
      
      if (!lat || !lon) {
        return jsonResponse({ success: false, error: 'Missing lat/lon' }, 400);
      }
      
      const result = await getRiverRainfallStatus(lat, lon);
      return jsonResponse(result);
    }

    // 都道府県リスト
    if (path === '/make-server-5f24a873/prefectures' && method === 'GET') {
      const allRiversData = await getAllRiversWithPagination();
      
      const prefectures = new Set<string>();
      allRiversData.forEach(item => {
        const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
        if (value.prefecture) {
          prefectures.add(value.prefecture);
        }
      });
      
      return jsonResponse({ success: true, prefectures: Array.from(prefectures).sort() });
    }

    // microCMSバナー
    if (path === '/make-server-5f24a873/banner' && method === 'GET') {
      const apiKey = Deno.env.get('MICROCMS_API_KEY');
      
      if (!apiKey) {
        return jsonResponse({ success: false, error: 'MICROCMS_API_KEY not set' }, 400);
      }
      
      const response = await fetch('https://0jb94z3dca.microcms.io/api/v1/banner', {
        headers: { 'X-MICROCMS-API-KEY': apiKey },
      });
      
      if (!response.ok) {
        return jsonResponse({ success: false, error: `microCMS error: ${response.status}` }, 500);
      }
      
      const data = await response.json();
      
      // microCMSはリスト形式でデータを返すので、最初のcontentを取得
      const bannerData = data.contents && data.contents.length > 0 ? data.contents[0] : data;
      
      return jsonResponse({ success: true, data: bannerData });
    }

    // 404
    return jsonResponse({ error: 'Not Found', path }, 404);

  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({ error: String(error) }, 500);
  }
}

// サーバー起動
Deno.serve(handler);