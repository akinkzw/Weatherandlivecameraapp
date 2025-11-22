import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export function BulkRiverUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);

  // CSVファイルを選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      previewCSV(selectedFile);
    }
  };

  // CSVプレビュー
  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const previewData = lines.slice(0, 6).map((line, index) => {
        const cols = line.split(',').map(col => col.trim());
        return {
          line: index + 1,
          name: cols[0] || '',
          prefecture: cols[1] || '',
          municipality: cols[2] || '',
          waterSystem: cols[3] || '',
          observatory: cols[4] || '',
          latitude: cols[5] || '',
          longitude: cols[6] || '',
          scale: cols[7] || ''
        };
      });
      setPreview(previewData);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // CSVアップロード
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      // CSVを読み込んで行に分割
      const text = await file.text();
      let lines = text.split('\n').filter(line => line.trim());
      
      // ヘッダー行を検出して除外
      if (lines.length > 0 && lines[0].includes('川の名前')) {
        console.log('📋 Removing header row from CSV');
        lines = lines.slice(1); // ヘッダー行を除外
      }
      
      console.log(`Total data lines to upload: ${lines.length}`);
      
      // バッチサイズ（一度に送信する行数） - サーバータイムアウトを避けるため小さめに設定
      const BATCH_SIZE = 50;
      const totalBatches = Math.ceil(lines.length / BATCH_SIZE);
      
      let totalSuccess = 0;
      let totalFailed = 0;
      let totalSkipped = 0;
      const allErrors: any[] = [];
      
      // バッチごとに処理
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = Math.min((i + 1) * BATCH_SIZE, lines.length);
        const batchLines = lines.slice(start, end);
        
        console.log(`🔄 Processing batch ${i + 1}/${totalBatches} (${start + 1}-${end})`);
        
        // 進捗を表示
        setResult({
          success: true,
          message: `処理中... ${i + 1}/${totalBatches} バッチ (${end}/${lines.length} 件)`,
          stats: { success: totalSuccess, failed: totalFailed, skipped: totalSkipped, total: lines.length },
          errors: []
        });
        
        try {
          // バッチをCSVテキストに変換
          const batchCSV = batchLines.join('\n');
          console.log(`📤 Sending batch ${i + 1}: ${batchLines.length} lines, ${batchCSV.length} bytes`);
          const batchBlob = new Blob([batchCSV], { type: 'text/csv' });
          const batchFile = new File([batchBlob], `batch_${i}.csv`, { type: 'text/csv' });
          
          const formData = new FormData();
          formData.append('file', batchFile);

          console.log(`🌐 Fetching batch ${i + 1}...`);
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/bulk-upload`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: formData,
            }
          );

          console.log(`📥 Response status for batch ${i + 1}: ${response.status}`);
          const data = await response.json();
          console.log(`📊 Batch ${i + 1} response:`, data);

          if (response.ok && data.stats) {
            totalSuccess += data.stats.success || 0;
            totalFailed += data.stats.failed || 0;
            totalSkipped += data.stats.skipped || 0;
            
            console.log(`✅ Batch ${i + 1}: success=${data.stats.success}, failed=${data.stats.failed}, skipped=${data.stats.skipped}`);
            
            if (data.errors && data.errors.length > 0) {
              allErrors.push(...data.errors);
            }
          } else {
            console.error(`❌ Batch ${i + 1} failed:`, data.error);
            totalFailed += batchLines.length;
            allErrors.push({
              batch: i + 1,
              error: data.error || 'バッチ処理に失敗しました'
            });
          }
        } catch (batchError) {
          console.error(`❌ Batch ${i + 1} exception:`, batchError);
          totalFailed += batchLines.length;
          allErrors.push({
            batch: i + 1,
            error: `ネットワークエラー: ${batchError}`
          });
        }
        
        // サーバーへの負荷を軽減するため、少し待機
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // 最終結果を表示
      setResult({
        success: true,
        message: `完了！ ${totalSuccess}件の川を登録しました`,
        stats: {
          success: totalSuccess,
          failed: totalFailed,
          skipped: totalSkipped,
          total: lines.length
        },
        errors: allErrors
      });
      
    } catch (error) {
      console.error('CSV一括登録エラー:', error);
      setResult({
        success: false,
        message: 'ネットワークエラーが発生しました',
        errors: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  // サンプルCSVダウンロード
  const downloadSampleCSV = () => {
    const sampleData = `川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模
那珂川,栃木県,那須町,那珂川,黒磯,36.9652,140.0431,medium
鬼怒川,栃木県,日光市,利根川,日光,36.7497,139.6986,large
中禅寺湖,栃木県,日光市,利根川,中禅寺,36.7333,139.4833,small`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_rivers.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#204670' }}>
              📊 CSV一括登録
            </h1>
            <p className="text-slate-600">
              複数の川をCSVファイルから一括で登録できます
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            style={{ borderColor: '#0372ac', color: '#0372ac' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
        </div>

        {/* CSVフォーマット説明 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#204670' }}>
            📋 CSVフォーマット
          </h2>
          <div className="space-y-3 text-sm">
            <p className="text-slate-700">
              以下の8列をカンマ区切りで記述してください：
            </p>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              川の名前,都道府県,市区町村,水系名称,観測所名称,度,経度,規模
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700">規模：</span>
                <span className="text-slate-600"> large / medium / small （任意）</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">水系名：</span>
                <span className="text-slate-600"> 利根川、信濃川など</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">観測所名称：</span>
                <span className="text-slate-600"> DPF APIの観測所名</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">緯度経度：</span>
                <span className="text-slate-600"> 自動で小数点以下6桁に丸めます</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={downloadSampleCSV}
            className="mt-4"
            style={{ borderColor: '#0372ac', color: '#0372ac' }}
          >
            <Download className="w-4 h-4 mr-2" />
            サンプルCSVをダウンロード
          </Button>
        </Card>

        {/* ファイル選択 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#204670' }}>
            📁 ファイル選択
          </h2>
          
          {/* 警告メッセージ */}
          <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>⚠️ 重要：</strong> 既存のデータがある場合、CSV一括登録前に「データベースをクリア」することを推奨します。
              これにより、重複や上書きを防ぎ、CSVの全件が正常に登録されます。
            </p>
          </div>
          
          {/* バックアップ＆クリア */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* バックアップボタン */}
            <Button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/backup`,
                    {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                      },
                    }
                  );
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `rivers_backup_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                    alert('✅ バックアップが完了しました');
                  } else {
                    alert('❌ バックアップに失敗しました');
                  }
                } catch (error) {
                  alert(`❌ エラー: ${error}`);
                }
              }}
              variant="outline"
              className="w-full"
              style={{ borderColor: '#0372ac', color: '#0372ac' }}
            >
              💾 バックアップ（CSV出力）
            </Button>
            
            {/* データベースクリアボタン */}
            <Button
              onClick={async () => {
                if (!confirm('本当に全ての川データを削除しますか？この操作は取り消せません。\n\n⚠️ 事前にバックアップを取得することを推奨します。')) {
                  return;
                }
                try {
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/clear-all`,
                    {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                      },
                    }
                  );
                  const data = await response.json();
                  if (data.success) {
                    alert(`✅ ${data.deletedCount}件の川データを削除しました。\n\nCSVファイルを選択して、再登録してください。`);
                  } else {
                    alert(`❌ エラー: ${data.error}`);
                  }
                } catch (error) {
                  alert(`❌ エラー: ${error}`);
                }
              }}
              variant="outline"
              className="w-full"
              style={{ borderColor: '#dc2626', color: '#dc2626' }}
            >
              🗑️ データベースをクリア（全削除）
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center"
              style={{ borderColor: '#0372ac' }}>
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: '#0372ac' }} />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer inline-block"
              >
                <Button
                  type="button"
                  variant="default"
                  style={{ backgroundColor: '#0372ac' }}
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  CSVファイルを選択
                </Button>
              </label>
              {file && (
                <p className="mt-3 text-sm text-slate-600">
                  選択中: <span className="font-semibold">{file.name}</span>
                </p>
              )}
            </div>

            {file && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
                style={{ backgroundColor: '#0372ac' }}
              >
                {isUploading ? '登録中...' : '一括登録を実行'}
              </Button>
            )}
          </div>
        </Card>

        {/* プレビュー */}
        {preview.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#204670' }}>
              👀 プレビュー（最初の5件）
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ color: '#204670' }}>
                    <th className="text-left p-2">行</th>
                    <th className="text-left p-2">川の名前</th>
                    <th className="text-left p-2">都道府県</th>
                    <th className="text-left p-2">市区町村</th>
                    <th className="text-left p-2">水系</th>
                    <th className="text-left p-2">観測所</th>
                    <th className="text-left p-2">緯度</th>
                    <th className="text-left p-2">経度</th>
                    <th className="text-left p-2">模</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-2 text-slate-500">{row.line}</td>
                      <td className="p-2 font-semibold">{row.name}</td>
                      <td className="p-2">{row.prefecture}</td>
                      <td className="p-2">{row.municipality}</td>
                      <td className="p-2">{row.waterSystem}</td>
                      <td className="p-2">{row.observatory}</td>
                      <td className="p-2 text-xs">{row.latitude}</td>
                      <td className="p-2 text-xs">{row.longitude}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          row.scale === 'large' ? 'bg-blue-100 text-blue-700' :
                          row.scale === 'medium' ? 'bg-green-100 text-green-700' :
                          row.scale === 'small' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {row.scale}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 結果表示 */}
        {result && (
          <Card className="p-6">
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h2 className={`text-xl font-semibold mb-2 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.success ? '✅ 登録完了' : '❌ エラー'}
                </h2>
                <p className="text-slate-700 mb-4">{result.message}</p>

                {result.stats && (
                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-2" style={{ color: '#204670' }}>
                      登録統計
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-600">合計</div>
                        <div className="text-2xl font-bold" style={{ color: '#0372ac' }}>
                          {result.stats.total}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">成功</div>
                        <div className="text-2xl font-bold text-green-600">
                          {result.stats.success}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">失敗</div>
                        <div className="text-2xl font-bold text-red-600">
                          {result.stats.failed}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">スキップ</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {result.stats.skipped}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      エラー詳細
                    </h3>
                    <div className="bg-red-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {result.errors.map((error: any, index: number) => (
                        <div key={index} className="text-sm text-red-800 mb-2">
                          <span className="font-semibold">行 {error.line}:</span> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => window.location.href = '/'}
                  className="mt-4"
                  style={{ backgroundColor: '#0372ac' }}
                >
                  ホームに戻る
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}