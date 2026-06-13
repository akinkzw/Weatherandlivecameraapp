// 国土交通省 川の防災情報 API クライアント
// 注: GraphQL APIは提供されていないため、HTMLスクレイピングと静的マッピングを使用
// バックアップ日時: 2025-11-19

const RIVER_SEARCH_BASE_URL = 'https://www.river.go.jp/kawabou/ipCamera.do';

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
export async function scrapeRiverCameras(riverName: string): Promise<RiverCamera[]> {
  try {
    // 川の防災情報サイトの検索URL
    const searchUrl = `https://www.river.go.jp/kawabou/ipCamera.do?init=init&searchWd=${encodeURIComponent(riverName)}`;
    
    console.log(`Scraping cameras from: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch river info page: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    
    // HTMLからカメラ情報を抽出
    const cameras: RiverCamera[] = [];
    
    // 観測所IDのパターンを検索（obsrvIdパラメータ）
    const obsrvIdPattern = /obsrvId=(\d{10,16})/g;
    const matches = [...html.matchAll(obsrvIdPattern)];
    
    // 重複を除去
    const uniqueIds = new Set<string>();
    
    for (const match of matches) {
      const obsrvId = match[1];
      
      if (uniqueIds.has(obsrvId)) {
        continue;
      }
      uniqueIds.add(obsrvId);
      
      // 観測所名を抽出（可能な場合）
      // HTMLの構造: <a href="...obsrvId=xxx...">観測所名</a> のようなパターンを探す
      const namePattern = new RegExp(`obsrvId=${obsrvId}[^>]*>\\s*([^<]+)\\s*<`, 'i');
      const nameMatch = html.match(namePattern);
      const name = nameMatch ? nameMatch[1].trim() : `観測所${obsrvId}`;
      
      cameras.push({
        id: obsrvId,
        name: name,
        location: riverName,
        imageUrl: `https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=${obsrvId}&mode=img`,
        detailUrl: `https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=${obsrvId}`,
        riverName: riverName,
        observationStationId: obsrvId,
        lastUpdated: '最新'
      });
    }
    
    console.log(`Found ${cameras.length} unique cameras for ${riverName}`);
    return cameras;
    
  } catch (error) {
    console.error('Error scraping river cameras:', error);
    return [];
  }
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
