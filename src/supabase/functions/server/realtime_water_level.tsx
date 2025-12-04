/**
 * リアルタイム水位取得ロジック
 * 川の防災情報サイトのAPIエンドポイントからリアルタイム水位データを取得
 * 
 * エンドポイント形式:
 * https://www.river.go.jp/kawabou/file/gjson/obs/{YYYYMMDD}/{HHMM}/stg/{町コード}.json
 * 
 * データ形式: GeoJSON FeatureCollection
 * 10分間隔で更新
 */

/**
 * 現在時刻を10分単位に丸める（直近の10分単位に切り捨て）
 * 例: 19:47 -> 19:40
 */
function roundToNearest10Minutes(date: Date): { YYYYMMDD: string; HHMM: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const hours = date.getHours();
  const minutes = Math.floor(date.getMinutes() / 10) * 10; // 10分単位に切り捨て
  
  const YYYYMMDD = `${year}${month}${day}`;
  const HHMM = `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
  
  return { YYYYMMDD, HHMM };
}

/**
 * 複数の時刻パターンを生成（過去20分間を試行）
 * データが存在しない場合に備えて、複数の時刻を試す
 */
function generateTimePatterns(date: Date): Array<{ YYYYMMDD: string; HHMM: string }> {
  const patterns = [];
  
  // 現在時刻から過去20分（10分刻みで3パターン）を生成
  // パターン数を減らして高速化
  for (let i = 0; i < 3; i++) {
    const targetDate = new Date(date.getTime() - i * 10 * 60 * 1000); // i*10分前
    patterns.push(roundToNearest10Minutes(targetDate));
  }
  
  return patterns;
}

/**
 * 水位レベルを判定
 * @param currentLevel 現在水位
 * @param warningLevel 水防団待機水位
 * @param dangerLevel 氾濫危険水位
 * @param floodLevel 氾濫発生水位
 */
function determineWaterLevelStatus(
  currentLevel: number,
  warningLevel: number,
  dangerLevel: number,
  floodLevel: number
): 'normal' | 'caution' | 'warning' | 'danger' {
  if (currentLevel >= floodLevel) {
    return 'danger'; // 氾濫発生
  } else if (currentLevel >= dangerLevel) {
    return 'warning'; // 警戒
  } else if (currentLevel >= warningLevel) {
    return 'caution'; // 注意
  } else {
    return 'normal'; // 正常
  }
}

/**
 * 単一の時刻パターンでAPIリクエストを試行
 */
async function tryFetchForTime(
  townCode: string,
  YYYYMMDD: string,
  HHMM: string,
  observatoryName?: string
): Promise<{
  success: boolean;
  data?: any[];
  apiUrl?: string;
  timestamp?: string;
  error?: string;
}> {
  const apiUrl = `https://www.river.go.jp/kawabou/file/gjson/obs/${YYYYMMDD}/${HHMM}/stg/${townCode}.json`;
  
  console.log(`Trying time pattern: ${YYYYMMDD} ${HHMM}`);
  console.log(`API URL: ${apiUrl}`);
  
  try {
    // タイムアウト付きfetch（3秒に短縮してレスポンスを高速化）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒タイムアウト
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `HTTP ${response.status}`,
        apiUrl
      };
    }
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.log('  ❌ Failed to parse JSON response');
      return {
        success: false,
        error: 'Invalid JSON response',
        apiUrl
      };
    }
    
    if (!data.features || data.features.length === 0) {
      console.log('  ❌ No features in response');
      return {
        success: false,
        error: 'No features',
        apiUrl
      };
    }
    
    console.log(`  ✅ Found ${data.features.length} observation(s)`);
    
    // 観測所データを整形
    const observations = data.features.map((feature: any) => {
      const props = feature.properties;
      const coords = feature.geometry?.coordinates || [];
      
      // 水位レベルを判定
      const status = determineWaterLevelStatus(
        props.stg,
        props.strt_stg,
        props.dng_stg,
        props.fld_stg
      );
      
      return {
        // 基本情報
        observationCode: props.swobs_cd,
        observationName: props.swobs_nm,
        observationKana: props.swobs_kana,
        
        // 位置情報
        prefecture: props.pref_cd,
        town: props.twn_cd,
        river: props.swrvr_cd,
        latitude: props.lat || coords[1],
        longitude: props.lon || coords[0],
        
        // 水位データ
        observationTime: props.obs_time,
        currentWaterLevel: props.stg,
        warningLevel: props.strt_stg,
        dangerLevel: props.dng_stg,
        floodLevel: props.fld_stg,
        waterLevelFlag: props.swstg_ovlvl,
        
        // ステータス判定
        status,
        
        // その他
        bankSection: props.bnk_sct,
      };
    });
    
    // 観測所名でフィルタリング（指定された場合）
    let filteredObservations = observations;
    if (observatoryName) {
      filteredObservations = observations.filter((obs: any) =>
        obs.observationName.includes(observatoryName)
      );
      console.log(`  📍 Filtered to ${filteredObservations.length} matching "${observatoryName}"`);
    }
    
    return {
      success: true,
      data: filteredObservations,
      apiUrl,
      timestamp: `${YYYYMMDD} ${HHMM}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log('  ⏱️  Timeout (3 seconds)');
        return {
          success: false,
          error: 'Timeout',
          apiUrl
        };
      }
      console.log(`  ❌ Fetch error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        apiUrl
      };
    }
    console.log(`  ❌ Unknown error: ${String(error)}`);
    return {
      success: false,
      error: 'Network error',
      apiUrl
    };
  }
}

/**
 * 川の防災情報APIからリアルタイム水位データを取得
 * @param townCode 町コード（DPF観測所ID） 例: 1901204
 * @param observatoryName 観測所名（フィルタリング用、オプション）
 */
export async function fetchRealtimeWaterLevel(
  townCode: string,
  observatoryName?: string
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
  apiUrl?: string;
  timestamp?: string;
}> {
  const startTime = Date.now();
  console.log('=== Realtime Water Level Request ===');
  console.log('Town Code:', townCode);
  console.log('Observatory Filter:', observatoryName || 'None');
  
  try {
    // 現在時刻から過去20分間の時刻パターンを生成
    const now = new Date();
    const timePatterns = generateTimePatterns(now);
    
    console.log(`Trying ${timePatterns.length} time patterns in parallel...`);
    
    // すべての時刻パターンを並列で試みる（高速化）
    const promises = timePatterns.map(({ YYYYMMDD, HHMM }) => 
      tryFetchForTime(townCode, YYYYMMDD, HHMM, observatoryName)
    );
    
    // Promise.allSettledで全てのリクエストを実行
    const results = await Promise.allSettled(promises);
    
    // 成功した最初の結果を返す
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value.success) {
        const elapsed = Date.now() - startTime;
        console.log(`✅ Successfully fetched water level data in ${elapsed}ms (pattern ${i + 1}/${results.length})`);
        return result.value;
      }
    }
    
    // すべての時刻パターンでデータが見つからなかった場合
    const elapsed = Date.now() - startTime;
    console.warn(`❌ No valid data found in any time pattern (${elapsed}ms)`);
    return {
      success: false,
      error: `過去${timePatterns.length * 10}分間のデータ��見つかりませんでした`,
    };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Fatal error in fetchRealtimeWaterLevel (${elapsed}ms):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown fatal error',
    };
  }
}
