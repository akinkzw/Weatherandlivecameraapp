import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function RiverApiTest() {
  const [riverName, setRiverName] = useState('利根川');
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [cameraResult, setCameraResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRiverApi = async () => {
    setLoading(true);
    setApiTestResult(null);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/river-api-test?riverName=${encodeURIComponent(riverName)}`;
      
      console.log('Testing River API:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      setApiTestResult(data);
      console.log('API Test Result:', data);
    } catch (err) {
      console.error('Error testing API:', err);
      setApiTestResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const testCameraApi = async () => {
    setLoading(true);
    setCameraResult(null);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/river-cameras?riverName=${encodeURIComponent(riverName)}`;
      
      console.log('Testing Camera API:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      setCameraResult(data);
      console.log('Camera API Result:', data);
    } catch (err) {
      console.error('Error testing camera API:', err);
      setCameraResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <Card className="p-6">
        <h2 className="text-slate-900 mb-4">国土交通省 河川API テスト</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-2">河川名</label>
            <div className="flex gap-2">
              <Input
                value={riverName}
                onChange={(e) => setRiverName(e.target.value)}
                placeholder="例: 利根川"
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={testRiverApi} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              河川APIテスト
            </Button>
            <Button onClick={testCameraApi} disabled={loading} variant="outline" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              カメラAPIテスト
            </Button>
          </div>

          <div>
            <p className="text-slate-600 mb-2">よく使われる河川:</p>
            <div className="flex flex-wrap gap-2">
              {['利根川', '荒川', '千曲川', '信濃川', '多摩川', '木曽川'].map((river) => (
                <Button
                  key={river}
                  variant="outline"
                  size="sm"
                  onClick={() => setRiverName(river)}
                >
                  {river}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* API テスト結果 */}
      {apiTestResult && (
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            {apiTestResult.error ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            河川API テスト結果
          </h3>
          
          {apiTestResult.error ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700">{apiTestResult.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-slate-900 mb-2">
                  <strong>河川名:</strong> {apiTestResult.riverName}
                </p>
                <p className="text-slate-900 mb-2">
                  <strong>メッセージ:</strong> {apiTestResult.message}
                </p>
              </div>

              {apiTestResult.availableApis && (
                <div>
                  <h4 className="text-slate-900 mb-2">利用可能なAPI:</h4>
                  <div className="space-y-2">
                    {apiTestResult.availableApis.map((api: any, index: number) => (
                      <div key={index} className="bg-slate-50 p-3 rounded">
                        <p className="text-slate-900"><strong>{api.name}</strong></p>
                        <p className="text-slate-600 text-xs mt-1">{api.description}</p>
                        <p className="text-blue-600 text-xs mt-1 break-all">{api.url}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {apiTestResult.testResults && (
                <div>
                  <h4 className="text-slate-900 mb-2">テスト結果:</h4>
                  <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(apiTestResult.testResults, null, 2)}
                  </pre>
                </div>
              )}

              {apiTestResult.notes && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="text-slate-900 mb-2">注意事項:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {apiTestResult.notes.map((note: string, index: number) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* カメラAPI結果 */}
      {cameraResult && (
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            {cameraResult.error ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            カメラAPI テスト結果
          </h3>
          
          {cameraResult.error ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700">{cameraResult.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-slate-900 mb-2">
                  <strong>河川名:</strong> {cameraResult.riverName}
                </p>
                <p className="text-slate-900 mb-2">
                  <strong>カメラ数:</strong> {cameraResult.cameraCount}件
                </p>
                <p className="text-slate-900">
                  <strong>データソース:</strong> {cameraResult.source}
                </p>
              </div>

              {cameraResult.cameras && cameraResult.cameras.length > 0 && (
                <div>
                  <h4 className="text-slate-900 mb-3">カメラ一覧:</h4>
                  <div className="grid gap-3">
                    {cameraResult.cameras.map((camera: any) => (
                      <div key={camera.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-slate-900 mb-1">
                              <strong>{camera.name}</strong>
                            </p>
                            <p className="text-slate-600 text-xs mb-2">{camera.location}</p>
                            <p className="text-slate-500 text-xs mb-2">
                              カメラID: {camera.id}
                            </p>
                            <p className="text-blue-600 text-xs break-all">
                              {camera.imageUrl}
                            </p>
                          </div>
                          <div className="text-slate-500 text-xs">
                            {camera.lastUpdated}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cameraResult.notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-slate-900 mb-2">補足情報:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {cameraResult.notes.map((note: string, index: number) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* 説明カード */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-slate-900 mb-4">公式API利用について</h3>
        <div className="space-y-3 text-slate-700">
          <p>
            <strong>✅ メリット:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>合法的で安定したデータ取得</li>
            <li>国土交通省の利用規約に準拠</li>
            <li>リアルタイムデータの取得</li>
            <li>スクレイピング不要でCORS問題なし</li>
          </ul>

          <p className="mt-4">
            <strong>📋 実装方針:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>国土交通省のオープンデータ/APIを活用</li>
            <li>観測所ID・河川コードでデータ取得</li>
            <li>サーバー側でデータを整形してフロントエンドに提供</li>
            <li>主要河川のカメラ情報をデータベース化</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
