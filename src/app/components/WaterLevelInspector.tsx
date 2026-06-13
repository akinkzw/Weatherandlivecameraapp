import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface InspectionResult {
  totalRivers: number;
  withWaterLevel: number;
  withoutWaterLevel: number;
  samples: Array<{
    id: string;
    name: string;
    prefecture: string;
    waterLevel: any;
    warningLevel: any;
    waterLevelType: string;
    warningLevelType: string;
  }>;
  dummyPatterns: {
    pattern: string;
    count: number;
  }[];
}

export function WaterLevelInspector() {
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [searchName, setSearchName] = useState('');

  const inspectWaterLevels = async () => {
    setIsInspecting(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/inspect-water-levels`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ searchName }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('検査エラー:', error);
      alert(`エラー: ${error}`);
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔬 水位データ検査ツール</CardTitle>
        <CardDescription>
          データベース内の水位データの実際の値を検査します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="川名で絞り込み（オプション）"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <Button onClick={inspectWaterLevels} disabled={isInspecting}>
            {isInspecting ? '検査中...' : '検査開始'}
          </Button>
        </div>

        {result && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="text-sm text-slate-600">総数</div>
                <div className="text-2xl font-bold">{result.totalRivers}件</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="text-sm text-blue-600">水位データあり</div>
                <div className="text-2xl font-bold text-blue-700">{result.withWaterLevel}件</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="text-sm text-slate-600">水位データなし</div>
                <div className="text-2xl font-bold">{result.withoutWaterLevel}件</div>
              </div>
            </div>

            {result.dummyPatterns.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h3 className="font-bold text-orange-800 mb-2">🚨 検出されたダミーパターン</h3>
                <div className="space-y-1">
                  {result.dummyPatterns.map((pattern, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-orange-700">{pattern.pattern}</span>
                      <span className="font-bold text-orange-900">{pattern.count}件</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold border-b">
                サンプルデータ（最初の10件）
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {result.samples.map((sample, index) => (
                  <div key={index} className="p-4 hover:bg-slate-50">
                    <div className="font-bold text-lg mb-2">
                      {sample.name} <span className="text-sm text-slate-500">({sample.prefecture})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600">水位: </span>
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                          {JSON.stringify(sample.waterLevel)} ({sample.waterLevelType})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">警戒水位: </span>
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                          {JSON.stringify(sample.warningLevel)} ({sample.warningLevelType})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
