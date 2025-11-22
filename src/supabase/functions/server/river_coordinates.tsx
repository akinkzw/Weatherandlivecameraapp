// 主要な川の緯度経度マッピングデータ（サーバー側）

export const riverCoordinates: { [key: string]: { lat: number; lon: number; prefecture: string } } = {
  // 長野県
  '千曲川': { lat: 36.6461, lon: 138.1889, prefecture: '長野県' },
  '犀川': { lat: 36.5640, lon: 137.9734, prefecture: '長野県' },
  '梓川': { lat: 36.2397, lon: 137.7503, prefecture: '長野県' },
  '高瀬川': { lat: 36.4258, lon: 137.8585, prefecture: '長野県' },
  '天竜川': { lat: 35.8453, lon: 137.9370, prefecture: '長野県' },
  '木曽川': { lat: 35.9969, lon: 137.5906, prefecture: '長野県' },
  '姫川': { lat: 36.8331, lon: 137.8614, prefecture: '長野県' },
  
  // 北海道
  '石狩川': { lat: 43.3641, lon: 142.3694, prefecture: '北海道' },
  '天塩川': { lat: 44.8764, lon: 142.1625, prefecture: '北海道' },
  '十勝川': { lat: 42.9238, lon: 143.2050, prefecture: '北海道' },
  '釧路川': { lat: 43.0458, lon: 144.3814, prefecture: '北海道' },
  '網走川': { lat: 43.9109, lon: 144.2695, prefecture: '北海道' },
  '尻別川': { lat: 42.8083, lon: 140.7808, prefecture: '北海道' },
  '豊平川': { lat: 43.0542, lon: 141.3469, prefecture: '北海道' },
  
  // 東北
  '岩木川': { lat: 40.6086, lon: 140.4645, prefecture: '青森県' },
  '北上川': { lat: 39.7036, lon: 141.1525, prefecture: '岩手県' },
  '最上川': { lat: 38.2529, lon: 140.3389, prefecture: '山形県' },
  '阿武隈川': { lat: 37.7608, lon: 140.4739, prefecture: '福島県' },
  
  // 関東
  '利根川': { lat: 36.1208, lon: 139.3925, prefecture: '群馬県' },
  '荒川': { lat: 35.8978, lon: 139.0233, prefecture: '埼玉県' },
  '多摩川': { lat: 35.6436, lon: 139.4286, prefecture: '東京都' },
  '相模川': { lat: 35.5453, lon: 139.3444, prefecture: '神奈川県' },
  '那珂川': { lat: 36.5606, lon: 140.2428, prefecture: '茨城県' },
  
  // 中部
  '信濃川': { lat: 37.9161, lon: 138.8503, prefecture: '新潟県' },
  '阿賀野川': { lat: 37.7889, lon: 139.5103, prefecture: '新潟県' },
  '神通川': { lat: 36.6958, lon: 137.2114, prefecture: '富山県' },
  '黒部川': { lat: 36.9022, lon: 137.4506, prefecture: '富山県' },
  '手取川': { lat: 36.4867, lon: 136.5825, prefecture: '石川県' },
  '九頭竜川': { lat: 36.0628, lon: 136.2192, prefecture: '福井県' },
  '富士川': { lat: 35.3308, lon: 138.4378, prefecture: '山梨県' },
  '長良川': { lat: 35.4231, lon: 136.7597, prefecture: '岐阜県' },
  '大井川': { lat: 34.8156, lon: 138.2428, prefecture: '静岡県' },
  '矢作川': { lat: 35.0647, lon: 137.3856, prefecture: '愛知県' },
  
  // 近畿
  '淀川': { lat: 34.8906, lon: 135.5647, prefecture: '大阪府' },
  '紀の川': { lat: 34.2264, lon: 135.5658, prefecture: '和歌山県' },
  '加古川': { lat: 34.9181, lon: 134.9208, prefecture: '兵庫県' },
  '由良川': { lat: 35.4833, lon: 135.2167, prefecture: '京都府' },
  
  // 中国
  '江の川': { lat: 34.9653, lon: 132.5283, prefecture: '島根県' },
  '旭川': { lat: 34.8664, lon: 133.8522, prefecture: '岡山県' },
  '太田川': { lat: 34.4517, lon: 132.4281, prefecture: '広島県' },
  '錦川': { lat: 34.1675, lon: 132.1717, prefecture: '山口県' },
  
  // 四国
  '吉野川': { lat: 34.0658, lon: 134.5592, prefecture: '徳島県' },
  '四万十川': { lat: 33.0011, lon: 132.9308, prefecture: '高知県' },
  '仁淀川': { lat: 33.5500, lon: 133.1833, prefecture: '高知県' },
  '肱川': { lat: 33.5092, lon: 132.7044, prefecture: '愛媛県' },
  
  // 九州
  '筑後川': { lat: 33.2186, lon: 130.7044, prefecture: '福岡県' },
  '遠賀川': { lat: 33.8636, lon: 130.6969, prefecture: '福岡県' },
  '嘉瀬川': { lat: 33.2928, lon: 130.3000, prefecture: '佐賀県' },
  '緑川': { lat: 32.6644, lon: 130.8231, prefecture: '熊本県' },
  '大分川': { lat: 33.2392, lon: 131.6128, prefecture: '大分県' },
  '大淀川': { lat: 31.9083, lon: 131.4231, prefecture: '宮崎県' },
  '川内川': { lat: 31.8136, lon: 130.3056, prefecture: '鹿児島県' }
};

export function getRiverCoordinates(riverName: string): { lat: number; lon: number } | null {
  const coords = riverCoordinates[riverName];
  if (coords) {
    return { lat: coords.lat, lon: coords.lon };
  }
  return null;
}
