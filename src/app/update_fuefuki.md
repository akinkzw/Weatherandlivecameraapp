# 笛吹川データ更新手順

## ✅ 実装完了事項

1. **CSVフォーマット拡張** ✅
   - 10列対応（DPF観測所ID, 水位情報URL追加）
   
2. **サーバー側対応** ✅
   - `/rivers/clear-all-dummy-values` - 全ダミー値クリア
   - `/rivers/update-existing` - 個別川の更新
   
3. **フロントエンド対応** ✅
   - `?test=dummy-cleaner` でダミー値クリア画面にアクセス可能

---

## 🚀 使用方法

### **方法1: 全てのダミー値を一括クリア（推奨）**

1. ブラウザで以下のURLにアクセス：
   ```
   ?test=dummy-cleaner
   ```

2. 「ダミー値をクリア」ボタンをクリック

3. 確認ダイアログで「OK」をクリック

4. 完了！

---

### **方法2: 新しいCSVで笛吹川を再登録**

1. 以下の内容でCSVファイルを作成：
   ```csv
   川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模,DPF観測所ID,水位情報URL
   笛吹川,山梨県,笛吹市,富士川,石和,35.648,138.640,medium,1901204,https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=304011283719010&timeType=60
   ```

2. `?test=bulk-upload` にアクセス

3. CSVファイルをアップロード

---

## 📋 確認方法

1. メインページで「笛吹川」を検索
2. 詳細画面を開く
3. 水位情報セクションを確認

### **期待される結果：**
- `dpfObservatoryId` が設定されている場合：リアルタイム水位が表示される
- `dpfObservatoryId` が未設定の場合：「この川の水位データは準備中です」と表示される

---

## 🔧 API仕様

### **POST /rivers/clear-all-dummy-values**
```bash
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/clear-all-dummy-values \
  -H 'Authorization: Bearer {publicAnonKey}'
```

**レスポンス:**
```json
{
  "success": true,
  "message": "XX件の川のダミー値をクリアしました",
  "summary": {
    "updated": XX,
    "skipped": XX,
    "total": XX
  }
}
```

### **POST /rivers/update-existing**
```bash
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/update-existing \
  -H 'Authorization: Bearer {publicAnonKey}' \
  -H 'Content-Type: application/json' \
  -d '{
    "riverId": "1",
    "dpfObservatoryId": "1901204",
    "waterLevelUrl": "https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=304011283719010&timeType=60"
  }'
```

---

## 🎯 次のステップ

1. `?test=dummy-cleaner` でダミー値をクリア
2. `/sample_rivers_with_dpf.csv` を使ってリアルタイム水位対応の川を登録
3. 笛吹川で動作確認
