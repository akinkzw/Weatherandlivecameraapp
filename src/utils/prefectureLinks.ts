// 都道府県別の河川監視カメラページへのリンクマッピング

const prefectureCameraUrls: { [key: string]: string } = {
  // 北海道
  '北海道': 'https://www.douhoku.pref.hokkaido.lg.jp/ks/skn/index.html',
  
  // 東北
  '青森県': 'https://www.pref.aomori.lg.jp/soshiki/kendo/kasenpub/',
  '岩手県': 'https://www.pref.iwate.jp/kurashikankyou/kasen/index.html',
  '宮城県': 'https://www.pref.miyagi.jp/soshiki/kasen/',
  '秋田県': 'https://www.pref.akita.lg.jp/pages/genre/12076',
  '山形県': 'https://www.pref.yamagata.jp/180026/bosai/kochibou/kasensabo/',
  '福島県': 'https://www.pref.fukushima.lg.jp/sec/41045a/',
  
  // 関東
  '茨城県': 'https://www.pref.ibaraki.jp/soshiki/doboku/kasensui/',
  '栃木県': 'https://www.pref.tochigi.lg.jp/h07/live/kasen/',
  '群馬県': 'https://www.pref.gunma.jp/04/h4800018.html',
  '埼玉県': 'https://www.pref.saitama.lg.jp/a1006/kasensabo/index.html',
  '千葉県': 'https://www.pref.chiba.lg.jp/kasei/',
  '東京都': 'https://www.kasen-suibo.metro.tokyo.lg.jp/',
  '神奈川県': 'https://www.pref.kanagawa.jp/docs/f4i/kasen.html',
  
  // 中部
  '新潟県': 'https://www.pref.niigata.lg.jp/sec/kasenkanri/',
  '富山県': 'https://www.pref.toyama.jp/1705/kurashi/bousai/kasensabo/index.html',
  '石川県': 'https://www.pref.ishikawa.lg.jp/kasen/',
  '福井県': 'https://www.pref.fukui.lg.jp/doc/kasen/',
  '山梨県': 'https://www.pref.yamanashi.jp/kasen-sui/',
  '長野県': 'https://www.pref.nagano.lg.jp/kasenka/',
  '岐阜県': 'https://www.pref.gifu.lg.jp/page/3023.html',
  '静岡県': 'https://www.pref.shizuoka.jp/kurashikankyo/bousai/saigaijoho/kasencam.html',
  '愛知県': 'https://www.pref.aichi.jp/soshiki/kasen/',
  
  // 近畿
  '三重県': 'https://www.pref.mie.lg.jp/KASEN/',
  '滋賀県': 'https://www.pref.shiga.lg.jp/kensei/koho/e-shinbun/bosai/kasen/',
  '京都府': 'https://www.pref.kyoto.jp/kasen/',
  '大阪府': 'https://www.pref.osaka.lg.jp/kasenseibi/',
  '兵庫県': 'https://www.kasen-kanri.jp/p/index.html',
  '奈良県': 'https://www.pref.nara.jp/1748.htm',
  '和歌山県': 'https://www.pref.wakayama.lg.jp/prefg/080100/',
  
  // 中国
  '鳥取県': 'https://www.pref.tottori.lg.jp/74201.htm',
  '島根県': 'https://www.pref.shimane.lg.jp/infra/kawa/',
  '岡山県': 'https://www.pref.okayama.jp/page/detail-3540.html',
  '広島県': 'https://www.pref.hiroshima.lg.jp/soshiki/102/',
  '山口県': 'https://www.pref.yamaguchi.lg.jp/soshiki/86/',
  
  // 四国
  '徳島県': 'https://www.pref.tokushima.lg.jp/ippannokata/kendozukuri/kasen/',
  '香川県': 'https://www.pref.kagawa.lg.jp/kasen/',
  '愛媛県': 'https://www.pref.ehime.jp/h15300/',
  '高知県': 'https://www.pref.kochi.lg.jp/soshiki/170701/',
  
  // 九州
  '福岡県': 'https://www.pref.fukuoka.lg.jp/contents/kasenkaigan.html',
  '佐賀県': 'https://www.pref.saga.lg.jp/kiji00318643/index.html',
  '長崎県': 'https://www.pref.nagasaki.jp/bunrui/machidukuri-doboku/kasen/',
  '熊本県': 'https://www.pref.kumamoto.jp/soshiki/101/',
  '大分県': 'https://www.pref.oita.jp/soshiki/17200/',
  '宮崎県': 'https://www.pref.miyazaki.lg.jp/kasenkanri/',
  '鹿児島県': 'https://www.pref.kagoshima.jp/ah07/infra/kotu/kasen/',
  '沖縄県': 'https://www.pref.okinawa.jp/site/doboku/kasen/',
};

// 都道府県名から河川カメラページのURLを取得する関数
export function getPrefectureCameraUrl(prefecture: string): string {
  // マッピングにある場合はそのURLを返す
  if (prefectureCameraUrls[prefecture]) {
    return prefectureCameraUrls[prefecture];
  }
  
  // マッピングにない場合は、都道府県名で検索するGoogleリンクを返す
  return `https://www.google.com/search?q=${encodeURIComponent(prefecture + ' 河川監視カメラ 河川情報')}`;
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
