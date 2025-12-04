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

    // 全���取得
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

    // 一括追加
    if (path === '/make-server-5f24a873/rivers/bulk' && method === 'POST') {
      const body = await req.json();
      const result = await addRiversBulk(body.rivers);
      return jsonResponse(result);
    }

    // 川の削除
    if (riverDetailMatch && method === 'DELETE') {
      const key = riverDetailMatch[1];
      await kv.del(key);
      return jsonResponse({ success: true, message: 'River deleted' });
    }

    // リアルタイム水位
    const waterLevelMatch = path.match(/^\/make-server-5f24a873\/(realtime-)?water-level\/(.+)$/);
    if (waterLevelMatch && method === 'GET') {
      const stationId = waterLevelMatch[2];
      const observatory = url.searchParams.get('observatory') || undefined;
      const waterLevelData = await fetchRealtimeWaterLevel(stationId, observatory);
      return jsonResponse({ success: true, data: waterLevelData });
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