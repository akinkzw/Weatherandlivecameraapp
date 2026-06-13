import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function CameraTest() {
  const [cameraId, setCameraId] = useState('0303050101100010'); // 利根川の栗橋観測所
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jsonResponse, setJsonResponse] = useState('');

  const testCameraProxy = async () => {
    setLoading(true);
    setError('');
    setJsonResponse('');
    setImageUrl('');

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/camera-proxy?cameraId=${cameraId}`;
      
      console.log('Testing camera proxy with URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('image')) {
        // 画像が返ってきた場合
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        console.log('✅ Success: Image received');
      } else {
        // JSONエラーが返ってきた場合
        const data = await response.json();
        setJsonResponse(JSON.stringify(data, null, 2));
        setError(data.error || 'Unknown error');
        console.error('❌ Error:', data);
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // テスト用の既知のカメラID一覧
  const testCameras = [
    { name: '利根川 - 栗橋観測所', id: '0303050101100010' },
    { name: '利根川 - 取手観測所', id: '0303050101100020' },
    { name: '荒川 - 治水橋', id: '0303060101100010' },
    { name: '荒川 - 岩淵水門', id: '0303060101100020' },
    { name: '多摩川 - 田園調布堰', id: '0303080101100010' },
  ];

  return (
    <div className="space-y-4 p-6 max-w-4xl mx-auto">
      <Card className="p-6">
        <h2 className="text-slate-900 mb-4">ライブカメラプロキシテスト</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-2">カメラID (obsrvId)</label>
            <div className="flex gap-2">
              <Input
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                placeholder="例: 0303050101100010"
                className="flex-1"
              />
              <Button onClick={testCameraProxy} disabled={loading}>
                {loading ? 'テスト中...' : 'テスト実行'}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-slate-600 mb-2">テスト用カメラを選択:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {testCameras.map((camera) => (
                <Button
                  key={camera.id}
                  variant="outline"
                  onClick={() => {
                    setCameraId(camera.id);
                    setError('');
                    setImageUrl('');
                    setJsonResponse('');
                  }}
                  className="justify-start"
                >
                  {camera.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 結果表示 */}
      {loading && (
        <Card className="p-6">
          <p className="text-slate-600">読み込み中...</p>
        </Card>
      )}

      {imageUrl && (
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">✅ 成功: ライブカメラ画像</h3>
          <img src={imageUrl} alt="Live Camera" className="w-full rounded-lg" />
          <p className="text-slate-600 mt-2">カメラID: {cameraId}</p>
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-red-900 mb-4">❌ エラー</h3>
          <p className="text-red-700 mb-4">{error}</p>
          {jsonResponse && (
            <div>
              <p className="text-slate-700 mb-2">レスポンス詳細:</p>
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto max-h-96">
                {jsonResponse}
              </pre>
            </div>
          )}
        </Card>
      )}

      {/* 使用方法の説明 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-blue-900 mb-4">📝 テスト方法</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>上記のテスト用カメラボタンをクリックしてカメラIDを設定</li>
          <li>「テスト実行」ボタンをクリック</li>
          <li>成功すれば画像が表示され、失敗すればエラー詳細が表示されます</li>
          <li>ブラウザの開発者ツール (F12) → Console タブでサーバーログを確認できます</li>
        </ol>
        <div className="mt-4 p-4 bg-white rounded border border-blue-200">
          <p className="text-slate-700 mb-2">
            <strong>期待される動作:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>✅ 画像が表示される → プロキシが正常に動作</li>
            <li>❌ エラーメッセージが表示される → サーバー側でHTML解析が必要</li>
            <li>❌ CORS エラー → これは予想された結果で、プロキシで解決</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
