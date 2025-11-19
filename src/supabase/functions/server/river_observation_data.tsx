// 国土交通省 河川観測所データベース
// 渓流釣りで有名な主要河川の観測所ID、カメラURL、水位観測所情報

export interface ObservationStation {
  stationId: string;        // 観測所ID
  stationName: string;      // 観測所名
  riverName: string;        // 川名
  prefecture: string;       // 都道府県
  location: string;         // 詳細位置
  cameraUrl?: string;       // ライブカメラURL
  waterLevelUrl?: string;   // 水位データURL
  lat?: number;             // 緯度
  lon?: number;             // 経度
}

// 主要河川の観測所データ
export const riverObservationDatabase: { [riverName: string]: ObservationStation[] } = {
  // 北海道
  '千歳川': [
    {
      stationId: '0101010004',
      stationName: '千歳',
      riverName: '千歳川',
      prefecture: '北海道',
      location: '千歳市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=101010004&KIND=1&PAGE=0'
    }
  ],
  
  // 東北地方
  '最上川': [
    {
      stationId: '0601010003',
      stationName: '左沢',
      riverName: '最上川',
      prefecture: '山形県',
      location: '西村山郡大江町',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=601010003&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0601010003'
    }
  ],
  
  '北上川': [
    {
      stationId: '0501010006',
      stationName: '狐禅寺',
      riverName: '北上川',
      prefecture: '岩手県',
      location: '一関市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=501010006&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0501010006'
    }
  ],
  
  // 関東地方
  '利根川': [
    {
      stationId: '0303050002',
      stationName: '栗橋',
      riverName: '利根川',
      prefecture: '埼玉県',
      location: '久喜市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303050002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0303050002',
      lat: 36.1288,
      lon: 139.6645
    },
    {
      stationId: '0303050006',
      stationName: '取手',
      riverName: '利根川',
      prefecture: '茨城県',
      location: '取手市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303050006&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0303050006',
      lat: 35.9087,
      lon: 140.0531
    }
  ],
  
  '荒川': [
    {
      stationId: '0303060001',
      stationName: '治水橋',
      riverName: '荒川',
      prefecture: '東京都',
      location: '北区',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303060001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0303060001',
      lat: 35.7681,
      lon: 139.7339
    }
  ],
  
  '鬼怒川': [
    {
      stationId: '0303030001',
      stationName: '石井',
      riverName: '鬼怒川',
      prefecture: '茨城県',
      location: '常総市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303030001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0303030001'
    }
  ],
  
  '那珂川': [
    {
      stationId: '0303020002',
      stationName: '野口',
      riverName: '那珂川',
      prefecture: '茨城県',
      location: '常陸大宮市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303020002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0303020002'
    }
  ],
  
  // 甲信越・北陸地方
  '千曲川': [
    {
      stationId: '0203040002',
      stationName: '立ヶ花',
      riverName: '千曲川',
      prefecture: '長野県',
      location: '中野市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=203040002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0203040002',
      lat: 36.7803,
      lon: 138.3664
    }
  ],
  
  '犀川': [
    {
      stationId: '0203030001',
      stationName: '村井',
      riverName: '犀川',
      prefecture: '長野県',
      location: '松本市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=203030001&KIND=1&PAGE=0'
    }
  ],
  
  '信濃川': [
    {
      stationId: '0203010003',
      stationName: '小千谷',
      riverName: '信濃川',
      prefecture: '新潟県',
      location: '小千谷市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=203010003&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0203010003'
    }
  ],
  
  '黒部川': [
    {
      stationId: '0402010001',
      stationName: '愛本',
      riverName: '黒部川',
      prefecture: '富山県',
      location: '黒部市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=402010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0402010001'
    }
  ],
  
  '神通川': [
    {
      stationId: '0403010002',
      stationName: '神通大橋',
      riverName: '神通川',
      prefecture: '富山県',
      location: '富山市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=403010002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=0403010002'
    }
  ],
  
  '手取川': [
    {
      stationId: '0404010001',
      stationName: '鶴来',
      riverName: '手取川',
      prefecture: '石川県',
      location: '白山市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=404010001&KIND=1&PAGE=0'
    }
  ],
  
  // 東海地方
  '天竜川': [
    {
      stationId: '1103010002',
      stationName: '鹿島',
      riverName: '天竜川',
      prefecture: '静岡県',
      location: '浜松市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1103010002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1103010002'
    }
  ],
  
  '大井川': [
    {
      stationId: '1104010001',
      stationName: '神座',
      riverName: '大井川',
      prefecture: '静岡県',
      location: '島田市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1104010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1104010001'
    }
  ],
  
  '木曽川': [
    {
      stationId: '1001010003',
      stationName: '犬山',
      riverName: '木曽川',
      prefecture: '愛知県',
      location: '犬山市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1001010003&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1001010003'
    }
  ],
  
  '長良川': [
    {
      stationId: '1002010002',
      stationName: '墨俣',
      riverName: '長良川',
      prefecture: '岐阜県',
      location: '大垣市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1002010002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1002010002'
    }
  ],
  
  // 関西地方
  '由良川': [
    {
      stationId: '1301010001',
      stationName: '綾部',
      riverName: '由良川',
      prefecture: '京都府',
      location: '綾部市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1301010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1301010001'
    }
  ],
  
  '淀川': [
    {
      stationId: '1403010002',
      stationName: '枚方',
      riverName: '淀川',
      prefecture: '大阪府',
      location: '枚方市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1403010002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1403010002'
    }
  ],
  
  '紀の川': [
    {
      stationId: '1503010001',
      stationName: '船戸',
      riverName: '紀の川',
      prefecture: '和歌山県',
      location: '橋本市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1503010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1503010001'
    }
  ],
  
  // 中国地方
  '高津川': [
    {
      stationId: '1701010001',
      stationName: '高津',
      riverName: '高津川',
      prefecture: '島根県',
      location: '益田市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1701010001&KIND=1&PAGE=0'
    }
  ],
  
  '江の川': [
    {
      stationId: '1702010002',
      stationName: '尾関山',
      riverName: '江の川',
      prefecture: '広島県',
      location: '三次市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1702010002&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1702010002'
    }
  ],
  
  // 四国地方
  '四万十川': [
    {
      stationId: '1901010001',
      stationName: '具同',
      riverName: '四万十川',
      prefecture: '高知県',
      location: '四万十市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1901010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1901010001'
    }
  ],
  
  '吉野川': [
    {
      stationId: '1801010003',
      stationName: '岩津',
      riverName: '吉野川',
      prefecture: '徳島県',
      location: '阿波市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1801010003&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1801010003'
    }
  ],
  
  '仁淀川': [
    {
      stationId: '1902010001',
      stationName: '伊野',
      riverName: '仁淀川',
      prefecture: '高知県',
      location: '吾川郡いの町',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=1902010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=1902010001'
    }
  ],
  
  // 九州地方
  '筑後川': [
    {
      stationId: '2001010003',
      stationName: '瀬ノ下',
      riverName: '筑後川',
      prefecture: '福岡県',
      location: '久留米市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=2001010003&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=2001010003'
    }
  ],
  
  '球磨川': [
    {
      stationId: '2102010001',
      stationName: '人吉',
      riverName: '球磨川',
      prefecture: '熊本県',
      location: '人吉市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=2102010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=2102010001'
    }
  ],
  
  '大分川': [
    {
      stationId: '2201010001',
      stationName: '三芳',
      riverName: '大分川',
      prefecture: '大分県',
      location: '大分市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=2201010001&KIND=1&PAGE=0'
    }
  ],
  
  '五ヶ瀬川': [
    {
      stationId: '2301010001',
      stationName: '北川',
      riverName: '五ヶ瀬川',
      prefecture: '宮崎県',
      location: '延岡市',
      waterLevelUrl: 'http://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=2301010001&KIND=1&PAGE=0',
      cameraUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?obsrvId=2301010001'
    }
  ]
};

// 河川名から観測所データを取得
export function getObservationStations(riverName: string): ObservationStation[] {
  return riverObservationDatabase[riverName] || [];
}

// すべての河川名を取得
export function getAllRiverNames(): string[] {
  return Object.keys(riverObservationDatabase);
}

// 観測所IDから観測所データを検索
export function findStationById(stationId: string): ObservationStation | undefined {
  for (const stations of Object.values(riverObservationDatabase)) {
    const found = stations.find(s => s.stationId === stationId);
    if (found) return found;
  }
  return undefined;
}
