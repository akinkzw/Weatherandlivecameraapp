# バックアップ情報

**作成日時**: 2025年11月19日  
**目的**: 国土交通省GraphQL API統合前の現在状態を保存

## 📦 バックアップファイル

### 1. サーバー関連
- `/supabase/functions/server/river_graphql.backup.tsx` - ライブカメラスクレイピング機能
- `/supabase/functions/server/index.backup.tsx` - メインサーバー（参照用マーカー）

### 2. 現在の実装状況

#### ✅ 実装済み機能
- 全国47都道府県の川データ（約452件）
- 8つの地方別フィルター
- 都道府県別絞り込み
- 川名検索機能
- 国土交通省HTMLスクレイピングによるライブカメラ情報取得
- microCMS連携（ヘッダー背景画像）
- レスポンシブデザイン

#### 📊 現在のデータ構造
```typescript
{
  id: string;
  name: string;           // 川の名前
  region: string;         // 地方（hokkaido, tohoku, kanto等）
  prefecture: string;     // 都道府県
  length: number;         // 川の長さ（km）
  waterLevel: number;     // 現在の水位（ダミーデータ）
  warningLevel: number;   // 警戒水位（固定値 5.20）
  currentStatus: string;  // ステータス（'normal', 'caution', 'warning'）（ダミー）
  cameras: Camera[];      // ライブカメラ（スクレイピングで動的取得）
  weather: WeatherData[]; // 天気予報（ダミーデータ）
}
```

#### 🔧 データソース
- **川の基本情報**: `/data/mockData.ts`（ダミーデータ）
- **ライブカメラ**: 国土交通省HTML動的スクレイピング（実データ）
- **水位・天気**: 固定値・ダミーデータ

## 🎯 今後の統合予定

### GraphQL APIから取得予定のデータ
- ✅ 河川名
- ✅ 観測所名
- ✅ 緯度・経度
- ✅ 最終更新日時
- ✅ ライブカメラURL
- ❓ 現在の水位（確認中）
- ❓ 警戒水位・危険水位（確認中）

### 追加予定のAPIソース
- OpenWeather API（天気・気温データ）

## 🔄 復元方法

元の状態に戻す場合:

```bash
# 1. バックアップファイルを確認
cat /supabase/functions/server/river_graphql.backup.tsx

# 2. 必要に応じて元のファイルに復元
# （手動でコピー＆ペースト）
```

## 📝 重要な注意事項

1. **ダミーデータの位置**: `/data/mockData.ts`
2. **ライブカメラスクレイピング**: `/supabase/functions/server/river_graphql.tsx`
3. **サーバーエンドポイント**: `/river-info/:riverName`
4. **動作確認済み**: ライブカメラ情報の自動取得・表示機能

## 🔍 国土交通省DPF APIサンプルデータ

```json
{
  "id": "002bb13f-2d50-4de8-8392-f7106f9b9113",
  "title": "熊本県熊本市:観測所名 代継橋",
  "metadata": {
    "HWQ:river_name": "白川",
    "HWQ:observation_place_name": "代継橋",
    "DPF:latitude": 32.796388888888885,
    "DPF:longitude": 130.70694444444445,
    "DPF:last_update_datetime": "2023-03-10T17:15:34+09:00",
    "HWQ:prefecture": "熊本県",
    "HWQ:municipality_name": "熊本市"
  }
}
```

**含まれていないデータ**: 
- 現在の水位値
- 警戒水位・危険水位などの基準値

---

**このファイルは削除しないでください**
