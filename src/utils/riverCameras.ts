// 国土交通省の川の防災情報 - 河川監視カメラ情報マッピング
export interface CameraInfo {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  webUrl: string;
  lastUpdated: string;
}

// 主要河川のカメラ情報マッピング
// 注意: 国土交通省のカメラ画像はCORS制限があるため、サンプル画像を使用
export const riverCameraMapping: { [key: string]: CameraInfo[] } = {
  // 関東
  '利根川': [
    {
      id: 'tone-1',
      name: '栗橋観測所',
      location: '久喜市',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303050101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'tone-2',
      name: '取手観測所',
      location: '取手市',
      imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303050101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '荒川': [
    {
      id: 'arakawa-1',
      name: '治水橋',
      location: 'さいたま市',
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303060101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'arakawa-2',
      name: '岩淵水門',
      location: '東京都北区',
      imageUrl: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303060101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '多摩川': [
    {
      id: 'tama-1',
      name: '田園調布堰',
      location: '大田区',
      imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303080101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'tama-2',
      name: '石原観測所',
      location: '調布市',
      imageUrl: 'https://images.unsplash.com/photo-1500622944204-b135684e99fd?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0303080101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],

  // 中部
  '信濃川': [
    {
      id: 'shinano-1',
      name: '小千谷観測所',
      location: '小千谷市',
      imageUrl: 'https://images.unsplash.com/photo-1505832018823-50331d70d237?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0504010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'shinano-2',
      name: '長岡観測所',
      location: '長岡市',
      imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0504010101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '千曲川': [
    {
      id: 'chikuma-1',
      name: '立ヶ花観測所',
      location: '中野市',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0504010201100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'chikuma-2',
      name: '小布施橋',
      location: '小布施町',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0504010201100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '天竜川': [
    {
      id: 'tenryu-1',
      name: '鹿島橋',
      location: '浜松市',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0506010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '木曽川': [
    {
      id: 'kiso-1',
      name: '犬山観測所',
      location: '犬山市',
      imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0507010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'kiso-2',
      name: '馬飼大橋',
      location: '各務原市',
      imageUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0507010101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],

  // 北海道
  '石狩川': [
    {
      id: 'ishikari-1',
      name: '石狩大橋',
      location: '河口付近',
      imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0201300409100050',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'ishikari-2',
      name: '江別水位観測所',
      location: '江別市',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0201300409100051',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '豊平川': [
    {
      id: 'toyohira-1',
      name: '豊平橋',
      location: '札幌市中央区',
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0201300409100052',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '天塩川': [
    {
      id: 'teshio-1',
      name: '天塩大橋',
      location: '天塩町',
      imageUrl: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0201300408200010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '十勝川': [
    {
      id: 'tokachi-1',
      name: '十勝大橋',
      location: '帯広市',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0201300407400010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],

  // 東北
  '北上川': [
    {
      id: 'kitakami-1',
      name: '北上大橋',
      location: '盛岡市',
      imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0202070101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'kitakami-2',
      name: '四十四田ダム',
      location: '盛岡市',
      imageUrl: 'https://images.unsplash.com/photo-1500622944204-b135684e99fd?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0202070101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '最上川': [
    {
      id: 'mogami-1',
      name: '長崎観測所',
      location: '山形市',
      imageUrl: 'https://images.unsplash.com/photo-1505832018823-50331d70d237?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0202210101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '阿武隈川': [
    {
      id: 'abukuma-1',
      name: '福島観測所',
      location: '福島市',
      imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0202050101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],

  // 近畿
  '淀川': [
    {
      id: 'yodo-1',
      name: '枚方観測所',
      location: '枚方市',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0608010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'yodo-2',
      name: '淀川大堰',
      location: '大阪市',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0608010101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '紀の川': [
    {
      id: 'kinokawa-1',
      name: '船戸観測所',
      location: '和歌山市',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0609010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],

  // 中国
  '太田川': [
    {
      id: 'otagawa-1',
      name: '祇園観測所',
      location: '広島市',
      imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0710010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '江の川': [
    {
      id: 'gonokawa-1',
      name: '川本観測所',
      location: '川本町',
      imageUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0711010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],

  // 四国
  '吉野川': [
    {
      id: 'yoshino-1',
      name: '岩津観測所',
      location: '徳島市',
      imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0801010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'yoshino-2',
      name: '川島観測所',
      location: '吉野川市',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0801010101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '四万十川': [
    {
      id: 'shimanto-1',
      name: '具同観測所',
      location: '四万十市',
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0804010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],

  // 九州
  '筑後川': [
    {
      id: 'chikugo-1',
      name: '瀬ノ下観測所',
      location: '久留米市',
      imageUrl: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0901010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'chikugo-2',
      name: '城島観測所',
      location: '久留米市',
      imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0901010101100020',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
  '球磨川': [
    {
      id: 'kuma-1',
      name: '人吉観測所',
      location: '人吉市',
      imageUrl: 'https://images.unsplash.com/photo-1500622944204-b135684e99fd?w=800&q=80',
      webUrl: 'https://www.river.go.jp/kawabou/ipCamera.do?init=init&obsrvId=0904010101100010',
      lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ],
};

// 川名からカメラ情報を取得する関数
export function getRiverCameras(riverName: string): CameraInfo[] {
  return riverCameraMapping[riverName] || [];
}

// カメラ画像URLを更新する関数（最新のタイムスタンプを追加）
export function getUpdatedCameraUrl(baseUrl: string): string {
  const timestamp = new Date().getTime();
  return `${baseUrl}&_t=${timestamp}`;
}
