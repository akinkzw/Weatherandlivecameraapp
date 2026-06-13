/**
 * 市区町村コードベースで川の防災情報APIからリアルタイム水位データを取得
 * エンドポイント: https://www.river.go.jp/kawabou/file/gjson/obs/{YYYYMMDD}/{HHMM}/stg/{市区町村コード}.json
 * @param municipalityCode 市区町村コード（5桁、例: 19209）
 */
export async function fetchRealtimeWaterLevel(
  municipalityCode: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  apiUrl?: string;
  timestamp?: string;
}> {
  const startTime = Date.now();
  console.log('=== Realtime Water Level Request (Municipality Code Based) ===');
  console.log('Municipality Code:', municipalityCode);
  
  // 現在時刻から日本時間を取得
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstDate = new Date(now.getTime() + jstOffset);
  
  // 🔄 最大6回試行（現在、10分前、20分前、30分前、40分前、50分前）
  const maxAttempts = 6;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 各試行で10分ずつ過去に遡る
    const attemptDate = new Date(jstDate.getTime() - (attempt * 10 * 60 * 1000));
    
    const year = attemptDate.getUTCFullYear();
    const month = String(attemptDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(attemptDate.getUTCDate()).padStart(2, '0');
    const hour = String(attemptDate.getUTCHours()).padStart(2, '0');
    const minute = String(Math.floor(attemptDate.getUTCMinutes() / 10) * 10).padStart(2, '0'); // 10分単位に丸める
    
    const dateStr = `${year}${month}${day}`;
    const timeStr = `${hour}${minute}`;
    
    // 川の防災情報サイトの市区町村コード別水位情報API（JSON形式）
    const apiUrl = `https://www.river.go.jp/kawabou/file/gjson/obs/${dateStr}/${timeStr}/stg/${municipalityCode}.json`;
    
    console.log(`Attempt ${attempt + 1}/${maxAttempts}: ${apiUrl}`);
    console.log(`  Date: ${dateStr}, Time: ${timeStr} (JST)`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒タイムアウト
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.river.go.jp/'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const elapsed = Date.now() - startTime;
        console.log(`  ❌ HTTP ${response.status} ${response.statusText} (${elapsed}ms)`);
        
        // 404の場合は次の試行へ続ける
        if (response.status === 404 && attempt < maxAttempts - 1) {
          console.log('  ⏭️  Trying older timestamp...');
          continue;
        }
        
        // 最後の試行でもエラーの場合
        if (attempt === maxAttempts - 1) {
          return {
            success: false,
            error: `データが見つかりません（市区町村コード: ${municipalityCode}）`,
            apiUrl
          };
        }
        continue;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const elapsed = Date.now() - startTime;
        console.log(`  ❌ Failed to parse JSON response (${elapsed}ms)`);
        console.log(`  ❌ JSON Error:`, jsonError);
        continue; // 次の試行へ
      }
      
      // データ構造を確認（完全なレスポンスをログ出力）
      console.log('  📊 Full API Response:', JSON.stringify(data, null, 2));
      
      // APIレスポンスの形式を解析
      if (!data || Object.keys(data).length === 0) {
        const elapsed = Date.now() - startTime;
        console.log(`  ❌ Empty response (${elapsed}ms)`);
        continue; // 次の試行へ
      }
      
      // 観測所データ配列を探す
      let observations = data.features;
      
      if (!observations || observations.length === 0) {
        const elapsed = Date.now() - startTime;
        console.log(`  ⚠️ No water level data found (${elapsed}ms)`);
        console.log('  Available keys:', Object.keys(data));
        continue; // 次の試行へ
      }
      
      const elapsed = Date.now() - startTime;
      console.log(`  ✅ Found ${observations.length} data point(s) (${elapsed}ms)`);
      
      // 観測所データを整形
      const formattedObservations = observations.map((feature: any) => {
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
      
      return {
        success: true,
        data: formattedObservations,
        apiUrl,
        timestamp: `${dateStr} ${timeStr}`,
      };
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log(`  ⏱️  Timeout (8 seconds) (${elapsed}ms)`);
          // タイムアウトの場合も次の試行へ
          if (attempt < maxAttempts - 1) {
            console.log('  ⏭️  Trying older timestamp...');
            continue;
          }
          return {
            success: false,
            error: 'Request timeout',
            apiUrl
          };
        }
        console.log(`  ❌ Fetch error (${elapsed}ms):`, error.message);
        // ネットワークエラーの場合も次の試行へ
        if (attempt < maxAttempts - 1) {
          continue;
        }
        return {
          success: false,
          error: error.message,
          apiUrl
        };
      }
      console.log(`  ❌ Unknown error (${elapsed}ms):`, String(error));
      if (attempt < maxAttempts - 1) {
        continue;
      }
      return {
        success: false,
        error: 'Network error',
        apiUrl
      };
    }
  }
  
  // すべての試行が失敗した場合
  const elapsed = Date.now() - startTime;
  console.log(`  ❌ All attempts failed (${elapsed}ms)`);
  return {
    success: false,
    error: `この市区町村コード（${municipalityCode}）の水位データは現在利用できません`,
    apiUrl: `https://www.river.go.jp/kawabou/file/gjson/obs/.../.../${municipalityCode}.json`
  };
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