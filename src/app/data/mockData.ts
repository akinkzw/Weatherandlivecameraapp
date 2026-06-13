import { River } from '../App';

export const mockRivers: River[] = [
  // 利根川（県別）
  {
    id: '1',
    name: '利根川',
    region: 'kanto',
    prefecture: '群馬県',
    length: 322,
    waterLevel: 3.45,
    warningLevel: 5.20,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c1',
        name: '利根川上流カメラ',
        location: '群馬県みなかみ町',
        imageUrl: 'https://images.unsplash.com/photo-1618330905853-8e23e9cc2cf5?w=800&q=80',
        lastUpdated: '5分前'
      }
    ],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 11, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '1-2',
    name: '利根川',
    region: 'kanto',
    prefecture: '埼玉県',
    length: 322,
    waterLevel: 3.40,
    warningLevel: 5.20,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c2',
        name: '利根川中流カメラ',
        location: '埼玉県行田市',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        lastUpdated: '3分前'
      }
    ],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 14, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 12, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '1-3',
    name: '利根川',
    region: 'kanto',
    prefecture: '茨城県',
    length: 322,
    waterLevel: 3.35,
    warningLevel: 5.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 14, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '1-4',
    name: '利根川',
    region: 'kanto',
    prefecture: '千葉県',
    length: 322,
    waterLevel: 3.30,
    warningLevel: 5.20,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c3',
        name: '利根川河口カメラ',
        location: '千葉県銚子市',
        imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80',
        lastUpdated: '2分前'
      }
    ],
    weather: [
      { date: '今日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 15, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  // 渡良瀬川（県別）
  {
    id: '9',
    name: '渡良瀬川',
    region: 'kanto',
    prefecture: '栃木県',
    length: 107,
    waterLevel: 2.30,
    warningLevel: 4.20,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c19',
        name: '渡良瀬川上流カメラ',
        location: '栃木県日光市',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        lastUpdated: '4分前'
      }
    ],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '9-2',
    name: '渡良瀬川',
    region: 'kanto',
    prefecture: '群馬県',
    length: 107,
    waterLevel: 2.25,
    warningLevel: 4.20,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c20',
        name: '渡良瀬川中流カメラ',
        location: '群馬県桐生市',
        imageUrl: 'https://images.unsplash.com/photo-1618330905853-8e23e9cc2cf5?w=800&q=80',
        lastUpdated: '6分前'
      }
    ],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '9-3',
    name: '渡良瀬川',
    region: 'kanto',
    prefecture: '埼玉県',
    length: 107,
    waterLevel: 2.20,
    warningLevel: 4.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 14, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '10',
    name: '犀川',
    region: 'chubu',
    prefecture: '石川県',
    length: 73,
    waterLevel: 1.85,
    warningLevel: 3.50,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c21',
        name: '犀川上流カメラ',
        location: '石川県白山市',
        imageUrl: 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=800&q=80',
        lastUpdated: '3分前'
      },
      {
        id: 'c22',
        name: '犀川河口カメラ',
        location: '石川県金沢市',
        imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
        lastUpdated: '5分前'
      }
    ],
    weather: [
      { date: '今日', temp: 13, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 14, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '明後日', temp: 12, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  // 信濃川（県別）
  {
    id: '2',
    name: '信濃川',
    region: 'chubu',
    prefecture: '新潟県',
    length: 367,
    waterLevel: 2.85,
    warningLevel: 4.50,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c5',
        name: '信濃川河口カメラ',
        location: '新潟県新潟市',
        imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
        lastUpdated: '6分前'
      }
    ],
    weather: [
      { date: '今日', temp: 12, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 13, condition: '雨', precipitation: 12, icon: 'rain' },
      { date: '明後日', temp: 11, condition: '雨', precipitation: 15, icon: 'rain' },
      { date: '3日後', temp: 14, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  {
    id: '2-2',
    name: '信濃川',
    region: 'chubu',
    prefecture: '長野県',
    length: 367,
    waterLevel: 2.90,
    warningLevel: 4.50,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c4',
        name: '信濃川上流カメラ',
        location: '長野県飯山市',
        imageUrl: 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=800&q=80',
        lastUpdated: '4分前'
      }
    ],
    weather: [
      { date: '今日', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 12, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '3',
    name: '淀川',
    region: 'kinki',
    prefecture: '京都府',
    length: 75,
    waterLevel: 4.20,
    warningLevel: 5.00,
    currentStatus: 'caution',
    cameras: [
      {
        id: 'c6',
        name: '淀川上流カメラ',
        location: '京都府八幡市',
        imageUrl: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
        lastUpdated: '1分前'
      }
    ],
    weather: [
      { date: '今日', temp: 18, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '明日', temp: 19, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '3-2',
    name: '淀川',
    region: 'kinki',
    prefecture: '大阪府',
    length: 75,
    waterLevel: 4.15,
    warningLevel: 5.00,
    currentStatus: 'caution',
    cameras: [
      {
        id: 'c7',
        name: '淀川河口カメラ',
        location: '大阪府大阪市',
        imageUrl: 'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=800&q=80',
        lastUpdated: '3分前'
      }
    ],
    weather: [
      { date: '今日', temp: 19, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '明日', temp: 20, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '3日後', temp: 22, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 筑後川（県別）
  {
    id: '4',
    name: '筑後川',
    region: 'kyushu',
    prefecture: '福岡県',
    length: 143,
    waterLevel: 5.50,
    warningLevel: 5.20,
    currentStatus: 'warning',
    cameras: [
      {
        id: 'c9',
        name: '筑後川中流カメラ',
        location: '福岡県久留米市',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
        lastUpdated: '1分前'
      },
      {
        id: 'c10',
        name: '筑後川河口カメラ',
        location: '福岡県大川市',
        imageUrl: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=800&q=80',
        lastUpdated: '4分前'
      }
    ],
    weather: [
      { date: '今日', temp: 20, condition: '雨', precipitation: 25, icon: 'rain' },
      { date: '明日', temp: 19, condition: '雨', precipitation: 18, icon: 'rain' },
      { date: '明後日', temp: 21, condition: '曇り', precipitation: 5, icon: 'cloud' },
      { date: '3日後', temp: 22, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '4-2',
    name: '筑後川',
    region: 'kyushu',
    prefecture: '大分県',
    length: 143,
    waterLevel: 5.55,
    warningLevel: 5.20,
    currentStatus: 'warning',
    cameras: [
      {
        id: 'c8',
        name: '筑後川上流カメラ',
        location: '大分県日田市',
        imageUrl: 'https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?w=800&q=80',
        lastUpdated: '2分前'
      }
    ],
    weather: [
      { date: '今日', temp: 19, condition: '雨', precipitation: 25, icon: 'rain' },
      { date: '明日', temp: 18, condition: '雨', precipitation: 18, icon: 'rain' },
      { date: '明後日', temp: 20, condition: '曇り', precipitation: 5, icon: 'cloud' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '4-3',
    name: '筑後川',
    region: 'kyushu',
    prefecture: '熊本県',
    length: 143,
    waterLevel: 5.45,
    warningLevel: 5.20,
    currentStatus: 'warning',
    cameras: [],
    weather: [
      { date: '今日', temp: 19, condition: '雨', precipitation: 25, icon: 'rain' },
      { date: '明日', temp: 18, condition: '雨', precipitation: 18, icon: 'rain' },
      { date: '明後日', temp: 20, condition: '曇り', precipitation: 5, icon: 'cloud' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 多摩川（県別）
  {
    id: '5',
    name: '多摩川',
    region: 'kanto',
    prefecture: '東京都',
    length: 138,
    waterLevel: 2.10,
    warningLevel: 4.00,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c11',
        name: '多摩川上流カメラ',
        location: '東京都青梅市',
        imageUrl: 'https://images.unsplash.com/photo-1541795083-1b160cf4f3d5?w=800&q=80',
        lastUpdated: '5分前'
      }
    ],
    weather: [
      { date: '今日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 15, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 14, condition: '雨', precipitation: 6, icon: 'rain' }
    ]
  },
  {
    id: '5-2',
    name: '多摩川',
    region: 'kanto',
    prefecture: '神奈川県',
    length: 138,
    waterLevel: 2.05,
    warningLevel: 4.00,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c12',
        name: '多摩川河口カメラ',
        location: '神奈川県川崎市',
        imageUrl: 'https://images.unsplash.com/photo-1535972555851-4b87eea1f01c?w=800&q=80',
        lastUpdated: '3分前'
      }
    ],
    weather: [
      { date: '今日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 16, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 15, condition: '雨', precipitation: 6, icon: 'rain' }
    ]
  },
  {
    id: '6',
    name: '石狩川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 268,
    waterLevel: 1.95,
    warningLevel: 3.80,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c13',
        name: '石狩川上流カメラ',
        location: '北海道上川町',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        lastUpdated: '7分前'
      },
      {
        id: 'c14',
        name: '石狩川河口カメラ',
        location: '北海道石狩市',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
        lastUpdated: '5分前'
      }
    ],
    weather: [
      { date: '今日', temp: 8, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 7, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 6, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 北上川（県別）
  {
    id: '7',
    name: '北上川',
    region: 'tohoku',
    prefecture: '岩手県',
    length: 249,
    waterLevel: 3.60,
    warningLevel: 5.50,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c15',
        name: '北上川上流カメラ',
        location: '岩手県盛岡市',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        lastUpdated: '6分前'
      }
    ],
    weather: [
      { date: '今日', temp: 10, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 11, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '明後日', temp: 9, condition: '雨', precipitation: 12, icon: 'rain' },
      { date: '3日後', temp: 12, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  {
    id: '7-2',
    name: '北上川',
    region: 'tohoku',
    prefecture: '宮城県',
    length: 249,
    waterLevel: 3.55,
    warningLevel: 5.50,
    currentStatus: 'normal',
    cameras: [
      {
        id: 'c16',
        name: '北上川河口カメラ',
        location: '宮城県石巻市',
        imageUrl: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800&q=80',
        lastUpdated: '4分前'
      }
    ],
    weather: [
      { date: '今日', temp: 11, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 12, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 12, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  // 吉野川（県別）
  {
    id: '8',
    name: '吉野川',
    region: 'shikoku',
    prefecture: '徳島県',
    length: 194,
    waterLevel: 4.10,
    warningLevel: 5.30,
    currentStatus: 'caution',
    cameras: [
      {
        id: 'c18',
        name: '吉野川河口カメラ',
        location: '徳島県徳島市',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        lastUpdated: '2分前'
      }
    ],
    weather: [
      { date: '今日', temp: 19, condition: '雨', precipitation: 15, icon: 'rain' },
      { date: '明日', temp: 20, condition: '曇り', precipitation: 4, icon: 'cloud' },
      { date: '明後日', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '3日後', temp: 22, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '8-2',
    name: '吉野川',
    region: 'shikoku',
    prefecture: '高知県',
    length: 194,
    waterLevel: 4.15,
    warningLevel: 5.30,
    currentStatus: 'caution',
    cameras: [
      {
        id: 'c17',
        name: '吉野川上流カメラ',
        location: '高知県大豊町',
        imageUrl: 'https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?w=800&q=80',
        lastUpdated: '3分前'
      }
    ],
    weather: [
      { date: '今日', temp: 18, condition: '雨', precipitation: 15, icon: 'rain' },
      { date: '明日', temp: 19, condition: '曇り', precipitation: 4, icon: 'cloud' },
      { date: '明後日', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '11',
    name: '尻別川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 126,
    waterLevel: 1.45,
    warningLevel: 3.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 9, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 8, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 7, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 10, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '12',
    name: '千歳川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 108,
    waterLevel: 1.20,
    warningLevel: 2.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '13',
    name: '忠別川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 86,
    waterLevel: 1.10,
    warningLevel: 2.60,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '14',
    name: '最上川',
    region: 'tohoku',
    prefecture: '山形県',
    length: 229,
    waterLevel: 2.95,
    warningLevel: 4.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 12, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 11, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  {
    id: '15',
    name: '米代川',
    region: 'tohoku',
    prefecture: '秋田県',
    length: 136,
    waterLevel: 2.15,
    warningLevel: 3.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 10, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 9, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '明後日', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 阿武隈川（県別）
  {
    id: '16',
    name: '阿武隈川',
    region: 'tohoku',
    prefecture: '福島県',
    length: 239,
    waterLevel: 3.25,
    warningLevel: 5.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 12, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 13, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 11, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '16-2',
    name: '阿武隈川',
    region: 'tohoku',
    prefecture: '宮城県',
    length: 239,
    waterLevel: 3.20,
    warningLevel: 5.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 12, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 13, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 11, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 那珂川（県別）
  {
    id: '17',
    name: '那珂川',
    region: 'kanto',
    prefecture: '栃木県',
    length: 150,
    waterLevel: 2.40,
    warningLevel: 4.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 13, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 12, condition: '雨', precipitation: 5, icon: 'rain' }
    ]
  },
  {
    id: '17-2',
    name: '那珂川',
    region: 'kanto',
    prefecture: '茨城県',
    length: 150,
    waterLevel: 2.35,
    warningLevel: 4.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 14, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 13, condition: '雨', precipitation: 5, icon: 'rain' }
    ]
  },
  // 鬼怒川（県別）
  {
    id: '18',
    name: '鬼怒川',
    region: 'kanto',
    prefecture: '栃木県',
    length: 176,
    waterLevel: 2.65,
    warningLevel: 4.50,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '18-2',
    name: '鬼怒川',
    region: 'kanto',
    prefecture: '茨城県',
    length: 176,
    waterLevel: 2.60,
    warningLevel: 4.50,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 14, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 荒川（県別）
  {
    id: '19',
    name: '荒川',
    region: 'kanto',
    prefecture: '埼玉県',
    length: 173,
    waterLevel: 2.80,
    warningLevel: 4.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 15, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 14, condition: '雨', precipitation: 6, icon: 'rain' }
    ]
  },
  {
    id: '19-2',
    name: '荒川',
    region: 'kanto',
    prefecture: '東京都',
    length: 173,
    waterLevel: 2.75,
    warningLevel: 4.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 16, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 15, condition: '雨', precipitation: 6, icon: 'rain' }
    ]
  },
  {
    id: '20',
    name: '相模川',
    region: 'kanto',
    prefecture: '神奈川県',
    length: 113,
    waterLevel: 2.05,
    warningLevel: 3.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '3日後', temp: 15, condition: '雨', precipitation: 4, icon: 'rain' }
    ]
  },
  {
    id: '21',
    name: '黒部川',
    region: 'chubu',
    prefecture: '富山県',
    length: 85,
    waterLevel: 1.75,
    warningLevel: 3.40,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 12, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 12, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  {
    id: '22',
    name: '神通川',
    region: 'chubu',
    prefecture: '富山県',
    length: 120,
    waterLevel: 2.20,
    warningLevel: 4.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 12, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 13, condition: '雨', precipitation: 11, icon: 'rain' },
      { date: '明後日', temp: 11, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '3日後', temp: 14, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '23',
    name: '庄川',
    region: 'chubu',
    prefecture: '富山県',
    length: 115,
    waterLevel: 2.10,
    warningLevel: 3.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 12, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 13, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '明後日', temp: 11, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '3日後', temp: 14, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  // 木曽川（県別）
  {
    id: '24',
    name: '木曽川',
    region: 'chubu',
    prefecture: '長野県',
    length: 229,
    waterLevel: 3.10,
    warningLevel: 5.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 14, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 12, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '24-2',
    name: '木曽川',
    region: 'chubu',
    prefecture: '岐阜県',
    length: 229,
    waterLevel: 3.05,
    warningLevel: 5.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '24-3',
    name: '木曽川',
    region: 'chubu',
    prefecture: '愛知県',
    length: 229,
    waterLevel: 3.00,
    warningLevel: 5.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 14, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 天竜川（県別）
  {
    id: '25',
    name: '天竜川',
    region: 'chubu',
    prefecture: '長野県',
    length: 213,
    waterLevel: 2.90,
    warningLevel: 4.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 13, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 12, condition: '雨', precipitation: 6, icon: 'rain' }
    ]
  },
  {
    id: '25-2',
    name: '天竜川',
    region: 'chubu',
    prefecture: '静岡県',
    length: 213,
    waterLevel: 2.85,
    warningLevel: 4.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 14, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 13, condition: '雨', precipitation: 6, icon: 'rain' }
    ]
  },
  {
    id: '26',
    name: '九頭竜川',
    region: 'chubu',
    prefecture: '福井県',
    length: 116,
    waterLevel: 2.25,
    warningLevel: 4.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 13, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 14, condition: '雨', precipitation: 11, icon: 'rain' },
      { date: '明後日', temp: 12, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  {
    id: '27',
    name: '由良川',
    region: 'kinki',
    prefecture: '京都府',
    length: 146,
    waterLevel: 2.55,
    warningLevel: 4.40,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 17, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '明後日', temp: 18, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 19, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 熊野川（県別）
  {
    id: '28',
    name: '熊野川',
    region: 'kinki',
    prefecture: '和歌山県',
    length: 183,
    waterLevel: 2.75,
    warningLevel: 4.60,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 19, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '28-2',
    name: '熊野川',
    region: 'kinki',
    prefecture: '三重県',
    length: 183,
    waterLevel: 2.70,
    warningLevel: 4.60,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 19, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 江の川（県別）
  {
    id: '29',
    name: '江の川',
    region: 'chugoku',
    prefecture: '広島県',
    length: 194,
    waterLevel: 2.85,
    warningLevel: 4.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 17, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '明後日', temp: 18, condition: '曇り', precipitation: 3, icon: 'cloud' },
      { date: '3日後', temp: 19, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '29-2',
    name: '江の川',
    region: 'chugoku',
    prefecture: '島根県',
    length: 194,
    waterLevel: 2.80,
    warningLevel: 4.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 16, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '明後日', temp: 17, condition: '曇り', precipitation: 3, icon: 'cloud' },
      { date: '3日後', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '30',
    name: '高梁川',
    region: 'chugoku',
    prefecture: '岡山県',
    length: 111,
    waterLevel: 2.00,
    warningLevel: 3.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 19, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '31',
    name: '四万十川',
    region: 'shikoku',
    prefecture: '高知県',
    length: 196,
    waterLevel: 2.90,
    warningLevel: 4.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 19, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 20, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '32',
    name: '仁淀川',
    region: 'shikoku',
    prefecture: '高知県',
    length: 124,
    waterLevel: 2.30,
    warningLevel: 4.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 19, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 20, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '33',
    name: '球磨川',
    region: 'kyushu',
    prefecture: '熊本県',
    length: 115,
    waterLevel: 2.20,
    warningLevel: 4.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 19, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 20, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '明後日', temp: 21, condition: '曇り', precipitation: 4, icon: 'cloud' },
      { date: '3日後', temp: 22, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '34',
    name: '五ヶ瀬川',
    region: 'kyushu',
    prefecture: '宮崎県',
    length: 106,
    waterLevel: 2.05,
    warningLevel: 3.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 21, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 22, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '3日後', temp: 23, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '35',
    name: '大淀川',
    region: 'kyushu',
    prefecture: '宮崎県',
    length: 107,
    waterLevel: 2.15,
    warningLevel: 3.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 21, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 22, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 23, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '36',
    name: '大芦川',
    region: 'kanto',
    prefecture: '栃木県',
    length: 41,
    waterLevel: 1.35,
    warningLevel: 2.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 14, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 12, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '37',
    name: '千曲川',
    region: 'chubu',
    prefecture: '長野県',
    length: 214,
    waterLevel: 2.75,
    warningLevel: 4.60,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 12, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 富士川（県別）
  {
    id: '38',
    name: '富士川',
    region: 'chubu',
    prefecture: '山梨県',
    length: 128,
    waterLevel: 2.20,
    warningLevel: 4.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 13, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 12, condition: '雨', precipitation: 4, icon: 'rain' }
    ]
  },
  {
    id: '38-2',
    name: '富士川',
    region: 'chubu',
    prefecture: '静岡県',
    length: 128,
    waterLevel: 2.15,
    warningLevel: 4.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 14, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 13, condition: '雨', precipitation: 4, icon: 'rain' }
    ]
  },
  {
    id: '39',
    name: '雄物川',
    region: 'tohoku',
    prefecture: '秋田県',
    length: 133,
    waterLevel: 2.40,
    warningLevel: 4.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 9, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 8, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 7, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 10, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '40',
    name: '閉伊川',
    region: 'tohoku',
    prefecture: '岩手県',
    length: 77,
    waterLevel: 1.65,
    warningLevel: 3.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 9, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 10, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '明後日', temp: 8, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '3日後', temp: 11, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '41',
    name: '長良川',
    region: 'chubu',
    prefecture: '岐阜県',
    length: 166,
    waterLevel: 2.50,
    warningLevel: 4.40,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '42',
    name: '魚野川',
    region: 'chubu',
    prefecture: '新潟県',
    length: 66,
    waterLevel: 1.55,
    warningLevel: 3.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 12, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 11, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  {
    id: '43',
    name: '奥入瀬渓流',
    region: 'tohoku',
    prefecture: '青森県',
    length: 14,
    waterLevel: 0.85,
    warningLevel: 2.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 3, icon: 'cloud' }
    ]
  },
  {
    id: '44',
    name: '付知川',
    region: 'chubu',
    prefecture: '岐阜県',
    length: 42,
    waterLevel: 1.20,
    warningLevel: 2.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 14, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 12, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 桂川（県別）
  {
    id: '45',
    name: '桂川',
    region: 'kanto',
    prefecture: '山梨県',
    length: 70,
    waterLevel: 1.60,
    warningLevel: 3.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 13, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 12, condition: '雨', precipitation: 5, icon: 'rain' }
    ]
  },
  {
    id: '45-2',
    name: '桂川',
    region: 'kanto',
    prefecture: '神奈川県',
    length: 70,
    waterLevel: 1.55,
    warningLevel: 3.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 15, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 14, condition: '雨', precipitation: 5, icon: 'rain' }
    ]
  },
  {
    id: '46',
    name: '桂川',
    region: 'kinki',
    prefecture: '京都府',
    length: 46,
    waterLevel: 1.45,
    warningLevel: 3.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 17, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '明後日', temp: 18, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 19, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '47',
    name: '奥多摩川',
    region: 'kanto',
    prefecture: '東京都',
    length: 48,
    waterLevel: 1.40,
    warningLevel: 3.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 13, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 12, condition: '雨', precipitation: 5, icon: 'rain' }
    ]
  },
  {
    id: '48',
    name: '大門川',
    region: 'chubu',
    prefecture: '岐阜県',
    length: 35,
    waterLevel: 1.15,
    warningLevel: 2.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 14, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '明後日', temp: 12, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '49',
    name: '川辺川',
    region: 'kyushu',
    prefecture: '熊本県',
    length: 62,
    waterLevel: 1.50,
    warningLevel: 3.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 18, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 19, condition: '雨', precipitation: 9, icon: 'rain' },
      { date: '明後日', temp: 20, condition: '曇り', precipitation: 3, icon: 'cloud' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '50',
    name: '豊平川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 72,
    waterLevel: 1.65,
    warningLevel: 3.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 7, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 6, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '51',
    name: '名取川',
    region: 'tohoku',
    prefecture: '宮城県',
    length: 55,
    waterLevel: 1.50,
    warningLevel: 3.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 12, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 10, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '52',
    name: '荒川',
    region: 'tohoku',
    prefecture: '福島県',
    length: 44,
    waterLevel: 1.30,
    warningLevel: 2.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 12, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '53',
    name: '入間川',
    region: 'kanto',
    prefecture: '埼玉県',
    length: 63,
    waterLevel: 1.55,
    warningLevel: 3.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 14, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 13, condition: '雨', precipitation: 5, icon: 'rain' }
    ]
  },
  {
    id: '54',
    name: '秋川',
    region: 'kanto',
    prefecture: '東京都',
    length: 33,
    waterLevel: 1.05,
    warningLevel: 2.50,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 14, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 13, condition: '雨', precipitation: 4, icon: 'rain' }
    ]
  },
  {
    id: '55',
    name: '狩野川',
    region: 'chubu',
    prefecture: '静岡県',
    length: 46,
    waterLevel: 1.40,
    warningLevel: 3.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明後日', temp: 15, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '3日後', temp: 14, condition: '雨', precipitation: 3, icon: 'rain' }
    ]
  },
  {
    id: '56',
    name: '安曇川',
    region: 'kinki',
    prefecture: '滋賀県',
    length: 44,
    waterLevel: 1.35,
    warningLevel: 2.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 16, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '明後日', temp: 17, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '57',
    name: '旭川',
    region: 'chugoku',
    prefecture: '岡山県',
    length: 142,
    waterLevel: 2.45,
    warningLevel: 4.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 17, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 18, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 19, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '58',
    name: '犀川',
    region: 'chubu',
    prefecture: '長野県',
    length: 77,
    waterLevel: 1.70,
    warningLevel: 3.40,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 12, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '59',
    name: 'エカニウス川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 35,
    waterLevel: 0.95,
    warningLevel: 2.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 7, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 6, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '60',
    name: 'オゴチナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 28,
    waterLevel: 0.85,
    warningLevel: 2.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '61',
    name: 'オゴツナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 32,
    waterLevel: 0.90,
    warningLevel: 2.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '62',
    name: 'オサナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 25,
    waterLevel: 0.75,
    warningLevel: 2.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '63',
    name: 'オニクス川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 30,
    waterLevel: 0.88,
    warningLevel: 2.15,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '64',
    name: 'オウッタラウシ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 38,
    waterLevel: 1.00,
    warningLevel: 2.40,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '65',
    name: 'ササンナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 27,
    waterLevel: 0.82,
    warningLevel: 2.05,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '66',
    name: 'シシチナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 29,
    waterLevel: 0.87,
    warningLevel: 2.12,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '67',
    name: 'タタミ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 24,
    waterLevel: 0.72,
    warningLevel: 1.95,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 3, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '68',
    name: 'チカブナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 31,
    waterLevel: 0.89,
    warningLevel: 2.18,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '69',
    name: 'チカブチナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 26,
    waterLevel: 0.78,
    warningLevel: 2.02,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '70',
    name: 'トヤイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 22,
    waterLevel: 0.68,
    warningLevel: 1.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '71',
    name: 'ドケツ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 28,
    waterLevel: 0.84,
    warningLevel: 2.08,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '72',
    name: 'ビライト川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 33,
    waterLevel: 0.92,
    warningLevel: 2.25,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '73',
    name: 'ホロナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 29,
    waterLevel: 0.86,
    warningLevel: 2.10,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '74',
    name: 'ポンオゴツナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 20,
    waterLevel: 0.65,
    warningLevel: 1.85,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '75',
    name: 'ポンナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 23,
    waterLevel: 0.70,
    warningLevel: 1.92,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 3, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '76',
    name: 'ポシカ真串川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 27,
    waterLevel: 0.81,
    warningLevel: 2.04,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '77',
    name: 'ポシカオサッカ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 25,
    waterLevel: 0.76,
    warningLevel: 2.01,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '78',
    name: 'ウンガヨナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 26,
    waterLevel: 0.79,
    warningLevel: 2.03,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '79',
    name: '三並川',
    region: 'chubu',
    prefecture: '岐阜県',
    length: 18,
    waterLevel: 0.60,
    warningLevel: 1.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 14, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 15, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 13, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '80',
    name: '中島北の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.55,
    warningLevel: 1.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '81',
    name: '中島南の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.58,
    warningLevel: 1.75,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 3, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '82',
    name: '中野沢川',
    region: 'tohoku',
    prefecture: '福島県',
    length: 19,
    waterLevel: 0.62,
    warningLevel: 1.82,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 12, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '83',
    name: '九郷川',
    region: 'kinki',
    prefecture: '兵庫県',
    length: 21,
    waterLevel: 0.67,
    warningLevel: 1.88,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 17, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 18, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 19, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '84',
    name: '井雲谷川',
    region: 'chugoku',
    prefecture: '島根県',
    length: 17,
    waterLevel: 0.59,
    warningLevel: 1.77,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 15, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 16, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '明後日', temp: 17, condition: '曇り', precipitation: 3, icon: 'cloud' },
      { date: '3日後', temp: 18, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '85',
    name: '伏見川',
    region: 'kinki',
    prefecture: '京都府',
    length: 12,
    waterLevel: 0.50,
    warningLevel: 1.60,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 17, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 18, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 19, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 20, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '86',
    name: '入中の沢川',
    region: 'chubu',
    prefecture: '長野県',
    length: 14,
    waterLevel: 0.53,
    warningLevel: 1.65,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 12, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '87',
    name: '入江川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.57,
    warningLevel: 1.73,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 2, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '88',
    name: '冷水川',
    region: 'chubu',
    prefecture: '長野県',
    length: 13,
    waterLevel: 0.52,
    warningLevel: 1.63,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 10, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 11, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 9, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 12, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '89',
    name: '利貢の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.56,
    warningLevel: 1.72,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '90',
    name: '勝山川',
    region: 'chugoku',
    prefecture: '岡山県',
    length: 24,
    waterLevel: 0.73,
    warningLevel: 1.96,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 16, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 17, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 18, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 19, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '91',
    name: '北五輪川',
    region: 'kyushu',
    prefecture: '熊本県',
    length: 19,
    waterLevel: 0.63,
    warningLevel: 1.84,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 18, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 19, condition: '雨', precipitation: 8, icon: 'rain' },
      { date: '明後日', temp: 20, condition: '曇り', precipitation: 3, icon: 'cloud' },
      { date: '3日後', temp: 21, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '92',
    name: '十石川',
    region: 'chubu',
    prefecture: '長野県',
    length: 22,
    waterLevel: 0.69,
    warningLevel: 1.91,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 11, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 12, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '明後日', temp: 10, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 13, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '93',
    name: '和渡沢川',
    region: 'chubu',
    prefecture: '長野県',
    length: 17,
    waterLevel: 0.60,
    warningLevel: 1.79,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 10, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 11, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 9, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 12, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  // 北海道の川（追加分1）
  {
    id: '94',
    name: '鵡川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 135,
    waterLevel: 1.85,
    warningLevel: 3.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '95',
    name: '土居の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.45,
    warningLevel: 1.50,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '96',
    name: '坂泉川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 18,
    waterLevel: 0.60,
    warningLevel: 1.80,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '97',
    name: '大登の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.52,
    warningLevel: 1.65,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '98',
    name: '天狗川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 22,
    waterLevel: 0.68,
    warningLevel: 1.90,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '99',
    name: '奥田川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 20,
    waterLevel: 0.64,
    warningLevel: 1.85,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '100',
    name: '安達の川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.55,
    warningLevel: 1.70,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '101',
    name: '菅貫郷川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 19,
    waterLevel: 0.62,
    warningLevel: 1.82,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '102',
    name: '富幌沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.48,
    warningLevel: 1.58,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '103',
    name: '有川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 25,
    waterLevel: 0.75,
    warningLevel: 2.00,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '104',
    name: '小学校の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.42,
    warningLevel: 1.45,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '105',
    name: '雲鳥川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 17,
    waterLevel: 0.58,
    warningLevel: 1.75,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '106',
    name: '成田の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.46,
    warningLevel: 1.52,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '107',
    name: '里の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.44,
    warningLevel: 1.48,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '108',
    name: '木古内の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.50,
    warningLevel: 1.62,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '109',
    name: '木近中沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.47,
    warningLevel: 1.55,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '110',
    name: '早子場内川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.54,
    warningLevel: 1.68,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '111',
    name: '黒ら中の川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.45,
    warningLevel: 1.51,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '112',
    name: '東元中沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.51,
    warningLevel: 1.64,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '113',
    name: '開墾の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.43,
    warningLevel: 1.47,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '114',
    name: '栄石川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 18,
    waterLevel: 0.59,
    warningLevel: 1.78,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '115',
    name: '源別川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 21,
    waterLevel: 0.67,
    warningLevel: 1.88,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '116',
    name: '浜古多曲川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.53,
    warningLevel: 1.66,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '117',
    name: '清里川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 27,
    waterLevel: 0.82,
    warningLevel: 2.15,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '118',
    name: '清水沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.49,
    warningLevel: 1.59,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '119',
    name: '温泉川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 19,
    waterLevel: 0.63,
    warningLevel: 1.83,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '120',
    name: '洪海川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.44,
    warningLevel: 1.49,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '121',
    name: '田村沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.41,
    warningLevel: 1.43,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '122',
    name: '男爵川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 17,
    waterLevel: 0.56,
    warningLevel: 1.73,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '123',
    name: '看度川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.50,
    warningLevel: 1.61,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '124',
    name: '白坂川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.47,
    warningLevel: 1.56,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '125',
    name: '白萩川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.45,
    warningLevel: 1.50,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '126',
    name: '白神川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.53,
    warningLevel: 1.67,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '127',
    name: '相影の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.43,
    warningLevel: 1.46,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '128',
    name: '矢野の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.40,
    warningLevel: 1.42,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '129',
    name: '石沢の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.46,
    warningLevel: 1.53,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '130',
    name: '竜神川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 24,
    waterLevel: 0.73,
    warningLevel: 1.95,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '131',
    name: '第２寿川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.38,
    warningLevel: 1.38,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '132',
    name: '給爾川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.51,
    warningLevel: 1.63,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '133',
    name: '花笑川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.44,
    warningLevel: 1.48,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '134',
    name: '若林の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.39,
    warningLevel: 1.40,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '135',
    name: '草磯川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.48,
    warningLevel: 1.57,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '136',
    name: '落石川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 23,
    waterLevel: 0.71,
    warningLevel: 1.92,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '137',
    name: '西平里川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.54,
    warningLevel: 1.69,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '138',
    name: '西測沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.45,
    warningLevel: 1.51,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '139',
    name: '西１号沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.37,
    warningLevel: 1.36,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '140',
    name: '貢森の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.42,
    warningLevel: 1.44,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '141',
    name: '谷地川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 18,
    waterLevel: 0.59,
    warningLevel: 1.77,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '142',
    name: '豊幌１号沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 9,
    waterLevel: 0.35,
    warningLevel: 1.32,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '143',
    name: '豊幌２号沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 9,
    waterLevel: 0.36,
    warningLevel: 1.33,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '144',
    name: '近労川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.50,
    warningLevel: 1.60,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '145',
    name: '道南沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.40,
    warningLevel: 1.41,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '146',
    name: '長谷川の川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.47,
    warningLevel: 1.54,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '147',
    name: '青泉川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.52,
    warningLevel: 1.65,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '148',
    name: '高磯川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.44,
    warningLevel: 1.47,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '149',
    name: '高砂川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 20,
    waterLevel: 0.65,
    warningLevel: 1.86,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '150',
    name: 'エーシュコマナイの川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 17,
    waterLevel: 0.57,
    warningLevel: 1.74,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '151',
    name: '右の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.38,
    warningLevel: 1.37,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '152',
    name: 'ウエンナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 22,
    waterLevel: 0.69,
    warningLevel: 1.91,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '153',
    name: '一の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 8,
    waterLevel: 0.32,
    warningLevel: 1.28,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '154',
    name: '二の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 8,
    waterLevel: 0.33,
    warningLevel: 1.29,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '155',
    name: '中の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 9,
    waterLevel: 0.34,
    warningLevel: 1.30,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '156',
    name: 'ウツナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 19,
    waterLevel: 0.61,
    warningLevel: 1.81,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '157',
    name: 'エウクナイ沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.43,
    warningLevel: 1.45,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '158',
    name: 'クラシップナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 24,
    waterLevel: 0.74,
    warningLevel: 1.96,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '159',
    name: 'クラシップナイ支派川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.39,
    warningLevel: 1.39,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '160',
    name: 'サラキトマナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 21,
    waterLevel: 0.66,
    warningLevel: 1.87,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '161',
    name: 'セビルンナイの沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.37,
    warningLevel: 1.35,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '162',
    name: 'セビルンナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 18,
    waterLevel: 0.58,
    warningLevel: 1.76,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '163',
    name: 'チフクシュナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.54,
    warningLevel: 1.68,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '164',
    name: 'チフクシュナイ左の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 9,
    waterLevel: 0.35,
    warningLevel: 1.31,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '165',
    name: 'ニタトロオマナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 20,
    waterLevel: 0.64,
    warningLevel: 1.84,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '166',
    name: 'ニタトロオマナイ沢の川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.40,
    warningLevel: 1.40,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '167',
    name: 'パンケシュプナイの沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.42,
    warningLevel: 1.43,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '168',
    name: 'パンケシュプナイ三の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.38,
    warningLevel: 1.36,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '169',
    name: 'マタンベツ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 19,
    waterLevel: 0.62,
    warningLevel: 1.82,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '170',
    name: 'ママカシンナイ川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 17,
    waterLevel: 0.56,
    warningLevel: 1.72,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '171',
    name: 'ヤマベノ沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.45,
    warningLevel: 1.49,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '172',
    name: '七の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 7,
    waterLevel: 0.30,
    warningLevel: 1.25,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '173',
    name: '三の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 7,
    waterLevel: 0.31,
    warningLevel: 1.26,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '174',
    name: '上小薮の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.48,
    warningLevel: 1.56,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '175',
    name: '二十六号川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.51,
    warningLevel: 1.63,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '176',
    name: '五の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 6,
    waterLevel: 0.28,
    warningLevel: 1.22,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '177',
    name: '十九の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 8,
    waterLevel: 0.33,
    warningLevel: 1.28,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '178',
    name: '十田の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.41,
    warningLevel: 1.42,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '179',
    name: '右一沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 9,
    waterLevel: 0.36,
    warningLevel: 1.33,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '180',
    name: '右田の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.43,
    warningLevel: 1.46,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '181',
    name: '吉田の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.46,
    warningLevel: 1.52,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '182',
    name: '四の沢水沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.39,
    warningLevel: 1.38,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '183',
    name: '学先谷川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.53,
    warningLevel: 1.66,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '184',
    name: '小屋の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.40,
    warningLevel: 1.41,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '185',
    name: '小沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.47,
    warningLevel: 1.55,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '186',
    name: '小樽の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.44,
    warningLevel: 1.48,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '187',
    name: '山岳の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 15,
    waterLevel: 0.50,
    warningLevel: 1.61,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '188',
    name: '左の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.37,
    warningLevel: 1.35,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '189',
    name: '早場の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.41,
    warningLevel: 1.43,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '190',
    name: '星の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.45,
    warningLevel: 1.50,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '191',
    name: '沼の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.42,
    warningLevel: 1.45,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '192',
    name: '熊の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 16,
    waterLevel: 0.54,
    warningLevel: 1.67,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '193',
    name: '牛久の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 14,
    waterLevel: 0.48,
    warningLevel: 1.57,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '194',
    name: '石炭の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 11,
    waterLevel: 0.40,
    warningLevel: 1.42,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '195',
    name: '藤山の沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 13,
    waterLevel: 0.46,
    warningLevel: 1.53,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '196',
    name: '西一号川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 9,
    waterLevel: 0.35,
    warningLevel: 1.32,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '197',
    name: '赤井川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 28,
    waterLevel: 0.85,
    warningLevel: 2.20,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '曇り', precipitation: 1, icon: 'cloud' },
      { date: '3日後', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '198',
    name: '送林沢川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 12,
    waterLevel: 0.43,
    warningLevel: 1.47,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 6, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  },
  {
    id: '199',
    name: '鉄道の沢三号川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 10,
    waterLevel: 0.38,
    warningLevel: 1.37,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明日', temp: 6, condition: '雨', precipitation: 5, icon: 'rain' },
      { date: '明後日', temp: 5, condition: '雨', precipitation: 7, icon: 'rain' },
      { date: '3日後', temp: 8, condition: '曇り', precipitation: 2, icon: 'cloud' }
    ]
  },
  {
    id: '200',
    name: '鉄道の沢支流川',
    region: 'hokkaido',
    prefecture: '北海道',
    length: 8,
    waterLevel: 0.32,
    warningLevel: 1.27,
    currentStatus: 'normal',
    cameras: [],
    weather: [
      { date: '今日', temp: 8, condition: '晴れ', precipitation: 0, icon: 'sun' },
      { date: '明日', temp: 7, condition: '曇り', precipitation: 0, icon: 'cloud' },
      { date: '明後日', temp: 6, condition: '雨', precipitation: 4, icon: 'rain' },
      { date: '3日後', temp: 9, condition: '晴れ', precipitation: 0, icon: 'sun' }
    ]
  }
];
