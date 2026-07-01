import React, { useState, useEffect, useRef } from 'react';
import { SimpleDpfIdTest } from './components/SimpleDpfIdTest';
import { ServerHealthCheck } from './components/ServerHealthCheck';
import { DirectDbUpdater } from './components/DirectDbUpdater';
import { RiverList } from './components/RiverList';
import { RiverDetail } from './components/RiverDetail';
import { AuthMenu } from './components/AuthMenu';
import { getRecentRivers, addRecentRiver, clearRecentRivers, type RecentRiver } from './utils/recentRivers';
import { getFavoriteRivers, toggleFavoriteRiver, type FavoriteRiver } from './utils/favoriteRivers';
import { DpfDataCheck } from './components/DpfDataCheck';
import { CameraTest } from './components/CameraTest';
import { RiverApiTest } from './components/RiverApiTest';
import { WeatherTest } from './components/WeatherTest';
import { WeatherApiTest } from './components/WeatherApiTest';
import { DpfSyncAdmin } from './components/DpfSyncAdmin';
import { ManualRiverAdmin } from './components/ManualRiverAdmin';
import { BulkRiverUpload } from './components/BulkRiverUpload';
import { DpfSearchTest } from './components/DpfSearchTest';
import { DummyValueCleaner } from './components/DummyValueCleaner';
import { RiverDataDebugger } from './components/RiverDataDebugger';
import { WaterLevelInspector } from './components/WaterLevelInspector';
import { WaterLevelUrlFixer } from './components/WaterLevelUrlFixer';
import { FuefukiCheck } from './components/FuefukiCheck';
import { FuefukiDbInspector } from './components/FuefukiDbInspector';
import { ServerConnectionTest } from './components/ServerConnectionTest';
import { DuplicateRiverCleaner } from './components/DuplicateRiverCleaner';
import { DuplicateAnalyzer } from './components/DuplicateAnalyzer';
import { DpfEnrichmentAdmin } from './components/DpfEnrichmentAdmin';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Search, ArrowUp, X } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { supabase } from './utils/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { toast, Toaster } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

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
  municipalityCode?: string; // ✅ 市区町村コード
  latitude?: number; // ✅ 緯度
  longitude?: number; // ✅ 経度
  dpfObservationId?: string; // ✅ DPF観測所ID（町コード）
  waterLevelUrl?: string; // ✅ 水位情報URL
  riverSystem?: string; // ✅ 水系名称
  basinName?: string; // ✅ 水系名称（CSVから取得）
  observatoryName?: string; // ✅ 観測所名称
  stationName?: string; // ✅ 観測所名称（CSVから取得）
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
  const [recentRivers, setRecentRivers] = useState<RecentRiver[]>(() => getRecentRivers());
  const [favorites, setFavorites] = useState<FavoriteRiver[]>(() => getFavoriteRivers());
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const handleToggleFavorite = (river: FavoriteRiver) => {
    setFavorites(toggleFavoriteRiver({
      id: river.id,
      name: river.name,
      prefecture: river.prefecture,
      currentStatus: river.currentStatus,
      observatoryName: river.observatoryName,
    }));
  };
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  // 認証セッション（この段階では保持のみ。UIは Step 2、お気に入り連携は Step 3〜）
  const [session, setSession] = useState<Session | null>(null);
  
  // 都道府県セクションへの参照
  const prefecturesSectionRef = useRef<HTMLDivElement>(null);

  // URLパラメータからテストモードを確認
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test');

  // デバッグ用（テストモード時のみ）
  if (testMode) {
    console.log('Test mode:', testMode);
  }

  // 認証セッションの購読。初回に現在のセッションを取得し、以後の変化を追跡する。
  // Magic Link のコールバックは client の detectSessionInUrl が処理する。
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 川のデータを取得
  useEffect(() => {
    // テストモードや管理ページの場合はデータ取得をスキップ
    if (testMode || showAdminPage) return;

    const fetchRivers = async () => {
      const maxRetries = 3;
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt === 1) setIsLoadingRivers(true);

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          });

          if (response.ok) {
            const data = await response.json();

            if (!data.success && data.error) {
              console.error('サーバーエラー:', data.error);
              toast.error('サーバーエラーが発生しました', {
                description: data.error,
                duration: 8000,
              });
              return;
            }

            console.log('川データ取得成功:', data.rivers?.length || 0, '件');

            const uniqueRivers = new Map<string, River>();
            (data.rivers || []).forEach((river: River) => {
              const uniqueKey = `${river.name}|${river.prefecture}`;
              if (!uniqueRivers.has(uniqueKey)) {
                uniqueRivers.set(uniqueKey, river);
              } else {
                const existingRiver = uniqueRivers.get(uniqueKey)!;
                if (parseInt(river.id) < parseInt(existingRiver.id)) {
                  uniqueRivers.set(uniqueKey, river);
                }
              }
            });

            setRivers(Array.from(uniqueRivers.values()));
            setIsLoadingRivers(false);
            return;
          } else {
            const errorText = await response.text();
            console.error(`川データの取得に失敗 (attempt ${attempt}):`, response.status, errorText);
            lastError = new Error(`HTTPエラー: ${response.status}`);
          }
        } catch (error) {
          console.error(`川データの取得エラー (attempt ${attempt}):`, error);
          lastError = error;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      setIsLoadingRivers(false);
      toast.error('サーバーに接続できません', {
        description: lastError instanceof Error ? lastError.message : 'しばらくしてから再度お試しください',
        duration: 10000,
      });
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
          // サーバーが { success: true, data: {...} } という形式で返しているので、data.dataを使用
          setBannerData(data.success && data.data ? data.data : data);
        } else {
          console.error('バナーデータの取得に失敗:', response.status);
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

  // 検索クエリの変更を監視してスライドパネルを表示/非表示
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // 検索結果をフィルタリング
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return rivers.filter(river => 
      river.name.toLowerCase().includes(query) ||
      river.prefecture.toLowerCase().includes(query) ||
      river.municipality?.toLowerCase().includes(query)
    );
  };

  // 検索結果パネルを閉じる
  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchQuery('');
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
  
  // 天気予報APIテストモードの場合
  if (testMode === 'weather-api') {
    return <WeatherApiTest />;
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
          <DirectDbUpdater />
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
  
  // 新しいURL: direct-db-update
  if (testMode === 'direct-db-update') {
    console.log('✅ Direct DB Update モードでレンダリング中 (v3.0)');
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="mb-2" style={{ color: '#0372ac' }}>
              DPF観測所ID 一括更新 v3.0
            </h1>
            <p className="text-slate-600">
              フロントエンドから直接データベースに接続
            </p>
          </div>
          <DirectDbUpdater />
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
  
  // 重複削除ツール
  if (testMode === 'duplicate-cleaner') {
    return <DuplicateRiverCleaner />;
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
            onClick={() => window.location.href = '/?test=water-inspector'}
            className="w-full"
          >
            🔬 水位データ検査ツールへ
          </Button>
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
  
  // 水位データ検査ツール画面
  if (testMode === 'water-inspector') {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0372ac' }}>
              🔬 水位データ検査ツール
            </h1>
            <p className="text-slate-600">
              データベース内の水位データの実際の値を確認します
            </p>
          </div>
          <WaterLevelInspector />
          <Button
            variant="outline"
            onClick={() => window.location.href = '/?test=dummy-cleaner'}
            className="w-full"
          >
            🧹 ダミーデータクリアツールへ
          </Button>
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

  // 水位情報URL修正ツール画面
  if (testMode === 'url-fixer') {
    return (
      <div className="min-h-screen bg-slate-50">
        <WaterLevelUrlFixer />
        <div className="max-w-6xl mx-auto px-8 pb-8">
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

  // 笛吹川データ確認ページ
  if (testMode === 'fuefuki-check') {
    return (
      <div className="min-h-screen bg-slate-50">
        <FuefukiCheck />
        <div className="max-w-4xl mx-auto px-8 pb-8">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/?test=url-fixer'}
            className="w-full mb-4"
          >
            水位情報URL修正ツールへ
          </Button>
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

  // 笛吹川データベース診断ツール（新規）
  if (testMode === 'fuefuki-inspector') {
    return (
      <div className="min-h-screen bg-slate-50">
        <FuefukiDbInspector />
        <div className="max-w-6xl mx-auto px-8 pb-8">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/?test=fuefuki-check'}
              className="flex-1"
            >
              基本確認ページへ
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/?test=url-fixer'}
              className="flex-1"
            >
              URL修正ツールへ
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              メインページに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // サーバー接続テスト（新規）
  if (testMode === 'connection-test') {
    return (
      <div className="min-h-screen bg-slate-50">
        <ServerConnectionTest />
        <div className="max-w-4xl mx-auto px-8 pb-8">
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

  // 重複データ分析ツール画面
  if (testMode === 'duplicate-analyzer') {
    return (
      <div className="min-h-screen bg-slate-50">
        <DuplicateAnalyzer />
        <div className="max-w-4xl mx-auto px-8 pb-8">
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

  // DPF補完管理画面
  if (testMode === 'dpf-enrich') {
    return (
      <div className="min-h-screen bg-slate-50">
        <DpfEnrichmentAdmin />
        <div className="max-w-4xl mx-auto px-8 pb-8">
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
      <Toaster position="top-right" richColors closeButton />
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
              <div className="flex justify-end mb-3">
                <AuthMenu session={session} />
              </div>
              <div className="flex gap-4 flex-wrap max-w-3xl">
                <div className="w-full max-w-xs relative">
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
                
                {/* 全国セレクトボックス - 非表示 */}
                {/* <Select value={selectedRegion} onValueChange={setSelectedRegion}>
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
                </Select> */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Japan Map Section */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-7">
            <div className="flex items-center justify-center gap-3">
              {bannerData?.icon?.url && (
                <ImageWithFallback
                  src={bannerData.icon.url}
                  alt="装飾アイコン"
                  className="w-8 h-8 object-contain"
                />
              )}
              <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Noto Sans JP, sans-serif', color: '#0372ac' }}>地方から探す</h2>
              {bannerData?.icon?.url && (
                <ImageWithFallback
                  src={bannerData.icon.url}
                  alt="装飾アイコン"
                  className="w-8 h-8 object-contain"
                />
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
              地域を選ぶと、その都道府県の川を一覧できます
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Region Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="ghost"
                onClick={() => handleAreaClick('hokkaido-tohoku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'hokkaido-tohoku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>北海道・東北地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>北海道/青森/岩手/宮城/秋田/山形/福島</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('kanto')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'kanto' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>関東地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>茨城/栃木/群馬/埼玉/千葉/東京/神奈川</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('koshinetsu-hokuriku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'koshinetsu-hokuriku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>甲信越・北陸地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>山梨/新潟/長野/富山/石川/福井</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('tokai')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'tokai' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>東海地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>愛知/岐阜/静岡/三重</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('kansai')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'kansai' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>関西地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>滋賀/京都/大阪/兵庫/奈良/和歌山</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('chugoku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'chugoku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>中国地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>鳥取/島根/岡山/広島/山口</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('shikoku')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'shikoku' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>四国地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>徳島/香川/愛媛/高知</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAreaClick('kyushu-okinawa')}
                className={`region-button h-auto py-4 px-4 text-left justify-start ${selectedArea === 'kyushu-okinawa' ? 'selected' : ''}`}
              >
                <div className="w-full">
                  <div className="font-semibold mb-2" style={{ color: '#204670' }}>九州・沖縄地方</div>
                  <div className="text-xs opacity-70 leading-relaxed whitespace-normal break-words" style={{ color: '#0372ac' }}>福岡/佐賀/長崎/熊本/大分/宮崎/鹿児島/沖縄</div>
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
                    className="h-10 px-4 rounded-full text-sm font-medium transition-all"
                    style={{ fontFamily: 'Noto Sans JP, sans-serif', color: selectedPrefecture === 'all' ? '' : '#0372ac', borderColor: selectedPrefecture === 'all' ? '' : '#cfe8f5' }}
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
                        className="h-10 px-4 rounded-full text-sm font-medium transition-all"
                        style={{ fontFamily: 'Noto Sans JP, sans-serif', color: selectedPrefecture === pref ? '' : '#0372ac', borderColor: selectedPrefecture === pref ? '' : '#cfe8f5' }}
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
      <div className="container mx-auto px-4 py-8">
        <RiverList
          selectedRegion={selectedRegion}
          searchQuery={searchQuery}
          selectedArea={selectedArea}
          selectedPrefecture={selectedPrefecture}
          areaToRegionMap={areaToRegionMap}
          onSelectRiver={(river) => {
            setSelectedRiver(river);
            setIsDialogOpen(true);
            setRecentRivers(addRecentRiver({
              id: river.id,
              name: river.name,
              prefecture: river.prefecture,
              currentStatus: river.currentStatus,
              observatoryName: river.observatoryName,
            }));
          }}
          recentRivers={recentRivers}
          onClearRecent={() => setRecentRivers(clearRecentRivers())}
          favorites={favorites}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onSelectPrefecture={(prefecture) => {
            // ドロップダウンで県を選んだら、地方/地域フィルタはクリアして県単独で絞り込む
            setSelectedArea('all');
            setSelectedRegion('all');
            setSelectedPrefecture(prefecture);
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
          {selectedRiver && (
            <RiverDetail
              river={selectedRiver}
              isFavorite={favoriteIds.has(selectedRiver.id)}
              onToggleFavorite={() => handleToggleFavorite(selectedRiver)}
            />
          )}
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

      {/* Search Results Slide Panel */}
      <AnimatePresence>
        {showSearchResults && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              onClick={closeSearchResults}
            />
            
            {/* Slide Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-white shadow-2xl z-[70] overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold" style={{ color: '#0372ac' }}>
                      検索結果
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeSearchResults}
                      className="hover:bg-white/50"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600">
                    「{searchQuery}」で検索中...
                  </p>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4">
                  {(() => {
                    const results = getSearchResults();
                    
                    if (isLoadingRivers) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                          <p className="text-slate-500">データを読み込み中...</p>
                        </div>
                      );
                    }
                    
                    if (results.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 text-center">
                            「{searchQuery}」に一致する川が見つかりませんでした
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600 mb-4">
                          {results.length}件の川が見つかりました
                        </p>
                        {results.map((river, index) => (
                          <motion.div
                            key={river.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Button
                              variant="ghost"
                              className="w-full h-auto p-4 justify-start hover:bg-blue-50 transition-colors"
                              onClick={() => {
                                setSelectedRiver(river);
                                setIsDialogOpen(true);
                                closeSearchResults();
                              }}
                            >
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-lg" style={{ color: '#204670' }}>
                                    {river.name}
                                  </h4>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      river.currentStatus === 'normal'
                                        ? 'bg-green-100 text-green-700'
                                        : river.currentStatus === 'caution'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {river.currentStatus === 'normal'
                                      ? '正常'
                                      : river.currentStatus === 'caution'
                                      ? '注意'
                                      : '警戒'}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-500 flex items-center gap-2">
                                  <span>{river.prefecture}</span>
                                  {river.municipality && (
                                    <>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                      <span>{river.municipality}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Access Button - 一旦非表示 */}
      {/* {(window.location.hostname === 'localhost' || 
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
      )} */}
      
      {/* 川データデバッグツール - 一旦非表示 */}
      {/* {(window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('preview') ||
        window.location.search.includes('admin=true')) && (
        <RiverDataDebugger />
      )} */}
    </div>
  );
}

export default App;