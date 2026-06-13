import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Database, ExternalLink, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DpfEnrichmentAdmin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugResult, setDebugResult] = useState<any>(null);

  const enrichAllRivers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Starting DPF enrichment...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/dpf/enrich-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ forceUpdate: false })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Enrichment result:', data);
      
      setResult(data);

    } catch (err) {
      console.error('❌ Enrichment error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const forceEnrichAllRivers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Starting FORCE DPF enrichment...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/dpf/enrich-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ forceUpdate: true })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Force enrichment result:', data);
      
      setResult(data);

    } catch (err) {
      console.error('❌ Force enrichment error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const checkFuefukiObservations = async () => {
    setLoading(true);
    setError(null);
    setDebugResult(null);

    try {
      console.log('🔍 Checking Fuefuki River observations from DPF API...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/dpf/observations?riverName=笛吹川`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Fuefuki observations:', data);
      
      setDebugResult(data);

    } catch (err) {
      console.error('❌ Debug error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const checkFuefukiInDatabase = async () => {
    setLoading(true);
    setError(null);
    setDebugResult(null);

    try {
      console.log('🔍 Checking Fuefuki River in database...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/debug/find-fuefuki`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Fuefuki in database:', data);
      
      setDebugResult(data);

    } catch (err) {
      console.error('❌ Debug error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            DPF観測所データ補完
          </CardTitle>
          <CardDescription>
            国土交通省データプラットフォーム（DPF）APIから観測所情報を取得し、
            データベース内の川データに水位URLと観測所IDを自動補完します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">この機能について</h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  <strong>DPF APIからデータ取得：</strong> 
                  全国の河川観測所情報（約1000件）を取得します
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  <strong>川名でマッチング：</strong> 
                  データベース内の川名と観測所の川名を照合します
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  <strong>URLを自動生成：</strong> 
                  観測所の緯度経度を使って、国土交通省「川の防災情報」の水位ページURLを生成します
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  <strong>データベースを更新：</strong> 
                  各川に <code className="bg-white px-1 rounded">dpfObservationId</code> と{' '}
                  <code className="bg-white px-1 rounded">waterLevelUrl</code> を追加します
                </span>
              </li>
            </ul>
          </div>

          {/* 生成されるURLの例 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">生成されるURLの例</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p className="font-mono text-xs bg-white p-2 rounded break-all">
                https://www.river.go.jp/kawabou/mb/tm?zm=14&clat=35.719...&clon=138.758...&itmkndCd=4
              </p>
              <p className="text-xs text-slate-600">
                ※ 観測所の緯度経度を使って、その場所の水位情報を表示するページに直接リンクします
              </p>
            </div>
          </div>

          {/* 実行ボタン */}
          <div className="space-y-3">
            <Button 
              onClick={checkFuefukiObservations}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  確認中...
                </>
              ) : (
                <>
                  🔍 笛吹川のDPF観測所を確認
                </>
              )}
            </Button>

            <Button 
              onClick={checkFuefukiInDatabase}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  確認中...
                </>
              ) : (
                <>
                  🔍 笛吹川のデータベースエントリを確認
                </>
              )}
            </Button>

            <Button 
              onClick={enrichAllRivers}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  DPF APIから取得中...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  全ての川データを補完
                </>
              )}
            </Button>
            
            <Button 
              onClick={forceEnrichAllRivers}
              disabled={loading}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  強制再補完中...
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  既存データも強制的に再補完
                </>
              )}
            </Button>
            
            <div className="text-xs text-slate-500 text-center bg-slate-50 p-3 rounded">
              💡 <strong>通常補完：</strong> 未設定の川のみ補完<br />
              🔄 <strong>強制再補完：</strong> 全ての川を最新のロジックで再生成（URL形式の変更時に使用）
            </div>
            
            {loading && (
              <div className="text-sm text-slate-600 text-center">
                処理には1〜2分かかる場合があります。お待ちください...
              </div>
            )}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">エラーが発生しました</h3>
                  <p className="text-sm text-red-800 font-mono whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* デバッグ結果表示 */}
          {debugResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {debugResult.observations ? 'DPF APIの笛吹川観測所' : 'データベース内の笛吹川'}
              </h3>
              {debugResult.success ? (
                <div>
                  <p className="text-sm text-blue-800 mb-2">
                    {debugResult.count}件{debugResult.observations ? 'の観測所' : 'の川データ'}が見つかりました
                  </p>
                  {debugResult.count === 0 ? (
                    <div className="bg-amber-100 border border-amber-300 rounded p-3">
                      <p className="text-sm text-amber-900">
                        ⚠️ {debugResult.observations ? 'DPF APIから' : 'データベースから'}笛吹川が見つかりませんでした。
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded p-3 max-h-96 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {JSON.stringify(debugResult.observations || debugResult.rivers, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-800">{debugResult.error}</p>
              )}
            </div>
          )}

          {/* 結果表示 */}
          {result && (
            <div className="space-y-4">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">補完が完了しました！</h3>
                      <p className="text-sm text-green-800">{result.message}</p>
                    </div>
                  </div>

                  {/* 統計情報 */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{result.enrichedCount}</div>
                      <div className="text-xs text-slate-600">更新</div>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <div className="text-2xl font-bold text-slate-600">{result.skippedCount}</div>
                      <div className="text-xs text-slate-600">スキップ</div>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">{result.errorCount}</div>
                      <div className="text-xs text-slate-600">エラー</div>
                    </div>
                  </div>

                  {/* 詳細ログ */}
                  {result.details && result.details.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">処理詳細:</h4>
                      <div className="bg-white rounded p-3 max-h-96 overflow-y-auto">
                        <ul className="space-y-1 text-xs font-mono">
                          {result.details.map((detail: string, index: number) => (
                            <li 
                              key={index}
                              className={
                                detail.startsWith('✅') ? 'text-green-700' :
                                detail.startsWith('⚠️') ? 'text-amber-700' :
                                detail.startsWith('❌') ? 'text-red-700' :
                                'text-slate-700'
                              }
                            >
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-1">処理が完了しましたが、一部問題がありました</h3>
                      <p className="text-sm text-amber-800">{result.message || '詳細は下記をご確認ください'}</p>
                      {result.details && (
                        <div className="mt-2 bg-white rounded p-2 max-h-48 overflow-y-auto">
                          <ul className="space-y-1 text-xs font-mono">
                            {result.details.map((detail: string, index: number) => (
                              <li key={index} className="text-slate-700">{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 次のアクション */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">次のステップ</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <strong>1.</strong> メインページに戻って、川のモーダルを開いてください
                  </p>
                  <p>
                    <strong>2.</strong> 「リアルタイム水位を確認」ボタンが、各川固有のページにリンクされているか確認してください
                  </p>
                  <p>
                    <strong>3.</strong> コンソールログで <code className="bg-white px-1 rounded">dpfObservationId</code> と{' '}
                    <code className="bg-white px-1 rounded">waterLevelUrl</code> が設定されているか確認してください
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                メインページに戻る
              </Button>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">注意事項</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>DPF APIキーが設定されている必要があります</li>
                  <li>処理には1〜2分程度かかる場合があります</li>
                  <li>既に設定済みの川はスキップされます</li>
                  <li>川名が完全に一致しない場合は観測所が見つからない可能性があります</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}