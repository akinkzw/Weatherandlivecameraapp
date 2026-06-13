// DPFアプリ - メインサーバー（最終更新: 2025-12-04T17:24）
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
import { getYesterdayWeather } from './weatherapi.tsx';
import { getYesterdayWeatherFromOpenMeteo } from './openmeteo.tsx';
import { estimateRiverStatusFromRainfall, detectRiverScale } from './rainfall_estimator.tsx';
import { addManualRiver, getRiverRainfallStatus, addRiversBulk, getPrefectureRegion } from './manual_river_endpoints.tsx';
import { fetchRealtimeWaterLevel } from './realtime_water_level.tsx';
import { enrichAllRiversWithDpfData, enrichSingleRiver, getObservationsByRiverName } from './dpf_enrichment.tsx';
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Supabaseクライアント作成
const getSupabaseClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!url || !key) {
    console.error("❌ Missing Supabase credentials:");
    console.error(`  SUPABASE_URL: ${url ? '✓' : '✗'}`);
    console.error(`  SUPABASE_SERVICE_ROLE_KEY: ${key ? '✓' : '✗'}`);
    throw new Error("Missing Supabase credentials");
  }
  
  console.log(`🔌 Creating Supabase client for URL: ${url}`);
  return createClient(url, key);
};

// 🚀 グローバルキャッシュ（バッチ間で共有）
let globalRiversCache: Array<{ key: string; value: any }> | null = null;
let globalRiversCacheTimestamp: number | null = null;
let globalRiversIndexCache: Map<string, Array<{ key: string; value: any }>> | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5分間キャッシュを保持

// キャッシュ付き全件取得（インデックス付き）
async function getAllRiversWithIndex(): Promise<{
  rivers: Array<{ key: string; value: any }>;
  index: Map<string, Array<{ key: string; value: any }>>;
}> {
  const now = Date.now();
  
  // キャッシュが有効な場合は再利用
  if (globalRiversCache && globalRiversIndexCache && globalRiversCacheTimestamp && (now - globalRiversCacheTimestamp < CACHE_TTL)) {
    console.log(`✅ Using cached river data and index (${globalRiversCache.length} rivers, ${globalRiversIndexCache.size} unique names)`);
    return {
      rivers: globalRiversCache,
      index: globalRiversIndexCache
    };
  }
  
  // キャッシュが無効な場合は再取得＋���ンデックス作成
  console.log('🔄 Cache expired or not found, fetching and indexing data...');
  const rivers = await getAllRiversWithPagination();
  
  // 川名でインデックスを作成（高速検索用）
  const riversByName = new Map<string, Array<{ key: string; value: any }>>();
  let parseErrorCount = 0;
  
  for (const river of rivers) {
    try {
      const riverData = typeof river.value === 'string' ? JSON.parse(river.value) : river.value;
      const name = riverData.name;
      if (name) {
        if (!riversByName.has(name)) {
          riversByName.set(name, []);
        }
        riversByName.get(name)!.push(river);
      }
    } catch (parseError) {
      parseErrorCount++;
      // パースエラーの場合はスキップして続行
      continue;
    }
  }
  
  if (parseErrorCount > 0) {
    console.warn(`⚠️ Skipped ${parseErrorCount} rivers due to parse errors`);
  }
  
  // キャッシュを更新
  globalRiversCache = rivers;
  globalRiversIndexCache = riversByName;
  globalRiversCacheTimestamp = now;
  
  console.log(`✅ Cached ${rivers.length} rivers with ${riversByName.size} unique names for future requests`);
  
  return {
    rivers,
    index: riversByName
  };
}

