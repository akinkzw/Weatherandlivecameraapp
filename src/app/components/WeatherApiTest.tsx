import React, { useState } from 'react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Weather API テストコンポーネント
 * 環境変数とWeather APIの動作を確認するための診断ツール
 */
export function WeatherApiTest() {
  const [envCheckResult, setEnvCheckResult] = useState<any>(null);
  const [weatherTestResult, setWeatherTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 環境変数チェック
  const checkEnvironment = async () => {
    setLoading(true);
    try {
      console.log('🔍 環境変数をチェック中...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/env-check`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('✅ 環境変数チェック結果:', data);
      setEnvCheckResult(data);
    } catch (error) {
      console.error('❌ 環境変数チェックエラー:', error);
      setEnvCheckResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Weather APIテスト
  const testWeatherApi = async () => {
    setLoading(true);
    try {
      console.log('🧪 Weather APIをテスト中...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/test-weatherapi`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('✅ Weather APIテスト結果:', data);
      setWeatherTestResult(data);
    } catch (error) {
      console.error('❌ Weather APIテストエラー:', error);
      setWeatherTestResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="mb-4">Weather API 診断ツール</h2>
      
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={checkEnvironment} 
          disabled={loading}
        >
          環境変数をチェック
        </Button>
        
        <Button 
          onClick={testWeatherApi} 
          disabled={loading}
          variant="secondary"
        >
          Weather APIをテスト
        </Button>
      </div>

      {/* 環境変数チェック結果 */}
      {envCheckResult && (
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="mb-2">環境変数チェック結果</h3>
          
          {envCheckResult.error ? (
            <div className="text-red-600">
              <p>❌ エラー: {envCheckResult.error}</p>
            </div>
          ) : (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">変数名</th>
                    <th className="text-left py-2">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {envCheckResult.variables && Object.entries(envCheckResult.variables).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-2">{key}</td>
                      <td className="py-2">
                        {key === 'WEATHERAPI_KEY_VALUE' ? (
                          <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                            {String(value)}
                          </code>
                        ) : (
                          <span className={String(value).includes('NOT SET') ? 'text-red-600' : 'text-green-600'}>
                            {String(value)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Weather APIテスト結果 */}
      {weatherTestResult && (
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="mb-2">Weather APIテスト結果</h3>
          
          {weatherTestResult.success ? (
            <div className="text-green-600">
              <p className="mb-2">✅ {weatherTestResult.message}</p>
              <div className="text-sm text-gray-700">
                <p><strong>APIキー:</strong> {weatherTestResult.apiKey}</p>
                <p><strong>テスト日付:</strong> {weatherTestResult.date}</p>
                
                {weatherTestResult.data && weatherTestResult.data.forecast && (
                  <div className="mt-4">
                    <p className="mb-2"><strong>取得データ:</strong></p>
                    <div className="bg-white p-3 rounded border overflow-auto max-h-96">
                      <pre className="text-xs">
                        {JSON.stringify(weatherTestResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-600">
              <p className="mb-2">❌ エラー: {weatherTestResult.error}</p>
              {weatherTestResult.errorDetails && (
                <div className="mt-2 text-sm">
                  <p><strong>詳細:</strong></p>
                  <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
                    {weatherTestResult.errorDetails}
                  </pre>
                </div>
              )}
              {weatherTestResult.apiKey && (
                <p className="mt-2 text-sm">APIキー: {weatherTestResult.apiKey}</p>
              )}
              {weatherTestResult.date && (
                <p className="text-sm">テスト日付: {weatherTestResult.date}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h4 className="mb-2">📝 診断手順</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>まず「環境変数をチェック」ボタンをクリック</li>
          <li>WEATHERAPI_KEYが正しく設定されているか確認</li>
          <li>次に「Weather APIをテスト」ボタンをクリック</li>
          <li>Weather APIが正しく動作するか確認</li>
        </ol>
        
        <div className="mt-3 text-sm">
          <p><strong>期待される結果:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li>WEATHERAPI_KEY: "SET (length: 32)"</li>
            <li>Weather APIテスト: 成功</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
