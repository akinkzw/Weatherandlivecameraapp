import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Loader2, MapPin, Hash, FileText, Tag } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SearchResult {
  観測所名: string;
  観測所ID: string;
  川名: string;
  メタデータタイトル: string;
  都道府県: string;
  市区町村: string;
  緯度: string | number;
  経度: string | number;
  最終更新: string;
  URL: string;
  生メタデータ?: any;
}

export function DpfSearchTest() {
  const [keyword, setKeyword] = useState('奈良子川');
  const [prefecture, setPrefecture] = useState('山梨県');
  const [dataset, setDataset] = useState('hwq_stage');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string>('');
  const [searchTime, setSearchTime] = useState<number>(0);

  const handleSearch = async () => {
    setIsSearching(true);
    setError('');
    setResults([]);
    
    const startTime = Date.now();
    
    try {
      const params = new URLSearchParams({
        keyword,
        prefecture,
        dataset,
      });
      
      console.log('🔍 DPF検索開始:', { keyword, prefecture, dataset });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/dpf-search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const endTime = Date.now();
      setSearchTime(endTime - startTime);
      
      console.log('レスポンスステータス:', response.status);
      console.log('レスポンスヘッダー:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗しました' }));
        console.error('❌ DPF API検索エラー:', errorData);
        
        let errorMessage = `検索に失敗しました (${response.status})\n`;
        errorMessage += `エラー: ${errorData.error || '不明なエラー'}\n`;
        if (errorData.details) {
          errorMessage += `詳細: ${JSON.stringify(errorData.details, null, 2)}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ 検索結果:', data);
      
      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(data.error || '検索に失敗しました');
      }
    } catch (err) {
      console.error('DPF検索エラ���:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">🔍 DPF API 観測所検索テスト</h1>
          <p className="text-slate-600">
            国土交通省DPF APIから観測所データを検索します
          </p>
        </div>

        {/* 検索フォーム */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                キーワード（川名、観測所名など）
              </label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例: 奈良子川"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                都道府県
              </label>
              <Input
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                placeholder="例: 山梨県"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                データセット
              </label>
              <select
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
              >
                <option value="hwq_stage">hwq_stage（水位データ）</option>
                <option value="hwq_camera">hwq_camera（カメラデータ）</option>
              </select>
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  検索中...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  検索
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* エラー表示 */}
        {error && (
          <Card className="p-6 mb-6 border-red-300 bg-red-50">
            <h3 className="text-red-800 font-semibold mb-2">❌ エラー</h3>
            <p className="text-red-700 whitespace-pre-wrap">{error}</p>
            <div className="mt-4 text-sm text-red-600">
              <p>💡 ブラウザのコンソール（F12）を開いて、詳細なエラーログを確認してください</p>
            </div>
          </Card>
        )}

        {/* 検索結果サマリー */}
        {results.length > 0 && (
          <Card className="p-6 mb-6 border-green-300 bg-green-50">
            <h3 className="text-green-800 font-semibold mb-2">✅ 検索完了</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p>検索結果: <strong>{results.length}件</strong></p>
              <p>検索時間: <strong>{searchTime}ms</strong></p>
              <p>キーワード: <strong>{keyword}</strong></p>
              <p>都道府県: <strong>{prefecture}</strong></p>
              <p>データセット: <strong>{dataset}</strong></p>
            </div>
          </Card>
        )}

        {/* 検索結果一覧 */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">検索結果（{results.length}件）</h2>
            
            {results.map((result, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {result.川名} - {result.観測所名}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {result.都道府県} {result.市区町村}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>

                  {/* 詳細情報 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Hash className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-slate-500">観測所ID:</span>
                          <br />
                          <code className="bg-blue-100 px-2 py-1 rounded text-xs font-bold text-blue-900">
                            {result.観測所ID}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-slate-500">川名:</span>
                          <br />
                          <span className="font-medium">{result.川名}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-slate-500">メタデータタイトル:</span>
                          <br />
                          <span>{result.メタデータタイトル}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-slate-500">最終更新:</span>
                          <br />
                          <span className="text-xs">{result.最終更新}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-slate-500">座標:</span>
                          <br />
                          <span className="font-mono text-xs">
                            緯度: {result.緯度}<br />
                            経度: {result.経度}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-slate-500">所在地:</span>
                          <br />
                          <span>{result.都道府県} {result.市区町村}</span>
                        </div>
                      </div>

                      {result.URL && result.URL !== 'N/A' && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="text-slate-500">URL:</span>
                            <br />
                            <a 
                              href={result.URL} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs break-all"
                            >
                              {result.URL}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* コピー可能なJSON */}
                  <details className="mt-4">
                    <summary className="text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                      📋 JSONデータを表示
                    </summary>
                    <pre className="mt-2 p-4 bg-slate-100 rounded text-xs overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 結果が0件の場合 */}
        {!isSearching && !error && results.length === 0 && keyword && (
          <Card className="p-8 text-center">
            <p className="text-slate-500">
              検索条件に一致する観測所が見つかりませんでした
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}