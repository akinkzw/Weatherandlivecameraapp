import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Trash2, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DuplicateRiverCleaner() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // 重複を分析
  const analyzeDuplicates = async () => {
    setAnalyzing(true);
    setError('');
    setResult('');
    setDuplicates([]);
    
    try {
      console.log('🔍 重複データを分析中...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.rivers) {
        throw new Error('データの取得に失敗しました');
      }
      
      console.log(`📊 全体: ${data.rivers.length} 件の川データ`);
      
      // 重複を検出（川名 + 都道府県 + 観測所名でグループ化）
      const groupedByKey = new Map<string, any[]>();
      
      data.rivers.forEach((river: any) => {
        const key = `${river.name}|${river.prefecture}|${river.stationName || 'unknown'}`;
        
        if (!groupedByKey.has(key)) {
          groupedByKey.set(key, []);
        }
        groupedByKey.get(key)!.push(river);
      });
      
      // 重複があるグループのみ抽出
      const duplicateGroups: any[] = [];
      let totalDuplicates = 0;
      
      groupedByKey.forEach((rivers, key) => {
        if (rivers.length > 1) {
          // IDでソート（数値として比較）
          rivers.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          
          duplicateGroups.push({
            key,
            name: rivers[0].name,
            prefecture: rivers[0].prefecture,
            stationName: rivers[0].stationName || '不明',
            count: rivers.length,
            rivers: rivers,
            keepId: rivers[0].id, // 最初のID（最小ID）を保持
            deleteIds: rivers.slice(1).map(r => r.id) // 残りを削除対象
          });
          
          totalDuplicates += rivers.length - 1;
        }
      });
      
      // 重複数でソート
      duplicateGroups.sort((a, b) => b.count - a.count);
      
      console.log(`✅ 重複グループ: ${duplicateGroups.length} 件`);
      console.log(`✅ 削除対象: ${totalDuplicates} 件`);
      
      setDuplicates(duplicateGroups);
      setResult(`重複グループ: ${duplicateGroups.length} 件\n削除対象データ: ${totalDuplicates} 件`);
      
    } catch (err) {
      console.error('❌ エラー:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalyzing(false);
    }
  };
  
  // 重複を削除
  const removeDuplicates = async () => {
    if (duplicates.length === 0) {
      setError('重複データが見つかりません。まず「重複を分析」を実行してください。');
      return;
    }
    
    if (!confirm(`${duplicates.reduce((sum, d) => sum + d.deleteIds.length, 0)} 件の重複データを削除します。\n\nこの操作は取り消せません。よろしいですか？`)) {
      return;
    }
    
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      console.log('🗑️ 重複データを削除中...');
      
      // 削除対象のIDを収集
      const idsToDelete: string[] = [];
      duplicates.forEach(group => {
        idsToDelete.push(...group.deleteIds);
      });
      
      console.log(`削除対象ID: ${idsToDelete.length} 件`, idsToDelete);
      
      // サーバーに削除リクエスト
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers/bulk-delete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: idsToDelete
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTPエラー: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '削除に失敗しました');
      }
      
      console.log('✅ 削除完了:', data);
      
      setResult(`✅ 削除成功！\n\n削除件数: ${data.deletedCount} 件\n残りのユニークな川: ${data.remainingCount} 件`);
      setDuplicates([]);
      
      // 3秒後に再分析
      setTimeout(() => {
        analyzeDuplicates();
      }, 3000);
      
    } catch (err) {
      console.error('❌ エラー:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#0372ac' }} className="flex items-center gap-2">
            <Trash2 className="w-6 h-6" />
            重複データクリーナー
          </CardTitle>
          <CardDescription>
            データベース内の重複した川データを検出・削除します
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* パフォーマンス改善のヒント */}
          <Alert className="border-blue-500 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="font-semibold mb-2">💡 読み込み速度改善のヒント</div>
              <div className="text-sm">
                重複データを削除することで、データ取得時間を最大60%短縮できます。
                詳しくは
                <a 
                  href="/PERFORMANCE_GUIDE.md" 
                  target="_blank" 
                  className="underline ml-1 font-semibold"
                >
                  パフォーマンス改善ガイド
                </a>
                をご覧ください。
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-4">
            <Button
              onClick={analyzeDuplicates}
              disabled={analyzing}
              style={{ backgroundColor: '#0372ac' }}
              className="flex items-center gap-2"
            >
              {analyzing ? '分析中...' : '重複を分析'}
            </Button>
            
            {duplicates.length > 0 && (
              <Button
                onClick={removeDuplicates}
                disabled={loading}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? '削除中...' : `重複を削除 (${duplicates.reduce((sum, d) => sum + d.deleteIds.length, 0)}件)`}
              </Button>
            )}
          </div>
          
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {result && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 whitespace-pre-line">
                {result}
              </AlertDescription>
            </Alert>
          )}
          
          {duplicates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-300 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-900">
                      {duplicates.length} 件の重複グループを検出
                    </p>
                    <p className="text-sm text-amber-700">
                      合計 {duplicates.reduce((sum, d) => sum + d.deleteIds.length, 0)} 件の重複データが削除対象です
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {duplicates.map((group, index) => (
                  <Card key={index} className="p-4 bg-red-50 border-red-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg">
                            {group.name} ({group.stationName})
                          </h3>
                          <p className="text-sm text-gray-600">
                            {group.prefecture} - 重複数: {group.count} 件
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
                          {group.count} 件
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {group.rivers.map((river: any, idx: number) => (
                          <div 
                            key={river.id}
                            className={`p-3 rounded border ${
                              idx === 0 
                                ? 'bg-green-100 border-green-400' 
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {idx === 0 ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Trash2 className="w-5 h-5 text-red-600" />
                                )}
                                <div>
                                  <p className="font-mono text-sm">
                                    <strong>ID:</strong> {river.id}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    市区町村: {river.municipality || '不明'} | 
                                    水系: {river.basinName || '不明'} | 
                                    延長: {river.length}km
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                idx === 0
                                  ? 'bg-green-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}>
                                {idx === 0 ? '保持' : '削除'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}