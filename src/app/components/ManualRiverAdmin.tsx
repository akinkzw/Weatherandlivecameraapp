import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Plus, ArrowLeft } from 'lucide-react';

export function ManualRiverAdmin() {
  const [formData, setFormData] = useState({
    name: '',
    prefecture: '',
    municipality: '',
    basinName: '',
    stationName: '',
    latitude: '',
    longitude: '',
    scale: 'medium' as 'large' | 'medium' | 'small',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県',
    '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/add-manual-river`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({ success: true, message: data.message });
        // フォームをリセット
        setFormData({
          name: '',
          prefecture: '',
          municipality: '',
          basinName: '',
          stationName: '',
          latitude: '',
          longitude: '',
          scale: 'medium',
        });
      } else {
        setResult({ success: false, message: data.error || '川の追加に失敗しました' });
      }
    } catch (error) {
      console.error('Error adding river:', error);
      setResult({ success: false, message: '通信エラーが発生しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/?test=dpf-check'}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            管理画面に戻る
          </Button>
          <h1 className="text-3xl font-bold mb-2">手動で川を追加</h1>
          <p className="text-slate-600">
            DPF APIに登録されていない渓流や支流を手動で追加できます。
            降水量ベースで川の状態を推定します。
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/?test=bulk-upload'}
            className="mt-3"
            style={{ borderColor: '#0372ac', color: '#0372ac' }}
          >
            📊 CSV一括登録はこちら
          </Button>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 川の名前 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                川の名前 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 桂川上流、小菅川"
                required
              />
            </div>

            {/* 都道府県 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.prefecture}
                onValueChange={(value) => setFormData({ ...formData, prefecture: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="都道府県を選択" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {prefectures.map((pref) => (
                    <SelectItem key={pref} value={pref}>
                      {pref}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 市区町村 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                市区町村（任意）
              </label>
              <Input
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                placeholder="例: 甲府市、小菅村"
              />
            </div>

            {/* 水系名称 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                水系名称（任意）
              </label>
              <Input
                value={formData.basinName}
                onChange={(e) => setFormData({ ...formData, basinName: e.target.value })}
                placeholder="例: 相模川水系、多摩川水系、富士川水系"
              />
            </div>

            {/* 気象観測所名称 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                気象観測所名称（任意）
              </label>
              <Input
                value={formData.stationName}
                onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                placeholder="例: 甲府観測所、小菅観測所"
              />
            </div>

            {/* 緯度・経度 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  緯度 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="例: 35.6895"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  経度 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="例: 138.8684"
                  required
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 -mt-3">
              💡 ヒント: <a href="https://www.google.co.jp/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a>で川の場所を右クリックして座標を取得できます
            </div>

            {/* 規模 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                規模
              </label>
              <select
                name="scale"
                value={formData.scale}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#0372ac' }}
              >
                <option value="">自動検出</option>
                <option value="large">大規模（一級河川など）</option>
                <option value="medium">中規模（二級河川など）</option>
                <option value="small">小規模（渓流など）</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                空欄の場合は川の名前から自動検出されます
              </p>
            </div>

            {/* 結果表示 */}
            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {result.message}
              </div>
            )}

            {/* 送信ボタン */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              style={{ backgroundColor: '#0372ac' }}
            >
              {isSubmitting ? (
                <>登録中...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  川を追加
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* 説明セクション */}
        <Card className="p-6 mt-6 bg-blue-50">
          <h3 className="font-bold mb-3 text-blue-900">📖 降水量ベースの推定について</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>✅ メリット:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>DPF APIに登録されていない川もカバーできる</li>
              <li>OpenWeather APIから降水量データを取得</li>
              <li>現在の降雨 + 今後6時間の予報から危険度を判定</li>
            </ul>
            
            <p className="mt-3">
              <strong>⚠️ 注意点:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>実際の水位ではなく「推定」です</li>
              <li>川の詳細では「降雨量 XXmm（推定）」と表示されます</li>
              <li>渓流釣りの参考情報としてご利用ください</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}