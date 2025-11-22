import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
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

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// プリフライトリクエスト（OPTIONS）を明示的に処理
app.options("/*", (c) => {
  return c.text("", 204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
  });
});

// Health check endpoint
app.get("/make-server-5f24a873/health", (c) => {
  return c.json({ status: "ok" });
});

// 環境変数のチェックエンドポイント（デバッグ用）
app.get("/make-server-5f24a873/env-check", (c) => {
  const dpfApiKey = Deno.env.get('DPF_API_KEY');
  const expectedApiKey = 's7sxiAxrH4SXB9sbcpbVDkJPc_j0y~v_'; // 期待されるAPIキー
  
  const envVars = {
    OPENWEATHER_API_KEY: Deno.env.get('OPENWEATHER_API_KEY') ? 'SET' : 'NOT SET',
    OPENWEATHER_API_KEY_LENGTH: Deno.env.get('OPENWEATHER_API_KEY')?.length || 0,
    DPF_API_KEY: dpfApiKey ? 'SET' : 'NOT SET',
    DPF_API_KEY_LENGTH: dpfApiKey?.length || 0,
    DPF_API_KEY_VALUE: dpfApiKey || 'NOT SET', // 完全な値を表示
    DPF_API_KEY_PREVIEW: dpfApiKey ? `${dpfApiKey.substring(0, 10)}...${dpfApiKey.substring(dpfApiKey.length - 4)}` : 'NOT SET',
    DPF_API_KEY_MATCHES_EXPECTED: dpfApiKey === expectedApiKey, // 期待値と一致するか
    EXPECTED_API_KEY_PREVIEW: `${expectedApiKey.substring(0, 10)}...${expectedApiKey.substring(expectedApiKey.length - 4)}`,
    MICROCMS_API_KEY: Deno.env.get('MICROCMS_API_KEY') ? 'SET' : 'NOT SET',
    MICROCMS_API_KEY_LENGTH: Deno.env.get('MICROCMS_API_KEY')?.length || 0,
  };
  
  console.log('Environment Variables Check:', envVars);
  console.log('Full DPF API Key:', dpfApiKey);
  console.log('Expected DPF API Key:', expectedApiKey);
  console.log('API Keys Match:', dpfApiKey === expectedApiKey);
  
  return c.json({
    message: 'Environment Variables Status',
    variables: envVars,
    timestamp: new Date().toISOString(),
    warning: dpfApiKey !== expectedApiKey ? '⚠️ DPF_API_KEYが期待される値と一致しません。環境変数を更新してください。' : null,
  });
});

// DPF API接続テスト用エンドポイント
app.get("/make-server-5f24a873/test-dpf", async (c) => {
  try {
    const apiKey = Deno.env.get('DPF_API_KEY');
    
    console.log('=== DPF API Connection Test ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('Full API Key:', apiKey);
    
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'DPF_API_KEY is not set in environment variables',
        suggestion: 'Please set the DPF_API_KEY environment variable'
      });
    }
  
  const endpoint = 'https://www.mlit-data.jp/api/v1/graphql';
  
  // DPFドキュメントに基づく正しいクエリ（hwq_stage = 水位データ）
  const correctQuery = `query GetRiverObservationMetadata { getAllData(size: 1000, attributeFilter: {AND: [{attributeName: "DPF:catalog_id", is: "hwq"}, {attributeName: "DPF:dataset_id", is: "hwq_stage"}]}) { data { id title metadata } } }`;
  
  // 複数の認証ヘッダーパターンを試す
  const testCases = [
    {
      name: 'ヘッダー1: apikey（Supabaseスタイル）⭐推奨',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
      query: correctQuery
    },
    {
      name: 'ヘッダー2: X-Dpf-Api-Key（標準）',
      headers: { 'Content-Type': 'application/json', 'X-Dpf-Api-Key': apiKey },
      query: correctQuery
    },
    {
      name: 'ヘッダー3: X-DPF-API-Key（大文字）',
      headers: { 'Content-Type': 'application/json', 'X-DPF-API-Key': apiKey },
      query: correctQuery
    },
    {
      name: 'ヘッダー4: Authorization Bearer',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      query: correctQuery
    },
    {
      name: 'ヘッダー5: X-API-Key',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      query: correctQuery
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const headers = testCase.headers;
    
    console.log(`\n=== Testing: ${testCase.name} ===`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Query:', testCase.query);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: testCase.query }),
      });
      
      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { rawText: responseText.substring(0, 500) };
      }
      
      results.push({
        testName: testCase.name,
        headersUsed: Object.keys(headers).filter(k => k !== 'Content-Type'),
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        dataCount: responseData?.data?.getAllData?.data?.length || 0,
        hasErrors: !!responseData?.errors,
        errors: responseData?.errors,
        sampleData: responseData?.data?.getAllData?.data?.[0] || null,
        response: response.ok ? responseData : { error: responseData }
      });
      
      console.log(`Result: ${response.status} - ${results[results.length - 1].dataCount} items`);
      
    } catch (error) {
      results.push({
        testName: testCase.name,
        headersUsed: Object.keys(headers).filter(k => k !== 'Content-Type'),
        success: false,
        error: String(error)
      });
    }
  }
  
    return c.json({
      success: results.some(r => r.success),
      apiKeyLength: apiKey.length,
      apiKeyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      fullApiKey: apiKey,
      apiKey: apiKey, // 追加: わかりやすくするため
      apiKeyUsed: apiKey, // 追加: データ同期で使用されるAPIキーと同じ
      envVarName: 'DPF_API_KEY', // 追加: どの環境変数を使用しているか明示
      endpoint,
      results,
      recommendation: results.every(r => !r.success) 
        ? 'すべてのクエリパターンが失敗しました。DPF管理画面でAPIキーの権限を確認してください。'
        : '一部のクエリパターンが成功しました。成功したパターンを使用してください。'
    });
  } catch (error) {
    console.error('Error testing DPF API:', error);
    return c.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, 500);
  }
});

// microCMSからバ��ーデータを取得するエンドポイント
app.get("/make-server-5f24a873/banner", async (c) => {
  try {
    const apiKey = Deno.env.get('MICROCMS_API_KEY');
    
    console.log('=== Banner API Request ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    
    if (!apiKey) {
      console.error('MICROCMS_API_KEY is not set');
      return c.json({ error: 'API key not configured' }, 500);
    }

    console.log('Fetching from microCMS...');
    const response = await fetch('https://0jb94z3dca.microcms.io/api/v1/banner', {
      headers: {
        'X-MICROCMS-API-KEY': apiKey,
      },
    });

    console.log('microCMS Response Status:', response.status);
    console.log('microCMS Response StatusText:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`microCMS API error: ${response.status} ${response.statusText}`);
      console.error('Error response:', errorText);
      return c.json({ error: 'Failed to fetch banner data from microCMS', details: errorText }, response.status);
    }

    const data = await response.json();
    console.log('=== FULL microCMS Response ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== Data Type Check ===');
    console.log('Has contents array:', Array.isArray(data.contents));
    console.log('Has items array:', Array.isArray(data.items));
    console.log('Is direct object:', typeof data === 'object' && !Array.isArray(data.contents) && !Array.isArray(data.items));
    
    // microCMSがリスト形式の場合、最初の要素を返す
    if (data.contents && Array.isArray(data.contents) && data.contents.length > 0) {
      console.log('Returning first item from contents array');
      return c.json(data.contents[0]);
    } else if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      console.log('Returning first item from items array');
      return c.json(data.items[0]);
    }
    
    // オブジェクト形式の場合はそのまま返す
    console.log('Returning data as-is (object format)');
    return c.json(data);
  } catch (error) {
    console.error('Error fetching banner data:', error);
    return c.json({ error: 'Internal server error while fetching banner data', details: String(error) }, 500);
  }
});

// 川のデータを取得するエンドポイント
app.get("/make-server-5f24a873/rivers", async (c) => {
  try {
    const allRivers = await kv.getByPrefix('river:');
    console.log(`Fetched ${allRivers.length} rivers from database`);
    return c.json({ rivers: allRivers, count: allRivers.length });
  } catch (error) {
    console.error('Error fetching rivers:', error);
    return c.json({ error: 'Failed to fetch rivers' }, 500);
  }
});

// 都道府県から地方を判定するヘルパー関数
function getPrefectureRegion(prefecture: string): string {
  const regionMap: { [key: string]: string } = {
    '北海道': 'hokkaido-tohoku',
    '青森県': 'hokkaido-tohoku',
    '岩手県': 'hokkaido-tohoku',
    '宮城県': 'hokkaido-tohoku',
    '秋田県': 'hokkaido-tohoku',
    '山形県': 'hokkaido-tohoku',
    '福島県': 'hokkaido-tohoku',
    '茨城県': 'kanto',
    '栃木県': 'kanto',
    '群馬県': 'kanto',
    '埼玉県': 'kanto',
    '千葉県': 'kanto',
    '東京都': 'kanto',
    '神奈川県': 'kanto',
    '新潟県': 'koshinetsu-hokuriku',
    '富山県': 'koshinetsu-hokuriku',
    '石川県': 'koshinetsu-hokuriku',
    '福井県': 'koshinetsu-hokuriku',
    '山梨県': 'koshinetsu-hokuriku',
    '長野県': 'koshinetsu-hokuriku',
    '岐阜県': 'tokai',
    '静岡県': 'tokai',
    '愛知県': 'tokai',
    '三重県': 'tokai',
    '滋賀県': 'kansai',
    '京都府': 'kansai',
    '大阪府': 'kansai',
    '兵庫県': 'kansai',
    '奈良県': 'kansai',
    '和歌山県': 'kansai',
    '鳥取県': 'chugoku',
    '島根県': 'chugoku',
    '岡山県': 'chugoku',
    '広島県': 'chugoku',
    '山口県': 'chugoku',
    '徳島県': 'shikoku',
    '香川県': 'shikoku',
    '愛媛県': 'shikoku',
    '高���県': 'shikoku',
    '福岡県': 'kyushu-okinawa',
    '佐賀県': 'kyushu-okinawa',
    '長崎県': 'kyushu-okinawa',
    '熊本県': 'kyushu-okinawa',
    '大分県': 'kyushu-okinawa',
    '宮崎県': 'kyushu-okinawa',
    '鹿児島県': 'kyushu-okinawa',
    '沖縄県': 'kyushu-okinawa'
  };
  
  return regionMap[prefecture] || 'other';
}

