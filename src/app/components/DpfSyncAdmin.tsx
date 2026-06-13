import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DpfSyncAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
    observationStations?: number;
    error?: string;
    timing?: {
      total: number;
      fetch: number;
      group: number;
      database: number;
    };
  } | null>(null);
  
  const [schemaTestResult, setSchemaTestResult] = useState<any>(null);
  const [isTestingSchema, setIsTestingSchema] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    setResult(null);
    
    const startTime = Date.now();
    console.log('=== DPF Sync Started ===');
    console.log('Start time:', new Date().toISOString());

    try {
      // 120秒のタイムアウトを設定（DPF APIの応答が遅い場合に対応）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`⏱️ Request timed out after 120 seconds (elapsed: ${elapsed}s)`);
        controller.abort();
      }, 120000); // 120秒

      console.log('Sending sync request to server...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/sync-rivers-from-dpf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      
      const requestDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Server response received after ${requestDuration}s`);
      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Sync completed successfully in ${totalDuration}s`);
        setResult({
          success: true,
          message: data.message,
          count: data.count,
          observationStations: data.observationStations,
          timing: data.timing,
        });
      } else {
        console.error('❌ Sync failed:', data);
        setResult({
          success: false,
          message: 'データの同期に失敗しました',
          error: data.error || data.details || '不明なエラー',
        });
      }
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`❌ Error after ${elapsed}s:`, error);
      
      // タイムアウトエラーの場合は特別なメッセージを表示
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      setResult({
        success: false,
        message: isTimeout 
          ? 'タイムアウトエラーが発生しました（120秒超過）' 
          : 'ネットワークエラーが発生しました',
        error: isTimeout 
          ? 'DPF APIからの応答が120秒以内に完了しませんでした。APIの応答時間が長い可能性があります。' 
          : String(error),
      });
    } finally {
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`=== DPF Sync Finished (Total: ${totalDuration}s) ===`);
      setIsLoading(false);
    }
  };

  const handleSchemaTest = async () => {
    setIsTestingSchema(true);
    setSchemaTestResult(null);
    
    const startTime = Date.now();
    console.log('=== DPF Schema Test Started ===');
    console.log('Start time:', new Date().toISOString());

    try {
      // 120秒のタイムアウトを設定（DPF APIの応答が遅い場合に対応）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`⏱️ Request timed out after 120 seconds (elapsed: ${elapsed}s)`);
        controller.abort();
      }, 120000); // 120秒

      console.log('Sending schema test request to server...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/test-dpf-schema`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      
      const requestDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Server response received after ${requestDuration}s`);
      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Schema test completed successfully in ${totalDuration}s`);
        setSchemaTestResult({
          success: true,
          message: data.message,
          count: data.count,
          observationStations: data.observationStations,
          timing: data.timing,
        });
      } else {
        console.error('❌ Schema test failed:', data);
        setSchemaTestResult({
          success: false,
          message: 'スキーマテストに失敗しました',
          error: data.error || data.details || '不明なエラー',
        });
      }
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`❌ Error after ${elapsed}s:`, error);
      
      // タイムアウトエラーの場合は特別なメッセージを表示
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      setSchemaTestResult({
        success: false,
        message: isTimeout 
          ? 'タイムアウトエラーが発生しました（120秒超過）' 
          : 'ネットワークエラーが発生しました',
        error: isTimeout 
          ? 'DPF APIからの応答が120秒以内に完了しませんでした。APIの応答時間が長い可能性があります。' 
          : String(error),
      });
    } finally {
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`=== DPF Schema Test Finished (Total: ${totalDuration}s) ===`);
      setIsTestingSchema(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" style={{ color: '#0372ac' }} />
              DPF GraphQL API データ同期
            </CardTitle>
            <CardDescription>
              国土交通省データプラットフォームから河川データを取得し、データベースに同期します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">同期について</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• DPF GraphQL APIから約1000件の観測所データを取得します</li>
                <li>• 観測所データを河川名と都道府県でグループ化します</li>
                <li>• 既存のデータベース内容を削除し、新しいデータで置き換えます</li>
                <li>• 処理には通常10〜40秒程度かかります</li>
                <li>⚠️ Supabase Functionの制限により、処理時間は60秒以内に制限されています</li>
              </ul>
            </div>

            <Button
              onClick={handleSync}
              disabled={isLoading}
              className="w-full"
              size="lg"
              style={{ backgroundColor: '#0372ac' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  同期中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  DPF APIからデータを同期
                </>
              )}
            </Button>

            {result && (
              <Alert
                className={
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }
              >
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription
                      className={result.success ? 'text-green-900' : 'text-red-900'}
                    >
                      <div className="font-semibold mb-1">{result.message}</div>
                      {result.success && (
                        <div className="text-sm space-y-1 mt-2">
                          <div>✅ 登録された河川: {result.count}件</div>
                          <div>📊 観測所データ: {result.observationStations}件</div>
                          {result.timing && (
                            <div className="text-sm mt-2 font-mono bg-white/50 p-2 rounded">
                              ⏱️ タイミング情報:
                              <div className="ml-2">総時間: {(result.timing.total / 1000).toFixed(2)}秒</div>
                              <div className="ml-2">データ取得: {(result.timing.fetch / 1000).toFixed(2)}秒</div>
                              <div className="ml-2">グループ化: {(result.timing.group / 1000).toFixed(2)}秒</div>
                              <div className="ml-2">DB更新: {(result.timing.database / 1000).toFixed(2)}秒</div>
                            </div>
                          )}
                        </div>
                      )}
                      {result.error && (
                        <div className="text-sm mt-2 font-mono bg-white/50 p-2 rounded">
                          エラー詳細: {result.error}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">使い方</h3>
              <ol className="text-sm text-slate-700 space-y-2">
                <li>1. 上の「DPF APIからデータを同期」ボタンをクリックします</li>
                <li>2. 同期が完了するまで待ちます（通常10〜30秒程度）</li>
                <li>3. 成功メッセージが表示されたら、メインページに戻ります</li>
                <li>4. データが反映されているか確認します</li>
              </ol>
            </div>

            <div className="border-t pt-6">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                メインページに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}