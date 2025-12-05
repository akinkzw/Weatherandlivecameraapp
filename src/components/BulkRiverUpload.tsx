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
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  // 統計情報を取得
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      console.log('🔍 Fetching stats from API...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      console.log(`📡 API Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log('📊 統計APIレスポンス (Raw JSON):', JSON.stringify(data, null, 2));
      console.log(`📊 totalRivers from API: ${data.totalRivers}`);
      console.log(`📊 Number of prefectures: ${Object.keys(data.prefectureStats || {}).length}`);
      
      // レスポンスが成功でもエラーでも、prefectureStatsが存在することを保証
      if (!data.prefectureStats) {
        data.prefectureStats = {};
      }
      
      if (response.ok) {
        console.log('📊 都道府県統計:', data.prefectureStats);
        console.log('📊 都道府県別の件数 (上位20件):', 
          Object.entries(data.prefectureStats || {})
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 20)
        );
        setStats(data);
      } else {
        console.error('統計情報の取得に失敗:', data);
        // エラー時も空の統計を設定
        setStats({
          success: false,
          totalRivers: 0,
          prefectureStats: {},
          error: data.error
        });
      }
    } catch (error) {
      console.error('統計情報の取得エラー:', error);
      // エラー時も空の統計を設定
      setStats({
        success: false,
        totalRivers: 0,
        prefectureStats: {},
        error: String(error)
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // 重複チェック
  const checkDuplicates = async () => {
    setLoadingDuplicates(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/check-duplicates`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('📊 重複チェックAPIレスポンス:', JSON.stringify(data, null, 2));
      if (response.ok) {
        console.log('📊 重複データ:', data.duplicates);
        console.log('📊 都道府県別統計（全件）:', data.prefectureStats);
        setDuplicateCheck(data);
      } else {
        console.error('重複チェックに失敗:', data);
      }
    } catch (error) {
      console.error('重複チェックエラー:', error);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  // CSVファイルを
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setPreview([]);
      setStats(null);
      setDuplicateCheck(null);
      
      console.log(`✅ ファイル選択完了: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`);
      console.log('ℹ️ プレビュー機能は無効化されています。「一括登録を実行」ボタンをクリックしてください。');
      
      // プレビュー機能を完全に無効化（大量データでクラッシュするため）
      // ファイル選択時には何もしない - アップロード時に処理する
    }
  };

  // CSVアップロード
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      // デバッグ: 環境変数の状態を確認
      console.log('=== アップロード前の環境変数チェック ===');
      console.log('projectId:', projectId);
      console.log('publicAnonKey exists:', !!publicAnonKey);
      console.log('publicAnonKey length:', publicAnonKey?.length || 0);
      
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
          // バッチをCSVからJSONに変換
          const riversBatch = batchLines.map((line, lineIndex) => {
            const columns = line.split(',').map(col => col.trim());
            
            // CSVフォーマット: 川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模,DPF観測所ID,水位情報URL
            return {
              name: columns[0] || '',
              prefecture: columns[1] || '',
              municipality: columns[2] || '',
              basinName: columns[3] || '',
              stationName: columns[4] || '',
              latitude: columns[5] || '',
              longitude: columns[6] || '',
              scale: columns[7] || '',
              dpfObservatoryId: columns[8] || '', // DPF観測所ID
              waterLevelUrl: columns[9] || '' // 水位情報URL
            };
          });
          
          console.log(`📤 Sending batch ${i + 1}: ${riversBatch.length} rivers`);
          console.log('First river in batch:', riversBatch[0]);
          
          console.log(`🌐 Fetching batch ${i + 1}...`);
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/bulk`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ rivers: riversBatch }),
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
        message: 'ネットワークエラーが発生しまた',
        errors: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  // サンプルCSVダウンロード
  const downloadSampleCSV = () => {
    const sampleData = `川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模,DPF観測所ID,水位情報URL
釜無川,山梨県,南アルプス市,富士川,竜王,35.683,138.467,large,1901204,https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=304011283719030&timeType=60
笛吹川,山梨県,笛吹市,富士川,石和,35.648,138.640,medium,1901204,https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=304011283719010&timeType=60
手取川,石川県,白山市,手取川,鶴来,36.537,136.570,medium,1701204,https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=304011283618010&timeType=60
神通川,富山県,富山市,神通川,神通大橋,36.689,137.200,large,1601204,https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=304011283517010&timeType=60`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_rivers_with_dpf.csv';
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
              以下の10列をカンマ区切りで記述してください：
            </p>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,規模,DPF観測所ID,水位情報URL
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
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
                <span className="text-slate-600"> 竜王、石和など</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">緯度経度：</span>
                <span className="text-slate-600"> 自動で小数点以下6桁に丸めます</span>
              </div>
              <div>
                <span className="font-semibold text-blue-700">🆕 DPF観測所ID：</span>
                <span className="text-blue-600"> 町コード（例: 1901204）</span>
              </div>
              <div>
                <span className="font-semibold text-blue-700">🆕 水位情報URL：</span>
                <span className="text-blue-600"> 国土交通省の水位詳細ページ</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>💡 リアルタイム水位機能：</strong> DPF観測所ID（町コード）を設定すると、川の詳細モーダルで国土交通省のリアルタイム水位データが自動的に表示されます。
                サンプルCSVには釜無川・笛吹川・手取川・神通川のデータが含まれています。
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={downloadSampleCSV}
            className="mt-4"
            style={{ borderColor: '#0372ac', color: '#0372ac' }}
          >
            <Download className="w-4 h-4 mr-2" />
            サンプルCSVをダウンロード（リアルタイム水位対応）
          </Button>
        </Card>

        {/* 現在のDB統計 */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: '#204670' }}>
              📊 現在のデータベース統計
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={fetchStats}
                disabled={loadingStats}
                variant="outline"
                style={{ borderColor: '#0372ac', color: '#0372ac' }}
              >
                {loadingStats ? '読み込み中...' : '統計を更新'}
              </Button>
              <Button
                onClick={checkDuplicates}
                disabled={loadingDuplicates}
                variant="outline"
                style={{ borderColor: '#9333ea', color: '#9333ea' }}
              >
                {loadingDuplicates ? 'チェック中...' : '🔍 重複チェック'}
              </Button>
              <Button
                onClick={async () => {
                  console.log('🐛 Running database debug check...');
                  const res = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/debug-count`,
                    { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
                  );
                  const data = await res.json();
                  console.log('🐛 Debug results:', data);
                  alert(`デバッグ結果:\n\nlimit(1000): ${data.results?.limit1000}件\nlimit(5000): ${data.results?.limit5000}件\nlimit(20000): ${data.results?.limit20000}件\nlimitなし: ${data.results?.noLimit}件\n実際の件数: ${data.results?.exactCount}件\n\n${data.conclusion}\n\nコンソールに詳細を出力しました（F12で確認）`);
                }}
                variant="outline"
                style={{ borderColor: '#dc2626', color: '#dc2626' }}
              >
                🐛 デバッグ
              </Button>
            </div>
          </div>
          
          {stats && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-2xl font-bold" style={{ color: '#0372ac' }}>
                  {stats.totalRivers}件
                </div>
                <div className="text-sm text-slate-600">登録済みの川</div>
              </div>
              
              {stats.prefectureStats && Object.keys(stats.prefectureStats).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-700">都道府県別の川の数（上位20件）</h3>
                  <div className="bg-slate-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {Object.entries(stats.prefectureStats || {})
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 20)
                        .map(([pref, count]: [string, any]) => (
                          <div key={pref} className="flex justify-between items-center p-2 bg-white rounded">
                            <span className="font-semibold text-slate-700">{pref}:</span>
                            <span className="text-slate-600">{count}件</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              
              {stats.prefectureStats && stats.prefectureStats['山梨県'] === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    ⚠️ <strong>山梨県のデータが0件です。</strong> CSVに山梨県のデータが含まれているか確認してください。
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!stats && !loadingStats && (
            <div className="text-center py-8 text-slate-500">
              「統計を更新」ボタンをクリックして、現在のデータベース状況を確認してください
            </div>
          )}
          
          {/* 重複チェック結果 */}
          {duplicateCheck && (
            <div className="mt-6 space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold mb-3 text-purple-900">🔍 重複チェック結果</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-purple-600">総ID数</div>
                    <div className="text-2xl font-bold text-purple-900">{duplicateCheck.totalIds}</div>
                  </div>
                  <div>
                    <div className="text-green-600">有効な川</div>
                    <div className="text-2xl font-bold text-green-700">{duplicateCheck.validRivers}</div>
                  </div>
                  <div>
                    <div className="text-red-600">空きID</div>
                    <div className="text-2xl font-bold text-red-700">{duplicateCheck.nullIds}</div>
                    <div className="text-xs text-slate-500 mt-1">（欠番のID）</div>
                  </div>
                  <div>
                    <div className="text-orange-600">重複グループ</div>
                    <div className="text-2xl font-bold text-orange-700">{duplicateCheck.duplicateGroups}</div>
                  </div>
                </div>
                
                {duplicateCheck.duplicateGroups > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-red-700 mb-2">⚠️ 重複データ（最初の10件）</h4>
                    <div className="bg-white p-3 rounded max-h-48 overflow-y-auto">
                      {duplicateCheck.duplicates.slice(0, 10).map((dup: any, idx: number) => (
                        <div key={idx} className="text-xs mb-2 pb-2 border-b last:border-b-0">
                          <div className="font-semibold text-slate-700">{dup.key}</div>
                          <div className="text-slate-600">
                            {dup.count}件の重複 - ID: {dup.ids.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {duplicateCheck.prefectureStats && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-purple-700 mb-2">📊 都道府県別統計（全件）</h4>
                    <div className="bg-white p-3 rounded max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {Object.entries(duplicateCheck.prefectureStats || {}).map(([pref, count]) => (
                          <div key={pref} className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="font-semibold">{pref}:</span>
                            <span>{count as number}件</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
          
          {/* マージ機能の説明 */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>✨ マージ機能：</strong> CSVをアップロードすると、既存データと自動的に統合されます。
              <br />
              • CSV内に同じ川名+都道府県が複数ある場合、最初の1件のみ登録されます
              <br />
              • 既存データとの重複は川名・都道府県・位置で判定（位置が違えば別の川として登録）
              <br />
              • 新しい川のみが追加されます
            </p>
          </div>
          
          {/* バックアップ＆クリア */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* データベース構造確認ボタン（デバッグ用） */}
            <Button
              onClick={async () => {
                try {
                  console.log('🔍 Checking database structure...');
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/debug-structure`,
                    {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                      },
                    }
                  );
                  
                  const data = await response.json();
                  
                  if (response.ok && data.success) {
                    console.log('📊 データベース構造:', data);
                    console.log('📊 利用可能なフィールド:', data.availableFields);
                    console.log('📊 サンプルデータ:', data.samples);
                    
                    alert(
                      `✅ データベース構造を確認しました\n\n` +
                      `総件数: ${data.totalCount}件\n\n` +
                      `利用可能なフィールド:\n${data.availableFields.join(', ')}\n\n` +
                      `詳細はブラウザのコンソール（F12）を確認してください。`
                    );
                  } else {
                    console.error('❌ Error:', data);
                    alert(`❌ エラー: ${data.error || data.message || '不明なエラー'}`);
                  }
                } catch (error) {
                  console.error('❌ Exception:', error);
                  alert(`❌ エラー: ${error}`);
                }
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              データベース構造を確認（デバッグ）
            </Button>
            
            {/* バックアップボタン */}
            <Button
              onClick={async () => {
                try {
                  console.log('🔍 Requesting backup...');
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers-backup-csv`,
                    {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                      },
                    }
                  );
                  
                  console.log('📡 Response status:', response.status);
                  console.log('📡 Response headers:', response.headers);
                  
                  if (response.ok) {
                    const contentType = response.headers.get('Content-Type');
                    
                    // JSONエラーレスポンスの場合
                    if (contentType && contentType.includes('application/json')) {
                      const errorData = await response.json();
                      console.error('❌ Server error:', errorData);
                      alert(`❌ バックアップに失敗しました\n\nエラー: ${errorData.message || errorData.error || 'Unknown error'}`);
                      return;
                    }
                    
                    // CSVレスポンスの場合
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `rivers_backup_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                    alert('✅ バックアップが完了しました！\n\n全ての川データ（DPF観測所ID、水位情報URLを含む10列フォーマット）がCSVファイルに保存されました。');
                  } else {
                    // HTTPエラーの場合
                    const errorText = await response.text();
                    console.error('❌ HTTP error:', response.status, errorText);
                    alert(`❌ バックアップに失敗しました\n\nHTTPステータス: ${response.status}\nエラー: ${errorText}`);
                  }
                } catch (error) {
                  console.error('❌ Exception:', error);
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
                    alert(`✅ ${data.deletedCount}件の川データを削除しました。\n\nCSVファイルを選択して、登録してください。`);
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