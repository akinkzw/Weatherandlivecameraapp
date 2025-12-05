import { useState, useEffect, useRef } from 'react';
import { RiverList } from './components/RiverList';
import { RiverDetail } from './components/RiverDetail';
import { CameraTest } from './components/CameraTest';
import { RiverApiTest } from './components/RiverApiTest';
import { WeatherTest } from './components/WeatherTest';
import { DpfSyncAdmin } from './components/DpfSyncAdmin';
import { DpfDataCheck } from './components/DpfDataCheck';
import { DpfApiDebugger } from './components/DpfApiDebugger';
import { ManualRiverAdmin } from './components/ManualRiverAdmin';
import { BulkRiverUpload } from './components/BulkRiverUpload';
import { DpfSearchTest } from './components/DpfSearchTest';
import { DummyValueCleaner } from './components/DummyValueCleaner';
import { SimpleDpfIdTest } from './components/SimpleDpfIdTest';
import { ServerHealthCheck } from './components/ServerHealthCheck';
import { DpfIdUpdater } from './components/DpfIdUpdater';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Search, ArrowUp } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { projectId, publicAnonKey } from './utils/supabase/info';

export interface River {
  id: string;
  name: string;
  region: string;
  prefecture: string;
  length: number;
  waterLevel: number;
  warningLevel: number;
  currentStatus: 'normal' | 'caution' | 'warning';
  cameras: Camera[];
  weather: WeatherData[];
  dataSource?: 'dpf' | 'manual'; // ✅ データソース
  scale?: 'large' | 'medium' | 'small'; // ✅ 川の規模
  municipality?: string; // ✅ 市区町村
  latitude?: number; // ✅ 緯度
  longitude?: number; // ✅ 経度
  dpfObservationId?: string; // ✅ DPF観測所ID（町コード）
  waterLevelUrl?: string; // ✅ 水位情報URL
  riverSystem?: string; // ✅ 水系名称
  observatoryName?: string; // ✅ 観測所名称
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  lastUpdated: string;
}

export interface WeatherData {
  date: string;
  temp: number;
  condition: string;
  precipitation: number;
  icon: string;
}

export interface BannerData {
  pc_image: {
    url: string;
  };
  sp_image: {
    url: string;
  };
  icon: {
    url: string;
  };
  icon_2?: {
    url: string;
  };
  icon_3?: {
    url: string;
  };
  url?: string;
  description?: string;
}

