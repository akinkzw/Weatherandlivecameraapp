import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CsvRow {
  municipality: string;      // 市町村名
  basinName: string;         // 水系名称
  riverName: string;         // 河川名称
  stationName: string;       // 観測所名称
  year: string;              // 年度/年
  latitude: string;          // 緯度
  longitude: string;         // 経度
  prefectureCode: string;    // 都道府県コード
  municipalityCode: string;  // 市区町村コード
  municipalityKanji: string; // 市区町村（漢字）
  theme: string;             // テーマ
  dataType: string;          // データ種別
}

export function DpfIdUpdater() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // サーバー接続テスト
  const testServerConnection = async () => {
    try {
      // まず /health エンドポイントを試す
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/health`;
      console.log('🔍 Testing server connection (health):', healthUrl);
      
      let response = await fetch(healthUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        console.log('✅ Server is online (health endpoint)');
        setServerStatus('online');
        return true;
      }
      
      // /health が失敗した場合、/rivers/list を試す
      const riversUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/list?limit=1`;
      console.log('🔍 Testing alternative endpoint (rivers/list):', riversUrl);
      
      response = await fetch(riversUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        console.log('✅ Server is online (rivers/list endpoint)');
        setServerStatus('online');
        return true;
      } else {
        console.error('❌ Both endpoints failed. Server status:', response.status);
        setServerStatus('offline');
        return false;
      }
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      console.error('❌ Project ID:', projectId);
      console.error('❌ Supabase Function may not be deployed');
      setServerStatus('offline');
      return false;
    }
  };

  // コンポーネントマウント時にサーバーをテスト
  useEffect(() => {
    testServerConnection();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('📋 CSV Headers:', headers);
    
    // ヘッダー名から列インデックスを特定
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
      year: getColumnIndex(['年度/年', '年度', '年']),
      latitude: getColumnIndex(['緯度']),
      longitude: getColumnIndex(['経度']),
      prefectureCode: getColumnIndex(['都道府県コード']),
      municipalityCode: getColumnIndex(['市区町村コード', '市町村コード']),
      municipalityKanji: getColumnIndex(['市区町村', '市区町村（漢字）']),
      theme: getColumnIndex(['テーマ']),
      dataType: getColumnIndex(['データ種別', 'データ関連ページ']),
    };
    
    console.log('📋 Column indices:', indices);
    
    // 必須列のチェック
    if (indices.riverName === -1 || indices.municipalityCode === -1) {
      console.error('❌ Required columns not found:', {
        riverName: indices.riverName === -1 ? 'MISSING' : 'OK',
        municipalityCode: indices.municipalityCode === -1 ? 'MISSING' : 'OK',
      });
      return [];
    }
    
    const data: CsvRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      // 河川名称と市区町村コードが存在する行のみ処理
      if (values[indices.riverName] && values[indices.municipalityCode]) {
        data.push({
          municipality: indices.municipality !== -1 ? values[indices.municipality] : '',
          basinName: indices.basinName !== -1 ? values[indices.basinName] : '',
          riverName: values[indices.riverName],
          stationName: indices.stationName !== -1 ? values[indices.stationName] : '',
          year: indices.year !== -1 ? values[indices.year] : '',
          latitude: indices.latitude !== -1 ? values[indices.latitude] : '',
          longitude: indices.longitude !== -1 ? values[indices.longitude] : '',
          prefectureCode: indices.prefectureCode !== -1 ? values[indices.prefectureCode] : '',
          municipalityCode: values[indices.municipalityCode],
          municipalityKanji: indices.municipalityKanji !== -1 ? values[indices.municipalityKanji] : '',
          theme: indices.theme !== -1 ? values[indices.theme] : '',
          dataType: indices.dataType !== -1 ? values[indices.dataType] : '',
        });
      }
    }
    
    console.log(`📊 Successfully parsed ${data.length} rows`);
    console.log('📊 First 3 rows:', data.slice(0, 3));
    
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
      // CSVファイルを読み込み
      const text = await file.text();
      const csvData = parseCSV(text);
      
      console.log(`📊 Parsed ${csvData.length} rows from CSV`);
      console.log('📊 Sample data:', csvData.slice(0, 3));

      // バッチ処理：50件ずつ送信
      const BATCH_SIZE = 50;
      const batches = [];
      for (let i = 0; i < csvData.length; i += BATCH_SIZE) {
        batches.push(csvData.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`📦 Split into ${batches.length} batches of ${BATCH_SIZE} items each`);

      let totalUpdated = 0;
      let totalSkipped = 0;
      let failedBatches = 0;

      // 各バッチを順番に処理
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchNumber = i + 1;
        
        console.log(`📤 Processing batch ${batchNumber}/${batches.length} (${batch.length} items)`);

        const requestUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/update-dpf-ids`;

        try {
          const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ csvData: batch }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              totalUpdated += data.updatedCount || 0;
              totalSkipped += data.skippedCount || 0;
              console.log(`✅ Batch ${batchNumber}: Updated ${data.updatedCount}, Skipped ${data.skippedCount}`);
            } else {
              failedBatches++;
              console.error(`❌ Batch ${batchNumber} failed:`, data.error);
            }
          } else {
            failedBatches++;
            console.error(`❌ Batch ${batchNumber} HTTP error:`, response.status);
          }
        } catch (batchError) {
          failedBatches++;
          console.error(`❌ Batch ${batchNumber} error:`, batchError);
        }

        // 進捗状況を表示（中間結果）
        setResult({
          success: true,
          message: `処理中... ${batchNumber}/${batches.length} バッチ完了\n\n更新: ${totalUpdated}件\nスキップ: ${totalSkipped}件`,
          details: null,
        });

        // 少し待機（サーバー負荷軽減）
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // 最終結果
      setResult({
        success: true,
        message: `✅ すべてのバッチ処理が完了しました！\n\n更新件数: ${totalUpdated}件\nスキップ: ${totalSkipped}件\n失敗バッチ: ${failedBatches}/${batches.length}`,
        details: {
          updatedCount: totalUpdated,
          skippedCount: totalSkipped,
          failedBatches,
          totalBatches: batches.length,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult({
        success: false,
        message: `❌ 更新に失敗しました\n\nエラー: ${errorMessage}`,
      });
      console.error('❌ Update error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DPF観測所ID 一括更新</CardTitle>
        <CardDescription>
          川の防災情報サイトのCSVファイルをアップロードして、既存の川データに「DPF観測所ID」と「水位情報URL」を追加します。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* サーバーステータス表示 */}
        {serverStatus === 'offline' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ サーバー接続エラー</strong>
              <p className="mt-2">Supabase Functionサーバーに接続できません。サーバーがデプロイされていない可能性があります。</p>
              <p className="mt-2 text-xs">コンソール（F12）でエラー詳細を確認してください。</p>
            </AlertDescription>
          </Alert>
        )}
        
        {serverStatus === 'online' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              ✅ サーバー接続OK - データ更新の準備ができました
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <label
            htmlFor="csv-file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            style={{ borderColor: '#0372ac' }}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2" style={{ color: '#0372ac' }} />
              <p className="mb-2 text-sm">
                <span className="font-semibold">クリックしてファイルを選択</span>
              </p>
              <p className="text-xs text-slate-500">CSV形式（市町村コード列が必須）</p>
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
              選択されたファイル: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
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
              {result.details && result.success && (
                <div className="mt-4 space-y-2">
                  {result.details.examples && result.details.examples.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">更新例:</p>
                      {result.details.examples.map((ex: any, idx: number) => (
                        <div key={idx} className="text-xs bg-slate-100 p-2 rounded mb-2">
                          <div><strong>{ex.riverName}</strong> ({ex.prefecture})</div>
                          <div>市町村コード: {ex.municipalityCode}</div>
                          <div>水系: {ex.basinName} / 観測所: {ex.stationName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 <strong>仕組み:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>CSVの「河��名称」と既存データの「川の名前」をマッチング</li>
            <li>「市区町村コード」をDPF観測所IDとして保存</li>
            <li>「水系名称」「観測所名称」も同時に更新</li>
            <li>水位情報URLを自動生成して保存</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}