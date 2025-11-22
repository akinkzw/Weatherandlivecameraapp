import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Database, Info, CheckCircle, AlertCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DpfDataCheck() {
  const [isLoadingRivers, setIsLoadingRivers] = useState(true);
  const [isLoadingDpf, setIsLoadingDpf] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [riverCount, setRiverCount] = useState(0);
  const [dpfInfo, setDpfInfo] = useState<any>(null);
  const [restoreInfo, setRestoreInfo] = useState<any>(null);
  const [testInfo, setTestInfo] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [isCheckingEnv, setIsCheckingEnv] = useState(false);

  // 現在のデータベースの川の数を取得
  useEffect(() => {
    const fetchRiverCount = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        const data = await response.json();
        setRiverCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching river count:', error);
      } finally {
        setIsLoadingRivers(false);
      }
    };

    fetchRiverCount();
  }, []);

  // DPF APIから取得可能なデータ件数を確認
  const checkDpfData = async () => {
    setIsLoadingDpf(true);
    setDpfInfo(null);

    try {
      // まずヘルスチェックでサーバーが応答するか確認
      console.log('=== Step 1: Health Check ===');
      console.log('Project ID:', projectId);
      console.log('Public Anon Key exists:', !!publicAnonKey);
      console.log('Public Anon Key length:', publicAnonKey?.length || 0);
      console.log('Public Anon Key preview:', publicAnonKey ? `${publicAnonKey.substring(0, 20)}...` : 'NOT SET');
      
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/health`;
      console.log('Health check URL:', healthUrl);
      console.log('Attempting fetch to:', healthUrl);
      
      let healthResponse;
      try {
        // タイムアウト付きfetch（10秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        healthResponse = await fetch(healthUrl, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log('Health check status:', healthResponse.status);
        console.log('Health check ok:', healthResponse.ok);
        
        if (!healthResponse.ok) {
          const errorText = await healthResponse.text();
          throw new Error(`Health check failed: ${healthResponse.status} - ${errorText}`);
        }
        
        const healthData = await healthResponse.json();
        console.log('Health check response:', healthData);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        
        // AbortErrorの場合はタイムアウト
        if (healthError instanceof Error && healthError.name === 'AbortError') {
          throw new Error(
            `サーバーへの接続がタイムアウトしました（10秒）。\n\n` +
            `考えられる原因：\n` +
            `1. Supabase Functionsがデプロイされていない、または起動に時間がかかっている\n` +
            `2. ネットワーク接続が遅い、または不安定\n` +
            `3. Figmaのプレビュー環境から外部APIへのアクセスが制限されている\n\n` +
            `対処方法：\n` +
            `- 下の「データベースを復元」ボタンを試してください\n` +
            `- ネットワーク接続を確認してください\n\n` +
            `URL: ${healthUrl}`
          );
        }
        
        throw new Error(
          `サーバーへの接続に失敗しました。\n` +
          `エラー: ${healthError}\n\n` +
          `考えられる原因：\n` +
          `1. Supabase Functionsがデプロイされていない\n` +
          `2. Project IDまたはAPI Keyが正しくない\n` +
          `3. ネットワーク接続の問題\n` +
          `4. Figmaのプレビュー環境からの外部アクセス制限\n\n` +
          `URL: ${healthUrl}`
        );
      }
      
      console.log('✅ Health check passed');
      
      // ヘルスチェックが成功したら、実際のDPF同期を実行
      console.log('=== Step 2: DPF Sync Request ===');
      const syncUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/sync-rivers-from-dpf`;
      console.log('Sync URL:', syncUrl);
      
      // タイムアウト付きfetch（120秒 - DPF API処理は時間がかかる可能性がある）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Request timed out after 120 seconds');
        controller.abort();
      }, 120000);
      console.log('Timeout set to 120 seconds');
      
      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('Sync response status:', response.status);
      console.log('Sync response ok:', response.ok);
      console.log('Sync response headers:', Object.fromEntries(response.headers.entries()));

      // レスポンスが空でないか確認
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error(
          `サーバーから予期しないレスポンスが返されました。\n` +
          `Content-Type: ${contentType}\n` +
          `Response: ${responseText.substring(0, 200)}`
        );
      }

      const data = await response.json();
      console.log('Sync response data:', data);
      
      setDpfInfo(data);

      // 成功した場合は川の数を再取得
      if (data.success) {
        console.log('=== Step 3: Fetching updated river count ===');
        const riverResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        const riverData = await riverResponse.json();
        console.log('River count:', riverData.count);
        setRiverCount(riverData.count || 0);
      }
    } catch (error) {
      console.error('=== Error in checkDpfData ===');
      console.error('Error:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error name:', error instanceof Error ? error.name : 'N/A');
      
      // エラーの詳細をログに出力
      if (error instanceof TypeError) {
        console.error('TypeError details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      
      setDpfInfo({
        success: false,
        error: String(error),
        errorCode: 'FETCH_FAILED',
        suggestions: [
          'ブラウザのコンソール（F12）でエラーの詳細を確認してください',
          '下の「データベースを復元」ボタンを使用して、事前登録済みの川データを使用してください',
          'Supabase Functionsが正しくデプロイされているか確認してください',
          'Project IDとAPI Keyが正しく設定されているか確認してください',
          'ネットワーク接続を確認してください',
        ],
        details: error instanceof Error ? error.stack : String(error),
      });
    } finally {
      setIsLoadingDpf(false);
    }
  };

  // データベースを復元
  const restoreDatabase = async () => {
    setIsRestoring(true);
    setRestoreInfo(null);

    try {
      // 全国45都道府県のデータを復元
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/restore-all-prefectures`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setRestoreInfo(data);

      // 成功した場合は川の数を再取得
      if (data.success) {
        const riverResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        const riverData = await riverResponse.json();
        setRiverCount(riverData.count || 0);
      }
    } catch (error) {
      setRestoreInfo({
        success: false,
        error: String(error),
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // DPF APIへの接続テスト
  const testDpfConnection = async () => {
    setIsTestingConnection(true);
    setTestInfo(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/test-dpf`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      console.log('DPF API Test Response:', data);
      setTestInfo(data);
    } catch (error) {
      console.error('Error testing DPF connection:', error);
      setTestInfo({
        success: false,
        error: String(error),
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 環境変数の確認
  const checkEnvVariables = async () => {
    setIsCheckingEnv(true);
    setEnvInfo(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/env-check`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      console.log('Environment Variables Check Response:', data);
      setEnvInfo({ success: true, ...data });
    } catch (error) {
      console.error('Error checking environment variables:', error);
      setEnvInfo({
        success: false,
        error: String(error),
      });
    } finally {
      setIsCheckingEnv(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0372ac' }}>
            DPF API データ同期
          </h1>
          <p className="text-slate-600">
            国土交通省データプラットフォームから河川データを取得します
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" style={{ color: '#0372ac' }} />
              データベース状態確認
            </CardTitle>
            <CardDescription>
              現在のデータベースとDPF APIのデータ状況を確認します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 現在のデータベース状態 */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5" style={{ color: '#0372ac' }} />
                <h3 className="font-semibold text-slate-900">現在のデータベース</h3>
              </div>
              {isLoadingRivers ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  読み込み中...
                </div>
              ) : (
                <div className="text-2xl font-bold" style={{ color: '#0372ac' }}>
                  {riverCount.toLocaleString()} 件の川
                </div>
              )}
            </div>

            {/* DPF API同期ボタン */}
            <Button
              onClick={checkDpfData}
              disabled={isLoadingDpf}
              className="w-full"
              size="lg"
              style={{ backgroundColor: '#0372ac' }}
            >
              {isLoadingDpf ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  DPF APIから同期中...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  DPF APIからデータを同期
                </>
              )}
            </Button>

            {/* 同期結果 */}
            {dpfInfo && (
              <div className={`border rounded-lg p-4 ${
                dpfInfo.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {dpfInfo.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <h3 className={`font-semibold ${
                    dpfInfo.success ? 'text-green-900' : 'text-amber-900'
                  }`}>
                    {dpfInfo.success ? '同期成功' : 'DPF APIを利用できません'}
                  </h3>
                </div>
                <div className={dpfInfo.success ? 'text-green-700' : 'text-amber-700'}>
                  {dpfInfo.success ? (
                    <>
                      <p>{dpfInfo.message}</p>
                      {dpfInfo.observationStations && (
                        <p className="text-sm mt-1">
                          ({dpfInfo.observationStations.toLocaleString()}件の観測所データから生成)
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-2">{dpfInfo.error}</p>
                      {dpfInfo.suggestions && dpfInfo.suggestions.length > 0 && (
                        <div className="bg-amber-100 border border-amber-300 rounded p-3 mt-3">
                          <p className="text-sm font-semibold mb-2">💡 対処方法：</p>
                          <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                            {dpfInfo.suggestions.map((suggestion: string, index: number) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {dpfInfo.errorCode === 'DPF_API_ACCESS_DENIED' && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-900 font-semibold mb-1">
                            📌 推奨される対処法
                          </p>
                          <p className="text-sm text-blue-800">
                            下の「<strong>データベースを復元</strong>」ボタンをクリックして、
                            全国45都道府県の川データ（約350件）を使用してください。
                          </p>
                        </div>
                      )}
                      {dpfInfo.details && (
                        <details className="mt-3">
                          <summary className="text-sm cursor-pointer font-semibold text-amber-800 hover:text-amber-900">
                            詳細なエラー情報を表示
                          </summary>
                          <div className="mt-2 p-3 bg-amber-100 rounded text-xs font-mono overflow-auto max-h-40">
                            <p className="whitespace-pre-wrap">{dpfInfo.details}</p>
                            {dpfInfo.rawError && (
                              <div className="mt-2 pt-2 border-t border-amber-300">
                                <p className="font-semibold mb-1">Raw Error:</p>
                                <p className="whitespace-pre-wrap">{dpfInfo.rawError}</p>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* データベース復元ボタン */}
            <Button
              onClick={restoreDatabase}
              disabled={isRestoring}
              className="w-full"
              size="lg"
              style={{ backgroundColor: '#0372ac' }}
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  データベース復元中...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  データベースを復元
                </>
              )}
            </Button>

            {/* 復元結果 */}
            {restoreInfo && (
              <div className={`border rounded-lg p-4 ${
                restoreInfo.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {restoreInfo.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className={`font-semibold ${
                    restoreInfo.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {restoreInfo.success ? '復元成功' : '復元失敗'}
                  </h3>
                </div>
                <div className={restoreInfo.success ? 'text-green-700' : 'text-red-700'}>
                  {restoreInfo.success ? (
                    <>
                      <p>{restoreInfo.message}</p>
                      {restoreInfo.observationStations && (
                        <p className="text-sm mt-1">
                          ({restoreInfo.observationStations.toLocaleString()}件の観測所データから生成)
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-2">エラーが発生しました</p>
                      <p className="mb-2">{restoreInfo.error || '不明なエラー'}</p>
                      {restoreInfo.errorCode && (
                        <div className="bg-red-100 border border-red-300 rounded p-3 mt-3">
                          <p className="text-sm font-mono">
                            Error: {restoreInfo.errorCode}
                          </p>
                          {restoreInfo.errorCode === 'DPF_API_ACCESS_DENIED' && (
                            <div className="mt-3 text-sm">
                              <p className="font-semibold mb-1">対処方法：</p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>DPF APIキーが正しく設定されているか確認してください</li>
                                <li>APIキーに観測所データへのアクセス権限があるか確認してください</li>
                                <li>DPFサービスが正常に稼働しているか確認してください</li>
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* DPF API接続テストボタン */}
            <Button
              onClick={testDpfConnection}
              disabled={isTestingConnection}
              className="w-full"
              size="lg"
              style={{ backgroundColor: '#0372ac' }}
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  接続テスト中...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  DPF API接続テスト
                </>
              )}
            </Button>

            {/* 接続テスト結果 */}
            {testInfo && (
              <div className={`border rounded-lg p-4 ${
                testInfo.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testInfo.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className={`font-semibold ${
                    testInfo.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {testInfo.success ? '接続成功' : '接続失敗'}
                  </h3>
                </div>
                <div className={testInfo.success ? 'text-green-700' : 'text-red-700'}>
                  {testInfo.success ? (
                    <>
                      <p className="mb-2">DPF APIへの接続に成功しました</p>
                      
                      {/* 成功したパターンの表示 */}
                      {testInfo.results && testInfo.results.length > 0 && (
                        <div className="mt-3 mb-3 p-3 bg-blue-50 border border-blue-300 rounded">
                          <h4 className="font-semibold text-blue-900 mb-2">✅ 認証パターンのテスト結果</h4>
                          <div className="space-y-2">
                            {testInfo.results.map((result: any, index: number) => (
                              <div 
                                key={index} 
                                className={`p-2 rounded text-sm ${
                                  result.success 
                                    ? 'bg-green-50 border border-green-300 text-green-900' 
                                    : 'bg-red-50 border border-red-300 text-red-900'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {result.success ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  <span className="font-semibold">{result.testName}</span>
                                </div>
                                <div className="ml-6 mt-1 space-y-1 text-xs">
                                  <div>
                                    ステータス: <span className="font-mono">{result.status || 'N/A'}</span>
                                  </div>
                                  {result.success && result.dataCount !== undefined && (
                                    <div className="text-green-700">
                                      ✅ <span className="font-semibold">{result.dataCount}件のデータ取得成功</span>
                                    </div>
                                  )}
                                  {result.headersUsed && result.headersUsed.length > 0 && (
                                    <div>
                                      使用ヘッダー: <span className="font-mono">{result.headersUsed.join(', ')}</span>
                                    </div>
                                  )}
                                  {!result.success && result.error && (
                                    <div className="text-red-700 mt-1">
                                      エラー: {result.error}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* 推奨事項 */}
                          {testInfo.recommendation && (
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <p className="text-sm text-blue-900">
                                <span className="font-semibold">💡 推奨:</span> {testInfo.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* APIキー情報の表示 */}
                      <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                        <h4 className="font-semibold text-green-900 mb-2">📌 APIキー情報（確認用）</h4>
                        <div className="space-y-1 text-sm text-green-900">
                          {testInfo.envVarName && (
                            <div>
                              <span className="font-semibold">環境変数名:</span>{' '}
                              <span className="font-mono bg-white px-2 py-1 rounded">{testInfo.envVarName}</span>
                            </div>
                          )}
                          {testInfo.apiKeyLength && (
                            <div>
                              <span className="font-semibold">APIキーの長さ:</span>{' '}
                              <span className="font-mono">{testInfo.apiKeyLength} 文字</span>
                            </div>
                          )}
                          {testInfo.apiKeyUsed && (
                            <div>
                              <span className="font-semibold">使用されたAPIキー:</span>{' '}
                              <div className="font-mono bg-white px-2 py-1 rounded mt-1 break-all text-xs">
                                {testInfo.apiKeyUsed}
                              </div>
                            </div>
                          )}
                          <div className="mt-2 pt-2 border-t border-green-300">
                            <p className="text-xs text-green-800">
                              ✅ このAPIキーは、データ同期（sync-rivers-from-dpf）でも同じ環境変数（{testInfo.envVarName}）から取得されます。
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <details className="mt-3">
                        <summary className="text-sm cursor-pointer font-semibold hover:underline">
                          詳細情報を表示
                        </summary>
                        <div className="mt-2 p-3 bg-green-100 rounded text-xs font-mono overflow-auto max-h-96">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(testInfo, null, 2)}</pre>
                        </div>
                      </details>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-2">DPF APIへの接続に失敗しました</p>
                      {testInfo.status && (
                        <p className="text-sm mb-2">
                          ステータス: <span className="font-mono">{testInfo.status} {testInfo.statusText}</span>
                        </p>
                      )}
                      {testInfo.apiKeyUsed && (
                        <p className="text-sm mb-2">
                          使用されたAPIキー: <span className="font-mono">{testInfo.apiKeyUsed}</span>
                        </p>
                      )}
                      {testInfo.apiKeyLength && (
                        <p className="text-sm mb-2">
                          APIキーの長さ: <span className="font-mono">{testInfo.apiKeyLength} 文字</span>
                        </p>
                      )}
                      <details className="mt-3">
                        <summary className="text-sm cursor-pointer font-semibold text-red-800 hover:text-red-900">
                          詳細なエラー情報を表示
                        </summary>
                        <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono overflow-auto max-h-96">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(testInfo, null, 2)}</pre>
                        </div>
                      </details>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 環境変数の確認 */}
            <Button
              onClick={checkEnvVariables}
              disabled={isCheckingEnv}
              className="w-full"
              size="lg"
              style={{ backgroundColor: '#0372ac' }}
            >
              {isCheckingEnv ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  環境変数確認中...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  環境変数を確認
                </>
              )}
            </Button>

            {/* 環境変数の確認結果 */}
            {envInfo && (
              <div className={`border rounded-lg p-4 ${
                envInfo.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {envInfo.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className={`font-semibold ${
                    envInfo.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {envInfo.success ? '確認成功' : '確認失敗'}
                  </h3>
                </div>
                <div className={envInfo.success ? 'text-green-700' : 'text-red-700'}>
                  {envInfo.success ? (
                    <>
                      <p>{envInfo.message}</p>
                      
                      {/* 警告メッセージの表示 */}
                      {envInfo.warning && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded">
                          <p className="text-amber-900 font-semibold">{envInfo.warning}</p>
                        </div>
                      )}
                      
                      {envInfo.variables && (
                        <div className="mt-3 space-y-2">
                          <h4 className="font-semibold text-green-900">確認された環境変数：</h4>
                          
                          {/* DPF_API_KEY の詳細 */}
                          <div className="bg-green-100 border border-green-300 rounded p-3">
                            <h5 className="font-semibold text-green-900 mb-2">DPF_API_KEY:</h5>
                            <div className="space-y-1 text-sm text-green-900">
                              <div>
                                <span className="font-semibold">ステータス:</span>{' '}
                                <span className={envInfo.variables.DPF_API_KEY === 'SET' ? 'text-green-700' : 'text-red-700'}>
                                  {envInfo.variables.DPF_API_KEY}
                                </span>
                              </div>
                              {envInfo.variables.DPF_API_KEY_LENGTH && (
                                <div>
                                  <span className="font-semibold">長さ:</span>{' '}
                                  <span className="font-mono">{envInfo.variables.DPF_API_KEY_LENGTH} 文字</span>
                                </div>
                              )}
                              {envInfo.variables.DPF_API_KEY_PREVIEW && (
                                <div>
                                  <span className="font-semibold">プレビュー:</span>{' '}
                                  <span className="font-mono bg-white px-2 py-1 rounded">{envInfo.variables.DPF_API_KEY_PREVIEW}</span>
                                </div>
                              )}
                              {envInfo.variables.DPF_API_KEY_VALUE && envInfo.variables.DPF_API_KEY_VALUE !== 'NOT SET' && (
                                <div>
                                  <span className="font-semibold">完全な値:</span>{' '}
                                  <div className="font-mono bg-white px-2 py-1 rounded mt-1 break-all text-xs">
                                    {envInfo.variables.DPF_API_KEY_VALUE}
                                  </div>
                                </div>
                              )}
                              {typeof envInfo.variables.DPF_API_KEY_MATCHES_EXPECTED !== 'undefined' && (
                                <div className={`mt-2 pt-2 border-t ${envInfo.variables.DPF_API_KEY_MATCHES_EXPECTED ? 'border-green-300' : 'border-amber-300'}`}>
                                  <span className="font-semibold">期待値との一致:</span>{' '}
                                  <span className={`font-mono ${envInfo.variables.DPF_API_KEY_MATCHES_EXPECTED ? 'text-green-700' : 'text-amber-700'}`}>
                                    {envInfo.variables.DPF_API_KEY_MATCHES_EXPECTED ? '✅ 一致' : '❌ 不一致'}
                                  </span>
                                  {envInfo.variables.EXPECTED_API_KEY_PREVIEW && (
                                    <div className="mt-1 text-xs">
                                      期待されるAPIキー: <span className="font-mono bg-white px-2 py-1 rounded">{envInfo.variables.EXPECTED_API_KEY_PREVIEW}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* 他の環境変数 */}
                          <details className="text-sm">
                            <summary className="cursor-pointer font-semibold text-green-900 hover:underline">
                              他の環境変数を表示
                            </summary>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-2 mt-2">
                              {Object.entries(envInfo.variables)
                                .filter(([key]) => !key.startsWith('DPF_API_KEY') && !key.startsWith('EXPECTED_'))
                                .map(([key, value]) => (
                                  <li key={key}>
                                    <span className="font-mono">{key}</span>: {String(value)}
                                  </li>
                                ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-2">エラーが発生しました</p>
                      <p className="mb-2">{envInfo.error || '不明なエラー'}</p>
                      {envInfo.errorCode && (
                        <div className="bg-red-100 border border-red-300 rounded p-3 mt-3">
                          <p className="text-sm font-mono">
                            Error: {envInfo.errorCode}
                          </p>
                          {envInfo.errorCode === 'DPF_API_ACCESS_DENIED' && (
                            <div className="mt-3 text-sm">
                              <p className="font-semibold mb-1">対処方法：</p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>DPF APIキーが正しく設定されているか確認してください</li>
                                <li>APIキーに観測所データへのアクセス権限があるか確認してください</li>
                                <li>DPFサービスが正常に稼働しているか確認してください</li>
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 説明 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-900 mb-2">このページについて</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <strong>データ���ースを復元：</strong> 全国45都道府県の川データ（約350件）を復元します。
                  渓流釣りで有名な川を中心に、各都道府県の主要河川を登録します。
                </p>
                <p>
                  <strong>DPF APIから同期：</strong> 国土交通省データプラットフォームのGraphQL APIから
                  約1000件の観測所データを取得し、河川名と都道府県でグループ化された川のリストを生成します。
                  （注：DPF APIへのアクセスには有効なAPIキーと権限が必要です）
                </p>
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                メインページに戻る
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/?test=dpf-sync'}
                className="flex-1"
              >
                管理画面を開く
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/stats`, {
                    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
                  });
                  const data = await res.json();
                  console.log('=== 川の統計情報 ===');
                  console.log('合計:', data.total);
                  console.log('都道府県別:', data.byPrefecture);
                  alert(`合計: ${data.total}件\n\n都道府県別トップ10:\n${Object.entries(data.byPrefecture).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map((e: any) => `${e[0]}: ${e[1]}件`).join('\n')}\n\n山梨県: ${data.byPrefecture['山梨県'] || 0}件`);
                }}
                className="flex-1"
                style={{ borderColor: '#0372ac', color: '#0372ac' }}
              >
                📈 統計情報
              </Button>
              <Button
                variant="default"
                onClick={() => window.location.href = '/?test=manual-river'}
                className="flex-1"
                style={{ backgroundColor: '#0372ac' }}
              >
                + 手動で川を追加
              </Button>
              <Button
                variant="default"
                onClick={() => window.location.href = '/?test=bulk-upload'}
                className="flex-1"
                style={{ backgroundColor: '#0372ac' }}
              >
                📊 CSV一括登録
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}