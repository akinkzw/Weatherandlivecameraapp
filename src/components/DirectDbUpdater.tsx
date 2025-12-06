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
  console.log('%c🎯 DirectDbUpdater v3.0.0 - フロントエンド直接DB更新モード', 'background: #22c55e; color: white; font-size: 16px; padding: 8px; font-weight: bold;');
  console.log('%c✅ 正しいコンポーネントがロードされました', 'color: #22c55e; font-size: 14px;');
  
  // ページタイトルに表示してユーザーが確認できるようにする
  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = '✅ DirectDbUpdater v3.0 - ' + originalTitle;
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
      
      // Supabaseクライアント作成
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );
      
      console.log('✅ Supabase client created');

      // CSVファイル読み込み
      const text = await file.text();
      const csvData = parseCSV(text);
      
      if (csvData.length === 0) {
        throw new Error('CSVデータが空またはフォーマットが不正です');
      }
      
      console.log(`📊 CSV: ${csvData.length} rows`);

      // 既存川データ取得
      setResult({
        success: true,
        message: '📥 既存の川データを取得中...',
      });

      const { data: allRiversData, error: fetchError } = await supabase
        .from('kv_store_5f24a873')
        .select('key, value')
        .like('key', 'river:%');

      if (fetchError) {
        throw new Error(`DB取得エラー: ${fetchError.message}`);
      }

      console.log(`✅ DB: ${allRiversData.length} rivers`);

      // 川名でインデックス作成
      setResult({
        success: true,
        message: `📊 ${allRiversData.length}件取得\n🔍 マッチング中...`,
      });

      const riversByName = new Map<string, any[]>();
      for (const item of allRiversData) {
        const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
        const dbRiverName = value.name || '';
        
        const dbRiverNameClean = dbRiverName.replace(/[（(].*?[）)]/g, '').trim();
        
        if (!riversByName.has(dbRiverName)) riversByName.set(dbRiverName, []);
        riversByName.get(dbRiverName)!.push(item);
        
        if (dbRiverNameClean !== dbRiverName) {
          if (!riversByName.has(dbRiverNameClean)) riversByName.set(dbRiverNameClean, []);
          riversByName.get(dbRiverNameClean)!.push(item);
        }
      }

      console.log(`✅ Index: ${riversByName.size} unique names`);

      // マッチングと更新準備
      const updatesToPerform: Array<{ key: string; value: any }> = [];
      let skippedCount = 0;

      for (const csvRow of csvData) {
        const { riverName, municipalityCode, basinName, stationName } = csvRow;
        
        if (!riverName || !municipalityCode) {
          skippedCount++;
          continue;
        }
        
        const matchingRivers = riversByName.get(riverName) || [];
        
        if (matchingRivers.length === 0) {
          skippedCount++;
          continue;
        }
        
        for (const riverItem of matchingRivers) {
          const riverData = typeof riverItem.value === 'string' 
            ? JSON.parse(riverItem.value) 
            : riverItem.value;
          
          riverData.dpfObservationId = municipalityCode;
          riverData.basinName = basinName;
          riverData.stationName = stationName;
          riverData.waterLevelUrl = `https://www.river.go.jp/kawabou/ipSuiiKobetu.do?obsrvId=${municipalityCode}`;
          
          updatesToPerform.push({
            key: riverItem.key,
            value: riverData,
          });
        }
      }

      console.log(`✅ Match: ${updatesToPerform.length} updates, ${skippedCount} skipped`);

      setResult({
        success: true,
        message: `🔍 マッチング完了\n\n更新予定: ${updatesToPerform.length}件\nスキップ: ${skippedCount}件\n\n💾 DB更新中...`,
      });

      // DB更新（10件ずつ）
      const DB_BATCH_SIZE = 10;
      let updatedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < updatesToPerform.length; i += DB_BATCH_SIZE) {
        const batch = updatesToPerform.slice(i, i + DB_BATCH_SIZE);
        
        const updatePromises = batch.map(({ key, value }) =>
          supabase
            .from('kv_store_5f24a873')
            .update({ value })
            .eq('key', key)
        );
        
        try {
          const results = await Promise.all(updatePromises);
          
          for (const { error } of results) {
            if (error) {
              console.error(`❌ DB update error:`, error);
              failedCount++;
            } else {
              updatedCount++;
            }
          }
        } catch (error) {
          console.error(`❌ Batch error:`, error);
          failedCount += batch.length;
        }
        
        const progress = Math.min(i + DB_BATCH_SIZE, updatesToPerform.length);
        setResult({
          success: true,
          message: `💾 更新中... ${progress}/${updatesToPerform.length}\n\n成功: ${updatedCount}件\n失敗: ${failedCount}件`,
        });

        if (i + DB_BATCH_SIZE < updatesToPerform.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // 完了
      console.log(`✅ Complete: ${updatedCount} updated, ${failedCount} failed`);
      
      setResult({
        success: true,
        message: `✅ 完了！\n\n更新成功: ${updatedCount}件\n更新失敗: ${failedCount}件\nスキップ: ${skippedCount}件`,
      });
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
        <CardTitle>DPF観測所ID 一括更新（直接DB接続版）</CardTitle>
        <CardDescription>
          フロントエンドから直接データベースに接続して更新します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 🚨 バージョン表示（ユーザーが確認できるように） */}
        <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-900">✅ DirectDbUpdater v3.0.0 がロードされました</span>
          </div>
          <p className="text-sm text-green-700">
            このメッセージが表示されていれば、正しい最新コードが実行されています。<br />
            もし古いエラーが表示される場合は、ブラウザキャッシュの問題です。
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
            <li>フロントエンドから直接Supabaseに接続</li>
            <li>サーバーのCPU時間制限を回避</li>
            <li>リアルタイムで進捗表示</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
