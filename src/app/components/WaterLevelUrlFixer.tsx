import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, CheckCircle, AlertCircle, Download, FileText } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ParsedRow {
  riverName: string;
  prefecture: string;
  municipality: string;
  basinName: string;
  stationName: string;
  latitude: string;
  longitude: string;
  dataPageUrl: string;
  extractedStCd?: string;
  generatedUrl?: string;
  parseError?: string;
}

export function WaterLevelUrlFixer() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<any>(null);
  
  // CSVファイルを読み込む
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setParsing(true);
    setUpdateResult(null);
    
    try {
      const text = await uploadedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      console.log('📄 CSV読み込み:', lines.length, '行');
      
      // ヘッダー行をスキップ（1行目）
      const dataLines = lines.slice(1);
      
      const parsed: ParsedRow[] = [];
      
      for (const line of dataLines) {
        // CSVパース（カンマ区切り、13列）
        const columns = line.split(',').map(col => col.trim());
        
        if (columns.length < 13) {
          console.warn('⚠️ 列数不足:', columns.length, line);
          continue;
        }
        
        const [
          location,           // 0: 所在地
          prefecture,         // 1: 都道府県
          municipality,       // 2: 市町村名
          basinName,          // 3: 水系名称
          riverName,          // 4: 河川名称
          stationName,        // 5: 観測所名称
          longitude,          // 6: 経度
          latitude,           // 7: 緯度
          prefectureCode,     // 8: 都道府県コード
          municipalityCode,   // 9: 市区町村コード
          municipalityName,   // 10: 市区町村
          theme,              // 11: テーマ
          dataPageUrl         // 12: データ関連ページ
        ] = columns;
        
        // 15桁のstCdを抽出（URLから）
        let extractedStCd = '';
        let generatedUrl = '';
        let parseError = '';
        
        try {
          // dataPageUrlからstCdパラメータを抽出
          const urlMatch = dataPageUrl.match(/stCd=(\d{15})/);
          
          if (urlMatch && urlMatch[1]) {
            extractedStCd = urlMatch[1];
            
            // 正しい水位情報URLを生成
            generatedUrl = `https://www.river.go.jp/kawabou/ipSuiiInfo.do?gmenKindCode=1&obsnKindCode=1&stCd=${extractedStCd}&timeType=60`;
          } else {
            parseError = 'stCdが見つかりません';
          }
        } catch (error) {
          parseError = `URL解析エラー: ${error}`;
        }
        
        parsed.push({
          riverName,
          prefecture,
          municipality,
          basinName,
          stationName,
          latitude,
          longitude,
          dataPageUrl,
          extractedStCd,
          generatedUrl,
          parseError
        });
      }
      
      console.log('✅ パース完了:', parsed.length, '件');
      console.log('📊 サンプル:', parsed.slice(0, 3));
      
      setParsedData(parsed);
    } catch (error) {
      console.error('❌ CSVパースエラー:', error);
      alert(`CSVの読み込みに失敗しました: ${error}`);
    } finally {
      setParsing(false);
    }
  };
  
  // データベースを更新
  const handleUpdate = async () => {
    if (parsedData.length === 0) {
      alert('先にCSVファイルをアップロードしてください');
      return;
    }
    
    const validData = parsedData.filter(row => row.generatedUrl && !row.parseError);
    
    if (validData.length === 0) {
      alert('有効なデータが見つかりません');
      return;
    }
    
    const confirmed = confirm(
      `${validData.length}件の川データの水位情報URLを更新します。\n\nこの処理は元に戻せません。続行しますか？`
    );
    
    if (!confirmed) return;
    
    setUpdating(true);
    setUpdateResult(null);
    
    try {
      console.log('🚀 データベース更新開始...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/update-water-level-urls`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            updates: validData.map(row => ({
              riverName: row.riverName,
              prefecture: row.prefecture,
              stationName: row.stationName,
              waterLevelUrl: row.generatedUrl,
              extractedStCd: row.extractedStCd
            }))
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`サーバーエラー: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ 更新完了:', result);
      
      setUpdateResult(result);
      
      if (result.success) {
        alert(`✅ 更新完了！\n\n更新: ${result.updatedCount}件\nスキップ: ${result.skippedCount}件`);
      } else {
        alert(`❌ 更新に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ 更新エラー:', error);
      alert(`更新中にエラーが発生しました: ${error}`);
    } finally {
      setUpdating(false);
    }
  };
  
  // 抽出結果をCSVダウンロード
  const downloadExtractedData = () => {
    if (parsedData.length === 0) return;
    
    let csv = '川の名前,都道府県,市区町村,水系名称,観測所名称,緯度,経度,抽出されたstCd,生成されたURL,エラー\n';
    
    for (const row of parsedData) {
      csv += `${row.riverName},${row.prefecture},${row.municipality},${row.basinName},${row.stationName},${row.latitude},${row.longitude},${row.extractedStCd || ''},${row.generatedUrl || ''},${row.parseError || ''}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted_water_level_urls.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const successCount = parsedData.filter(row => row.generatedUrl && !row.parseError).length;
  const errorCount = parsedData.filter(row => row.parseError).length;
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#0372ac' }}>
            水位情報URL 修正ツール
          </CardTitle>
          <CardDescription>
            SearchResults_v4.csvから15桁のstCdを抽出し、正しい水位情報URLを生成します
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* ステップ1: CSVアップロード */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                1
              </div>
              <h3 className="font-semibold">CSVファイルをアップロード</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={parsing || updating}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {file ? file.name : 'SearchResults_v4.csvをアップロード'}
                  </p>
                  <p className="text-sm text-gray-500">
                    クリックしてファイルを選択
                  </p>
                </div>
              </label>
            </div>
            
            {parsing && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  CSVを解析中...
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* ステップ2: 解析結果 */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">解析結果</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold" style={{ color: '#0372ac' }}>
                        {parsedData.length}
                      </div>
                      <div className="text-sm text-gray-600">総データ数</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {successCount}
                      </div>
                      <div className="text-sm text-gray-600">抽出成功</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {errorCount}
                      </div>
                      <div className="text-sm text-gray-600">エラー</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* サンプル表示 */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">サンプル（最初の3件）</h4>
                <div className="space-y-2 text-sm">
                  {parsedData.slice(0, 3).map((row, index) => (
                    <div key={index} className="border-b pb-2">
                      <div className="font-medium">{row.riverName} - {row.stationName}</div>
                      <div className="text-gray-600">
                        {row.extractedStCd ? (
                          <>
                            <span className="text-green-600">✓ stCd: {row.extractedStCd}</span>
                            <br />
                            <span className="text-xs break-all">{row.generatedUrl}</span>
                          </>
                        ) : (
                          <span className="text-red-600">✗ {row.parseError}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={downloadExtractedData}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  抽出結果をCSVダウンロード
                </Button>
              </div>
            </div>
          )}
          
          {/* ステップ3: データベース更新 */}
          {parsedData.length > 0 && successCount > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  3
                </div>
                <h3 className="font-semibold">データベース更新</h3>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {successCount}件の川データの水位情報URLを更新します。この操作は元に戻せません。
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full"
                style={{ backgroundColor: '#0372ac' }}
              >
                {updating ? '更新中...' : `${successCount}件のURLを更新する`}
              </Button>
            </div>
          )}
          
          {/* 更新結果 */}
          {updateResult && (
            <Alert className={updateResult.success ? 'border-green-500' : 'border-red-500'}>
              {updateResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {updateResult.success ? (
                  <div>
                    <div className="font-medium mb-2">更新完了！</div>
                    <div className="text-sm space-y-1">
                      <div>✓ 更新: {updateResult.updatedCount}件</div>
                      <div>- スキップ: {updateResult.skippedCount}件</div>
                      <div className="text-gray-600">処理時間: {updateResult.processingTime}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">更新失敗</div>
                    <div className="text-sm">{updateResult.error}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
