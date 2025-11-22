# DPF GraphQL API データ同期ガイド

## 概要

国土交通省データプラットフォーム（DPF）のGraphQL APIから、全国の河川観測所データ（約1000件）を取得し、アプリのデータベースに同期する機能です。

## 使い方

### 1. 同期管理画面にアクセス

URLに `?test=dpf-sync` を追加してアクセスします：

```
https://your-app-url.com/?test=dpf-sync
```

### 2. データを同期

「DPF APIからデータを同期」ボタンをクリックすると、以下の処理が実行されます：

1. DPF GraphQL APIから観測所データを取得（約1000件）
2. 観測所データを河川名と都道府県でグループ化
3. 既存のデータベースをクリア
4. 新しいデータを保存

### 3. 完了確認

同期が成功すると、以下の情報が表示されます：
- 登録された河川の数
- 観測所データの数

### 4. メインページで確認

「メインページに戻る」ボタンをクリックして、データが正しく反映されているか確認します。

## 技術詳細

### API エンドポイント

```
POST /make-server-5f24a873/sync-rivers-from-dpf
```

### データ構造

同期された各河川には以下の情報が含まれます：

```typescript
{
  id: string;
  name: string;              // 河川名
  region: string;            // 地方（hokkaido-tohoku, kanto, など）
  prefecture: string;        // 都道府県
  length: number;            // 河川延長（仮データ）
  waterLevel: number;        // 水位（仮データ）
  warningLevel: number;      // 警戒水位
  currentStatus: string;     // 現在のステータス
  cameras: [];               // カメラ情報
  weather: [];               // 天気情報
  observationCount: number;  // 観測所の数
  dpfStations: [{            // DPF観測所データ
    id: string;
    name: string;
    lat: number;
    lon: number;
  }];
}
```

### 地方区分マッピング

都道府県は以下の地方に自動的に分類されます：

- `hokkaido-tohoku`: 北海道・東北地方
- `kanto`: 関東地方
- `koshinetsu-hokuriku`: 甲信越・北陸地方
- `tokai`: 東海地方
- `kansai`: 関西地方
- `chugoku`: 中国地方
- `shikoku`: 四国地方
- `kyushu-okinawa`: 九州・沖縄地方

## 注意事項

⚠️ **重要**: 
- 同期処理は既存のデータベースの内容を**完全に削除**してから新しいデータを保存します
- 手動で追加したカスタムデータは失われます
- DPF APIが利用できない場合、同期は失敗します

## トラブルシューティング

### エラー: "DPF APIからデータを取得できませんでした"

原因:
- DPF_API_KEY環境変数が設定されていない
- DPF APIがメンテナンス中
- ネットワーク接続の問題

解決方法:
1. 環境変数設定を確認: `?test=weather` でAPIキーのステータスを確認
2. しばらく待ってから再試行

### エラー: "403 Forbidden"

原因:
- APIキーが無効または期限切れ
- アクセス権限がない

解決方法:
1. 正しいAPIキーを再設定
2. DPFサポートに問い合わせ

## 開発者向け情報

### ソースコード

- サーバー側実装: `/supabase/functions/server/index.tsx`
- GraphQL クライアント: `/supabase/functions/server/dpf_graphql.tsx`
- 管理UI: `/components/DpfSyncAdmin.tsx`

### 拡張方法

独自のデータフィルタリングやマッピングロジックを追加する場合は、
`/supabase/functions/server/index.tsx` の `sync-rivers-from-dpf` エンドポイントを編集してください。
