# リアルタイム水位機能テストガイド

## 実装内容

### API エンドポイント
```
GET /make-server-5f24a873/realtime-water-level/{townCode}?observatory={観測所名}
```

### テストデータ例

#### 桂川（山梨県）
- **DPF観測所ID（町コード）**: `1901204`
- **観測所名**: `桂川　境橋`
- **水位情報URL**: `https://www.river.go.jp/kawabou/ipSuiiKobetu.do?obsrvId=1900000055&gamenId=01-1003&fldCtlParty=no`

#### API URL例
```
https://{projectId}.supabase.co/functions/v1/make-server-5f24a873/realtime-water-level/1901204?observatory=桂川
```

### 川の防災情報 直接API
```
https://www.river.go.jp/kawabou/file/gjson/obs/20251201/1940/stg/1901204.json
```

## テスト手順

### 1. サーバーエンドポイントのテスト

ブラウザまたはcURLで以下を実行：

```bash
curl "https://{projectId}.supabase.co/functions/v1/make-server-5f24a873/realtime-water-level/1901204" \
  -H "Authorization: Bearer {publicAnonKey}"
```

### 2. フロントエンドでテスト

川データに以下のフィールドを追加：

```typescript
{
  id: "test-katsura",
  name: "桂川",
  prefecture: "山梨県",
  municipality: "都留市",
  riverSystem: "相模川",
  observatoryName: "境橋",
  dpfObservatoryId: "1901204",
  waterLevelUrl: "https://www.river.go.jp/kawabou/ipSuiiKobetu.do?obsrvId=1900000055&gamenId=01-1003&fldCtlParty=no",
  // ... その他のフィールド
}
```

### 3. 期待される動作

1. ✅ モーダルを開くと自動的にリアルタイム水位データを取得
2. ✅ 「リアルタイムデータ」バッジが表示される
3. ✅ 観測所名、観測時刻が表示される
4. ✅ 現在水位、水防団待機水位、氾濫危険水位、氾濫発生水位が表示される
5. ✅ 水位レベルに応じたステータスバッジ（正常/注意/警戒/氾濫発生）が表示される
6. ✅ 「詳細な水位情報を見る」リンクが表示される

### 4. エラーハンドリング

- ❌ `dpfObservatoryId`が未設定 → 「この川の観測所データは登録されていません」
- ❌ APIエラー → コンソールにエラーログ、デフォルトの水位表示にフォールバック

## データ取得の仕組み

1. **町コード（DPF観測所ID）**: CSVの「DPF観測所ID」列に対応
2. **API URL構造**: 
   ```
   https://www.river.go.jp/kawabou/file/gjson/obs/{YYYYMMDD}/{HHMM}/stg/{townCode}.json
   ```
3. **時刻の丸め**: 現在時刻を10分単位に切り捨て（例: 19:47 → 19:40）
4. **データ形式**: GeoJSON FeatureCollection
5. **観測所フィルタリング**: 観測所名が指定されている場合、該当する観測所のみ抽出

## サンプルレスポンス

```json
{
  "success": true,
  "data": [
    {
      "observationCode": 1900000055,
      "observationName": "桂川　境橋",
      "observationTime": "2025/12/02 00:00",
      "currentWaterLevel": 581.14,
      "warningLevel": 581.97,
      "dangerLevel": 583.9,
      "floodLevel": 586.38,
      "status": "normal",
      "latitude": 35.5285167,
      "longitude": 138.8588389
    }
  ],
  "apiUrl": "https://www.river.go.jp/kawabou/file/gjson/obs/20251201/1940/stg/1901204.json",
  "timestamp": "20251201 1940",
  "count": 1
}
```

## CSVフォーマット（拡張版）

```
川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模,DPF観測所ID,水位情報URL
桂川,山梨県,都留市,相模川,境橋,35.5285167,138.8588389,中規模,1901204,https://www.river.go.jp/kawabou/ipSuiiKobetu.do?obsrvId=1900000055
```

## 次のステップ

1. ✅ サーバーサイド実装完了
2. ✅ フロントエンド実装完了
3. ⏳ CSVデータの拡張（DPF観測所ID、水位情報URLの追加）
4. ⏳ 一括アップロード機能の更新（新しいCSVフォーマットに対応）
