import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function FuefukiCheck() {
  const [loading, setLoading] = useState(false);
  const [fuefukiData, setFuefukiData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  
  const checkFuefuki = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 笛吹川のデータを検索中...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.rivers) {
        throw new Error('データの取得に失敗しました');
      }
      
      // 笛吹川を検索
      const fuefuki = data.rivers.filter((r: any) => 
        r.name && r.name.includes('笛吹川')
      );
      
      console.log('✅ 笛吹川のデータ:', fuefuki);
      
      if (fuefuki.length === 0) {
        setError('笛吹川のデータが見つかりませんでした');
      } else {
        setFuefukiData(fuefuki);
      }
    } catch (err) {
      console.error('❌ エラー:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  // 正しいURLを生成
  const generateCorrectUrl = (stationName: string) => {
    // サンプルCSVの笛吹川のstCd
    const stCdMap: { [key: string]: string } = {
      '石和': '304011283719010'
    };
    
    const stCd = stCdMap[stationName];
    
    if (!stCd) {
      return null;
    }
    
    return `https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=${stCd}&timeType=60`;
  };
  
  useEffect(() => {
    checkFuefuki();
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#0372ac' }}>
            笛吹川 データ確認
          </CardTitle>
          <CardDescription>
            笛吹川の水位情報URLが正しく設定されているか確認します
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              onClick={checkFuefuki}
              disabled={loading}
              style={{ backgroundColor: '#0372ac' }}
            >
              {loading ? '確認中...' : '再確認'}
            </Button>
          </div>
          
          {error && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {fuefukiData.length > 0 && (
            <div className="space-y-4">
              <Alert className="border-green-500">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  笛吹川のデータが {fuefukiData.length} 件見つかりました
                </AlertDescription>
              </Alert>
              
              {fuefukiData.map((river, index) => {
                const correctUrl = generateCorrectUrl(river.stationName || '');
                const isCorrect = river.waterLevelUrl === correctUrl;
                
                return (
                  <Card key={index} className={`p-6 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">
                          {river.name} ({river.stationName || '観測所不明'})
                        </h3>
                        {isCorrect ? (
                          <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                            ✓ 正しいURL
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
                            ✗ 間違ったURL
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-3 rounded">
                          <span className="text-gray-600 block mb-1">都道府県:</span>
                          <span className="font-mono">{river.prefecture}</span>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <span className="text-gray-600 block mb-1">市区町村:</span>
                          <span className="font-mono">{river.municipality || '未設定'}</span>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <span className="text-gray-600 block mb-1">水系:</span>
                          <span className="font-mono">{river.basinName || '未設定'}</span>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <span className="text-gray-600 block mb-1">観測所:</span>
                          <span className="font-mono">{river.stationName || '未設定'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded">
                          <span className="text-gray-600 block mb-1">現在設定されているURL:</span>
                          {river.waterLevelUrl ? (
                            <div className="space-y-2">
                              <a 
                                href={river.waterLevelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-mono text-xs break-all flex items-center gap-2"
                              >
                                {river.waterLevelUrl}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <Button
                                onClick={() => window.open(river.waterLevelUrl, '_blank')}
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                URLをテスト（新しいタブで開く）
                              </Button>
                            </div>
                          ) : (
                            <span className="text-red-500">未設定</span>
                          )}
                        </div>
                        
                        {correctUrl && (
                          <div className="bg-green-100 border border-green-300 p-3 rounded">
                            <span className="text-gray-600 block mb-1">✅ 正しいURL（石和観測所）:</span>
                            <a 
                              href={correctUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-700 hover:underline font-mono text-xs break-all flex items-center gap-2"
                            >
                              {correctUrl}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <Button
                              onClick={() => window.open(correctUrl, '_blank')}
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 border-green-600 text-green-700 hover:bg-green-50"
                            >
                              正しいURLをテスト（新しいタブで開く）
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {!isCorrect && correctUrl && (
                        <Alert className="border-amber-500 bg-amber-50">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800">
                            <strong>修正が必要:</strong> SearchResults_v4.csvから正しいstCdを抽出して、水位情報URLを更新してください。
                            <br />
                            <br />
                            <strong>手順:</strong>
                            <ol className="list-decimal ml-5 mt-2 space-y-1">
                              <li>「/?test=url-fixer」にアクセス</li>
                              <li>SearchResults_v4.csvをアップロード</li>
                              <li>「データベース更新」ボタンをクリック</li>
                            </ol>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
