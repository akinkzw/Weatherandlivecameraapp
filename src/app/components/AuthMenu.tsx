import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, authRedirectUrl } from '../utils/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { LogIn, Mail, User } from 'lucide-react';

export function AuthMenu({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const sendLink = async () => {
    const addr = email.trim();
    if (!addr) return;
    setStatus('sending');
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo: authRedirectUrl },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  // ログイン済み：マイページへの入口（ログアウトはマイページに集約）
  if (session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => { window.location.href = '/?page=mypage'; }}
        className="bg-white/90"
      >
        <User className="w-4 h-4 mr-1" />
        マイページ
      </Button>
    );
  }

  // 未ログイン：ログインボタン → メール入力ダイアログ
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="bg-white/90">
        <LogIn className="w-4 h-4 mr-1" />
        ログイン
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) { setStatus('idle'); setEmail(''); setErrorMsg(''); }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ログイン</DialogTitle>
            <DialogDescription>
              メールアドレスにログイン用のリンクを送ります（パスワード不要）。
            </DialogDescription>
          </DialogHeader>

          {status === 'sent' ? (
            <div className="py-2 text-sm text-slate-700">
              <Mail className="w-5 h-5 text-blue-600 inline mr-1" />
              確認メールを送信しました。メール内のリンクを開くとログインできます。
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="auth-email">メールアドレス</Label>
                <Input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendLink(); }}
                  placeholder="you@example.com"
                />
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-600">{errorMsg || '送信に失敗しました'}</p>
              )}
              <Button
                onClick={sendLink}
                disabled={status === 'sending' || !email.trim()}
                className="w-full"
              >
                {status === 'sending' ? '送信中...' : 'ログインリンクを送信'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
