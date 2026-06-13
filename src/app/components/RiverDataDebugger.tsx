import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function RiverDataDebugger() {
  const [result, setResult] = useState<string>('');
  const [riverName, setRiverName] = useState<string>('笛吹川');
  const [loading, setLoading] = useState(false);

  const checkRiverData = async () => {
    if (!riverName.trim()) {
      setResult('❌ 川の名前を入力してください');
      return;
    }

    setLoading(true);
    setResult('🔍 検索中...');

    try {
      // 全ての川データを取得
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // 指定された川を検索
        const matchingRivers = data.rivers.filter((r: any) => 
          r.name && r.name.includes(riverName.trim())
        );
        
        console.log(`🔍 「${riverName}」のデータ:`, matchingRivers);
        
        if (matchingRivers.length > 0) {
          const river = matchingRivers[0];
          
          // 全てのフィールドをコンソールに出力
          console.log('🔍 全てのフィールド:', Object.keys(river));
          console.log('🔍 全データ:', river);
          
          const info = [
            `川の名前: ${river.name}`,
            `都道府県: ${river.prefecture}`,
            `市区町村: ${river.municipality || '(なし)'}`,
            `都道府県コード: ${river.prefectureCode || '(なし)'}`,
            `市区町村コード: ${river.municipalityCode || '(なし)'}`,
            `DPF観測所ID: ${river.dpfObservationId || '(未設定)'}`,
            `水系名: ${river.basinName || '(なし)'}`,
            `観測所名: ${river.stationName || '(なし)'}`,
            `水位情報URL: ${river.waterLevelUrl || '(なし)'}`,
            `緯度: ${river.latitude}`,
            `経度: ${river.longitude}`,
            ``,
            `=== 全フィールド一覧 ===`,
            ...Object.keys(river).map(key => `${key}: ${river[key]}`),
            ``,
            `該当件数: ${matchingRivers.length}件`,
          ].join('\n');
          
          setResult(`✅ 「${riverName}」が見つかりました\n\n${info}`);
          
          // 水位データを取得してテスト
          if (river.municipalityCode) {
            console.log(`🌊 Testing water level API for municipality code: ${river.municipalityCode}`);
            
            const waterLevelResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/realtime-water-level/${river.municipalityCode}`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              }
            );
            
            const waterLevelData = await waterLevelResponse.json();
            
            console.log('📊 Water Level API Response:', waterLevelData);
            
            if (waterLevelData.success && waterLevelData.data) {
              console.log('✅ Water level data retrieved successfully:', waterLevelData.data);
              alert(`✅ 水位データ取得成功！\n\n市区町村コード: ${river.municipalityCode}\nデータ: ${JSON.stringify(waterLevelData.data, null, 2)}\n\nAPI URL: ${waterLevelData.apiUrl}\n\n詳細はコンソールログ（F12）を確認してください。`);
            } else {
              console.error('❌ Water level fetch failed:', waterLevelData);
              alert(`❌ 水位データ取得失敗\n\nエラー: ${waterLevelData.error || '不明なエラー'}\n\nAPI URL: ${waterLevelData.apiUrl}\n\n詳細はコンソールログ（F12）を確認してください。`);
            }
          } else {
            alert('⚠️ この川には市区町村コードが設定されていません。\n\n水位データを取得するには、市区町村コードが必要です。');
          }
        } else {
          setResult(`❌ 「${riverName}」が見つかりませんでした\n\n別の川名を試してください。`);
        }
      } else {
        setResult(`❌ エラー: ${data.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('❌ Exception:', error);
      setResult(`❌ エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md z-50 border-2 border-blue-500">
      <h3 className="font-bold mb-3 text-blue-700">🔍 川データデバッグ</h3>
      <div className="space-y-2">
        <Input
          placeholder="川の名前を入力..."
          value={riverName}
          onChange={(e) => setRiverName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              checkRiverData();
            }
          }}
          className="mb-2"
        />
        <Button 
          onClick={checkRiverData} 
          className="w-full"
          disabled={loading}
        >
          {loading ? '検索中...' : 'データを確認'}
        </Button>
      </div>
      {result && (
        <pre className="text-xs bg-slate-100 p-3 rounded mt-3 whitespace-pre-wrap overflow-auto max-h-96 font-mono">
          {result}
        </pre>
      )}
    </div>
  );
}