// 全件取得（ページネーション）
async function getAllRiversWithPagination() {
  const supabase = getSupabaseClient();
  const allData: any[] = [];
  let offset = 0;
  const BATCH_SIZE = 500; // 1000から500に削減してタイムアウトを防ぐ
  const MAX_RETRIES = 5; // リトライ回数を増やす
  
  try {
    while (true) {
      let retries = 0;
      let success = false;
      let data = null;
      
      // リトライロジック（指数バックオフ）
      while (retries < MAX_RETRIES && !success) {
        try {
          const result = await supabase
            .from("kv_store_5f24a873")
            .select("key, value")
            .like("key", "river:%")
            .range(offset, offset + BATCH_SIZE - 1);
          
          if (result.error) {
            console.error(`❌ Database error at offset ${offset}:`, result.error);
            let errorMessage = result.error?.message || result.error?.details || JSON.stringify(result.error);
            
            // HTMLエラーページが返された場合の処理
            if (errorMessage.includes('<!DOCTYPE html>')) {
              errorMessage = 'Database server is unavailable (Error 521). Please check Supabase dashboard.';
              console.error('❌ Received HTML error page instead of JSON response. This usually means the database server is down or unreachable.');
            }
            
            // スキーマキャッシュエラーは再試行可能
            if (errorMessage.includes('schema cache') || errorMessage.includes('Retrying')) {
              console.warn(`⚠️ Schema cache error detected. This is usually temporary during database cold start.`);
              throw new Error(`Database query failed: ${errorMessage}`);
            }
            
            throw new Error(`Database query failed: ${errorMessage}`);
          }
          
          data = result.data;
          success = true;
          console.log(`✅ Successfully retrieved batch at offset ${offset}`);
        } catch (fetchError) {
          retries++;
          const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
          const isSchemaError = errorMsg.includes('schema cache');
          
          // スキーマキャッシュエラーの場合はより長く待つ
          const baseDelay = isSchemaError ? 3000 : 1000;
          const delay = baseDelay * Math.pow(2, retries - 1); // 指数バックオフ
          
          console.warn(`⚠️ Retry ${retries}/${MAX_RETRIES} for offset ${offset} (waiting ${delay}ms):`, errorMsg.substring(0, 150));
          
          if (retries >= MAX_RETRIES) {
            console.error(`❌ Failed after ${MAX_RETRIES} retries. Last error:`, errorMsg);
            throw fetchError;
          }
          
          // 指数バックオフで待機
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      if (!data || data.length === 0) break;
      
      allData.push(...data);
      console.log(`📊 Retrieved batch: ${data.length} items (total: ${allData.length})`);
      
      if (data.length < BATCH_SIZE) break;
      
      offset += BATCH_SIZE;
      
      // バッチ間で少し待つ（サーバー負荷軽減）
      if (offset > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Successfully retrieved ${allData.length} rivers`);
    return allData;
  } catch (error) {
    console.error('❌ Error in getAllRiversWithPagination:', error);
    throw error;
  }
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
      const weatherApiKey = Deno.env.get('WEATHERAPI_KEY');
      
      return jsonResponse({
        message: 'Environment Variables Status',
        variables: {
          OPENWEATHER_API_KEY: Deno.env.get('OPENWEATHER_API_KEY') ? 'SET' : 'NOT SET',
          WEATHERAPI_KEY: weatherApiKey ? `SET (length: ${weatherApiKey.length})` : 'NOT SET',
          WEATHERAPI_KEY_VALUE: weatherApiKey || 'NOT SET',
          DPF_API_KEY: dpfApiKey ? 'SET' : 'NOT SET',
          MICROCMS_API_KEY: Deno.env.get('MICROCMS_API_KEY') ? 'SET' : 'NOT SET',
          SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT SET',
        },
      });
    }
    
    // Weather API テスト
    if (path === '/make-server-5f24a873/test-weatherapi' && method === 'GET') {
      const apiKey = Deno.env.get('WEATHERAPI_KEY');
      
      if (!apiKey) {
        return jsonResponse({ success: false, error: 'WEATHERAPI_KEY not set' }, 400);
      }
      
      console.log('🧪 Testing Weather API with key:', apiKey);
      
      // テスト用に東京の座標を使用
      const lat = 35.6895;
      const lon = 139.6917;
      
      // Current weatherとForecast APIをテスト（History APIは有料のため除外）
      const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
      const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3`;
      
      console.log('📡 Testing Current Weather API...');
      
      try {
        // Current Weather APIをテスト
        const currentResponse = await fetch(currentUrl);
        const currentStatus = currentResponse.status;
        
        console.log('📡 Current API response status:', currentStatus);
        
        if (!currentResponse.ok) {
          const errorText = await currentResponse.text();
          console.error('❌ Current API Error:', errorText);
          
          return jsonResponse({
            success: false,
            error: `Current API returned ${currentStatus}`,
            errorDetails: errorText,
            apiKey: apiKey.substring(0, 10) + '...',
            note: 'Weather API無料プランではCurrent WeatherとForecast APIのみ使用可能です'
          }, 500);
        }
        
        const currentData = await currentResponse.json();
        console.log('✅ Current API Success');
        
        // Forecast APIをテスト
        console.log('📡 Testing Forecast API...');
        const forecastResponse = await fetch(forecastUrl);
        const forecastStatus = forecastResponse.status;
        
        console.log('📡 Forecast API response status:', forecastStatus);
        
        if (!forecastResponse.ok) {
          const errorText = await forecastResponse.text();
          console.error('❌ Forecast API Error:', errorText);
          
          return jsonResponse({
            success: false,
            error: `Forecast API returned ${forecastStatus}`,
            errorDetails: errorText,
            apiKey: apiKey.substring(0, 10) + '...',
          }, 500);
        }
        
        const forecastData = await forecastResponse.json();
        console.log('✅ Forecast API Success');
        
        return jsonResponse({
          success: true,
          message: 'Weather API is working correctly (Current + Forecast only)',
          apiKey: apiKey.substring(0, 10) + '...',
          note: '無料プランのため、今日から3日後の天気のみ取得可能です。昨日の天気は取得できません。',
          currentWeather: {
            location: currentData.location?.name,
            temp: currentData.current?.temp_c,
            condition: currentData.current?.condition?.text
          },
          forecast: {
            days: forecastData.forecast?.forecastday?.length || 0
          }
        });
      } catch (error) {
        console.error('❌ Test error:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
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
      try {
        const prefecture = url.searchParams.get('prefecture');
        const { rivers: allRiversData } = await getAllRiversWithIndex();
        
        const rivers = allRiversData.map(item => {
          const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
          return { ...value, _key: item.key };
        });
        
        // 🔍 デバッグ：笛吹川のデータを確認
        const fuefukiRivers = rivers.filter(r => r.name && r.name.includes('笛吹川'));
        if (fuefukiRivers.length > 0) {
          console.log('🔍 DEBUG: 笛吹川データをサーバーから送信:', {
            count: fuefukiRivers.length,
            sample: fuefukiRivers[0],
            hasWaterLevelUrl: !!fuefukiRivers[0].waterLevelUrl,
            waterLevelUrl: fuefukiRivers[0].waterLevelUrl
          });
        }
        
        // サーバー側で重複除外（川名 + 都道府県でユニーク化、IDが小さい方を優先）
        const uniqueMap = new Map<string, any>();
        for (const river of rivers) {
          const key = `${river.name}|${river.prefecture}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, river);
          } else {
            const existing = uniqueMap.get(key)!;
            if (parseInt(river.id) < parseInt(existing.id)) {
              uniqueMap.set(key, river);
            }
          }
        }
        const uniqueRivers = Array.from(uniqueMap.values());
        const duplicateCount = rivers.length - uniqueRivers.length;
        if (duplicateCount > 0) {
          console.log(`🧹 重複除外: ${rivers.length}件 → ${uniqueRivers.length}件 (${duplicateCount}件除外)`);
        }

        if (prefecture && prefecture !== "すべて") {
          const filtered = uniqueRivers.filter(r => r.prefecture === prefecture);
          return jsonResponse({ success: true, rivers: filtered, count: filtered.length });
        }

        return jsonResponse({ success: true, rivers: uniqueRivers, count: uniqueRivers.length });
      } catch (error) {
        console.error('❌ Error in /rivers endpoint:', error);
        return jsonResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined
        }, 500);
      }
    }

    // データベース���造確認用（デバッグ）
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

    // DPF観測所ID 一括更新（SQL一括UPDATE版）
    if (path === '/make-server-5f24a873/rivers/update-dpf-ids' && method === 'POST') {
      try {
        const startTime = Date.now();
        const body = await req.json();
        const csvData = body.csvData;
        
        console.log('🚀 Server: SQL Batch Update endpoint called');
        console.log(`📊 Received ${csvData?.length || 0} rows`);
        
        if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
          console.error('❌ Invalid csvData:', csvData);
          return jsonResponse({ 
            success: false, 
            error: 'csvData is required and must be a non-empty array' 
          }, 400);
        }
        
        const supabase = getSupabaseClient();
        
        // CSVデータを川名でマップ化
        const csvMap = new Map<string, any[]>();
        for (const row of csvData) {
          const riverName = row.riverName;
          if (!riverName) continue;
          
          if (!csvMap.has(riverName)) {
            csvMap.set(riverName, []);
          }
          csvMap.get(riverName)!.push(row);
        }
        
        console.log(`🗂️ CSV contains ${csvMap.size} unique river names`);
        
        // 全川データを取得
        console.log('🔄 Fetching all rivers from database...');
        const fetchStart = Date.now();
        
        const { data: allRivers, error: fetchError } = await supabase
          .from('kv_store_5f24a873')
          .select('key, value')
          .like('key', 'river:%');
        
        if (fetchError) {
          throw new Error(`Database fetch error: ${fetchError.message}`);
        }
        
        console.log(`✅ Fetched ${allRivers?.length || 0} rivers in ${Date.now() - fetchStart}ms`);
        
        if (!allRivers || allRivers.length === 0) {
          return jsonResponse({
            success: false,
            error: 'No rivers found in database'
          }, 404);
        }
        
        // 一括更新用の配列を準備
        const updatePromises: Promise<any>[] = [];
        let updatedCount = 0;
        let skippedCount = 0;
        
        console.log('🔄 Matching and preparing updates...');
        const matchStart = Date.now();
        
        for (const riverItem of allRivers) {
          try {
            const riverData = typeof riverItem.value === 'string' 
              ? JSON.parse(riverItem.value) 
              : riverItem.value;
            
            const riverName = riverData.name;
            if (!riverName) {
              skippedCount++;
              continue;
            }
            
            // CSVにこの川名がマッチするか確認
            const csvRows = csvMap.get(riverName);
            if (!csvRows || csvRows.length === 0) {
              skippedCount++;
              continue;
            }
            
            // 最初のマッチを使用（同じ川名が複数ある場合）
            const csvRow = csvRows[0];
            
            // データを更新
            riverData.municipalityCode = csvRow.municipalityCode;
            riverData.dpfObservationId = csvRow.dpfObservationId || csvRow.municipalityCode;
            riverData.basinName = csvRow.basinName;
            riverData.stationName = csvRow.stationName;
            
            const urlId = csvRow.dpfObservationId || csvRow.municipalityCode;
            riverData.waterLevelUrl = `https://www.river.go.jp/kawabou/ipSuiiKobetu.do?obsrvId=${urlId}`;
            
            // 更新をプロミス配列に追加
            updatePromises.push(
              supabase
                .from('kv_store_5f24a873')
                .update({ value: riverData })
                .eq('key', riverItem.key)
                .then(result => {
                  if (result.error) {
                    console.warn(`⚠️ Update failed for ${riverItem.key}:`, result.error);
                    return { success: false };
                  }
                  return { success: true };
                })
            );
            
          } catch (parseError) {
            console.warn(`⚠️ Parse error for river ${riverItem.key}:`, parseError);
            skippedCount++;
            continue;
          }
        }
        
        console.log(`✅ Matched in ${Date.now() - matchStart}ms`);
        console.log(`📊 Prepared ${updatePromises.length} updates`);
        
        // 全更新を並列実行
        console.log('🚀 Executing batch updates...');
        const updateStart = Date.now();
        
        const results = await Promise.all(updatePromises);
        updatedCount = results.filter(r => r.success).length;
        
        console.log(`✅ Updates completed in ${Date.now() - updateStart}ms`);
        
        const totalTime = Date.now() - startTime;
        const processingTime = `${(totalTime / 1000).toFixed(2)}秒`;
        
        console.log(`✅ Batch complete: ${updatedCount} updated, ${skippedCount} skipped in ${processingTime}`);
        
        return jsonResponse({
          success: true,
          updatedCount,
          skippedCount,
          processingTime,
          message: 'バッチ処理が完了しました'
        });
        
      } catch (error) {
        console.error('❌ Error updating DPF IDs:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        return jsonResponse({
          success: false,
          error: errorMessage,
          errorType: typeof error,
          errorDetails: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : String(error)
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
        
        // 最初の川データをサンプルとして出力（デバ用）
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

    // 川の一括削除（重複削除用）
    if (path === '/make-server-5f24a873/rivers/bulk-delete' && method === 'POST') {
      try {
        console.log('🗑️ Starting bulk delete...');
        
        const body = await req.json();
        const idsToDelete = body.ids || [];
        
        if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
          return jsonResponse({ 
            success: false, 
            error: '削除対象のIDが指定されていません' 
          }, 400);
        }
        
        console.log(`📋 削除対象ID: ${idsToDelete.length} 件`, idsToDelete);
        
        // IDからキーを生成して削除
        const keysToDelete = idsToDelete.map((id: string) => `river:${id}`);
        
        // 一括削除実行
        let deletedCount = 0;
        for (const key of keysToDelete) {
          try {
            await kv.del(key);
            deletedCount++;
          } catch (error) {
            console.error(`Failed to delete ${key}:`, error);
          }
        }
        
        console.log(`✅ 削除完了: ${deletedCount} 件`);
        
        // 残りのデータ数を取得
        const remainingData = await getAllRiversWithPagination();
        
        return jsonResponse({ 
          success: true, 
          deletedCount,
          remainingCount: remainingData.length,
          message: `${deletedCount}件の重複データを削除しました` 
        });
        
      } catch (error) {
        console.error('❌ Bulk delete error:', error);
        return jsonResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }, 500);
      }
    }

    // 水位情報URL一括更新エンドポイント
    if (path === '/make-server-5f24a873/rivers/update-water-level-urls' && method === 'POST') {
      try {
        const startTime = Date.now();
        const body = await req.json();
        const updates = body.updates;
        
        console.log('🚀 Water Level URL Update: endpoint called');
        console.log(`📊 Received ${updates?.length || 0} updates`);
        
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
          return jsonResponse({ 
            success: false, 
            error: 'updates is required and must be a non-empty array' 
          }, 400);
        }
        
        const supabase = getSupabaseClient();
        
        // 更新データを川名でマップ化
        const updateMap = new Map<string, any[]>();
        for (const update of updates) {
          const key = `${update.riverName}:${update.stationName}`;
          if (!updateMap.has(key)) {
            updateMap.set(key, []);
          }
          updateMap.get(key)!.push(update);
        }
        
        console.log(`🗂️ Updates contain ${updateMap.size} unique river-station pairs`);
        
        // 全川データを取得
        console.log('🔄 Fetching all rivers from database...');
        const fetchStart = Date.now();
        
        const { data: allRivers, error: fetchError } = await supabase
          .from('kv_store_5f24a873')
          .select('key, value')
          .like('key', 'river:%');
        
        if (fetchError) {
          throw new Error(`Database fetch error: ${fetchError.message}`);
        }
        
        console.log(`✅ Fetched ${allRivers?.length || 0} rivers in ${Date.now() - fetchStart}ms`);
        
        if (!allRivers || allRivers.length === 0) {
          return jsonResponse({
            success: false,
            error: 'No rivers found in database'
          }, 404);
        }
        
        // 一括更新
        const updatePromises: Promise<any>[] = [];
        let updatedCount = 0;
        let skippedCount = 0;
        
        console.log('🔄 Matching and preparing updates...');
        const matchStart = Date.now();
        
        for (const riverItem of allRivers) {
          try {
            const riverData = typeof riverItem.value === 'string' 
              ? JSON.parse(riverItem.value) 
              : riverItem.value;
            
            const riverName = riverData.name;
            const stationName = riverData.stationName;
            
            if (!riverName || !stationName) {
              skippedCount++;
              continue;
            }
            
            // 更新デーにマッチするか確認
            const key = `${riverName}:${stationName}`;
            const matchingUpdates = updateMap.get(key);
            
            if (!matchingUpdates || matchingUpdates.length === 0) {
              skippedCount++;
              continue;
            }
            
            // 最初のマッチを使用
            const update = matchingUpdates[0];
            
            // waterLevelUrlを更新
            riverData.waterLevelUrl = update.waterLevelUrl;
            
            // stCdも保存（オプション）
            if (update.extractedStCd) {
              riverData.stCd = update.extractedStCd;
            }
            
            // 更新をプロミス配列に追加
            updatePromises.push(
              supabase
                .from('kv_store_5f24a873')
                .update({ value: riverData })
                .eq('key', riverItem.key)
                .then(result => {
                  if (result.error) {
                    console.warn(`⚠️ Update failed for ${riverItem.key}:`, result.error);
                    return { success: false };
                  }
                  return { success: true };
                })
            );
            
          } catch (parseError) {
            console.warn(`⚠️ Parse error for river ${riverItem.key}:`, parseError);
            skippedCount++;
            continue;
          }
        }
        
        console.log(`✅ Matched in ${Date.now() - matchStart}ms`);
        console.log(`📊 Prepared ${updatePromises.length} updates`);
        
        // 全更新を並列実行
        console.log('🚀 Executing batch updates...');
        const updateStart = Date.now();
        
        const results = await Promise.all(updatePromises);
        updatedCount = results.filter(r => r.success).length;
        
        console.log(`✅ Updates completed in ${Date.now() - updateStart}ms`);
        
        const totalTime = Date.now() - startTime;
        const processingTime = `${(totalTime / 1000).toFixed(2)}秒`;
        
        console.log(`✅ Batch complete: ${updatedCount} updated, ${skippedCount} skipped in ${processingTime}`);
        
        return jsonResponse({
          success: true,
          updatedCount,
          skippedCount,
          processingTime,
          message: '水位情報URLの更新が完了しました'
        });
        
      } catch (error) {
        console.error('❌ Error updating water level URLs:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    // リアルタイム水位取得（市区町村コードベース - 川の防災情報API）
    if (path.startsWith('/make-server-5f24a873/realtime-water-level/') && method === 'GET') {
      const pathParts = path.split('/');
      const municipalityCode = pathParts[pathParts.length - 1];
      
      if (!municipalityCode) {
        return jsonResponse({ success: false, error: 'Municipality code is required' }, 400);
      }
      
      console.log(`🌊 Fetching realtime water level for municipality code: ${municipalityCode}`);
      
      // 市区町村コードベースの川の防災情報APIを使用
      const result = await fetchRealtimeWaterLevel(municipalityCode);
      
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
      
      console.log(`🌤️ Weather request for lat: ${lat}, lon: ${lon}`);
      
      let yesterday = null;
      let current = null;
      let forecast = [];
      
      // Open-Meteoで昨日の天気を取得（完全無料、APIキー不要）
      try {
        console.log('📡 Fetching yesterday weather from Open-Meteo...');
        yesterday = await getYesterdayWeatherFromOpenMeteo(lat, lon);
        console.log('✅ Yesterday weather:', yesterday ? 'OK' : 'NULL');
      } catch (error) {
        console.error('❌ Error fetching yesterday weather:', error);
      }
      
      try {
        console.log('📡 Fetching current weather...');
        current = await getCurrentWeather(lat, lon);
        console.log('✅ Current weather:', current ? 'OK' : 'NULL');
      } catch (error) {
        console.error('❌ Error fetching current weather:', error);
      }
      
      try {
        console.log('📡 Fetching forecast...');
        forecast = await getWeatherForecast(lat, lon);
        console.log('✅ Forecast:', forecast ? `${forecast.length} days` : 'NULL');
      } catch (error) {
        console.error('❌ Error fetching forecast:', error);
      }
      
      console.log('📊 Final data - Yesterday:', yesterday ? 'OK' : 'NULL', ', Forecast:', forecast.length, 'days');
      if (forecast.length > 0) {
        console.log('📊 First forecast item:', forecast[0]);
      }
      
      return jsonResponse({ success: true, yesterday, current, forecast });
    }

    // DPF観��所情報
    if (path === '/make-server-5f24a873/dpf/observations' && method === 'GET') {
      const riverName = url.searchParams.get('riverName');
      
      if (!riverName) {
        return jsonResponse({ success: false, error: 'Missing riverName' }, 400);
      }
      
      const allObservations = await fetchAllRiverObservations();
      const filtered = filterByRiverName(allObservations, riverName);
      
      return jsonResponse({ success: true, observations: filtered, count: filtered.length });
    }

    // DPFデータによる川データ補完（全件）
    if (path === '/make-server-5f24a873/dpf/enrich-all' && method === 'POST') {
      try {
        console.log('⚠️ DPF全川補完機能は一時的に無効化されています（Supabase 500エラーのため）');
        
        return jsonResponse({
          success: false,
          enrichedCount: 0,
          skippedCount: 0,
          errorCount: 0,
          details: ['⚠️ この機能は一時的に無効化されています。Supabaseの500エラーが解決するまでお待ちください。'],
          message: '機能が一時的に無効化されています'
        });
      } catch (error) {
        console.error('❌ Error in DPF enrichment:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    // DPFデータによる川データ補完（単一）
    if (path === '/make-server-5f24a873/dpf/enrich-single' && method === 'POST') {
      try {
        const body = await req.json();
        const riverName = body.riverName;
        
        if (!riverName) {
          return jsonResponse({ success: false, error: 'Missing riverName' }, 400);
        }
        
        console.log(`🔍 Enriching single river: ${riverName}`);
        const result = await enrichSingleRiver(riverName);
        
        return jsonResponse(result);
      } catch (error) {
        console.error('❌ Error in single river enrichment:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    // 川名から観測所情報を取得
    if (path === '/make-server-5f24a873/dpf/observations-by-name' && method === 'GET') {
      try {
        const riverName = url.searchParams.get('riverName');
        
        if (!riverName) {
          return jsonResponse({ success: false, error: 'Missing riverName' }, 400);
        }
        
        console.log(`🔍 Fetching observations for: ${riverName}`);
        const observations = await getObservationsByRiverName(riverName);
        
        return jsonResponse({
          success: true,
          riverName,
          observations,
          count: observations.length
        });
      } catch (error) {
        console.error('❌ Error fetching observations:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    // DPFメタデータのデバッグ（最初の10件のメタデータキーを確認）
    if (path === '/make-server-5f24a873/dpf/debug-metadata' && method === 'GET') {
      try {
        console.log('🔍 Fetching DPF observations for metadata analysis...');
        const allObservations = await fetchAllRiverObservations();
        
        // 最初の10件のメタデータを詳細に分析
        const samples = allObservations.slice(0, 10).map(obs => ({
          id: obs.id,
          title: obs.title,
          riverName: obs.riverName,
          observationPlaceName: obs.observationPlaceName,
          ofcCd: obs.ofcCd,
          obsCd: obs.obsCd,
          metadataKeys: obs.rawMetadata ? Object.keys(obs.rawMetadata) : [],
          codeRelatedKeys: obs.rawMetadata 
            ? Object.keys(obs.rawMetadata).filter(k => 
                k.toLowerCase().includes('code') || 
                k.toLowerCase().includes('office') ||
                k.toLowerCase().includes('obs') ||
                k.toLowerCase().includes('station')
              )
            : [],
          rawMetadata: obs.rawMetadata
        }));
        
        return jsonResponse({
          success: true,
          totalCount: allObservations.length,
          samples,
          message: '最初の10件の観測所メタデータを取得しました。metadataKeysとcodeRelatedKeysを確認してください。'
        });
      } catch (error) {
        console.error('❌ Error in metadata debug:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    // データベース内の笛��川を検索（デバッグ用）
    if (path === '/make-server-5f24a873/debug/find-fuefuki' && method === 'GET') {
      try {
        console.log('🔍 Searching for Fuefuki River in database...');
        const allRiverItems = await getAllRiversWithPagination();
        
        // getAllRiversWithPaginationは{key, value}の配列を返す
        const fuefukiVariants = allRiverItems.filter(item => {
          if (!item || !item.value) return false;
          
          const riverData = typeof item.value === 'string' 
            ? JSON.parse(item.value) 
            : item.value;
          
          const name = riverData?.name || '';
          
          // 笛吹川を含む名前を検索
          return name.includes('笛吹') || name.includes('ふえふき');
        });
        
        const results = fuefukiVariants.map(item => {
          const data = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
          return {
            key: item.key,
            name: data.name,
            prefecture: data.prefecture,
            waterLevelUrl: data.waterLevelUrl,
            dpfObservationId: data.dpfObservationId,
            id: data.id
          };
        });
        
        return jsonResponse({
          success: true,
          count: results.length,
          rivers: results,
          message: `データベース内で笛吹川に関連する川を${results.length}件見つけました`
        });
      } catch (error) {
        console.error('❌ Error finding Fuefuki:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    // 笛吹川データの詳細検査（新規エンドポイント）
    if (path === '/make-server-5f24a873/debug/fuefuki-inspect' && method === 'GET') {
      try {
        console.log('🔍 Inspecting Fuefuki River data in database...');
        const allRiverItems = await getAllRiversWithPagination();
        
        const fuefukiRivers = allRiverItems.filter(item => {
          if (!item || !item.value) return false;
          
          const riverData = typeof item.value === 'string' 
            ? JSON.parse(item.value) 
            : item.value;
          
          const name = riverData?.name || '';
          return name.includes('笛吹');
        });
        
        const detailedResults = fuefukiRivers.map(item => {
          const data = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
          return {
            dbKey: item.key,
            id: data.id,
            name: data.name,
            prefecture: data.prefecture,
            municipality: data.municipality,
            basinName: data.basinName,
            stationName: data.stationName,
            observatoryName: data.observatoryName,
            waterLevelUrl: data.waterLevelUrl,
            dpfObservationId: data.dpfObservationId,
            latitude: data.latitude,
            longitude: data.longitude,
            rawData: data
          };
        });
        
        console.log(`✅ Found ${detailedResults.length} Fuefuki river(s)`);
        
        return jsonResponse({
          success: true,
          count: detailedResults.length,
          rivers: detailedResults,
          message: `笛吹川のデータを${detailedResults.length}件見つけました`
        });
      } catch (error) {
        console.error('❌ Error inspecting Fuefuki:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    // 笛吹川のwaterLevelUrlを直接更新（新規エンドポイント）
    if (path === '/make-server-5f24a873/debug/fuefuki-update' && method === 'POST') {
      try {
        console.log('🚀 Updating Fuefuki River waterLevelUrl...');
        
        const body = await req.json();
        const newUrl = body.newUrl;
        
        if (!newUrl) {
          return jsonResponse({
            success: false,
            error: 'newUrl is required'
          }, 400);
        }
        
        const supabase = getSupabaseClient();
        const allRiverItems = await getAllRiversWithPagination();
        
        // 笛吹川を検索
        const fuefukiRivers = allRiverItems.filter(item => {
          if (!item || !item.value) return false;
          
          const riverData = typeof item.value === 'string' 
            ? JSON.parse(item.value) 
            : item.value;
          
          const name = riverData?.name || '';
          return name.includes('笛吹');
        });
        
        console.log(`📊 Found ${fuefukiRivers.length} Fuefuki river(s) to update`);
        
        if (fuefukiRivers.length === 0) {
          return jsonResponse({
            success: false,
            error: '笛吹川のデータが見つかりませんでした'
          }, 404);
        }
        
        // 全ての笛吹川データを更新
        let updatedCount = 0;
        
        for (const item of fuefukiRivers) {
          const riverData = typeof item.value === 'string' 
            ? JSON.parse(item.value) 
            : item.value;
          
          // waterLevelUrlを更新
          riverData.waterLevelUrl = newUrl;
          
          // データベースを更新
          const { error: updateError } = await supabase
            .from('kv_store_5f24a873')
            .update({ value: riverData })
            .eq('key', item.key);
          
          if (updateError) {
            console.error(`⚠️ Failed to update ${item.key}:`, updateError);
          } else {
            console.log(`✅ Updated ${item.key}`);
            updatedCount++;
          }
        }
        
        // キャッシュをクリア
        globalRiversCache = null;
        globalRiversIndexCache = null;
        globalRiversCacheTimestamp = null;
        console.log('🗑️ Cache cleared after update');
        
        return jsonResponse({
          success: true,
          updatedCount,
          totalFound: fuefukiRivers.length,
          message: `笛吹川��waterLevelUrlを${updatedCount}件更新しました`
        });
      } catch (error) {
        console.error('❌ Error updating Fuefuki:', error);
        return jsonResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }, 500);
      }
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

    // ダミー水位データをクリアするエンドポイント（SQL一括更新版）
    if (path === '/make-server-5f24a873/clear-dummy-water-levels-sql' && method === 'POST') {
      console.log('🧹 Starting SQL-based dummy water level clearing...');
      
      try {
        const supabase = getSupabaseClient();
        
        // ステップ1: まず全データを取得してパターンマッチ
        const { data: allData, error: fetchError } = await supabase
          .from('kv_store_5f24a873')
          .select('key, value')
          .like('key', 'river:%');
        
        if (fetchError) {
          throw new Error(`Database fetch error: ${fetchError.message}`);
        }
        
        console.log(`📊 Fetched ${allData?.length || 0} rivers`);
        
        if (!allData || allData.length === 0) {
          return jsonResponse({
            success: true,
            message: 'データがありません',
            updatedCount: 0
          });
        }
        
        // ステップ2: ダミーパターンを検出してキーのリストを作成
        const keysToUpdate: string[] = [];
        const detectedPatterns: { [key: string]: number } = {};
        
        for (const item of allData) {
          try {
            const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
            const waterLevel = value.waterLevel;
            const warningLevel = value.warningLevel;
            
            let isDummy = false;
            let pattern = '';
            
            // パターン1: 0値
            if (
              waterLevel != null && warningLevel != null &&
              (waterLevel === 0 || waterLevel === '0' || waterLevel === 0.0 || waterLevel === '0.0' ||
               warningLevel === 0 || warningLevel === '0' || warningLevel === 0.0 || warningLevel === '0.0')
            ) {
              isDummy = true;
              pattern = '0値';
            }
            
            // パターン2: 5.00 / 3.50
            if (!isDummy &&
              (waterLevel === 5.00 || waterLevel === 5 || waterLevel === '5.00' || waterLevel === '5') &&
              (warningLevel === 3.50 || warningLevel === 3.5 || warningLevel === '3.50' || warningLevel === '3.5')
            ) {
              isDummy = true;
              pattern = '5.00 / 3.50';
            }
            
            // パターン3: 5.00 / 3.20
            if (!isDummy &&
              (waterLevel === 5.00 || waterLevel === 5 || waterLevel === '5.00' || waterLevel === '5') &&
              (warningLevel === 3.20 || warningLevel === 3.2 || warningLevel === '3.20' || warningLevel === '3.2')
            ) {
              isDummy = true;
              pattern = '5.00 / 3.20';
            }
            
            // パターン4: 異常値（水位が警戒水位を大きく上回る）
            if (!isDummy && waterLevel != null && warningLevel != null) {
              const wl = parseFloat(String(waterLevel));
              const wwl = parseFloat(String(warningLevel));
              
              if (!isNaN(wl) && !isNaN(wwl) && wl > 0 && wwl > 0 && wl > wwl && (wl - wwl) > 1.5) {
                isDummy = true;
                pattern = '異常値';
              }
            }
            
            if (isDummy) {
              keysToUpdate.push(item.key);
              detectedPatterns[pattern] = (detectedPatterns[pattern] || 0) + 1;
            }
          } catch (parseError) {
            console.warn(`Parse error for ${item.key}:`, parseError);
          }
        }
        
        console.log(`🔍 Detected ${keysToUpdate.length} dummy entries`);
        console.log('📊 Patterns:', detectedPatterns);
        
        if (keysToUpdate.length === 0) {
          return jsonResponse({
            success: true,
            message: 'ダミーデータは見つかりませんでした',
            updatedCount: 0,
            detectedPatterns
          });
        }
        
        // ステップ3: バッチで更新（50件ずつ）
        let updatedCount = 0;
        const BATCH_SIZE = 50;
        
        for (let i = 0; i < keysToUpdate.length; i += BATCH_SIZE) {
          const batchKeys = keysToUpdate.slice(i, i + BATCH_SIZE);
          
          // 各キーのデータを取得して更新
          const updatePromises = batchKeys.map(async (key) => {
            const { data, error: getError } = await supabase
              .from('kv_store_5f24a873')
              .select('value')
              .eq('key', key)
              .single();
            
            if (getError || !data) {
              console.warn(`Failed to get ${key}:`, getError);
              return false;
            }
            
            const value = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            
            // 水位データをnullに設定
            value.waterLevel = null;
            value.warningLevel = null;
            value.currentStatus = 'normal';
            
            const { error: updateError } = await supabase
              .from('kv_store_5f24a873')
              .update({ value })
              .eq('key', key);
            
            if (updateError) {
              console.warn(`Failed to update ${key}:`, updateError);
              return false;
            }
            
            return true;
          });
          
          const results = await Promise.all(updatePromises);
          updatedCount += results.filter(r => r).length;
          
          console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${results.filter(r => r).length}/${batchKeys.length} updated`);
        }
        
        // キャッシュをクリア
        globalRiversCache = null;
        globalRiversCacheTimestamp = null;
        globalRiversIndexCache = null;
        
        console.log(`✅ Successfully cleared ${updatedCount} dummy entries`);
        
        return jsonResponse({
          success: true,
          message: `${updatedCount}件のダミーデータをクリアしました`,
          updatedCount,
          totalProcessed: allData.length,
          detectedPatterns
        });
        
      } catch (error) {
        console.error('❌ SQL clear error:', error);
        return jsonResponse({
          success: false,
          error: String(error)
        }, 500);
      }
    }

    // ダミー水位データをクリアするエンドポイント
    if (path === '/make-server-5f24a873/clear-dummy-water-levels' && method === 'POST') {
      console.log('🧹 Starting to clear dummy water level data...');
      
      try {
        const allRiversData = await getAllRiversWithPagination();
        console.log(`📊 Total rivers to process: ${allRiversData.length}`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        let detectedDummyPatterns: { [key: string]: number } = {};
        let errors: string[] = [];
        
        // バッチ処理（100件ずつ）
        const BATCH_SIZE = 100;
        for (let i = 0; i < allRiversData.length; i += BATCH_SIZE) {
          const batch = allRiversData.slice(i, i + BATCH_SIZE);
          console.log(`  Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allRiversData.length / BATCH_SIZE)}...`);
          
          for (const item of batch) {
            try {
              const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              
              // より柔軟なダミー水位データの検出ロジック
              const waterLevel = value.waterLevel;
              const warningLevel = value.warningLevel;
              
              // 複数のダミーパターン検出
              let isDummyWaterLevel = false;
              let detectedPattern = '';
              
              // 🔥 パターン0: 0値（最も一般的なダミー値）
              if (
                (waterLevel === 0 || waterLevel === '0' || waterLevel === 0.0 || waterLevel === '0.0') ||
                (warningLevel === 0 || warningLevel === '0' || warningLevel === 0.0 || warningLevel === '0.0')
              ) {
                isDummyWaterLevel = true;
                detectedPattern = '0値（初期値）';
              }
              
              // パターン1: 5.00m / 3.50m（文字列・数値両方）
              if (!isDummyWaterLevel &&
                (waterLevel === 5.00 || waterLevel === 5 || waterLevel === '5.00' || waterLevel === '5') &&
                (warningLevel === 3.50 || warningLevel === 3.5 || warningLevel === '3.50' || warningLevel === '3.5')
              ) {
                isDummyWaterLevel = true;
                detectedPattern = '5.00 / 3.50';
              }
              
              // パターン2: null以外で、両方とも設定されていて、水位が警戒水位より高い（異常値）
              if (!isDummyWaterLevel && waterLevel != null && warningLevel != null) {
                const wl = parseFloat(String(waterLevel));
                const wwl = parseFloat(String(warningLevel));
                
                // 水位が警戒水位を大きく上回っている場合（1.5m以上）はダミー���可能性
                if (!isNaN(wl) && !isNaN(wwl) && wl > 0 && wwl > 0 && wl > wwl && (wl - wwl) > 1.5) {
                  isDummyWaterLevel = true;
                  detectedPattern = `${wl.toFixed(2)} / ${wwl.toFixed(2)} (異常値)`;
                }
              }
              
              // パターン3: 特定のダミー値パターン（3.00 / 2.00など）
              if (!isDummyWaterLevel && waterLevel != null && warningLevel != null) {
                const wl = parseFloat(String(waterLevel));
                const wwl = parseFloat(String(warningLevel));
                
                // 整数値で、水位が警戒水位より高い（ただし0は除外済み）
                if (!isNaN(wl) && !isNaN(wwl) && wl > 0 && wwl > 0 && wl % 1 === 0 && wwl % 1 === 0 && wl > wwl) {
                  isDummyWaterLevel = true;
                  detectedPattern = `${wl.toFixed(2)} / ${wwl.toFixed(2)} (整数値)`;
                }
              }
              
              if (isDummyWaterLevel) {
                // カウント
                detectedDummyPatterns[detectedPattern] = (detectedDummyPatterns[detectedPattern] || 0) + 1;
                
                // デバッグログ（最初の10件のみ）
                if (updatedCount < 10) {
                  console.log(`  🔍 ダミー検出: ${value.name} - ${detectedPattern}`);
                }
                
                // 水位データをnullに設定
                value.waterLevel = null;
                value.warningLevel = null;
                value.currentStatus = 'normal';
                
                await kv.set(item.key, value);
                updatedCount++;
              } else {
                skippedCount++;
              }
            } catch (itemError) {
              console.error(`  ❌ Error processing item ${item.key}:`, itemError);
              errors.push(`${item.key}: ${String(itemError)}`);
            }
          }
          
          // バッチごとの進捗ログ
          console.log(`  ✓ Batch complete: ${updatedCount} updated, ${skippedCount} skipped so far`);
        }
        
        console.log(`✅ ダミーデータクリア完了: ${updatedCount}件更新、${skippedCount}件スキップ`);
        console.log('  検出されたパターン:', detectedDummyPatterns);
        
        if (errors.length > 0) {
          console.warn(`⚠️ ${errors.length} errors occurred during processing`);
        }
        
        // キャッシュをクリア
        globalRiversCache = null;
        globalRiversCacheTimestamp = null;
        globalRiversIndexCache = null;
        
        return jsonResponse({
          success: true,
          message: 'ダミー水位データをクリアしました',
          updatedCount,
          skippedCount,
          totalProcessed: allRiversData.length,
          detectedPatterns: detectedDummyPatterns
        });
      } catch (error) {
        console.error('❌ ダミーデータクリアエラー:', error);
        return jsonResponse({
          success: false,
          error: String(error)
        }, 500);
      }
    }

    // 水位データ検査エンドポイント（デバッグ用）
    if (path === '/make-server-5f24a873/inspect-water-levels' && method === 'POST') {
      console.log('🔬 Starting water level inspection...');
      
      try {
        const body = await req.json();
        const searchName = body.searchName || '';
        
        const allRiversData = await getAllRiversWithPagination();
        
        let totalRivers = 0;
        let withWaterLevel = 0;
        let withoutWaterLevel = 0;
        const samples: any[] = [];
        const dummyPatternsMap: { [key: string]: number } = {};
        
        for (const item of allRiversData) {
          const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
          
          // 川名でフィルタリング（指定されている場合）
          if (searchName && !value.name?.includes(searchName)) {
            continue;
          }
          
          totalRivers++;
          
          const waterLevel = value.waterLevel;
          const warningLevel = value.warningLevel;
          
          // 水位データの有無をカウント
          if (waterLevel != null || warningLevel != null) {
            withWaterLevel++;
            
            // ダミーパターンの検出
            if (
              (waterLevel === 5.00 || waterLevel === 5 || waterLevel === '5.00' || waterLevel === '5') &&
              (warningLevel === 3.50 || warningLevel === 3.5 || warningLevel === '3.50' || warningLevel === '3.5')
            ) {
              const pattern = '5.00 / 3.50 (典型的なダミー)';
              dummyPatternsMap[pattern] = (dummyPatternsMap[pattern] || 0) + 1;
            } else if (waterLevel != null && warningLevel != null) {
              const wl = parseFloat(String(waterLevel));
              const wwl = parseFloat(String(warningLevel));
              
              if (!isNaN(wl) && !isNaN(wwl) && wl > wwl && (wl - wwl) > 1.5) {
                const pattern = `異常値 (水位 > 警戒水位 + 1.5m)`;
                dummyPatternsMap[pattern] = (dummyPatternsMap[pattern] || 0) + 1;
              }
            }
            
            // 🔥 0値の検出
            if (
              (waterLevel === 0 || waterLevel === '0' || waterLevel === 0.0 || waterLevel === '0.0') ||
              (warningLevel === 0 || warningLevel === '0' || warningLevel === 0.0 || warningLevel === '0.0')
            ) {
              const pattern = '0値（初期値・ダミー）';
              dummyPatternsMap[pattern] = (dummyPatternsMap[pattern] || 0) + 1;
            }
          } else {
            withoutWaterLevel++;
          }
          
          // サンプルを収集（最初の10件）
          if (samples.length < 10) {
            samples.push({
              id: value.id,
              name: value.name,
              prefecture: value.prefecture,
              waterLevel: waterLevel,
              warningLevel: warningLevel,
              waterLevelType: typeof waterLevel,
              warningLevelType: typeof warningLevel,
            });
          }
        }
        
        const dummyPatterns = Object.entries(dummyPatternsMap).map(([pattern, count]) => ({
          pattern,
          count
        }));
        
        console.log(`✅ 検査完了: 総数=${totalRivers}, 水位あり=${withWaterLevel}, 水位なし=${withoutWaterLevel}`);
        console.log('  ダミーパターン:', dummyPatterns);
        
        return jsonResponse({
          success: true,
          result: {
            totalRivers,
            withWaterLevel,
            withoutWaterLevel,
            samples,
            dummyPatterns
          }
        });
      } catch (error) {
        console.error('❌ 水位検査エラー:', error);
        return jsonResponse({
          success: false,
          error: String(error)
        }, 500);
      }
    }

    // 404
    return jsonResponse({ error: 'Not Found', path }, 404);

  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({ error: String(error) }, 500);
  }
}

// サーバー起動
console.log('🚀 Server starting...');
console.log('📍 Available endpoints:');
console.log('  - GET  /make-server-5f24a873/health');
console.log('  - GET  /make-server-5f24a873/rivers');
console.log('  - GET  /make-server-5f24a873/banner');
console.log('  - POST /make-server-5f24a873/rivers/bulk');
console.log('  - POST /make-server-5f24a873/rivers/update-dpf-ids');
console.log('✅ Server is ready to accept requests');

Deno.serve(handler);