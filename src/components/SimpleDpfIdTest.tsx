import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, CheckCircle, Loader2, TestTube } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function SimpleDpfIdTest() {
  const [townCode, setTownCode] = useState('1901204'); // 笛吹川 石和
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/realtime-water-level/${townCode}`;
      
      console.log('Testing water level API with town code:', townCode);
      console.log('URL:', url);
      
      // タイムアウト付きfetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒タイムアウト
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Result:', data);
      setResult(data);
    } catch (error) {
      console.error('Test error:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'リクエストがタイムアウトしました（15秒）。ネットワーク接続を確認してください。';
        } else {
          errorMessage = error.message;
        }
      }
      
      setResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            DPF観測所ID (町コード) テスト
          </CardTitle>
          <CardDescription>
            CSVの「DPF観測所ID」を使って川の防災情報APIから水位データを取得できるかテストします
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="townCode">DPF観測所ID (町コード)</Label>
            <Input
              id="townCode"
              value={townCode}
              onChange={(e) => setTownCode(e.target.value)}
              placeholder="例: 1901204"
            />
            <p className="text-sm text-gray-500">
              デフォルト: 1901204 (笛吹川 石和)
            </p>
          </div>

          <Button onClick={runTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                テスト中...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                テスト実行
              </>
            )}
          </Button>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">サンプルの町コード:</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setTownCode('1901204')} 
                className="text-left p-2 border rounded hover:bg-gray-50"
              >
                1901204 - 笛吹川 石和
              </button>
              <button 
                onClick={() => setTownCode('1701204')} 
                className="text-left p-2 border rounded hover:bg-gray-50"
              >
                1701204 - 手取川 鶴来
              </button>
              <button 
                onClick={() => setTownCode('1601204')} 
                className="text-left p-2 border rounded hover:bg-gray-50"
              >
                1601204 - 神通川 神通大橋
              </button>
              <button 
                onClick={() => setTownCode('1501204')} 
                className="text-left p-2 border rounded hover:bg-gray-50"
              >
                1501204 - 信濃川 小千谷
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          {/* 結果 */}
          <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className="text-base font-medium">
              {result.success 
                ? `✅ 成功！町コード "${townCode}" でリアルタイム水位データを取得できました。` 
                : `❌ 失敗：町コード "${townCode}" ではデータを取得できませんでした。`}
            </AlertDescription>
          </Alert>

          {result.error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">エラー情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 rounded">
                  {result.error}
                </div>
              </CardContent>
            </Card>
          )}

          {result.success && result.data && result.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">取得データ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">API URL:</span>
                    <div className="mt-1 p-2 bg-gray-100 rounded text-xs break-all">{result.apiUrl}</div>
                  </div>
                  <div>
                    <span className="font-medium">タイムスタンプ:</span>
                    <div className="mt-1">{result.timestamp}</div>
                  </div>
                  <div>
                    <span className="font-medium">取得件数:</span>
                    <div className="mt-1">{result.count} 件</div>
                  </div>
                </div>

                {result.data[0] && (
                  <div>
                    <div className="font-medium mb-2">観測所データ:</div>
                    <div className="space-y-2 p-4 bg-gray-50 rounded">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">観測所名:</span> {result.data[0].observationName}</div>
                        <div><span className="font-medium">観測所コード:</span> {result.data[0].observationCode}</div>
                        <div><span className="font-medium">現在水位:</span> {result.data[0].currentWaterLevel} m</div>
                        <div><span className="font-medium">警戒水位:</span> {result.data[0].warningLevel} m</div>
                        <div><span className="font-medium">危険水位:</span> {result.data[0].dangerLevel} m</div>
                        <div><span className="font-medium">氾濫水位:</span> {result.data[0].floodLevel} m</div>
                        <div className="col-span-2">
                          <span className="font-medium">ステータス:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            result.data[0].status === 'normal' ? 'bg-green-100 text-green-800' :
                            result.data[0].status === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                            result.data[0].status === 'warning' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.data[0].status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="font-medium mb-2">完全なJSONデータ:</div>
                  <pre className="p-4 bg-gray-100 rounded overflow-x-auto text-xs max-h-96">
                    {JSON.stringify(result.data[0], null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
