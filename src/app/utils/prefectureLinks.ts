// 都道府県名から河川カメラ情報のGoogle検索URLを返す
// 個別の県サイトURLはページ移動で頻繁に404になるため、検索URLを使用
export function getPrefectureCameraUrl(prefecture: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(prefecture + ' 河川 ライブカメラ')}`;
}

// 都道府県の防災情報ページURLマッピング
const prefectureDisasterUrls: { [key: string]: string } = {
  // 北海道
  '北海道': 'https://www.bousai-hokkaido.jp/',
  
  // 東北
  '青森県': 'https://www.bousai.pref.aomori.jp/',
  '岩手県': 'https://www.pref.iwate.jp/kurashikankyou/anzen/index.html',
  '宮城県': 'https://www.pref.miyagi.jp/site/bousai/',
  '秋田県': 'https://www.pref.akita.lg.jp/pages/genre/bousai',
  '山形県': 'https://www.pref.yamagata.jp/180026/bosai/',
  '福島県': 'https://www.pref.fukushima.lg.jp/site/bousai/',
  
  // 関東
  '茨城県': 'https://www.pref.ibaraki.jp/seikatsukankyo/bousaikiki/',
  '栃木県': 'https://www.pref.tochigi.lg.jp/c03/intro/bousai/',
  '群馬県': 'https://www.pref.gunma.jp/site/bousai/',
  '埼玉県': 'https://www.pref.saitama.lg.jp/a0401/bousai/',
  '千葉県': 'https://www.pref.chiba.lg.jp/bousai/',
  '東京都': 'https://www.bousai.metro.tokyo.lg.jp/',
  '神奈川県': 'https://www.pref.kanagawa.jp/docs/j8g/cnt/f360944/',
  
  // 中部
  '新潟県': 'https://www.pref.niigata.lg.jp/sec/bosai/',
  '富山県': 'https://www.pref.toyama.jp/1200/bosai/',
  '石川県': 'https://www.pref.ishikawa.lg.jp/bousai/',
  '福井県': 'https://www.pref.fukui.lg.jp/doc/kikitaisaku/',
  '山梨県': 'https://www.pref.yamanashi.jp/bousai/',
  '長野県': 'https://www.pref.nagano.lg.jp/kikikan/',
  '岐阜県': 'https://www.pref.gifu.lg.jp/site/bosai/',
  '静岡県': 'https://www.pref.shizuoka.jp/bousai/',
  '愛知県': 'https://www.pref.aichi.jp/bousai/',
  
  // 近畿
  '三重県': 'https://www.pref.mie.lg.jp/BOSAI/',
  '滋賀県': 'https://www.pref.shiga.lg.jp/ippan/kurashi/bosai/',
  '京都府': 'https://www.pref.kyoto.jp/kikikanri/',
  '大阪府': 'https://www.pref.osaka.lg.jp/kikikanri/',
  '兵庫県': 'https://web.pref.hyogo.lg.jp/kk03/',
  '奈良県': 'https://www.pref.nara.jp/1691.htm',
  '和歌山県': 'https://www.pref.wakayama.lg.jp/prefg/011400/',
  
  // 中国
  '鳥取県': 'https://www.pref.tottori.lg.jp/dd.aspx?menuid=59852',
  '島根県': 'https://www.pref.shimane.lg.jp/bousai_info/',
  '岡山県': 'https://www.pref.okayama.jp/site/bousai/',
  '広島県': 'https://www.pref.hiroshima.lg.jp/site/bousai/',
  '山口県': 'https://www.pref.yamaguchi.lg.jp/soshiki/17/',
  
  // 四国
  '徳島県': 'https://anshin.pref.tokushima.jp/',
  '香川県': 'https://www.pref.kagawa.lg.jp/kikikanri/',
  '愛媛県': 'https://www.pref.ehime.jp/h99900/',
  '高知県': 'https://www.pref.kochi.lg.jp/soshiki/010201/',
  
  // 九州
  '福岡県': 'https://www.bousai.pref.fukuoka.jp/',
  '佐賀県': 'https://www.pref.saga.lg.jp/bousai/',
  '長崎県': 'https://www.pref.nagasaki.jp/bunrui/kurashi-kankyo/bosai/',
  '熊本県': 'https://www.pref.kumamoto.jp/soshiki/4/',
  '大分県': 'https://www.pref.oita.jp/site/bousai/',
  '宮崎県': 'https://www.pref.miyazaki.lg.jp/kiki-kikikanri/',
  '鹿児島県': 'https://www.pref.kagoshima.jp/aj03/',
  '沖縄県': 'https://www.pref.okinawa.jp/site/chijiko/bosai/',
};

// 都道府県名から防災情報ページのURLを取得する関数
export function getPrefectureDisasterUrl(prefecture: string): string {
  return prefectureDisasterUrls[prefecture] || `https://www.google.com/search?q=${encodeURIComponent(prefecture + ' 防災情報')}`;
}
