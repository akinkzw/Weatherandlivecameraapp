import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DummyValueCleaner() {
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      updated: number;
      skipped: number;
      total: number;
    };
    detectedPatterns?: { [key: string]: number };
  } | null>(null);

  const handleClearDummyValues = async () => {
    if (!confirm('全ての川のダミー水位値（5.00m / 3.50m、5.00m / 3.20m、0値など）をクリアします。よろしいですか？\n\nこの操作により、水位データがnullに設定されます。')) {
      return;
    }

    setIsClearing(true);
    setResult(null);

    try {
      console.log('🧹 Starting to clear dummy values (SQL version)...');
      console.log('Project ID:', projectId);
      console.log('Endpoint:', `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/clear-dummy-water-levels-sql`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/clear-dummy-water-levels-sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'ダミーデータをクリアしました',
          summary: {
            updated: data.updatedCount || 0,
            skipped: (data.totalProcessed || 0) - (data.updatedCount || 0),
            total: data.totalProcessed || 0
          },
          detectedPatterns: data.detectedPatterns || {}
        });
        console.log('✅ Dummy values cleared successfully:', data);
        
        // 成功後、3秒待ってページをリロード
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setResult({
          success: false,
          message: data.error || 'エラーが発生しました'
        });
        console.error('❌ Failed to clear dummy values:', data);
      }
    } catch (error) {
      console.error('❌ Error clearing dummy values:', error);
      setResult({
        success: false,
        message: `エラー: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          ダミー水位値クリア
        </CardTitle>
        <CardDescription>
          既存の川データに設定されているダミー水位値をクリアします。
          <br />
          リアルタイム水位を取得するにはDPF観測所IDを設定してください。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleClearDummyValues}
          disabled={isClearing}
          variant="destructive"
          className="w-full"
        >
          {isClearing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              クリア中...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              ダミー値をクリア
            </>
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </p>
                {result.summary && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p>更新: {result.summary.updated}件</p>
                    <p>スキップ: {result.summary.skipped}件</p>
                    <p>合計: {result.summary.total}件</p>
                  </div>
                )}
                {result.detectedPatterns && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p>検出されたパターン:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {Object.entries(result.detectedPatterns).map(([pattern, count]) => (
                        <li key={pattern}>{pattern}: {count}件</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-medium">📝 注意事項：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>waterLevel と warningLevel が null に設定されます</li>
            <li>dpfObservatoryId が設定されている川は自動的にリアルタイム水位を取得します</li>
            <li>dpfObservatoryId が未設定の川は「データ準備中」と表示されます</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}