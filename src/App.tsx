import { useState, useEffect } from 'react';
import { RiverList } from './components/RiverList';
import { RiverDetail } from './components/RiverDetail';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Search } from 'lucide-react';
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
  const [rivers, setRivers] = useState<River[]>([]);
  const [isLoadingRivers, setIsLoadingRivers] = useState(true);

  // 川のデータを取得
  useEffect(() => {
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
          setRivers(data.rivers || []);
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
  }, []);

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
          setBannerData(data);
        } else {
          console.error('バナーデータの取得に失敗しました:', response.status, response.statusText);
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
    'tokai': ['岐阜県', '静県', '愛知県', '三重県'],
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
  };

  // 選択された地方の都道府県リストを取得
  const getAvailablePrefectures = () => {
    if (selectedArea === 'all') return [];
    return areaToRegionMap[selectedArea] || [];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="relative sticky top-0 z-10 overflow-hidden">
        {/* Background Image - PC */}
        <div className="absolute inset-0 hidden md:block">
          <ImageWithFallback
            src={bannerData?.pc_image?.url || "https://images.unsplash.com/photo-1699202538405-be2b2b08e5f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMHJpdmVyJTIwbmF0dXJlfGVufDF8fHx8MTc2MzAzMTY1OXww&ixlib=rb-4.1.0&q=80&w=1080"}
            alt="日本の川"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(22, 91, 125, 0.7)' }} />
        </div>

        {/* Background Image - SP */}
        <div className="absolute inset-0 md:hidden">
          <ImageWithFallback
            src={bannerData?.sp_image?.url || "https://images.unsplash.com/photo-1699202538405-be2b2b08e5f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMHJpdmVyJTIwbmF0dXJlfGVufDF8fHx8MTc2MzAzMTY1OXww&ixlib=rb-4.1.0&q=80&w=1080"}
            alt="日本の川"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(22, 91, 125, 0.7)' }} />
        </div>

        {/* Header Content */}
        <div className="relative container mx-auto px-4 py-10">
          <div className="flex items-center gap-4 mb-8">
            {bannerData?.icon?.url ? (
              <ImageWithFallback
                src={bannerData.icon.url}
                alt="川アイコン"
                className="w-12 h-12 drop-shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-lg" />
            )}
            <h1 
              className="text-white tracking-wide drop-shadow-lg text-[33.6px] md:text-[48px]" 
              style={{ fontFamily: "'Sawarabi Mincho', serif" }}
            >
              川の空もよう
            </h1>
          </div>
          
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
              />
            </div>
            
            <Select value={selectedRegion} onValueChange={(value) => {
              setSelectedRegion(value);
              setSelectedArea('all');
            }}>
              <SelectTrigger className="w-[200px] h-12 bg-white/95 backdrop-blur-sm text-lg border-2 border-transparent focus:border-white/50">
                <SelectValue placeholder="地域を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全国</SelectItem>
                <SelectItem value="hokkaido">北海道</SelectItem>
                <SelectItem value="tohoku">東北</SelectItem>
                <SelectItem value="kanto">関東</SelectItem>
                <SelectItem value="chubu">中部</SelectItem>
                <SelectItem value="kinki">近畿</SelectItem>
                <SelectItem value="chugoku">中国</SelectItem>
                <SelectItem value="shikoku">四国</SelectItem>
                <SelectItem value="kyushu">九州</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Japan Map Section */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            {bannerData?.icon_2?.url && (
              <ImageWithFallback
                src={bannerData.icon_2.url}
                alt="装飾アイコン"
                className="w-8 h-8 object-contain"
              />
            )}
            <h2 className="font-mincho font-bold" style={{ color: '#0372ac' }}>地方から探す</h2>
            {bannerData?.icon_3?.url && (
              <ImageWithFallback
                src={bannerData.icon_3.url}
                alt="装飾アイコン"
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Region Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant={selectedArea === 'hokkaido-tohoku' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('hokkaido-tohoku')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">北海道・東北地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">北海道/青森/岩手/宮城/秋田/山形/福島</div>
                </div>
              </Button>

              <Button
                variant={selectedArea === 'kanto' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('kanto')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">関東地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">茨城/栃木/群馬/埼玉/千葉/東京/神奈川</div>
                </div>
              </Button>

              <Button
                variant={selectedArea === 'koshinetsu-hokuriku' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('koshinetsu-hokuriku')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">甲信越・北陸地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">山梨/新潟/長野/富山/石川/福井</div>
                </div>
              </Button>

              <Button
                variant={selectedArea === 'tokai' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('tokai')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">東海地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">愛知/岐阜/静岡/三重</div>
                </div>
              </Button>

              <Button
                variant={selectedArea === 'kansai' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('kansai')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">関西地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">滋賀/京都/大阪/兵庫/奈良/和歌山</div>
                </div>
              </Button>

              <Button
                variant={selectedArea === 'chugoku' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('chugoku')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">中国地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">鳥取/島根/岡山/広島/山口</div>
                </div>
              </Button>

              <Button
                variant={selectedArea === 'shikoku' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('shikoku')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">四国地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">徳島/香川/愛媛/高知</div>
                </div>
              </Button>

              <Button
                variant={selectedArea === 'kyushu-okinawa' ? 'default' : 'outline'}
                onClick={() => handleAreaClick('kyushu-okinawa')}
                className="h-auto py-4 px-4 text-left justify-start"
              >
                <div className="w-full">
                  <div className="font-semibold font-mincho mb-2">九州・沖縄地方</div>
                  <div className="text-xs opacity-70 leading-relaxed">福岡/佐賀/長崎/熊本/大分/宮崎/鹿児島/沖縄</div>
                </div>
              </Button>
            </div>
            
            {/* 都道府県ボタン */}
            {selectedArea !== 'all' && getAvailablePrefectures().length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px bg-slate-300 flex-1"></div>
                  <span className="text-slate-600 text-sm px-3">都道府県</span>
                  <div className="h-px bg-slate-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  <Button
                    variant={selectedPrefecture === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedPrefecture('all')}
                    className="h-auto py-3 font-mincho"
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
                        className="h-auto py-3 font-mincho"
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
    </div>
  );
}

export default App;