-- お気に入りの川（アカウント制）。RLSで本人の行のみ read/write。
-- 適用: Supabase Dashboard の SQL Editor に貼り付けて実行（または supabase db push）。

create table if not exists public.favorites (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  river_id   text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, river_id)          -- (user, river) 一意 = 重複防止
);

alter table public.favorites enable row level security;

-- 本人の行のみ SELECT / INSERT / DELETE（UPDATE は不要）
create policy "own favorites - select"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "own favorites - insert"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "own favorites - delete"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- 一覧取得（新しい順）用の索引
create index if not exists favorites_user_created_idx
  on public.favorites (user_id, created_at desc);

-- API ロールへの権限（Supabase の既定付与と重複する場合があるが明示しておく）
grant select, insert, delete on public.favorites to authenticated;
