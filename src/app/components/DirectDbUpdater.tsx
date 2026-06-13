import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface CsvRow {
  municipality: string;
  basinName: string;
  riverName: string;
  stationName: string;
  municipalityCode: string;
}

export function DirectDbUpdater() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 🚨 バージョン確認用ログ（必ず最初に実行される）
  console.log('%c🎯 DirectDbUpdater v9.0.0 - SQL一括UPDATE版', 'background: #22c55e; color: white; font-size: 16px; padding: 8px; font-weight: bold;');
  console.log('%c✅ 正しいコンポーネントがロードされました', 'color: #22c55e; font-size: 14px;');
  
  // ページタイトルに表示してユーザーが確認できるようにする
  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = '✅ DirectDbUpdater v9.0.0 - ' + originalTitle;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      console.log('📁 ファイル選択:', selectedFile.name);
    }
  };

  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('📋 CSV Headers:', headers);
    
    const getColumnIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => h === name || h.includes(name));
        if (index !== -1) return index;
      }
      return -1;
    };
    
    const indices = {
      municipality: getColumnIndex(['市町村名', '市区町村名']),
      basinName: getColumnIndex(['水系名称']),
      riverName: getColumnIndex(['河川名称']),
      stationName: getColumnIndex(['観測所名称']),
      municipalityCode: getColumnIndex(['市区町村コード', '市町村コード']),
    };
    
    console.log('📋 Column indices:', indices);
    
    if (indices.riverName === -1 || indices.municipalityCode === -1) {
      console.error('❌ Required columns not found');
      return [];
    }
    
    const data: CsvRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (values[indices.riverName] && values[indices.municipalityCode]) {
        data.push({
          municipality: indices.municipality !== -1 ? values[indices.municipality] : '',
          basinName: indices.basinName !== -1 ? values[indices.basinName] : '',
          riverName: values[indices.riverName],
          stationName: indices.stationName !== -1 ? values[indices.stationName] : '',
          municipalityCode: values[indices.municipalityCode],
        });
      }
    }
    
    console.log(`✅ Parsed ${data.length} rows`);
    return data;
  };

  const handleUpdate = async () => {
    if (!file) {
      setResult({
        success: false,
        message: 'CSVファイルを選択してください'
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      console.log('🚀 処理開始');
      
      // CSVファイル読み込み
      const text = await file.text();
      const csvData = parseCSV(text);
      
      if (csvData.length === 0) {
        throw new Error('CSVデータが空またはフォーマットが不正です');
      }
      
      console.log(` CSV: ${csvData.length} rows`);

      // 🔄 バッチサイズ（100件に拡大してバッチ数を削減）
      const BATCH_SIZE = 100;
      const totalBatches = Math.ceil(csvData.length / BATCH_SIZE);
      
      let totalUpdated = 0;
      let totalSkipped = 0;
      
      console.log(`📦 Splitting into ${totalBatches} batches of ${BATCH_SIZE} rows each`);

      // バッチごとに処理
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = Math.min((i + 1) * BATCH_SIZE, csvData.length);
        const batchData = csvData.slice(start, end);
        
        console.log(`🔄 Processing batch ${i + 1}/${totalBatches} (${start + 1}-${end})`);
        
        // 進捗を表示
        setResult({
          success: true,
          message: `📤 処理中... ${i + 1}/${totalBatches} バッチ\n(${end}/${csvData.length} 件)\n\n更新: ${totalUpdated}件\nスキップ: ${totalSkipped}件`,
        });

        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/update-dpf-ids`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                csvData: batchData.map(row => ({
                  riverName: row.riverName,
                  municipalityCode: row.municipalityCode,
                  basinName: row.basinName,
                  stationName: row.stationName,
                  dpfObservationId: row.municipalityCode,
                }))
              }),
            }
          );

          console.log(`📥 Batch ${i + 1} response status: ${response.status}`);
          const data = await response.json();
          console.log(`📊 Batch ${i + 1} response:`, data);

          if (response.ok && data.success) {
            totalUpdated += data.updatedCount || 0;
            totalSkipped += data.skippedCount || 0;
            console.log(`✅ Batch ${i + 1}: updated=${data.updatedCount}, skipped=${data.skippedCount}`);
          } else {
            console.error(`❌ Batch ${i + 1} failed:`, data.error);
            throw new Error(`バッチ ${i + 1} の処理に失敗: ${data.error || '不明なエラー'}`);
          }
        } catch (batchError) {
          console.error(`❌ Batch ${i + 1} error:`, batchError);
          throw new Error(`バッチ ${i + 1} の処理中にエラー: ${batchError instanceof Error ? batchError.message : String(batchError)}`);
        }
        
        // サーバー負荷を軽減するため、バッチ間で少し待機（オプション）
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 0.1秒待機
        }
      }

      // 完了
      setResult({
        success: true,
        message: `✅ 完了！\n\n更新成功: ${totalUpdated}件\nスキップ: ${totalSkipped}件\n処理バッチ数: ${totalBatches}`,
      });
      
      console.log(`✅ All batches completed: ${totalUpdated} updated, ${totalSkipped} skipped`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult({
        success: false,
        message: `❌ エラー\n\n${errorMessage}`,
      });
      console.error('❌ Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>市区町村コード 一括更新（サーバー経由版）</CardTitle>
        <CardDescription>
          サーバー経由でデータベースの市区町村コードを一括更新します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 🚨 バージョン表示（ユーザーが確認できるように） */}
        <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-900">✅ DirectDbUpdater v9.0.0 - SQL一括UPDATE版</span>
          </div>
          <p className="text-sm text-green-700">
            <strong>新方式:</strong> SQL並列更新で高速処理！<br />
            3020件のCSVを100件バッチ × 31回で処理（約30-60秒で完了）
          </p>
        </div>
        <div>
          <label
            htmlFor="csv-file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            style={{ borderColor: '#0372ac' }}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2" style={{ color: '#0372ac' }} />
              <p className="mb-2 text-sm">
                <span className="font-semibold">CSVファイルを選択</span>
              </p>
              <p className="text-xs text-slate-500">河川名称と市区町村コードが必須</p>
            </div>
            <input
              id="csv-file"
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {file && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              選択: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpdate}
          disabled={!file || isProcessing}
          className="w-full"
          style={{ backgroundColor: '#0372ac' }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              データを更新
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {result.message}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 <strong>仕組み:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>サーバー経由でデータベースを更新</li>
            <li>大量データでも安全に処理</li>
            <li>川名でマッチングして市区町村コードを更新</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}