// 北海道の川を追加登録するエンドポイント（ID 201-298）
app.post("/make-server-5f24a873/add-hokkaido-rivers-batch-2", async (c) => {
  try {
    const hokkaidoRivers = [
      // 稚内・宗谷地方の川（ID 201-298）
      { id: 201, name: '七号嫌川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 202, name: '猿骨川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 203, name: '声問川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 204, name: '増幌川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 205, name: '知来別川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 206, name: '猿払川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 207, name: 'ケナシポロ川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 208, name: 'メグマ川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 209, name: '一の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 210, name: '上増幌奥の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 211, name: '下の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 212, name: '二の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 213, name: '千国の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 214, name: '右の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 215, name: '吉田牧場の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 216, name: '四の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 217, name: '奥の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 218, name: '富沢の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 219, name: '川住川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 220, name: '炭山の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 221, name: '炭焼境沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 222, name: '牧場の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 223, name: '石の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 224, name: 'イチャンナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 225, name: '七線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 226, name: '增幌中川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 227, name: '桜川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 228, name: '知来別一号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 229, name: '知来別三号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 230, name: '知来別二号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 231, name: '知来別五号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 232, name: '知来別六号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 233, name: '知来別四号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 234, name: '自衛隊一号線川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 235, name: '自衛隊川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 236, name: '小出川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 237, name: '牧場川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 238, name: '苗畑川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 239, name: '鬼志別川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 240, name: 'エコペー号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 241, name: 'エコペニ号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 242, name: 'カツラ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 243, name: '猿骨三号線川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 244, name: '猿骨二号線川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 245, name: '猿骨四号線川', prefecture: '北海道', region: 'hokkaido', area: '稚内市' },
      { id: 246, name: '白百合川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 247, name: 'エコペ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 248, name: 'タンネペナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 249, name: 'エサヌカ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 250, name: 'カネユ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 251, name: 'キモマ沼川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 252, name: 'セキタンベツ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 253, name: 'ヒトシベツー号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 254, name: 'ヒトシベツ二号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷方' },
      { id: 255, name: 'ヒトシベツ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 256, name: 'ポロナイー号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 257, name: 'ポロナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 258, name: 'ポロー号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 259, name: 'ポロ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 260, name: 'ポンポロ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 261, name: 'モケウニ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 262, name: 'ユウクルー号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 263, name: 'ユウクル川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 264, name: '宗谷濁川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 265, name: '成田川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 266, name: '旧濁川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 267, name: '清川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 268, name: '猿払一号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 269, name: '猿払七号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 270, name: '猿払三号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 271, name: '猿払九号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 272, name: '猿払二号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 273, name: '猿払五号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 274, name: '猿払八号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 275, name: '猿払六号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 276, name: '猿払十号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 277, name: '猿払四号線川', prefecture: '北海道', region: 'hokkaido', area: '猿払村' },
      { id: 278, name: '錦川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 279, name: 'カリベツ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 280, name: 'ニタチナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 281, name: 'パンケシュプナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 282, name: 'タツニウシュナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 283, name: '炭焼の沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 284, name: 'あめの沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 285, name: 'アサヒの沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 286, name: 'アザミノ沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 287, name: 'イワナノ沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 288, name: 'ウノサワ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 289, name: 'エイコの沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 290, name: 'オサチナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 291, name: 'オサナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 292, name: 'オビンナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 293, name: 'コンクリート沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 294, name: 'チュピタウシュナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 295, name: 'チョッコノ沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 296, name: 'ナカヒロノ沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 297, name: 'バンケノ沢川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
      { id: 298, name: 'ポンウツナイ川', prefecture: '北海道', region: 'hokkaido', area: '宗谷地方' },
    ];

    let successCount = 0;
    for (const river of hokkaidoRivers) {
      const riverData = {
        id: river.id.toString(),
        name: river.name,
        region: river.region,
        prefecture: river.prefecture,
        length: Math.floor(Math.random() * 50) + 10, // 10-60km
        waterLevel: parseFloat((Math.random() * 3 + 1).toFixed(2)), // 1.00-4.00m
        warningLevel: 5.20,
        currentStatus: 'normal' as const,
        cameras: [],
        weather: []
      };

      await kv.set(`river:${river.id}`, riverData);
      successCount++;
    }

    console.log(`Successfully added ${successCount} Hokkaido rivers (batch 2)`);
    return c.json({ 
      success: true, 
      message: `北海道の川${successCount}件を追加しました（ID: 201-298）`,
      count: successCount 
    });
  } catch (error) {
    console.error('Error adding Hokkaido rivers batch 2:', error);
    return c.json({ error: 'Failed to add rivers' }, 500);
  }
});

// 新規川データを一括登録するエンドポイント（バッチ3: ID 299〜）
app.post("/make-server-5f24a873/add-rivers-batch-3", async (c) => {
  try {
    const riverNames = [
      '声問川', 'パンケシュプナイ川', 'タツニウシュナイ川', '炭焼の沢川', 'ケナシポロ川',
      'メグマ川', '一の沢川', '上増幌奥の沢川', '下の沢川', '二の沢川',
      '千国の沢川', '右の沢川', '吉田���場の沢川', '四の沢川', '奥の沢川',
      '富沢の沢川', '川住川', '炭山の沢川', '炭焼境沢川', '牧場の沢川',
      '石の沢川', '増幌川', 'イチャンナイ川', '七線川', '增幌中川',
      'ケナシポロ川', '桜川', '知来別一号線川', '知来別三号線川', '知来別二号線川',
      '知来別五号線川', '知来別六号線川', '知来別四号線川', '自衛隊一号線川', '自衛隊川',
      '知来別川', '一号線川', '七号線川', '三号線川', '二号線川',
      '五号線川', '八号線川', '六号線川', '四号線川', '小出川',
      '牧場川', '苗畑川', '鬼志別川', 'エコペー号線川', 'エコペニ号線川',
      'カツラ川', '猿骨三号線川', '猿骨二号���川', '猿骨四号線川', '白百合川',
      '猿骨川', 'エコペ川', 'タンネペナイ川', 'エサヌカ川', 'カネユ川',
      'キモマ沼川', 'セキタンベツ川', 'ヒトシベツー号線川', 'ヒトシベツ二号線川', 'ヒトシベツ川',
      'ポロナイー号線川', 'ポロナイ川', 'ポロー号線川', 'ポロ川', 'ポンポロ川',
      'モケウニ川', 'ユウクルー号線川', 'ユウクル川', '宗谷濁川', '成田川',
      '旧濁川', '清川', '猿払一号線川', '猿払七号線川', '猿払三号線川',
      '猿払九号線川', '猿二号線川', '猿払五号線川', '猿払八号線', '猿払六号線川',
      '猿払十号線川', '猿払四号線川', '錦川', '猿払川', 'カリベツ川',
      'ニタチナイ川', 'あめの沢川', 'アサヒの沢川', 'アザミノ沢川', 'イワナノ沢川',
      'ウノサワ川', 'エイコの沢��', 'オサチナイ川', 'オサナイ川', 'オビンナイ川',
      'コンクリート沢川', 'チュピタウシュナイ川', 'チョッコノ沢川', 'ナカヒロノ沢川', 'バンケノ沢川',
      'ポンウツナイ川', 'ポンケイ川', 'ポンピラナイ川', 'ポン仁達内川', 'マスノ沢川',
      'マップの沢川', 'ヤスベツ川', 'ヤツメの沢川', 'ヤナドマリノ沢川', 'ヨシヨシノ沢川',
      'ル���シュナイル', '一ノ沢川', '���号ノ沢川', '一号沢川', '一己内川',
      '一線川', '七ノ沢川', '三ノ沢川', '中島ノ沢川', '中島川',
      '二号沢川', '七号沢', '七号沢川', '五号沢川'
    ];

    let successCount = 0;
    let startId = 299;

    for (const riverName of riverNames) {
      const riverData = {
        id: startId.toString(),
        name: riverName,
        region: 'hokkaido',
        prefecture: '北海道',
        length: Math.floor(Math.random() * 50) + 10, // 10-60km
        waterLevel: parseFloat((Math.random() * 3 + 1).toFixed(2)), // 1.00-4.00m
        warningLevel: 5.20,
        currentStatus: 'normal' as const,
        cameras: [],
        weather: []
      };

      await kv.set(`river:${startId}`, riverData);
      successCount++;
      startId++;
    }

    console.log(`Successfully added ${successCount} rivers (batch 3, ID: 299-${startId - 1})`);
    return c.json({ 
      success: true, 
      message: `北海道の川${successCount}件を追加しました（ID: 299-${startId - 1}）`,
      count: successCount,
      startId: 299,
      endId: startId - 1
    });
  } catch (error) {
    console.error('Error adding rivers batch 3:', error);
    return c.json({ error: 'Failed to add rivers' }, 500);
  }
});

// 長野県の川を再登録するエンドポイント（ID 1-93）
app.post("/make-server-5f24a873/restore-nagano-rivers", async (c) => {
  try {
    const naganoRivers = [
      // 千曲川水系
      '千曲川', '犀川', '梓川', '高瀬川', '穂高川', '烏川', '鹿島川', '中房川', '蓼川',
      // 天竜川水系
      '天竜川', '三峰川', '小渋川', '遠山川', '横川', '大田切川', '虻川', '小野川',
      // 木曽川水系
      '木曽川', '王滝川', '木曽川支流', '奈川', '黒川', '西野川',
      // 富士川水系
      '釜無川', '塩川', '大門川',
      // 阿賀野川水系
      '犀川支流', '裾花川', '浅川', '奈良井川', '西条川',
      // 信濃川水系
      '保科川', '土尻川', '依田川', '内村川', '神川', '角間川', '夜間瀬川', '松川',
      // 姫川水系
      '姫川', '中谷川', '浦川', '鎌池川',
      // その他主要河川
      '野尻湖', '諏訪湖', '木崎湖', '中綱湖', '青木湖', '女鳥羽川', '薄川', '横河川',
      '田川', '会田川', '麻績川', '唐沢川', '布引川', '大沢川', '万水川',
      '片貝川', '駒沢川', '湯川', '乳川', '黒沢川', '小黒川', '滝沢川',
      '権兵衛沢川', '三沢川', '水無川', '戸隠川', '鳥居川', '太田川', '百々川',
      '深沢川', '土川', '大川', '郷士川', '北沢川', '南沢川', '砥川', '承知川'
    ];

    let successCount = 0;
    
    for (let i = 0; i < naganoRivers.length && i < 93; i++) {
      const riverId = i + 1;
      const riverData = {
        id: riverId.toString(),
        name: naganoRivers[i],
        region: 'chubu',
        prefecture: '長野県',
        length: Math.floor(Math.random() * 80) + 20, // 20-100km
        waterLevel: parseFloat((Math.random() * 3 + 1).toFixed(2)), // 1.00-4.00m
        warningLevel: 5.20,
        currentStatus: 'normal' as const,
        cameras: [],
        weather: []
      };

      await kv.set(`river:${riverId}`, riverData);
      successCount++;
    }

    console.log(`Successfully restored ${successCount} Nagano rivers (ID: 1-${successCount})`);
    return c.json({ 
      success: true, 
      message: `長野県の川${successCount}件を再登録しました（ID: 1-${successCount}）`,
      count: successCount
    });
  } catch (error) {
    console.error('Error restoring Nagano rivers:', error);
    return c.json({ error: 'Failed to restore Nagano rivers' }, 500);
  }
});

// 北海道の川（ID 94-200）を登録するエンドポイント
app.post("/make-server-5f24a873/add-hokkaido-rivers-batch-1", async (c) => {
  try {
    const hokkaidoRivers = [
      // 主要河川
      '石狩川', '天塩川', '十勝川', '釧路川', '網走川', '常呂川', '湧別川', '渚滑川',
      '留萌川', '���毛川', '尻別川', '後志利別川', '鵡川', '沙流川', '静内川', '新冠川',
      // 石狩川水系
      '空知川', '夕張川', '幾春別川', '美唄川', '奈井江川', '当別川', '篠津川', 'ウツナイ川',
      '豊平川', '厚別川', '月寒川', '望月寒川', '精��川', '琴似川', '新川', '伏籠川',
      '茨戸川', '創成川', '発寒川', 'サクシュコトニ川', '星置川', '手稲川', '軽川', '中の川',
      // 十勝川水系
      '札内川', '帯広川', '売買川', '音更川', '然別川', 'ペンケ川', 'パンケ川', '利別川',
      // 釧路川水系
      '久著呂川', '仁々志別川', '雪裡川', '阿寒川', 'シラルトロ川', '新釧路川',
      // 天塩川水系
      '名寄川', '剣淵川', '美深川', 'サンル川', 'ペンケ川', 'パンケ川', '問寒別川',
      // 網走川水系
      '美幌川', '女満別川', '津別川', 'チミケップ川',
      // 常呂川水系
      '無加川', '訓子府川', '仁頃川',
      // 湧別川水系
      '��名淵川', 'ルベシベ川', 'サロマ川',
      // 渚滑川水系
      'チミケップ湖', '滝ノ上川',
      // 尻別川水系
      '真狩川', '昆布川', '倶知安川', 'ルベシベ川', 'ペーペナイ川',
      // 後志利別川水系
      '真駒内川', '奥沢川', '厚沢部川',
      // 鵡川水系
      '��珠別川', '穂別川', 'ルベシベ川',
      // 沙流川水系
      '額平川', 'パンケヌーシ川', 'ペンケヌーシ川', '千呂露川', '二風谷川',
      // 日高地方
      '門別川', '厚賀川', '慶能舞川', 'ペテガリ川', '妹背牛川'
    ];

    let successCount = 0;
    
    for (let i = 0; i < hokkaidoRivers.length && i < 107; i++) {
      const riverId = i + 94;
      const riverData = {
        id: riverId.toString(),
        name: hokkaidoRivers[i],
        region: 'hokkaido',
        prefecture: '北海道',
        length: Math.floor(Math.random() * 80) + 20, // 20-100km
        waterLevel: parseFloat((Math.random() * 3 + 1).toFixed(2)), // 1.00-4.00m
        warningLevel: 5.20,
        currentStatus: 'normal' as const,
        cameras: [],
        weather: []
      };

      await kv.set(`river:${riverId}`, riverData);
      successCount++;
    }

    console.log(`Successfully added ${successCount} Hokkaido rivers (ID: 94-${93 + successCount})`);
    return c.json({ 
      success: true, 
      message: `北海道の川${successCount}件を追加しました（ID: 94-${93 + successCount}）`,
      count: successCount
    });
  } catch (error) {
    console.error('Error adding Hokkaido rivers batch 1:', error);
    return c.json({ error: 'Failed to add Hokkaido rivers' }, 500);
  }
});

// 全国45都道府県（北海道・長野以外）の川を復元するエンドポイント（ID 299〜）
app.post("/make-server-5f24a873/restore-all-prefectures", async (c) => {
  try {
    const rivers = [
      // 青森県
      { name: '���木川', pref: '青森県', region: 'tohoku' }, { name: '馬淵川', pref: '青森県', region: 'tohoku' },
      { name: '奥入瀬川', pref: '青森県', region: 'tohoku' }, { name: '新井田川', pref: '青森県', region: 'tohoku' },
      // 岩手県
      { name: '北上川', pref: '岩手県', region: 'tohoku' }, { name: '雫石川', pref: '岩手県', region: 'tohoku' },
      { name: '中津川', pref: '岩手県', region: 'tohoku' }, { name: '猿ヶ石川', pref: '岩手県', region: 'tohoku' },
      // 宮城県
      { name: '北上川', pref: '宮城県', region: 'tohoku' }, { name: '名取川', pref: '宮城県', region: 'tohoku' },
      { name: '広瀬川', pref: '宮城県', region: 'tohoku' }, { name: '阿武隈川', pref: '宮城県', region: 'tohoku' },
      // 秋田県
      { name: '米���川', pref: '秋田県', region: 'tohoku' }, { name: '雄物川', pref: '秋田県', region: 'tohoku' },
      { name: '子��川', pref: '秋田県', region: 'tohoku' }, { name: '玉川', pref: '秋田県', region: 'tohoku' },
      // 山形県
      { name: '最上川', pref: '山形県', region: 'tohoku' }, { name: '置賜白川', pref: '山形県', region: 'tohoku' },
      { name: '丹生川', pref: '山形県', region: 'tohoku' }, { name: '小国���', pref: '山形県', region: 'tohoku' },
      // 福島県
      { name: '阿武隈川', pref: '福島県', region: 'tohoku' }, { name: '阿賀川', pref: '福島県', region: 'tohoku' },
      { name: '只見川', pref: '福島県', region: 'tohoku' }, { name: '夏井川', pref: '福島県', region: 'tohoku' },
      // 茨城県
      { name: '那珂川', pref: '茨城県', region: 'kanto' }, { name: '久慈川', pref: '茨城県', region: 'kanto' },
      { name: '小貝川', pref: '茨城県', region: 'kanto' }, { name: '鬼怒川', pref: '茨城県', region: 'kanto' },
      // 栃木県
      { name: '那珂川', pref: '栃木県', region: 'kanto' }, { name: '鬼怒川', pref: '栃木県', region: 'kanto' },
      { name: '渡良瀬川', pref: '栃木県', region: 'kanto' }, { name: '大谷川', pref: '栃木県', region: 'kanto' },
      // 群馬県
      { name: '利根川', pref: '群馬県', region: 'kanto' }, { name: '吾妻川', pref: '群馬県', region: 'kanto' },
      { name: '烏川', pref: '群馬県', region: 'kanto' }, { name: '神流川', pref: '群馬県', region: 'kanto' },
      // 埼玉県
      { name: '荒川', pref: '埼玉県', region: 'kanto' }, { name: '入間川', pref: '埼玉県', region: 'kanto' },
      { name: '高麗川', pref: '埼玉県', region: 'kanto' }, { name: '越辺川', pref: '埼玉県', region: 'kanto' },
      // 千葉県
      { name: '利根川', pref: '千葉県', region: 'kanto' }, { name: '江戸川', pref: '千葉県', region: 'kanto' },
      { name: '養老川', pref: '千葉県', region: 'kanto' }, { name: '小櫃川', pref: '千葉県', region: 'kanto' },
      // 東京都
      { name: '多摩川', pref: '東京都', region: 'kanto' }, { name: '荒川', pref: '東京都', region: 'kanto' },
      { name: '隅田川', pref: '東京都', region: 'kanto' }, { name: '神田川', pref: '東京都', region: 'kanto' },
      // 神奈��県
      { name: '相模��', pref: '神奈川県', region: 'kanto' }, { name: '酒匂川', pref: '神奈川県', region: 'kanto' },
      { name: '鶴見川', pref: '神奈川県', region: 'kanto' }, { name: '多摩川', pref: '神奈川県', region: 'kanto' },
      // 新潟県
      { name: '信濃川', pref: '新潟県', region: 'chubu' }, { name: '阿賀野川', pref: '新潟県', region: 'chubu' },
      { name: '魚野川', pref: '新潟県', region: 'chubu' }, { name: '関川', pref: '新潟県', region: 'chubu' },
      // ���山県
      { name: '神通川', pref: '富山県', region: 'chubu' }, { name: '常願寺川', pref: '富山県', region: 'chubu' },
      { name: '黒部川', pref: '富山県', region: 'chubu' }, { name: '庄川', pref: '富山県', region: 'chubu' },
      // 石川県
      { name: '手取川', pref: '石川県', region: 'chubu' }, { name: '梯川', pref: '石川県', region: 'chubu' },
      { name: '犀川', pref: '石川県', region: 'chubu' }, { name: '浅野川', pref: '石川県', region: 'chubu' },
      // 福井県
      { name: '九頭竜川', pref: '福井県', region: 'chubu' }, { name: '足羽川', pref: '福井県', region: 'chubu' },
      { name: '日野川', pref: '福井県', region: 'chubu' }, { name: '北川', pref: '福井県', region: 'chubu' },
      // 山梨県
      { name: '富士川', pref: '山梨県', region: 'chubu' }, { name: '釜無川', pref: '山梨県', region: 'chubu' },
      { name: '笛吹川', pref: '山梨県', region: 'chubu' }, { name: '桂川', pref: '山梨県', region: 'chubu' },
      // 岐阜県
      { name: '木曽川', pref: '岐阜県', region: 'chubu' }, { name: '長良川', pref: '岐阜県', region: 'chubu' },
      { name: '揖斐川', pref: '岐阜県', region: 'chubu' }, { name: '飛騨川', pref: '岐阜県', region: 'chubu' },
      // 静岡県
      { name: '富士川', pref: '静岡県', region: 'chubu' }, { name: '安倍川', pref: '静岡県', region: 'chubu' },
      { name: '大井川', pref: '静岡県', region: 'chubu' }, { name: '天竜川', pref: '静岡県', region: 'chubu' },
      // 愛知県
      { name: '木曽川', pref: '愛知県', region: 'chubu' }, { name: '矢作川', pref: '愛知県', region: 'chubu' },
      { name: '豊川', pref: '愛知県', region: 'chubu' }, { name: '庄内川', pref: '愛知県', region: 'chubu' },
      // 三重県
      { name: '木曽川', pref: '三重県', region: 'kinki' }, { name: '櫛田川', pref: '三重県', region: 'kinki' },
      { name: '宮川', pref: '三重県', region: 'kinki' }, { name: '雲出川', pref: '三��県', region: 'kinki' },
      // 滋賀県
      { name: '瀬田川', pref: '滋賀県', region: 'kinki' }, { name: '野洲川', pref: '滋賀県', region: 'kinki' },
      { name: '愛知川', pref: '滋賀県', region: 'kinki' }, { name: '姉川', pref: '滋賀県', region: 'kinki' },
      // 京都府
      { name: '淀川', pref: '京都府', region: 'kinki' }, { name: '桂川', pref: '京都府', region: 'kinki' },
      { name: '鴨川', pref: '京都府', region: 'kinki' }, { name: '宇治川', pref: '京都府', region: 'kinki' },
      // 大阪府
      { name: '淀川', pref: '大阪��', region: 'kinki' }, { name: '大和川', pref: '大阪府', region: 'kinki' },
      { name: '寝屋川', pref: '大阪府', region: 'kinki' }, { name: '石川', pref: '大阪府', region: 'kinki' },
      // 兵庫県
      { name: '加古川', pref: '兵庫県', region: 'kinki' }, { name: '揖保川', pref: '兵庫県', region: 'kinki' },
      { name: '武庫川', pref: '兵庫県', region: 'kinki' }, { name: '市川', pref: '兵庫県', region: 'kinki' },
      // 奈良県
      { name: '吉野川', pref: '奈良県', region: 'kinki' }, { name: '紀の川', pref: '奈良県', region: 'kinki' },
      { name: '大和川', pref: '奈良県', region: 'kinki' }, { name: '名張川', pref: '奈良県', region: 'kinki' },
      // 和歌山県
      { name: '紀の川', pref: '和歌山県', region: 'kinki' }, { name: '有田川', pref: '和歌山県', region: 'kinki' },
      { name: '日高川', pref: '和歌山県', region: 'kinki' }, { name: '熊野川', pref: '和歌山県', region: 'kinki' },
      // 鳥取県
      { name: '千代川', pref: '鳥取県', region: 'chugoku' }, { name: '天神川', pref: '鳥取県', region: 'chugoku' },
      { name: '日野川', pref: '鳥取県', region: 'chugoku' }, { name: '佐治川', pref: '鳥取県', region: 'chugoku' },
      // 島根県
      { name: '斐伊川', pref: '島根県', region: 'chugoku' }, { name: '江の川', pref: '島根���', region: 'chugoku' },
      { name: '高津川', pref: '島根県', region: 'chugoku' }, { name: '神戸川', pref: '島根県', region: 'chugoku' },
      // 岡山県
      { name: '旭川', pref: '岡山県', region: 'chugoku' }, { name: '吉井川', pref: '岡山県', region: 'chugoku' },
      { name: '高梁川', pref: '岡山県', region: 'chugoku' }, { name: '百間川', pref: '岡山県', region: 'chugoku' },
      // 広島県
      { name: '太田川', pref: '広島県', region: 'chugoku' }, { name: '江の川', pref: '広島県', region: 'chugoku' },
      { name: '芦田川', pref: '広島県', region: 'chugoku' }, { name: '沼田川', pref: '広島県', region: 'chugoku' },
      // 山口県
      { name: '錦川', pref: '山口県', region: 'chugoku' }, { name: '佐波川', pref: '山口県', region: 'chugoku' },
      { name: '小瀬川', pref: '山口県', region: 'chugoku' }, { name: '椹野川', pref: '山口県', region: 'chugoku' },
      // 徳島県
      { name: '吉野川', pref: '徳島県', region: 'shikoku' }, { name: '那賀川', pref: '徳島県', region: 'shikoku' },
      { name: '勝浦川', pref: '徳島県', region: 'shikoku' }, { name: '鮎喰川', pref: '徳島県', region: 'shikoku' },
      // 香川県
      { name: '土器川', pref: '香川県', region: 'shikoku' }, { name: '綾川', pref: '香川県', region: 'shikoku' },
      { name: '香東川', pref: '香川県', region: 'shikoku' }, { name: '大束川', pref: '香川県', region: 'shikoku' },
      // 愛媛県
      { name: '重信川', pref: '愛媛県', region: 'shikoku' }, { name: '肱川', pref: '愛媛県', region: 'shikoku' },
      { name: '仁淀川', pref: '愛媛県', region: 'shikoku' }, { name: '加茂川', pref: '愛媛県', region: 'shikoku' },
      // 高知県
      { name: '四万十川', pref: '高知県', region: 'shikoku' }, { name: '仁淀川', pref: '高知県', region: 'shikoku' },
      { name: '物部川', pref: '高知県', region: 'shikoku' }, { name: '安田川', pref: '高知県', region: 'shikoku' },
      // 福岡県
      { name: '筑後川', pref: '福岡県', region: 'kyushu' }, { name: '遠賀川', pref: '福岡県', region: 'kyushu' },
      { name: '矢部川', pref: '福岡県', region: 'kyushu' }, { name: '那珂川', pref: '福岡県', region: 'kyushu' },
      // 佐賀県
      { name: '筑後川', pref: '佐賀県', region: 'kyushu' }, { name: '嘉瀬川', pref: '佐賀県', region: 'kyushu' },
      { name: '六角川', pref: '佐賀県', region: 'kyushu' }, { name: '松浦川', pref: '佐賀県', region: 'kyushu' },
      // 長崎県
      { name: '本明川', pref: '長崎県', region: 'kyushu' }, { name: '郷川', pref: '長崎県', region: 'kyushu' },
      { name: '相浦川', pref: '長崎県', region: 'kyushu' }, { name: '佐々川', pref: '長崎県', region: 'kyushu' },
      // 熊本県
      { name: '白川', pref: '熊本県', region: 'kyushu' }, { name: '緑川', pref: '熊本県', region: 'kyushu' },
      { name: '菊池川', pref: '熊本県', region: 'kyushu' }, { name: '球磨川', pref: '熊本県', region: 'kyushu' },
      // 大分県
      { name: '大野川', pref: '大分県', region: 'kyushu' }, { name: '大分川', pref: '大分県', region: 'kyushu' },
      { name: '筑後川', pref: '大分県', region: 'kyushu' }, { name: '山国川', pref: '大分県', region: 'kyushu' },
      // 宮崎県
      { name: '大淀川', pref: '宮崎県', region: 'kyushu' }, { name: '小丸川', pref: '宮崎県', region: 'kyushu' },
      { name: '一ツ瀬川', pref: '宮崎県', region: 'kyushu' }, { name: '五ヶ瀬川', pref: '宮崎県', region: 'kyushu' },
      // 鹿児島県
      { name: '川内川', pref: '鹿児島県', region: 'kyushu' }, { name: '肝属川', pref: '鹿児島県', region: 'kyushu' },
      { name: '万之瀬川', pref: '鹿児島県', region: 'kyushu' }, { name: '雄川', pref: '鹿児島県', region: 'kyushu' },
      // 沖縄県
      { name: '比謝川', pref: '沖縄県', region: 'kyushu' }, { name: '国場川', pref: '沖縄県', region: 'kyushu' },
      { name: '安里川', pref: '沖縄県', region: 'kyushu' }, { name: '与那覇川', pref: '��縄県', region: 'kyushu' },
    ];

    let successCount = 0;
    let startId = 299;

    for (const r of rivers) {
      const riverData = {
        id: startId.toString(),
        name: r.name,
        region: r.region,
        prefecture: r.pref,
        length: Math.floor(Math.random() * 80) + 20,
        waterLevel: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        warningLevel: 5.20,
        currentStatus: 'normal' as const,
        cameras: [],
        weather: []
      };

      await kv.set(`river:${startId}`, riverData);
      successCount++;
      startId++;
    }

    console.log(`Successfully restored ${successCount} rivers from 45 prefectures`);
    return c.json({ 
      success: true, 
      message: `全国45都道府県の川${successCount}件を復元しました`,
      count: successCount
    });
  } catch (error) {
    console.error('Error restoring all prefectures:', error);
    return c.json({ error: 'Failed to restore rivers' }, 500);
  }
});

// ライブカメラ画像プロキシエンドポイント（テスト用）
app.get("/make-server-5f24a873/camera-proxy", async (c) => {
  try {
    const cameraId = c.req.query('cameraId');
    
    console.log('=== Camera Proxy Request ===');
    console.log('Camera ID:', cameraId);
    
    if (!cameraId) {
      return c.json({ error: 'Camera ID is required' }, 400);
    }

    // 国土交通省のカメラ画像URL（実際のURLは異なる可能性があります）
    // 例: https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303050101100010
    const cameraUrl = `https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=${cameraId}`;
    
    console.log('Fetching camera image from:', cameraUrl);
    
    // カメラページをフェッチ
    const response = await fetch(cameraUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('Camera response status:', response.status);

    if (!response.ok) {
      console.error(`Camera fetch error: ${response.status}`);
      return c.json({ 
        error: 'Failed to fetch camera image', 
        status: response.status,
        cameraUrl 
      }, response.status);
    }

    const html = await response.text();
    console.log('HTML length:', html.length);
    
    // HTMLから実際の画像URLを抽出する（簡易的な実装���
    // 実際のURLパターンは検証が必要
    const imageUrlMatch = html.match(/src=["']([^"']*\.jpg[^"']*)["']/i) || 
                          html.match(/src=["']([^"']*\.jpeg[^"']*)["']/i) ||
                          html.match(/src=["']([^"']*image[^"']*)["']/i);
    
    if (imageUrlMatch && imageUrlMatch[1]) {
      let imageUrl = imageUrlMatch[1];
      
      // 相対URLの場合は絶対URLに変換
      if (imageUrl.startsWith('/')) {
        imageUrl = `https://www.river.go.jp${imageUrl}`;
      } else if (imageUrl.startsWith('../')) {
        imageUrl = `https://www.river.go.jp/kawabou/${imageUrl.replace('../', '')}`;
      } else if (!imageUrl.startsWith('http')) {
        imageUrl = `https://www.river.go.jp/kawabou/${imageUrl}`;
      }
      
      console.log('Found image URL:', imageUrl);
      
      // 画像を直接フェッチして返す
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': cameraUrl,
        },
      });
      
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        
        return new Response(imageBlob, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=60', // 1分キャッシュ
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        console.error('Image fetch failed:', imageResponse.status);
        return c.json({ 
          error: 'Failed to fetch image', 
          imageUrl,
          status: imageResponse.status 
        }, 500);
      }
    } else {
      console.log('No image URL found in HTML');
      console.log('HTML snippet:', html.substring(0, 500));
      
      return c.json({ 
        error: 'Could not extract image URL from camera page',
        cameraUrl,
        htmlLength: html.length
      }, 500);
    }
  } catch (error) {
    console.error('Error in camera proxy:', error);
    return c.json({ 
      error: 'Internal server error in camera proxy', 
      details: String(error) 
    }, 500);
  }
});

// 国土交通省の川の防災情報APIから河川データを取得（公式API利用）
app.get("/make-server-5f24a873/river-api-test", async (c) => {
  try {
    const riverName = c.req.query('riverName') || '利根川';
    
    console.log('=== River API Test ===');
    console.log('River Name:', riverName);
    
    // 国土交通省のリアルタイム川情報API
    // 実際のエンドポイントは以下のようなものがあります：
    const apiEndpoints = [
      {
        name: '水文水質データベース',
        url: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe',
        description: '水位・雨量データ'
      },
      {
        name: 'XRAIN (高解像度降水ナウキャスト)',
        url: 'https://www.river.go.jp/x/xmn0107010.php',
        description: 'リアルタイム雨量データ'
      }
    ];
    
    // テスト: 利根川水系の観測所データを取得
    // 実際のAPIエンドポイントをテスト
    const testResults = [];
    
    // 1. 川の防災情報ポータルのAPIをテスト
    try {
      // XMLフィードの例
      const xmlUrl = 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303051283904020&KIND=1&PAGE=0';
      console.log('Testing XML feed:', xmlUrl);
      
      const response = await fetch(xmlUrl);
      const data = await response.text();
      
      testResults.push({
        endpoint: 'XML水位データフィード',
        status: response.status,
        contentType: response.headers.get('content-type'),
        dataLength: data.length,
        sample: data.substring(0, 500)
      });
    } catch (error) {
      testResults.push({
        endpoint: 'XML水位データフィード',
        error: String(error)
      });
    }
    
    return c.json({
      message: '国土交通省 川の防災情報API テスト',
      riverName,
      availableApis: apiEndpoints,
      testResults,
      notes: [
        '国土交通省は公式APIとしてXML/JSONフィードを提供しています',
        'これらのAPIは利用規約に従って使用可能です',
        'スクレイピングではなく公式APIを使用することを推奨します',
        '観測所IDが必要な場合があります'
      ]
    });
  } catch (error) {
    console.error('Error in river API test:', error);
    return c.json({ 
      error: 'Internal server error in river API test', 
      details: String(error) 
    }, 500);
  }
});

// 国土交通省の河川カメラ情報API（公式��ータ利用）
app.get("/make-server-5f24a873/river-cameras", async (c) => {
  try {
    const riverName = c.req.query('riverName');
    const prefecture = c.req.query('prefecture');
    
    console.log('=== River Cameras API Request ===');
    console.log('River Name:', riverName);
    console.log('Prefecture:', prefecture);
    
    if (!riverName) {
      return c.json({ error: 'River name is required' }, 400);
    }
    
    // 国土交通省のオープンデータ / APIから河川カメラ情報を取得
    // 実装例：地方整備局ごとのAPIエンドポイント
    
    // 主要河川のカメラ情報（サンプル実装）
    // 実際の運用では国土交通省の公式APIやオープンデータカタログから取得
    const riverCameraDatabase: { [key: string]: any[] } = {
      '利根川': [
        {
          id: '0303050101100010',
          name: '栗橋観測所',
          location: '埼玉県久喜市',
          imageUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303050101100010',
          lastUpdated: '10分前',
          lat: 36.1288,
          lon: 139.6645
        },
        {
          id: '0303050101100020',
          name: '取手観����',
          location: '茨城県取手市',
          imageUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303050101100020',
          lastUpdated: '10分前',
          lat: 35.9087,
          lon: 140.0531
        }
      ],
      '荒川': [
        {
          id: '0303060101100010',
          name: '治水橋',
          location: '東京都北区',
          imageUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303060101100010',
          lastUpdated: '10分前',
          lat: 35.7681,
          lon: 139.7339
        }
      ],
      '千曲川': [
        {
          id: '0203040101100010',
          name: '立ヶ花観測所',
          location: '長野県中野市',
          imageUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0203040101100010',
          lastUpdated: '10分前',
          lat: 36.7803,
          lon: 138.3664
        }
      ]
    };
    
    const cameras = riverCameraDatabase[riverName] || [];
    
    return c.json({
      riverName,
      prefecture,
      cameraCount: cameras.length,
      cameras,
      source: '国土交通省 川の防災情報',
      notes: [
        'このデータは国土交通省の公開情報に基づいています',
        '実際の運用では公式APIまたはオープンデータカタログから取得します',
        'カメラIDは観測所IDに対応しています'
      ]
    });
  } catch (error) {
    console.error('Error fetching river cameras:', error);
    return c.json({ 
      error: 'Internal server error while fetching river cameras', 
      details: String(error) 
    }, 500);
  }
});

// DPFデータキャッシュ（1時間有効）
let dpfDataCache: {
  data: RiverObservationMetadata[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 60 * 60 * 1000; // 1時間

/**
 * DPF GraphQL APIからデータを取得（キャッシュ付き）
 */
async function getDPFData(): Promise<RiverObservationMetadata[]> {
  const now = Date.now();
  
  // キャッシュが有効な場合は返す
  if (dpfDataCache.data && (now - dpfDataCache.timestamp) < CACHE_DURATION) {
    console.log('Using cached DPF data');
    return dpfDataCache.data;
  }
  
  console.log('Fetching fresh DPF data...');
  try {
    const data = await fetchAllRiverObservations();
    dpfDataCache.data = data;
    dpfDataCache.timestamp = now;
    console.log(`Cached ${data.length} observation stations`);
    return data;
  } catch (error) {
    // 403エラーの場合は静かに失敗させる
    const errorMessage = String(error);
    if (errorMessage.includes('DPF_API_ACCESS_DENIED') || errorMessage.includes('403')) {
      console.warn('DPF API access denied - using fallback data source');
    } else {
      console.error('Failed to fetch DPF data:', error);
    }
    
    // キャッシュがあれば古くても返す
    if (dpfDataCache.data) {
      console.log('Returning stale cache due to error');
      return dpfDataCache.data;
    }
    throw error;
  }
}

// 新しいAPIエンドポイント: DPF GraphQL APIで観測所情報を取得
app.get("/make-server-5f24a873/river-observations/:riverName", async (c) => {
  try {
    const riverName = c.req.param('riverName');
    
    console.log('=== River Observations Request (DPF GraphQL) ===');
    console.log('River Name:', riverName);
    
    // DPF GraphQL APIからデータ取得を試みる
    try {
      const allObservations = await getDPFData();
      const observations = filterByRiverName(allObservations, riverName);
      
      console.log(`Found ${observations.length} observation stations for ${riverName}`);
      
      // カメラ情報を抽出
      const cameras = observations.map(extractCameraInfo);
      
      // 最初の観測所の緯度経度で天気予報を取得
      let weatherData = [];
      let currentWeather = null;
      
      if (observations.length > 0) {
        const firstObs = observations[0];
        if (firstObs.latitude && firstObs.longitude) {
          try {
            console.log(`Fetching weather for lat=${firstObs.latitude}, lon=${firstObs.longitude}`);
            weatherData = await getWeatherForecast(firstObs.latitude, firstObs.longitude);
            currentWeather = await getCurrentWeather(firstObs.latitude, firstObs.longitude);
          } catch (error) {
            console.error('Weather fetch error:', error);
          }
        }
      }
    
      return c.json({
        riverName,
        hasData: observations.length > 0,
        observationCount: observations.length,
        cameraCount: cameras.length,
        observations: observations.map(obs => ({
          id: obs.id,
          title: obs.title,
          riverName: obs.riverName,
          observationPlaceName: obs.observationPlaceName,
          prefecture: obs.prefecture,
          municipalityName: obs.municipalityName,
          latitude: obs.latitude,
          longitude: obs.longitude,
          lastUpdateDateTime: obs.lastUpdateDateTime,
          url: obs.url,
          cameraUrl: obs.cameraUrl,
          hasCameraUrl: !!obs.cameraUrl || !!obs.url
        })),
        cameras: cameras.map(cam => ({
          id: cam.id,
          name: cam.name,
          location: cam.location,
          lat: cam.lat,
          lon: cam.lon,
          imageUrl: cam.imageUrl,
          detailUrl: cam.detailUrl,
          cameraUrl: cam.detailUrl,
          hasCameraUrl: !!cam.imageUrl || !!cam.detailUrl,
          lastUpdated: cam.lastUpdated || '最新'
        })),
        weather: weatherData,
        currentWeather: currentWeather,
        source: '��土交通省データプラットフォーム (GraphQL API)',
        apiEndpoint: 'DPF GraphQL API',
        totalStations: allObservations.length
      });
      
    } catch (dpfError) {
      // DPF APIエラーの場合、川名から緯度経度を取得して天気予報を返す
      const errorMessage = String(dpfError);
      if (errorMessage.includes('DPF_API_ACCESS_DENIED') || errorMessage.includes('403')) {
        console.warn('DPF API access denied, using coordinates fallback');
      } else {
        console.error('DPF API failed, trying coordinates fallback:', dpfError);
      }
      
      // 川名から緯度経度を取得
      const coords = getRiverCoordinates(riverName);
      let weatherData = [];
      let currentWeather = null;
      
      if (coords) {
        try {
          console.log(`Using fallback coordinates for ${riverName}: lat=${coords.lat}, lon=${coords.lon}`);
          weatherData = await getWeatherForecast(coords.lat, coords.lon);
          currentWeather = await getCurrentWeather(coords.lat, coords.lon);
          
          return c.json({
            riverName,
            hasData: true,
            observationCount: 0,
            cameraCount: 0,
            observations: [],
            cameras: [],
            weather: weatherData,
            currentWeather: currentWeather,
            source: '天気予報データ��緯度経度マッピング）',
            apiEndpoint: 'OpenWeather API (Coordinates Fallback)',
            note: 'DPF APIが利用できないため、川の代表地点の天気予報を表示しています'
          });
        } catch (weatherError) {
          console.error('Weather API also failed:', weatherError);
        }
      }
      
      return c.json({
        riverName,
        hasData: false,
        observationCount: 0,
        cameraCount: 0,
        observations: [],
        cameras: [],
        weather: [],
        currentWeather: null,
        source: 'DPF API Error - Check API key configuration',
        apiEndpoint: 'DPF GraphQL API (Failed)',
        error: String(dpfError)
      });
    }
  } catch (error) {
    console.error('Error in river observations endpoint:', error);
    return c.json({ 
      error: 'Internal server error while fetching river observations', 
      details: String(error),
      riverName: c.req.param('riverName')
    }, 500);
  }
});

// 既存のスクレイピングエンドポイント（フォールバック用に保持）
app.get("/make-server-5f24a873/river-info/:riverName", async (c) => {
  try {
    const riverName = c.req.param('riverName');
    
    console.log('=== River Info Request (Web Scraping) ===');
    console.log('River Name:', riverName);
    
    // HTMLスクレイピングでデータ取得
    const { cameras, stations, source } = await getRiverCameraInfo(riverName);
    
    console.log(`Data source: ${source}`);
    console.log(`Found ${cameras.length} cameras, ${stations.length} stations`);
    
    return c.json({
      riverName,
      hasData: cameras.length > 0 || stations.length > 0,
      cameraCount: cameras.length,
      stationCount: stations.length,
      cameras: cameras.map(cam => ({
        id: cam.id,
        name: cam.name,
        location: cam.location,
        imageUrl: cam.imageUrl,
        detailUrl: cam.detailUrl,
        cameraUrl: cam.detailUrl, // フロントエンド互換��のため
        hasCameraUrl: true,
        lastUpdated: cam.lastUpdated || '最新'
      })),
      stations: stations.map(s => ({
        ...s,
        hasCameraUrl: s.hasCamera,
        hasWaterLevelUrl: s.hasWaterLevel
      })),
      source: `国土交通省 川の防災情報 (${source})`,
      apiEndpoint: 'HTML Scraping'
    });
  } catch (error) {
    console.error('Error fetching river info:', error);
    return c.json({ 
      error: 'Internal server error while fetching river info', 
      details: String(error),
      riverName
    }, 500);
  }
});

// 新しいAPIエンドポイント: 水位データをリアルタイム取得
app.get("/make-server-5f24a873/water-level/:stationId", async (c) => {
  try {
    const stationId = c.req.param('stationId');
    
    console.log('=== Water Level Request ===');
    console.log('Station ID:', stationId);
    
    const station = findStationById(stationId);
    
    if (!station) {
      return c.json({ error: '観測所が見つかりません' }, 404);
    }
    
    if (!station.waterLevelUrl) {
      return c.json({ 
        error: 'この観測所には水位データURLが登録されていません',
        station: station.stationName 
      }, 404);
    }
    
    // 国土交通省APIから水位データを取得
    try {
      const response = await fetch(station.waterLevelUrl);
      const htmlText = await response.text();
      
      // HTMLから水位デー���を抽出（簡易的な実装）
      // 実際のHTMLの構造に応じて調整が必要
      const waterLevelMatch = htmlText.match(/水位[：:]\s*([0-9.]+)\s*m/i);
      const waterLevel = waterLevelMatch ? parseFloat(waterLevelMatch[1]) : null;
      
      // 時刻データの抽出
      const timeMatch = htmlText.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
      const observedAt = timeMatch 
        ? `${timeMatch[1]}-${timeMatch[2]}-${timeMatch[3]}T${timeMatch[4]}:${timeMatch[5]}:00`
        : null;
      
      return c.json({
        stationId,
        stationName: station.stationName,
        riverName: station.riverName,
        prefecture: station.prefecture,
        waterLevel,
        observedAt,
        dataUrl: station.waterLevelUrl,
        source: '国土交通省 水文水質データベース',
        note: waterLevel === null ? 'データの解析に失敗しました。HTMLの構造が変更された可能性があります。' : undefined
      });
    } catch (fetchError) {
      console.error('Error fetching water level data:', fetchError);
      return c.json({ 
        error: '水位データの取得に失敗しました', 
        details: String(fetchError),
        dataUrl: station.waterLevelUrl
      }, 500);
    }
  } catch (error) {
    console.error('Error in water level endpoint:', error);
    return c.json({ 
      error: 'Internal server error', 
      details: String(error) 
    }, 500);
  }
});

// DPF GraphQL API スキーマ確認エンドポイント（デバッグ用）
app.get("/make-server-5f24a873/test-dpf-schema", async (c) => {
  try {
    console.log('=== Testing DPF API Schema ===');
    
    const apiKey = Deno.env.get('DPF_API_KEY');
    if (!apiKey) {
      return c.json({ success: false, error: 'DPF_API_KEY not configured' }, 500);
    }
    
    console.log(`API Key: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);
    
    // GraphQL Introspection query
    const introspectionQuery = `
      query {
        __schema {
          queryType {
            name
            fields {
              name
              description
            }
          }
        }
      }
    `;
    
    const testPatterns = [
      { name: 'X-Dpf-Api-Key', headers: { 'X-Dpf-Api-Key': apiKey } },
      { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${apiKey}` } },
    ];
    
    const results = [];
    
    for (const pattern of testPatterns) {
      console.log(`\nTesting pattern: ${pattern.name}`);
      
      try {
        const response = await fetch('https://www.mlit-data.jp/api/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...pattern.headers,
          },
          body: JSON.stringify({ query: introspectionQuery }),
        });
        
        const responseText = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${responseText.substring(0, 500)}`);
        
        results.push({
          pattern: pattern.name,
          status: response.status,
          statusText: response.statusText,
          response: responseText.substring(0, 1000),
          headers: Object.fromEntries(response.headers.entries()),
        });
      } catch (error) {
        results.push({
          pattern: pattern.name,
          error: String(error),
        });
      }
    }
    
    return c.json({ success: true, results });
  } catch (error) {
    console.error('Error testing DPF schema:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DPF GraphQL API 直接テストエンドポイント（デバッグ用）
app.post("/make-server-5f24a873/test-dpf-direct", async (c) => {
  try {
    const body = await c.req.json();
    const { endpoint, authHeader, query } = body;
    
    const apiKey = Deno.env.get('DPF_API_KEY');
    if (!apiKey) {
      return c.json({ success: false, error: 'DPF_API_KEY not configured' }, 500);
    }
    
    console.log('=== DPF API Direct Test ===');
    console.log('Endpoint:', endpoint);
    console.log('Auth Header:', authHeader);
    console.log('API Key:', apiKey.substring(0, 10) + '... (length: ' + apiKey.length + ')');
    console.log('Query:', query);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // ヘッダー名に基づいて認証情報を追加
    if (authHeader === 'Authorization') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      headers[authHeader] = apiKey;
    }
    
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    
    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });
    const duration = Date.now() - startTime;
    
    const responseText = await response.text();
    console.log(`Response received in ${duration}ms`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.log('Response body (first 1000 chars):', responseText.substring(0, 1000));
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = responseText;
    }
    
    return c.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration,
      headers: Object.fromEntries(response.headers.entries()),
      response: parsedResponse,
      rawResponse: responseText.substring(0, 2000),
    });
  } catch (error) {
    console.error('Error in direct test:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DPF GraphQL APIから川のリストを生成・保存するエンドポイント
app.post("/make-server-5f24a873/sync-rivers-from-dpf", async (c) => {
  const overallStartTime = Date.now();
  
  try {
    console.log('=== Starting DPF River Sync ===');
    console.log(`Start time: ${new Date().toISOString()}`);
    console.log('⚠️ Supabase Function timeout limit: 60 seconds');
    
    // DPF GraphQL APIから観測所データを取得
    const fetchStartTime = Date.now();
    console.log('Step 1: Fetching data from DPF API...');
    const dpfData = await getDPFData();
    const fetchDuration = Date.now() - fetchStartTime;
    const elapsedSoFar = Date.now() - overallStartTime;
    console.log(`✅ Step 1 completed in ${fetchDuration}ms (elapsed: ${elapsedSoFar}ms / 60000ms)`);
    console.log(`Fetched ${dpfData.length} observation stations from DPF API`);
    
    // 60秒制限チェック
    if (elapsedSoFar > 50000) {
      console.warn(`⚠️ WARNING: Already ${elapsedSoFar}ms elapsed. Approaching 60s timeout!`);
    }
    
    if (dpfData.length === 0) {
      return c.json({ 
        success: false, 
        message: 'DPF APIからデータを取得できませんでした',
        count: 0 
      });
    }
    
    // 河川名でグループ化
    const groupStartTime = Date.now();
    console.log('Step 2: Grouping rivers by name and prefecture...');
    const riverMap = new Map<string, {
      name: string;
      prefecture: string;
      region: string;
      observationCount: number;
      stations: RiverObservationMetadata[];
    }>();
    
    // 都道府県別のカウントをログ出力
    const prefectureCount = new Map<string, number>();
    
    for (const station of dpfData) {
      const riverName = station.riverName;
      const prefecture = station.prefecture;
      
      // 都道府県ごとのカウント
      if (prefecture && prefecture !== '不明') {
        prefectureCount.set(prefecture, (prefectureCount.get(prefecture) || 0) + 1);
      }
      
      if (!riverName || riverName === '不明' || !prefecture) {
        continue;
      }
      
      // 河川名+都道府県で一意のキーを作成（同じ川が複数の県にまたがる場合を考慮）
      const key = `${riverName}_${prefecture}`;
      
      if (!riverMap.has(key)) {
        riverMap.set(key, {
          name: riverName,
          prefecture: prefecture,
          region: getPrefectureRegion(prefecture),
          observationCount: 0,
          stations: []
        });
      }
      
      const river = riverMap.get(key)!;
      river.observationCount++;
      river.stations.push(station);
    }
    
    // 都道府県別のカウントをログ出力
    console.log('\n=== Prefecture observation station count ===');
    const sortedPrefectures = Array.from(prefectureCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // 上位20件のみ表示
    for (const [pref, count] of sortedPrefectures) {
      console.log(`${pref}: ${count} observation stations`);
    }
    console.log('===\n');
    
    // 山梨県のデータを詳しく確認
    console.log('=== Yamanashi Prefecture Detail ===');
    const yamanashiStations = dpfData.filter(s => s.prefecture === '山梨県');
    console.log(`山梨県の観測所数: ${yamanashiStations.length}`);
    const yamanashiRivers = Array.from(riverMap.values())
      .filter(r => r.prefecture === '山梨県');
    console.log(`山梨県の川の数: ${yamanashiRivers.length}`);
    console.log('山梨県の川リスト:');
    for (const river of yamanashiRivers) {
      console.log(`  - ${river.name} (観測所: ${river.observationCount})`);
    }
    console.log('===\n');
    
    const groupDuration = Date.now() - groupStartTime;
    const elapsedAfterGroup = Date.now() - overallStartTime;
    console.log(`✅ Step 2 completed in ${groupDuration}ms (elapsed: ${elapsedAfterGroup}ms / 60000ms)`);
    console.log(`Grouped into ${riverMap.size} unique rivers`);
    
    // 60秒制限チェック
    if (elapsedAfterGroup > 50000) {
      console.warn(`⚠️ WARNING: Already ${elapsedAfterGroup}ms elapsed. Approaching 60s timeout!`);
    }
    
    // データベースに保存
    const dbStartTime = Date.now();
    console.log('Step 3: Saving to database...');
    let successCount = 0;
    let riverId = 1;
    
    // 既存のデータをクリア（バッチ削除で高速化）
    console.log('Step 3a: Clearing existing river data...');
    const clearStartTime = Date.now();
    const existingRivers = await kv.getByPrefix('river:');
    if (existingRivers.length > 0) {
      const keysToDelete = existingRivers.map(r => `river:${r.id}`);
      await kv.mdel(keysToDelete); // バッチ削除
    }
    const clearDuration = Date.now() - clearStartTime;
    const elapsedAfterClear = Date.now() - overallStartTime;
    console.log(`Cleared ${existingRivers.length} existing rivers in ${clearDuration}ms (elapsed: ${elapsedAfterClear}ms / 60000ms)`);
    
    // 新しいデータを保存（バッチ保存で高速化）
    console.log('Step 3b: Saving new river data...');
    const saveStartTime = Date.now();
    const keys: string[] = [];
    const values: any[] = [];
    
    for (const [key, riverData] of riverMap.entries()) {
      const riverRecord = {
        id: riverId.toString(),
        name: riverData.name,
        region: riverData.region,
        prefecture: riverData.prefecture,
        length: Math.floor(Math.random() * 80) + 20, // 20-100km (仮のデータ)
        waterLevel: parseFloat((Math.random() * 3 + 1).toFixed(2)), // 1.00-4.00m (仮のデータ)
        warningLevel: 5.20,
        currentStatus: 'normal' as const,
        cameras: [],
        weather: [],
        dataSource: 'dpf' as const, // ✅ DPF APIから取得したデータ
        scale: detectRiverScale(riverData.name), // ✅ 川の規模を自動判定
        observationCount: riverData.observationCount, // 観測所の数を追加
        dpfStations: riverData.stations.map(s => ({
          id: s.id,
          name: s.observationPlaceName,
          lat: s.latitude,
          lon: s.longitude
        }))
      };
      
      keys.push(`river:${riverId}`);
      values.push(riverRecord);
      successCount++;
      riverId++;
    }
    
    // バッチ保存実行
    console.log(`Batch saving ${keys.length} rivers...`);
    await kv.mset(keys, values);
    
    const saveDuration = Date.now() - saveStartTime;
    const dbDuration = Date.now() - dbStartTime;
    const elapsedAfterDB = Date.now() - overallStartTime;
    console.log(`✅ Step 3 completed in ${dbDuration}ms (clear: ${clearDuration}ms, save: ${saveDuration}ms)`);
    console.log(`Elapsed time after DB: ${elapsedAfterDB}ms / 60000ms`);
    
    const overallDuration = Date.now() - overallStartTime;
    console.log(`\n=== DPF River Sync Complete ===`);
    console.log(`Successfully synced ${successCount} rivers from DPF API`);
    console.log(`⏱️ Total execution time: ${overallDuration}ms`);
    console.log(`  - Fetch DPF data: ${fetchDuration}ms (${((fetchDuration / overallDuration) * 100).toFixed(1)}%)`);
    console.log(`  - Group by river: ${groupDuration}ms (${((groupDuration / overallDuration) * 100).toFixed(1)}%)`);
    console.log(`  - Database operations: ${dbDuration}ms (${((dbDuration / overallDuration) * 100).toFixed(1)}%)`);
    console.log(`End time: ${new Date().toISOString()}`);
    
    return c.json({ 
      success: true, 
      message: `DPF APIから${successCount}件の��を同期しました`,
      count: successCount,
      observationStations: dpfData.length,
      timing: {
        total: overallDuration,
        fetch: fetchDuration,
        group: groupDuration,
        database: dbDuration,
      }
    });
    
  } catch (error) {
    const overallDuration = Date.now() - overallStartTime;
    
    // 詳細なエラーログを出力
    const errorMessage = String(error);
    console.error('=== DPF API Sync Error Details ===');
    console.error(`Failed after ${overallDuration}ms`);
    console.error('Error message:', errorMessage);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (errorMessage.includes('DPF_API_ACCESS_DENIED') || errorMessage.includes('403')) {
      console.warn('⚠️ DPF API sync failed: Access denied (403)');
    } else {
      console.error('Error syncing rivers from DPF:', error);
    }
    
    // エラーの詳細を判定
    let userMessage = 'DPF APIからデータを取得できませんでした';
    let errorCode = 'UNKNOWN_ERROR';
    let suggestions: string[] = [];
    
    if (errorMessage.includes('DPF_API_ACCESS_DENIED') || errorMessage.includes('403')) {
      userMessage = 'DPF APIへのアクセスが拒否されました（403 Forbidden）';
      errorCode = 'DPF_API_ACCESS_DENIED';
      suggestions = [
        '国土交通省データプラットフォーム（DPF）のAPIキーが無効または期限切れの可能性があります',
        'APIキーに観測所データ（hwq/hwq_stage）へのアクセス権限が付与されていない可能性があります',
        '代わりに「データベースを復元」ボタンをクリックして、事前に登録された約350件の川データを使用してください'
      ];
    } else if (errorMessage.includes('DPF_API_KEY is not set')) {
      userMessage = 'DPF APIキーが設定されていません。';
      errorCode = 'API_KEY_MISSING';
      suggestions = [
        '環境変数 DPF_API_KEY が設定されていません',
        '管理画面でAPIキーを設定してください'
      ];
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      userMessage = 'ネットワークエラーまたはDPF APIへの接続に失敗しまし���。';
      errorCode = 'NETWORK_ERROR';
      suggestions = [
        'DPF APIエンドポイント (https://www.mlit-data.jp/api/v1/graphql) への接続に失敗しました',
        'インターネット接続を確認してください',
        'DPF APIサービスが正常に稼働しているか確認してください',
        'ファイアウォールやプロキシ設定を確認してください'
      ];
    }
    
    return c.json({ 
      success: false,
      error: userMessage, 
      errorCode: errorCode,
      suggestions: suggestions,
      details: String(error),
      rawError: errorMessage
    }, 500);
  }
});

// 手動で川を追加するエンドポイント
app.post("/make-server-5f24a873/add-manual-river", addManualRiver);

// CSVから複数の川を一括登録するエンドポイント
app.post("/make-server-5f24a873/add-rivers-bulk", addRiversBulk);

// CSVファイルから複数の川を一括登録するエンドポイント（新）
app.post("/make-server-5f24a873/rivers/bulk-upload", async (c) => {
  try {
    console.log('=== CSV Bulk Upload Started ===');
    
    // FormDataを取得
    const formData = await c.req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return c.json({
        success: false,
        error: 'CSVファイルが見つかりません'
      }, 400);
    }
    
    console.log('File received:', file.name, file.size, 'bytes');
    
    // CSVファイルを読み込む
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    console.log('Total lines:', lines.length);
    
    if (lines.length === 0) {
      return c.json({
        success: false,
        error: 'CSVファイルが空です'
      }, 400);
    }
    
    // 既存の川の数を取得してIDを決定
    // 毎回既存の川をスキャンして正確なmaxIdを取得（重複防止のため）
    console.log('🔍 Fetching existing rivers to determine max ID...');
    const existingRivers = await kv.getByPrefix('river:');
    let maxId = existingRivers.reduce((max, river) => {
      const id = parseInt(river.id);
      return id > max ? id : max;
    }, 0);
    console.log(`📌 Current max ID: ${maxId}, existing rivers: ${existingRivers.length}`);
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      total: lines.length
    };
    
    const errors: any[] = [];
    
    // 各行を処理
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        results.skipped++;
        continue;
      }
      
      try {
        const cols = line.split(',').map(col => col.trim());
        
        // CSVフォーマット: 川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模
        const name = cols[0];
        const prefecture = cols[1];
        const municipality = cols[2] || '';
        const basinName = cols[3] || '';
        const stationName = cols[4] || '';
        const latitude = cols[5];
        const longitude = cols[6];
        const scale = cols[7];
        
        // 必須フィールドのチェック
        if (!name || !prefecture || !latitude || !longitude) {
          results.failed++;
          errors.push({
            line: i + 1,
            error: `必須フィールドが不足しています（川の名前: ${name}, 都道府県: ${prefecture}, 緯度: ${latitude}, 経度: ${longitude}）`
          });
          continue;
        }
        
        // 緯度経度の数値チェックと自動丸め処理（小数点以下6桁）
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        
        if (isNaN(lat) || isNaN(lon)) {
          results.failed++;
          errors.push({
            line: i + 1,
            error: `緯度または経度が数値ではありません（緯度: ${latitude}, 経度: ${longitude}）`
          });
          continue;
        }
        
        // 小数点以下6桁に丸める（約10cm精度）
        const roundedLat = Math.round(lat * 1000000) / 1000000;
        const roundedLon = Math.round(lon * 1000000) / 1000000;
        
        // 規模のチェック（空欄の場合は自動検出）
        const validScales = ['large', 'medium', 'small'];
        const riverScale = (scale && validScales.includes(scale.toLowerCase())) 
          ? scale.toLowerCase() 
          : detectRiverScale(name);
        
        maxId++;
        const riverRegion = getPrefectureRegion(prefecture);
        
        const riverRecord = {
          id: maxId.toString(),
          name: name,
          region: riverRegion,
          prefecture: prefecture,
          municipality: municipality,
          basinName: basinName,
          stationName: stationName,
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
        
        await kv.set(`river:${maxId}`, riverRecord);
        results.success++;
        
        console.log(`✅ Line ${i + 1}: Added ${name} (${prefecture})`);
        
      } catch (error) {
        results.failed++;
        errors.push({
          line: i + 1,
          error: String(error)
        });
        console.error(`❌ Line ${i + 1}: Error -`, error);
      }
    }
    
    console.log('=== CSV Bulk Upload Complete ===');
    console.log('Results:', results);
    console.log(`📌 Final max ID: ${maxId}`);
    
    return c.json({
      success: true,
      message: `${results.success}件の川を登録しました`,
      stats: results,
      errors: errors
    });
    
  } catch (error) {
    console.error('CSV Bulk Upload Error:', error);
    return c.json({
      success: false,
      error: 'CSV一括登録に失敗しました',
      details: String(error)
    }, 500);
  }
});

// 川に降水量ベースの推定を追加するエンドポイント
app.get("/make-server-5f24a873/river/:id/rainfall-status", getRiverRainfallStatus);

// 登録されている川の統計情報を取得するエンドポイント
app.get("/make-server-5f24a873/rivers/stats", async (c) => {
  try {
    console.log('=== Fetching River Statistics ===');
    const allRivers = await kv.getByPrefix('river:');
    
    // 都道府県別の件数を集計
    const prefectureStats: Record<string, number> = {};
    allRivers.forEach(river => {
      const pref = river.prefecture || '不明';
      prefectureStats[pref] = (prefectureStats[pref] || 0) + 1;
    });
    
    // 地域別の件数を集計
    const regionStats: Record<string, number> = {};
    allRivers.forEach(river => {
      const region = river.region || '不明';
      regionStats[region] = (regionStats[region] || 0) + 1;
    });
    
    return c.json({
      success: true,
      total: allRivers.length,
      byPrefecture: prefectureStats,
      byRegion: regionStats
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return c.json({
      success: false,
      error: '統計情報の取得に失敗しました',
      details: String(error)
    }, 500);
  }
});

// データバックアップエンドポイント（CSV形式でエクスポート）
app.get("/make-server-5f24a873/rivers/backup", async (c) => {
  try {
    console.log('=== Backing up Rivers Data ===');
    const allRivers = await kv.getByPrefix('river:');
    
    // CSVヘッダー
    let csv = '川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模\n';
    
    // データを追加
    allRivers.forEach(river => {
      csv += `${river.name},${river.prefecture},${river.city},${river.waterSystem || ''},${river.observatory || ''},${river.latitude},${river.longitude},${river.scale}\n`;
    });
    
    console.log(`✅ Backed up ${allRivers.length} rivers`);
    
    // CSV形式で返す
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rivers_backup_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Backup Rivers Error:', error);
    return c.json({
      success: false,
      error: 'バックアップに失敗しました',
      details: String(error)
    }, 500);
  }
});

// 全ての川データを削除するエンドポイント（CSV再登録前のクリーンアップ用）
app.delete("/make-server-5f24a873/rivers/clear-all", async (c) => {
  try {
    console.log('=== Clearing All Rivers ===');
    const allRivers = await kv.getByPrefix('river:');
    
    // 全ての川データを削除
    const deletePromises = allRivers.map(river => kv.del(`river:${river.id}`));
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${allRivers.length} rivers`);
    
    return c.json({
      success: true,
      message: `${allRivers.length}件の川データを削除しました`,
      deletedCount: allRivers.length
    });
  } catch (error) {
    console.error('Clear All Rivers Error:', error);
    return c.json({
      success: false,
      error: '川データの削除に失敗しました',
      details: String(error)
    }, 500);
  }
});

Deno.serve(app.fetch);