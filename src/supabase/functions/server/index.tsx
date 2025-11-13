import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
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
  }),
);

// Health check endpoint
app.get("/make-server-5f24a873/health", (c) => {
  return c.json({ status: "ok" });
});

// microCMSからバナーデータを取得するエンドポイント
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
    console.log('Banner data successfully fetched:', JSON.stringify(data).substring(0, 200));
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
      { id: 254, name: 'ヒトシベツ二号線川', prefecture: '北海道', region: 'hokkaido', area: '宗谷���方' },
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
      '千国の沢川', '右の沢川', '吉田牧場の沢川', '四の沢川', '奥の沢川',
      '富沢の沢川', '川住川', '炭山の沢川', '炭焼境沢川', '牧場の沢川',
      '石の沢川', '増幌川', 'イチャンナイ川', '七線川', '增幌中川',
      'ケナシポロ川', '桜川', '知来別一号線川', '知来別三号線川', '知来別二号線川',
      '知来別五号線川', '知来別六号線川', '知来別四号線川', '自衛隊一号線川', '自衛隊川',
      '知来別川', '一号線川', '七号線川', '三号線川', '二号線川',
      '五号線川', '八号線川', '六号線川', '四号線川', '小出川',
      '牧場川', '苗畑川', '鬼志別川', 'エコペー号線川', 'エコペニ号線川',
      'カツラ川', '猿骨三号線川', '猿骨二号線川', '猿骨四号線川', '白百合川',
      '猿骨川', 'エコペ川', 'タンネペナイ川', 'エサヌカ川', 'カネユ川',
      'キモマ沼川', 'セキタンベツ川', 'ヒトシベツー号線川', 'ヒトシベツ二号線川', 'ヒトシベツ川',
      'ポロナイー号線川', 'ポロナイ川', 'ポロー号線川', 'ポロ川', 'ポンポロ川',
      'モケウニ川', 'ユウクルー号線川', 'ユウクル川', '宗谷濁川', '成田川',
      '旧濁川', '清川', '猿払一号線川', '猿払七号線川', '猿払三号線川',
      '猿払九号線川', '猿二号線川', '猿払五号線川', '猿払八号線川', '猿払六号線川',
      '猿払十号線川', '猿払四号線川', '錦川', '猿払川', 'カリベツ川',
      'ニタチナイ川', 'あめの沢川', 'アサヒの沢川', 'アザミノ沢川', 'イワナノ沢川',
      'ウノサワ川', 'エイコの沢川', 'オサチナイ川', 'オサナイ川', 'オビンナイ川',
      'コンクリート沢川', 'チュピタウシュナイ川', 'チョッコノ沢川', 'ナカヒロノ沢川', 'バンケノ沢川',
      'ポンウツナイ川', 'ポンケイ川', 'ポンピラナイ川', 'ポン仁達内川', 'マスノ沢川',
      'マップの沢川', 'ヤスベツ川', 'ヤツメの沢川', 'ヤナドマリノ沢川', 'ヨシヨシノ沢川',
      'ルカシュナイル', '一ノ沢川', '一号ノ沢川', '一号沢川', '一己内川',
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
      '留萌川', '増毛川', '尻別川', '後志利別川', '鵡川', '沙流川', '静内川', '新冠川',
      // 石狩川水系
      '空知川', '夕張川', '幾春別川', '美唄川', '奈井江川', '当別川', '篠津川', 'ウツナイ川',
      '豊平川', '厚別川', '月寒川', '望月寒川', '精進川', '琴似川', '新川', '伏籠川',
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
      '社名淵川', 'ルベシベ川', 'サロマ川',
      // 渚滑川水系
      'チミケップ湖', '滝ノ上川',
      // 尻別川水系
      '真狩川', '昆布川', '倶知安川', 'ルベシベ川', 'ペーペナイ川',
      // 後志利別川水系
      '真駒内川', '奥沢川', '厚沢部川',
      // 鵡川水系
      '双珠別川', '穂別川', 'ルベシベ川',
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
      { name: '岩木川', pref: '青森県', region: 'tohoku' }, { name: '馬淵川', pref: '青森県', region: 'tohoku' },
      { name: '奥入瀬川', pref: '青森県', region: 'tohoku' }, { name: '新井田川', pref: '青森県', region: 'tohoku' },
      // 岩手県
      { name: '北上川', pref: '岩手県', region: 'tohoku' }, { name: '雫石川', pref: '岩手県', region: 'tohoku' },
      { name: '中津川', pref: '岩手県', region: 'tohoku' }, { name: '猿ヶ石川', pref: '岩手県', region: 'tohoku' },
      // 宮城県
      { name: '北上川', pref: '宮城県', region: 'tohoku' }, { name: '名取川', pref: '宮城県', region: 'tohoku' },
      { name: '広瀬川', pref: '宮城県', region: 'tohoku' }, { name: '阿武隈川', pref: '宮城県', region: 'tohoku' },
      // 秋田県
      { name: '米代川', pref: '秋田県', region: 'tohoku' }, { name: '雄物川', pref: '秋田県', region: 'tohoku' },
      { name: '子吉川', pref: '秋田県', region: 'tohoku' }, { name: '玉川', pref: '秋田県', region: 'tohoku' },
      // 山形県
      { name: '最上川', pref: '山形県', region: 'tohoku' }, { name: '置賜白川', pref: '山形県', region: 'tohoku' },
      { name: '丹生川', pref: '山形県', region: 'tohoku' }, { name: '小国川', pref: '山形県', region: 'tohoku' },
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
      // 神奈川県
      { name: '相模川', pref: '神奈川県', region: 'kanto' }, { name: '酒匂川', pref: '神奈川県', region: 'kanto' },
      { name: '鶴見川', pref: '神奈川県', region: 'kanto' }, { name: '多摩川', pref: '神奈川県', region: 'kanto' },
      // 新潟県
      { name: '信濃川', pref: '新潟県', region: 'chubu' }, { name: '阿賀野川', pref: '新潟県', region: 'chubu' },
      { name: '魚野川', pref: '新潟県', region: 'chubu' }, { name: '関川', pref: '新潟県', region: 'chubu' },
      // 富山県
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
      { name: '宮川', pref: '三重県', region: 'kinki' }, { name: '雲出川', pref: '三重県', region: 'kinki' },
      // 滋賀県
      { name: '瀬田川', pref: '滋賀県', region: 'kinki' }, { name: '野洲川', pref: '滋賀県', region: 'kinki' },
      { name: '愛知川', pref: '滋賀県', region: 'kinki' }, { name: '姉川', pref: '滋賀県', region: 'kinki' },
      // 京都府
      { name: '淀川', pref: '京都府', region: 'kinki' }, { name: '桂川', pref: '京都府', region: 'kinki' },
      { name: '鴨川', pref: '京都府', region: 'kinki' }, { name: '宇治川', pref: '京都府', region: 'kinki' },
      // 大阪府
      { name: '淀川', pref: '大阪府', region: 'kinki' }, { name: '大和川', pref: '大阪府', region: 'kinki' },
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
      { name: '斐伊川', pref: '島根県', region: 'chugoku' }, { name: '江の川', pref: '島根県', region: 'chugoku' },
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
      { name: '安里川', pref: '沖縄県', region: 'kyushu' }, { name: '与那覇川', pref: '沖縄県', region: 'kyushu' },
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

Deno.serve(app.fetch);