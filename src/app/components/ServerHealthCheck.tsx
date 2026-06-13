import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface HealthCheckResult {
  serverStatus: 'running' | 'error' | 'checking';
  bannerStatus: 'success' | 'error' | 'checking';
  envStatus: any;
  bannerData: any;
  errors: string[];
  timestamp: string;
}

export function ServerHealthCheck() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runHealthCheck = async () => {
    setIsChecking(true);
    const errors: string[] = [];
    let serverStatus: 'running' | 'error' = 'error';
    let bannerStatus: 'success' | 'error' = 'error';
    let envStatus = null;
    let bannerData = null;

    try {
      // 1. サーバーの環境変数を確認
      console.log('🔍 Checking server environment...');
      const envResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/env-check`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (envResponse.ok) {
        envStatus = await envResponse.json();
        serverStatus = 'running';
        console.log('✅ Server is running');
        console.log('Environment status:', envStatus);
      } else {
        errors.push(`Server env-check failed: ${envResponse.status} ${envResponse.statusText}`);
        console.error('❌ Server env-check failed:', envResponse.status);
      }
    } catch (error) {
      errors.push(`Server connection error: ${error}`);
      console.error('❌ Server connection error:', error);
    }

    try {
      // 2. バナーAPIを確認
      console.log('🔍 Checking banner API...');
      const bannerResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/banner`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('Banner API response status:', bannerResponse.status);

      if (bannerResponse.ok) {
        bannerData = await bannerResponse.json();
        bannerStatus = 'success';
        console.log('✅ Banner data fetched successfully');
        console.log('Banner data:', bannerData);
      } else {
        const errorData = await bannerResponse.json().catch(() => ({}));
        errors.push(`Banner API failed: ${bannerResponse.status} ${bannerResponse.statusText}`);
        console.error('❌ Banner API failed:', errorData);
        
        if (errorData.diagnostics) {
          errors.push(`Diagnostics: ${JSON.stringify(errorData.diagnostics, null, 2)}`);
        }
      }
    } catch (error) {
      errors.push(`Banner API error: ${error}`);
      console.error('❌ Banner API error:', error);
    }

    setResult({
      serverStatus,
      bannerStatus,
      envStatus,
      bannerData,
      errors,
      timestamp: new Date().toISOString(),
    });
    setIsChecking(false);
  };

  // コンポーネントマウント時に自動実行
  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="mb-4" style={{ color: '#0372ac' }}>サーバー診断ツール</h2>
      
      <Button 
        onClick={runHealthCheck} 
        disabled={isChecking}
        className="mb-4"
        style={{ backgroundColor: '#0372ac' }}
      >
        {isChecking ? '診断中...' : '診断を実行'}
      </Button>

      {result && (
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            最終チェック: {new Date(result.timestamp).toLocaleString('ja-JP')}
          </div>

          {/* サーバーステータス */}
          <div className={`p-4 rounded-lg border-2 ${
            result.serverStatus === 'running' 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <h3 className="mb-2">
              {result.serverStatus === 'running' ? '✅' : '❌'} サーバーステータス
            </h3>
            <p className="text-sm">
              {result.serverStatus === 'running' ? '正常に稼働中' : 'サーバーエラー'}
            </p>
          </div>

          {/* バナーAPIステータス */}
          <div className={`p-4 rounded-lg border-2 ${
            result.bannerStatus === 'success' 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <h3 className="mb-2">
              {result.bannerStatus === 'success' ? '✅' : '❌'} バナーAPIステータス
            </h3>
            <p className="text-sm">
              {result.bannerStatus === 'success' ? 'データ取得成功' : 'データ取得失敗'}
            </p>
            {result.bannerData && (
              <div className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(result.bannerData, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* 環境変数ステータス */}
          {result.envStatus && (
            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
              <h3 className="mb-2">📋 環境変数ステータス</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>microCMS API:</strong>{' '}
                  <span className={result.envStatus.variables?.MICROCMS_API_KEY === 'SET' ? 'text-green-600' : 'text-red-600'}>
                    {result.envStatus.variables?.MICROCMS_API_KEY || 'NOT SET'}
                  </span>
                </div>
                <div>
                  <strong>OpenWeather API:</strong>{' '}
                  <span className={result.envStatus.variables?.OPENWEATHER_API_KEY === 'SET' ? 'text-green-600' : 'text-red-600'}>
                    {result.envStatus.variables?.OPENWEATHER_API_KEY || 'NOT SET'}
                  </span>
                </div>
                <div>
                  <strong>DPF API:</strong>{' '}
                  <span className={result.envStatus.variables?.DPF_API_KEY === 'SET' ? 'text-green-600' : 'text-red-600'}>
                    {result.envStatus.variables?.DPF_API_KEY || 'NOT SET'}
                  </span>
                </div>
                <div>
                  <strong>Supabase:</strong>{' '}
                  <span className={result.envStatus.variables?.SUPABASE_URL === 'SET' ? 'text-green-600' : 'text-red-600'}>
                    {result.envStatus.variables?.SUPABASE_URL === 'SET' ? 'SET' : 'NOT SET'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* エラー一覧 */}
          {result.errors.length > 0 && (
            <div className="p-4 rounded-lg border-2 border-red-500 bg-red-50">
              <h3 className="mb-2">⚠️ エラー詳細</h3>
              <ul className="text-sm space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 成功メッセージ */}
          {result.serverStatus === 'running' && result.bannerStatus === 'success' && (
            <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
              <h3 className="mb-2">🎉 すべて正常に動作しています！</h3>
              <p className="text-sm text-green-700">
                サーバーは正常に稼働しており、バナーデータの取得も成功しています。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
