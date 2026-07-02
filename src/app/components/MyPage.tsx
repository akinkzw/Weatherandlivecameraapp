import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { River } from '../App';
import type { FavoriteRiver } from '../utils/favoriteRivers';
import { supabase } from '../utils/supabase/client';
import { AuthMenu } from './AuthMenu';
import { RiverDetail } from './RiverDetail';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ArrowLeft, Star, MapPin, ChevronRight, LogOut, Mail } from 'lucide-react';

interface MyPageProps {
  session: Session | null;
  rivers: River[];
  favorites: FavoriteRiver[];
  favoriteIdSet: Set<string>;
  onToggleFavorite: (river: FavoriteRiver) => void;
  isLoadingRivers: boolean;
}

export function MyPage({ session, rivers, favorites, favoriteIdSet, onToggleFavorite, isLoadingRivers }: MyPageProps) {
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openRiver = (id: string) => {
    const r = rivers.find((x) => x.id === id);
    if (r) { setSelectedRiver(r); setIsDialogOpen(true); }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // 未ログイン：ログインを促す（ヘッダーが無い画面なのでAuthMenuを内包）
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => (window.location.href = '/')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> ホームに戻る
          </Button>
          <Card className="p-8 text-center space-y-4">
            <h1 className="text-xl font-bold text-slate-900">マイページ</h1>
            <p className="text-slate-600">マイページのご利用にはログインが必要です。</p>
            <div className="flex justify-center"><AuthMenu session={session} /></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#0372ac' }}>マイページ</h1>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> ホームに戻る
          </Button>
        </div>

        {/* タブ（現在は「お気に入り」のみ。将来ここに プロフィール / 釣行ログ を追加） */}
        <div className="flex gap-2 mb-4 border-b border-slate-200">
          <button type="button" className="px-3 py-2 text-sm font-semibold text-slate-900 border-b-2" style={{ borderColor: '#0372ac' }}>
            お気に入り
          </button>
          {/* 将来: <button>プロフィール</button> / <button>釣行ログ</button> */}
        </div>

        {/* お気に入り管理（メイン） */}
        <section className="space-y-2 mb-8">
          {isLoadingRivers ? (
            // rivers ロード中は一瞬「0件」に見せない
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-3.5 rounded-xl border-l-4 border-l-amber-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="w-4 h-4 rounded-full" />
                </div>
              </Card>
            ))
          ) : favorites.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">お気に入りの川はまだありません。</Card>
          ) : (
            favorites.map((fav) => (
              <Card key={fav.id} className="p-3.5 rounded-xl border-l-4 border-l-amber-400">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => openRiver(fav.id)} className="flex-1 min-w-0 text-left">
                    <h4 className="text-slate-900 font-semibold text-sm truncate">{fav.name}</h4>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{fav.prefecture}</span>
                      {fav.observatoryName && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="truncate text-slate-400">{fav.observatoryName}</span>
                        </>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(fav)}
                    className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="お気に入りから外す"
                    title="お気に入りから外す"
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              </Card>
            ))
          )}
        </section>

        {/* アカウント（登録メール＋ログアウトを集約） */}
        <section>
          <h2 className="text-sm font-bold text-slate-700 mb-2">アカウント</h2>
          <Card className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate">{session.user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1" /> ログアウト
            </Button>
          </Card>
        </section>
      </div>

      {/* 川詳細（App と同一構造） */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRiver?.name}</DialogTitle>
            <DialogDescription>川の詳細情報と天気予報を確認できます。</DialogDescription>
          </DialogHeader>
          {selectedRiver && (
            <RiverDetail
              river={selectedRiver}
              isFavorite={favoriteIdSet.has(selectedRiver.id)}
              onToggleFavorite={() => onToggleFavorite(selectedRiver)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
