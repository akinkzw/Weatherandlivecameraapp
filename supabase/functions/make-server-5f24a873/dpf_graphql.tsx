// 国土交通省データプラットフォーム GraphQL API クライアント
// エンドポイント: https://www.mlit-data.jp/api/v1/graphql

const GRAPHQL_ENDPOINT = 'https://www.mlit-data.jp/api/v1/graphql';

export interface RiverObservationMetadata {
  id: string;
  title: string;
  riverName: string;
  observationPlaceName: string;
  latitude: number;
  longitude: number;
  lastUpdateDateTime: string;
  prefecture: string;
  municipalityName?: string;
  url?: string;
  cameraUrl?: string;
  // 追加: 川の防災情報のURL生成に必要なコード
  ofcCd?: string;  // 事務所コード
  obsCd?: string;  // 観測所コード
  rawMetadata?: any; // デバッグ用: 生のメタデータ
}

interface DPFMetadata {
  'HWQ:river_name'?: string;
  'HWQ:observation_place_name'?: string;
  'DPF:latitude'?: number;
  'DPF:longitude'?: number;
  'DPF:last_update_datetime'?: string;
  'HWQ:prefecture'?: string;
  'HWQ:municipality_name'?: string;
  'HWQ:url'?: string;
  [key: string]: any;
}

interface DPFResponse {
  data: {
    getAllData: {
      data: Array<{
        id: string;
        title: string;
        metadata: DPFMetadata;
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

/**
 * 国土交通省DPF GraphQL APIから河川観測所データを取得
 */
export async function fetchAllRiverObservations(): Promise<RiverObservationMetadata[]> {
  const apiKey = Deno.env.get('DPF_API_KEY');
  
  if (!apiKey) {
    console.error('❌ DPF_API_KEY environment variable is not set');
    throw new Error('DPF_API_KEY_NOT_CONFIGURED: DPF_API_KEY environment variable is missing');
  }
  
  console.log(`✅ DPF_API_KEY found: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);
  console.log(`GraphQL Endpoint: ${GRAPHQL_ENDPOINT}`);
  
  // GraphQLクエリ（国土交通省DPFの河川水位観測所データ用）
  // DPFドキュメントに基づく正しいクエリ（hwq_stage = 水位データ）
  // 重要: 接続テストで成功した1行形式を使用（改行なし）
  const query = `query GetRiverObservationMetadata { getAllData(size: 1000, attributeFilter: {AND: [{attributeName: "DPF:catalog_id", is: "hwq"}, {attributeName: "DPF:dataset_id", is: "hwq_stage"}]}) { data { id title metadata } } }`;

  console.log('Fetching river observation data from DPF GraphQL API...');
  
  // 全体の処理開始時刻を記録
  const overallStartTime = Date.now();
  let attemptStartTime = 0; // 各パターンの開始時刻（エラーハンドリングからアクセス可能なスコープで定義）
  
  // ✅ 接続テストで成功したパターンのみを使用（他のパターンは不要）
  console.log('=== Using apikey header (proven successful in connection test) ===');
  
  try {
    attemptStartTime = Date.now();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': apiKey, // ✅ 接続テストで成功したヘッダー
    };
    
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    console.log('Sending request...');
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    const fetchDuration = Date.now() - attemptStartTime;
    console.log(`Request completed in ${fetchDuration}ms`);
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Request failed with ${response.status}:`);
      console.error('Full error response:', errorText);
      throw new Error(`DPF_API_ERROR: ${response.status} - ${errorText}`);
    }

    const result: DPFResponse = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const rawData = result.data?.getAllData?.data || [];
    const totalDuration = Date.now() - attemptStartTime;
    console.log(`✅ Success! Fetched ${rawData.length} observation stations from DPF API`);
    console.log(`⏱️ Total time: ${totalDuration}ms`);

    // メタデータを正規化
    const observations: RiverObservationMetadata[] = rawData.map((item) => {
      const meta = item.metadata || {};
      
      return {
        id: item.id,
        title: item.title,
        riverName: meta['HWQ:river_name'] || '不明',
        observationPlaceName: meta['HWQ:observation_place_name'] || '不明',
        latitude: meta['DPF:latitude'] || 0,
        longitude: meta['DPF:longitude'] || 0,
        lastUpdateDateTime: meta['DPF:last_update_datetime'] || '',
        prefecture: meta['HWQ:prefecture'] || '',
        municipalityName: meta['HWQ:municipality_name'],
        url: meta['HWQ:url'],
        cameraUrl: meta['HWQ:url'], // URLがカメラURLと仮定
        // 追加: ofcCdとobsCdを抽出（実際のキー名は要確認）
        ofcCd: meta['HWQ:office_code'] || meta['office_code'] || meta['ofcCd'],
        obsCd: meta['HWQ:observation_code'] || meta['observation_code'] || meta['obsCd'],
        rawMetadata: meta, // デバッグ用
      };
    });

    console.log(`Data transformation completed. Total execution time: ${Date.now() - overallStartTime}ms`);
    return observations;
    
  } catch (error) {
    const totalDuration = Date.now() - overallStartTime;
    console.error(`❌ Request failed after ${totalDuration}ms`);
    console.error('Error:', error);
    throw error;
  }
}

/**
 * 河川名でフィルタリング
 */
export function filterByRiverName(
  observations: RiverObservationMetadata[], 
  riverName: string
): RiverObservationMetadata[] {
  return observations.filter((obs) => 
    obs.riverName === riverName || 
    obs.riverName.includes(riverName) ||
    riverName.includes(obs.riverName)
  );
}

/**
 * 都道府県でフィルタリング
 */
export function filterByPrefecture(
  observations: RiverObservationMetadata[], 
  prefecture: string
): RiverObservationMetadata[] {
  return observations.filter((obs) => obs.prefecture === prefecture);
}

/**
 * ライブカメラ情報を抽出
 */
export function extractCameraInfo(observation: RiverObservationMetadata) {
  return {
    id: observation.id,
    name: observation.observationPlaceName,
    location: `${observation.prefecture} ${observation.municipalityName || ''}`,
    lat: observation.latitude,
    lon: observation.longitude,
    imageUrl: observation.cameraUrl || observation.url || '',
    detailUrl: observation.url || '',
    riverName: observation.riverName,
    observationStationId: observation.id,
    lastUpdated: observation.lastUpdateDateTime,
  };
}