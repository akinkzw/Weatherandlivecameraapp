import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DpfApiDebugger() {
  const [endpoint, setEndpoint] = useState('https://www.mlit-data.jp/api/v1/graphql');
  const [authHeader, setAuthHeader] = useState('X-Dpf-Api-Key');
  const [query, setQuery] = useState(`query {
  __schema {
    queryType {
      name
      fields {
        name
        description
        args {
          name
          type {
            name
          }
        }
      }
    }
  }
}`);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    setResult('');

    try {
      console.log('=== DPF API Debug Test ===');
      console.log('Endpoint:', endpoint);
      console.log('Auth Header:', authHeader);
      console.log('Query:', query);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/test-dpf-direct`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint,
            authHeader,
            query,
          }),
        }
      );

      const data = await response.json();
      console.log('Response:', data);

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>DPF API デバッガー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>エンドポイント</Label>
              <Input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://www.mlit-data.jp/api/v1/graphql"
              />
            </div>

            <div>
              <Label>認証ヘッダー名</Label>
              <Input
                value={authHeader}
                onChange={(e) => setAuthHeader(e.target.value)}
                placeholder="X-Dpf-Api-Key"
              />
            </div>

            <div>
              <Label>GraphQLクエリ（Introspectionクエリで利用可能なAPIを確認）</Label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={testApi}
              disabled={isLoading}
              className="w-full"
              style={{ backgroundColor: '#0372ac' }}
            >
              {isLoading ? 'テスト中...' : 'APIをテスト'}
            </Button>

            {result && (
              <div>
                <Label>結果</Label>
                <Textarea
                  value={result}
                  readOnly
                  rows={20}
                  className="font-mono text-sm bg-slate-900 text-green-400"
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <h3 className="font-semibold mb-2">デバッグのヒント</h3>
              <ul className="space-y-1 text-blue-900">
                <li>1. まず上記のIntrospectionクエリで、利用可能なGraphQL APIを確認します</li>
                <li>2. レスポンスに `queryType.fields` が含まれていれば、認証は成功しています</li>
                <li>3. 403エラーが出る場合は、APIキーまたはヘッダー名が間違っています</li>
                <li>4. 成功した場合、`fields`の中に `getWaterLevelDataList` があるか確認します</li>
                <li>5. なければ、正しいクエリ名を `fields` のリストから探します</li>
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/dpf-sync'}
              className="w-full"
            >
              DPF同期ページに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
