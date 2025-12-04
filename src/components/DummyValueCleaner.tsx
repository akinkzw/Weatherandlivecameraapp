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
  } | null>(null);

  const handleClearDummyValues = async () => {
    if (!confirm('全ての川のダミー水位値をクリアします。よろしいですか？')) {
      return;
    }

    setIsClearing(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/clear-all-dummy-values`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      setResult(data);

      if (data.success) {
        console.log('✅ Dummy values cleared successfully:', data);
      } else {
        console.error('❌ Failed to clear dummy values:', data);
      }
    } catch (error) {
      console.error('Error clearing dummy values:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'エラーが発生しました'
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
          リアルタイム水位を取得するには、DPF観測所IDを設定してください。
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