function App() {
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all');
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [rivers, setRivers] = useState<River[]>([])
  const [isLoadingRivers, setIsLoadingRivers] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  
  // 都道府県セクションへの参照
  const prefecturesSectionRef = useRef<HTMLDivElement>(null);

  // URLパラメータからテストモードを確認
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test');

  // デバッグ用：コンソールに出力
  console.log('Current URL:', window.location.href);
  console.log('URL search params:', window.location.search);
  console.log('Test mode:', testMode);
  console.log('testMode === "bulk-upload":', testMode === 'bulk-upload');
  
  // 画面に表示してデバッグ
  if (window.location.search.includes('test=')) {
    console.log('⚠️ TEST MODE DETECTED IN URL');
  }

  // グローバル関数として環境変数チェック機能を追加（デバッグ用）
  useEffect(() => {
    (window as any).checkEnv = async () => {
      try {
        console.log('=== 環境変数チェック開始 ===');
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/env-check`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('環境変数チェック結果:', data);
        console.table(data.variables);
        return data;
      } catch (error) {
        console.error('環境変数チェックエラー:', error);
        return { error: String(error) };
      }
    };
    console.log('💡 デバッグ用: コンソールで checkEnv() を実行して環境変数を確認できます');
  }, []);

  // 川のデータを取得
  useEffect(() => {
    // テストモードや管理ページの場合はデータ取得をスキップ
    if (testMode || showAdminPage) return;

    const fetchRivers = async () => {
      try {
        setIsLoadingRivers(true);
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('川データ取得成功:', data);
          console.log('取得した川の総数:', data.rivers?.length || 0);
          
          // 重複排除処理（川名 + 都道府県でユニーク化）
          const uniqueRivers = new Map<string, River>();
          
          (data.rivers || []).forEach((river: River) => {
            // ユニークキー = 川名 + 都道府県
            const uniqueKey = `${river.name}|${river.prefecture}`;
            
            // すでに同じキーが存在する場合は、IDが小さい方（古いデータ）を優先
            if (!uniqueRivers.has(uniqueKey)) {
              uniqueRivers.set(uniqueKey, river);
            } else {
              const existingRiver = uniqueRivers.get(uniqueKey)!;
              const existingId = parseInt(existingRiver.id);
              const newId = parseInt(river.id);
              
              // IDが小さい方を優先（最初に登録されたデータを優先）
              if (newId < existingId) {
                uniqueRivers.set(uniqueKey, river);
              }
            }
          });
          
          const uniqueRiversArray = Array.from(uniqueRivers.values());
          console.log('重複排除後の川の数:', uniqueRiversArray.length);
          console.log('削除された重複データ:', (data.rivers?.length || 0) - uniqueRiversArray.length, '件');
          
          setRivers(uniqueRiversArray);
        } else {
          console.error('川データの取得に失敗しました:', response.status);
        }
      } catch (error) {
        console.error('川データの取得エラー:', error);
      } finally {
        setIsLoadingRivers(false);
      }
    };

    fetchRivers();
  }, [testMode, showAdminPage]);

  // microCMSからバナーデータを取得
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/banner`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('バナーデータ取得成功:', data);
          console.log('完全なバナーデータ:', JSON.stringify(data, null, 2));
          // サーバーが { success: true, data: {...} } という形式で返しているので、data.dataを使用
          setBannerData(data.success && data.data ? data.data : data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('バナーデータの取得に失敗しました:', response.status, response.statusText);
          console.error('エラー詳細:', errorData);
        }
      } catch (error) {
        console.error('バナーデータの取得エラー:', error);
      }
    };

    fetchBanner();
  }, []);

  // 地方から地域へのマッピング
  const areaToRegionMap: { [key: string]: string[] } = {
    'hokkaido-tohoku': ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    'kanto': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    'koshinetsu-hokuriku': ['新潟県', '長野県', '富山県', '石川県', '福井県', '山梨県'],
    'tokai': ['岐阜県', '静岡県', '愛知県', '三重県'],
    'kansai': ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    'chugoku': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    'shikoku': ['徳島県', '香川県', '愛媛県', '高知県'],
    'kyushu-okinawa': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
  };

  const handleAreaClick = (area: string) => {
    setSelectedArea(area);
    setSelectedRegion('all');
    setSelectedPrefecture('all');
    setSearchQuery('');
    
    // 都道府県セクションへスムーズにスクロール（DOM更新後に実行）
    setTimeout(() => {
      prefecturesSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  // 選択された地方の都道府県リストを取得
  const getAvailablePrefectures = () => {
    if (selectedArea === 'all') return [];
    return areaToRegionMap[selectedArea] || [];
  };

  // トップへスクロール
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ホームに戻る（全フィルタリセット）
  const handleResetToHome = () => {
    setSelectedArea('all');
    setSelectedRegion('all');
    setSelectedPrefecture('all');
    setSearchQuery('');
    scrollToTop();
  };

  // スクロールイベントハンドラ
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // モバイル判定
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // 管理ページを表示
  if (showAdminPage) {
    return <DpfDataCheck />;
  }

  // テストモードの場合はテストコンポーネントを表示
  if (testMode === 'camera') {
    return <CameraTest />;
  }
  
  // API テストモードの場合
  if (testMode === 'api') {
    return <RiverApiTest />;
  }
  
  // 天気予報テストモードの場合
  if (testMode === 'weather') {
    return <WeatherTest />;
  }
  
  // DPF同期管理画面
  if (testMode === 'dpf-sync') {
    return <DpfSyncAdmin />;
  }
  
  // 手動で川を追加する管理画面
  if (testMode === 'manual-river') {
    return <ManualRiverAdmin />;
  }
  
  // CSV一括登録画面
  if (testMode === 'bulk-upload') {
    return <BulkRiverUpload />;
  }
  
  // DPF ID 更新画面
  if (testMode === 'dpf-id-updater') {
    console.log('✅ DPF ID Updater モードでレンダリング中');
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="mb-2" style={{ color: '#0372ac' }}>
              DPF観測所ID 一括更新
            </h1>
            <p className="text-slate-600">
              川の防災情報サイトのCSVファイルで既存データを更新します
            </p>
          </div>
          <DpfIdUpdater />
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            メインページに戻る
          </Button>
        </div>
      </div>
    );
  }
  
  // DPF検索テスト画面
  if (testMode === 'dpf-search') {
    return <DpfSearchTest />;
  }
  
  // DPF ID テスト画面
  if (testMode === 'dpf-id-test') {
    return <SimpleDpfIdTest />;
  }
  
  // サーバー診断画面
  if (testMode === 'server-health') {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="mb-2" style={{ color: '#0372ac' }}>
              サーバー診断
            </h1>
            <p className="text-slate-600">
              サーバーの稼働状況とAPI接続を確認します
            </p>
          </div>
          <ServerHealthCheck />
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            メインページに戻る
          </Button>
        </div>
      </div>
    );
  }
  
  // ダミー値クリア画面
  if (testMode === 'dummy-cleaner') {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0372ac' }}>
              データ管理
            </h1>
            <p className="text-slate-600">
              既存の川データのダミー値をクリアします
            </p>
          </div>
          <DummyValueCleaner />
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            メインページに戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header 
        className="relative shadow-md border-b-4 cursor-pointer overflow-hidden" 
        style={{ 
          borderColor: '#0372ac'
        }}
        onClick={handleResetToHome}
      >
        {/* グラデーション背景を持つ親要素 */}
        <div
          style={{
            background: 'linear-gradient(to bottom, #97d0ed 0%, #97d0ed 60%, rgba(151, 208, 237, 0.3) 100%)'
          }}
        >
          {/* Background Image */}
          <div className="relative pt-[165px] md:pt-[160px]">
            {bannerData && (
              <>
                {/* PC用画像 */}
                <div className="hidden md:block absolute top-0 left-0 w-full h-[220px]">
                  <ImageWithFallback
                    src={bannerData.pc_image?.url}
                    alt="川の風景"
                    className="w-full h-full object-contain object-top"
                  />
                </div>
                {/* SP用画像 */}
                <div className="block md:hidden absolute top-0 left-0 w-full h-[190px]">
                  <ImageWithFallback
                    src={bannerData.sp_image?.url}
                    alt="川の風景"
                    className="w-full h-full object-contain object-top"
                  />
                </div>
              </>
            )}
          </div>

          {/* Header Content */}
          <div className="relative py-6">
            <div 
              className="container mx-auto px-4" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-4 flex-wrap max-w-3xl">
                <div className="flex-1 min-w-[250px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="川名を検索..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedArea('all');
                    }}
                    className="pl-12 h-12 bg-white/95 backdrop-blur-sm text-lg border-2 border-transparent focus:border-white/50 transition-all"
                    style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  />
                </div>
                
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="h-12 bg-white/95 backdrop-blur-sm text-lg border-2 border-transparent focus:border-white/50 transition-all" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全国</SelectItem>
                    <SelectItem value="hokkaido-tohoku">北海道・東北</SelectItem>
                    <SelectItem value="kanto">関東</SelectItem>
                    <SelectItem value="koshinetsu-hokuriku">甲信越・北陸</SelectItem>
                    <SelectItem value="tokai">東海</SelectItem>
                    <SelectItem value="kansai">関西</SelectItem>
                    <SelectItem value="chugoku">中国</SelectItem>
                    <SelectItem value="shikoku">四国</SelectItem>
                    <SelectItem value="kyushu-okinawa">九州・沖縄</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Japan Map Section */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            {bannerData?.icon?.url && (
              <ImageWithFallback
                src={bannerData.icon.url}
                alt="装飾アイコン"
                className="w-8 h-8 object-contain"
              />
            )}
            <h2 className="font-bold" style={{ fontFamily: 'Noto Sans JP, sans-serif', color: '#0372ac' }}>地方から探す</h2>
            {bannerData?.icon?.url && (
              <ImageWithFallback
                src={bannerData.icon.url}
                alt="装飾アイコン"
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Region Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="ghost"
                onClick={() => handleAreaClick('hokkaido-tohoku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'hokkaido-tohoku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>北海道・東北地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>北海道/青森/岩手/宮城/秋田/山形/福島</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('kanto')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'kanto' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>関東地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>茨城/栃木/群馬/埼玉/千葉/東京/神奈川</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('koshinetsu-hokuriku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'koshinetsu-hokuriku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>甲信越・北陸地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>山梨/新潟/長野/富山/石川/福井</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('tokai')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'tokai' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>東海地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>愛知/岐阜/静岡/三重</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('kansai')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'kansai' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>関西地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>滋賀/京都/大阪/兵庫/奈良/和歌山</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('chugoku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'chugoku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>中国地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>鳥取/島根/岡山/広島/山口</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('shikoku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'shikoku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>四国地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>徳島/香川/愛媛/高知</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('kyushu-okinawa')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'kyushu-okinawa' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>九州・沖縄地方</div>
                  <div className="text-xs opacity-70 leading-relaxed" style={{ color: '#0372ac' }}>福岡/佐賀/長崎/熊本/大分/宮崎/鹿児島/沖縄</div>
                </div>
              </Button>
            </div>
            
            {/* 都道府県ボタン */}
            {selectedArea !== 'all' && getAvailablePrefectures().length > 0 && (
              <div className="mt-6" ref={prefecturesSectionRef}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px bg-slate-300 flex-1"></div>
                  <span className="text-sm px-3" style={{ color: '#204670' }}>都道府県</span>
                  <div className="h-px bg-slate-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  <Button
                    variant={selectedPrefecture === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedPrefecture('all')}
                    className="h-auto py-3"
                    style={{ fontFamily: 'Noto Sans JP, sans-serif', color: selectedPrefecture === 'all' ? '' : '#204670' }}
                  >
                    すべて
                  </Button>
                  {getAvailablePrefectures().map((pref) => {
                    // 京都府は「京都」、大阪府は「大阪」、東京都は「東京」として表示
                    let displayName = pref;
                    if (pref === '京都府') {
                      displayName = '京都';
                    } else if (pref === '大阪府') {
                      displayName = '大阪';
                    } else if (pref === '東京都') {
                      displayName = '東京';
                    } else {
                      displayName = pref.replace('県', '');
                    }
                    
                    return (
                      <Button
                        key={pref}
                        variant={selectedPrefecture === pref ? 'default' : 'outline'}
                        onClick={() => setSelectedPrefecture(pref)}
                        className="h-auto py-3"
                        style={{ fontFamily: 'Noto Sans JP, sans-serif', color: selectedPrefecture === pref ? '' : '#204670' }}
                      >
                        {displayName}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <RiverList
          selectedRegion={selectedRegion}
          searchQuery={searchQuery}
          selectedArea={selectedArea}
          selectedPrefecture={selectedPrefecture}
          areaToRegionMap={areaToRegionMap}
          onSelectRiver={(river) => {
            setSelectedRiver(river);
            setIsDialogOpen(true);
          }}
          selectedRiverId={selectedRiver?.id}
          rivers={rivers}
          isLoadingRivers={isLoadingRivers}
        />
      </div>

      {/* River Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRiver?.name}</DialogTitle>
            <DialogDescription>川の詳細情報と天気予報を確認できます。</DialogDescription>
          </DialogHeader>
          {selectedRiver && <RiverDetail river={selectedRiver} />}
        </DialogContent>
      </Dialog>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="default"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0 flex items-center justify-center"
          style={{ backgroundColor: '#0372ac' }}
          onClick={scrollToTop}
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}

      {/* Admin Access Button - 開発環境のみ表示 */}
      {(window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('preview') ||
        window.location.search.includes('admin=true')) && (
        <Button
          variant="outline"
          className="fixed bottom-6 left-6 shadow-lg hover:shadow-xl transition-all z-50 text-xs"
          style={{ borderColor: '#0372ac', color: '#0372ac' }}
          onClick={() => setShowAdminPage(true)}
        >
          管理画面
        </Button>
      )}
      
      {/* Server Health Check Button - 常に表示（一時的） */}
      <Button
        variant="outline"
        className="fixed bottom-24 left-6 shadow-lg hover:shadow-xl transition-all z-50 text-xs"
        style={{ borderColor: '#22c55e', color: '#22c55e' }}
        onClick={() => window.location.href = '/?test=server-health'}
      >
        🔍 サーバー診断
      </Button>
      
      {/* Database Debug Button - デバッグ用 */}
      <Button
        variant="outline"
        className="fixed bottom-44 left-6 shadow-lg hover:shadow-xl transition-all z-50 text-xs"
        style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
        onClick={async () => {
          try {
            console.log('🔍 Checking database structure...');
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/debug-structure`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              }
            );
            
            const data = await response.json();
            
            if (response.ok && data.success) {
              console.log('📊 データベース構造:', data);
              console.log('📊 利用可能なフィールド:', data.availableFields);
              console.log('📊 サンプルデータ:', data.samples);
              
              // dpfStationsフィールドの内容を詳しく確認
              if (data.samples && data.samples.length > 0) {
                data.samples.forEach((sample: any, index: number) => {
                  console.log(`サンプル${index + 1} - dpfStations:`, sample.dpfStations);
                  console.log(`サンプル${index + 1} - dpfObservationId:`, sample.dpfObservationId);
                  console.log(`サンプル${index + 1} - waterLevelUrl:`, sample.waterLevelUrl);
                });
              }
              
              alert(
                `✅ データベース構造を確認しました\n\n` +
                `総件数: ${data.totalCount}件\n\n` +
                `利用可能なフィールド:\n${data.availableFields.join(', ')}\n\n` +
                `詳細はブラウザのコンソール（F12）を確認してください。`
              );
            } else {
              console.error('❌ Error:', data);
              alert(`❌ エラー: ${data.error || data.message || '不明なエラー'}`);
            }
          } catch (error) {
            console.error('❌ Exception:', error);
            alert(`❌ エラー: ${error}`);
          }
        }}
      >
        🐛 DB構造確認
      </Button>
      
      {/* DPF検索ボタン - デバッグ用 */}
      <Button
        variant="outline"
        className="fixed bottom-64 left-6 shadow-lg hover:shadow-xl transition-all z-50 text-xs"
        style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
        onClick={async () => {
          const riverName = prompt('検索する川の名前を入力してください:', '笛吹川');
          if (!riverName) return;
          
          try {
            console.log(`🔍 ローカルデータベース検索: ${riverName}`);
            
            // まずローカルデータベースから検索
            const localResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              }
            );
            
            const localData = await localResponse.json();
            
            if (localResponse.ok && localData.success) {
              const matchingRivers = localData.rivers.filter((r: any) => 
                r.name && r.name.includes(riverName)
              );
              
              if (matchingRivers.length > 0) {
                console.log(`✅ ローカルDBに ${matchingRivers.length}件の「${riverName}」が見つかりました:`, matchingRivers);
                console.table(matchingRivers.map((r: any) => ({
                  川名: r.name,
                  都道府県: r.prefecture,
                  市区町村: r.municipality,
                  水系: r.basinName,
                  観測所: r.stationName,
                  'DPF ID': r.dpfObservationId || '(なし)',
                  '水位URL': r.waterLevelUrl || '(なし)',
                })));
                
                let resultText = `✅ 「${riverName}」の検索結果: ${matchingRivers.length}件\n\n`;
                matchingRivers.forEach((r: any, index: number) => {
                  resultText += `${index + 1}. ${r.name} (${r.prefecture} ${r.municipality || ''})\n`;
                  resultText += `   水系: ${r.basinName || '(なし)'}\n`;
                  resultText += `   観測所: ${r.stationName || '(なし)'}\n`;
                  resultText += `   DPF観測所ID: ${r.dpfObservationId || '(なし)'}\n`;
                  resultText += `   水位情報URL: ${r.waterLevelUrl || '(なし)'}\n`;
                  resultText += `   緯度: ${r.latitude || '(なし)'}, 経度: ${r.longitude || '(なし)'}\n\n`;
                });
                
                alert(resultText + '\n詳細はブラウザのコンソール（F12）を確認してください。');
                return;
              } else {
                alert(`⚠️ ローカルDBに「${riverName}」が見つかりませんでした。\n\n別の川名を試してください。`);
                return;
              }
            }
            
            // DPF API検索（フォールバック）
            console.log(`🔍 DPF API検索: ${riverName}`);
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/dpf-search?river=${encodeURIComponent(riverName)}`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              }
            );
            
            const data = await response.json();
            
            if (response.ok && data.success) {
              console.log('✅ DPF検索結果:', data);
              console.log('📊 検索クエリ:', data.query);
              console.log('📊 該当件数:', data.count);
              console.log('📊 データ:', data.data);
              
              if (data.data && data.data.length > 0) {
                console.table(data.data);
                
                let resultText = `✅ 「${riverName}」の検索結果: ${data.count}件\n\n`;
                data.data.forEach((item: any, index: number) => {
                  resultText += `${index + 1}. ${item.name || item.obs_name}\n`;
                  resultText += `   ID: ${item.id}\n`;
                  resultText += `   河川名: ${item.river_name || '(なし)'}\n`;
                  resultText += `   観測所: ${item.obs_name || '(なし)'}\n`;
                  resultText += `   緯度: ${item.latitude || '(なし)'}, 経度: ${item.longitude || '(なし)'}\n\n`;
                });
                
                alert(resultText);
              } else {
                alert(`⚠️ 「${riverName}」に該当するデータが見つかりませんでした。`);
              }
            } else {
              console.error('❌ Error:', data);
              alert(`❌ DPF API エラー: ${data.error || data.message || '不明なエラー'}\n\n${data.suggestion || ''}`);
            }
          } catch (error) {
            console.error('❌ Exception:', error);
            alert(`❌ エラー: ${error}`);
          }
        }}
      >
        🔍 川検索
      </Button>
    </div>
  );
}

export default App;