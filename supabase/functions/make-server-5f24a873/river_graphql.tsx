// 国土交通省 川の防災情報 API クライアント
// 注: GraphQL APIは提供されていないため、HTMLスクレイピングと静的マッピングを使用

const RIVER_CAMERA_MAP_BASE = 'https://www.river.go.jp/kawabou/pc/tm';
const RIVER_CAMERA_SEARCH_BASE = 'https://www.river.go.jp/kawabou/pc/th';

export interface RiverCamera {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lon?: number;
  imageUrl: string;
  detailUrl: string;
  riverName: string;
  observationStationId?: string;
  lastUpdated?: string;
}

export interface ObservationStation {
  stationId: string;
  stationName: string;
  riverName: string;
  location: string;
  prefecture: string;
  lat?: number;
  lon?: number;
  hasCamera: boolean;
  hasWaterLevel: boolean;
  cameraUrl?: string;
  waterLevelUrl?: string;
}

/**
 * 国土交通省の川の防災情報サイトをスクレイピングして
 * ライブカメラ情報を取得
 */
export async function scrapeRiverCameras(riverName: string, lat?: number, lon?: number): Promise<RiverCamera[]> {
  // 川の防災情報サイトの現行URL（pc/th はカメラ検索、pc/tm は地図表示）
  const detailUrl = lat && lon
    ? `${RIVER_CAMERA_MAP_BASE}?zm=13&clat=${lat}&clon=${lon}&fld=0&mapType=0&itmkndCd=8`
    : `${RIVER_CAMERA_SEARCH_BASE}?fld=0&mapType=0&itmkndCd=8&searchWd=${encodeURIComponent(riverName)}`;

  console.log(`Camera URL for ${riverName}: ${detailUrl}`);

  return [{
    id: `search-${encodeURIComponent(riverName)}`,
    name: `${riverName}のライブカメラ一覧`,
    location: riverName,
    imageUrl: '',
    detailUrl,
    riverName,
    lastUpdated: '最新'
  }];
}

/**
 * 河川のライブカメラ情報を取得（スクレイピングのみ）
 */
export async function getRiverCameraInfo(riverName: string): Promise<{
  cameras: RiverCamera[];
  stations: ObservationStation[];
  source: string;
}> {
  // HTMLスクレイピングでカメラ情報を取得
  console.log(`Fetching camera info for: ${riverName}`);
  const cameras = await scrapeRiverCameras(riverName);
  
  return {
    cameras,
    stations: [],
    source: cameras.length > 0 ? 'Web Scraping (HTML)' : 'No Data'
  };
}
