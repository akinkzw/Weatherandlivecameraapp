import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Wifi, Server } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BannerData {
  pc_image: {
    url: string;
  };
  sp_image: {
    url: string;
  };
  icon: {
    url: string;
  };
  icon_2?: {
    url: string;
  };
  icon_3?: {
    url: string;
  };
  url?: string;
  description?: string;
}

export function ServerConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  
  // microCMSからバナーデータを取得
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/banner`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setBannerData(data.success && data.data ? data.data : data);
        }
      } catch (error) {
        console.error('バナーデータの取得エラー:', error);
      }
    };

    fetchBanner();
  }, []);
  
  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const testResults: any[] = [];
    
    // テスト1: /rivers エンドポイント
    try {
      console.log('🧪 Testing /rivers endpoint...');
      const startTime = Date.now();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/rivers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: '/rivers エンドポイント',
          status: 'success',
          responseTime: `${responseTime}ms`,
          details: `${data.rivers?.length || 0}件の川データを取得`
        });
      } else {
        const errorText = await response.text();
        let errorDetails = `HTTPエラー: ${response.status}`;
        
        // HTMLエラーページかどうかを確認
        if (errorText.includes('<!DOCTYPE html>')) {
          errorDetails += ' - データベースサーバーが利用できません（Error 521）';
        } else {
          errorDetails += ` - ${errorText.substring(0, 100)}`;
        }
        
        testResults.push({
          name: '/rivers エンドポイント',
          status: 'error',
          responseTime: `${responseTime}ms`,
          details: errorDetails
        });
      }
    } catch (error) {
      testResults.push({
        name: '/rivers エンドポイント',
        status: 'error',
        responseTime: '-',
        details: `接続エラー: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // テスト2: /debug/find-fuefuki エンドポイント
    try {
      console.log('🧪 Testing /debug/find-fuefuki endpoint...');
      const startTime = Date.now();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f24a873/debug/find-fuefuki`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: '/debug/find-fuefuki エンドポイント',
          status: 'success',
          responseTime: `${responseTime}ms`,
          details: `${data.rivers?.length || 0}件の笛吹川データを検出`
        });
      } else {
        const errorText = await response.text();
        testResults.push({
          name: '/debug/find-fuefuki エンドポイント',
          status: 'error',
          responseTime: `${responseTime}ms`,
          details: `HTTPエラー: ${response.status} - ${errorText.substring(0, 100)}`
        });
      }
    } catch (error) {
      testResults.push({
        name: '/debug/find-fuefuki エンドポイント',
        status: 'error',
        responseTime: '-',
        details: `接続エラー: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // テスト3: 環境変数
    testResults.push({
      name: '環境変数',
      status: 'info',
      responseTime: '-',
      details: `Project ID: ${projectId ? '✓' : '✗'}, API Key: ${publicAnonKey ? '✓' : '✗'}`
    });
    
    setResults(testResults);
    setTesting(false);
  };
  
  return (
    <div>
      {/* ヘッダー */}
      <header 
        className="relative shadow-md border-b-4" 
        style={{ borderColor: '#0372ac' }}
      >
        <div style={{
          background: 'linear-gradient(to bottom, #97d0ed 0%, #97d0ed 60%, rgba(151, 208, 237, 0.3) 100%)'
        }}>
          {/* Background Image */}
          <div className="relative pt-[165px] md:pt-[160px]">
            {bannerData && (
              <>
                {/* PC用画像 */}
                <div className="hidden md:block absolute top-0 left-0 w-full h-[220px]">
                  <ImageWithFallback
                    src={bannerData.pc_image?.url}
                    alt="川の風景"
                    className="w-full h-full object-contain object-top"
                  />
                </div>
                {/* SP用画像 */}
                <div className="block md:hidden absolute top-0 left-0 w-full h-[190px]">
                  <ImageWithFallback
                    src={bannerData.sp_image?.url}
                    alt="川の風景"
                    className="w-full h-full object-contain object-top"
                  />
                </div>
              </>
            )}
          </div>

          {/* Header Content */}
          <div className="relative py-6">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                {bannerData?.icon?.url && (
                  <ImageWithFallback
                    src={bannerData.icon.url}
                    alt="装飾アイコン"
                    className="w-8 h-8 object-contain"
                  />
                )}
                <h1 className="font-bold" style={{ fontFamily: 'Noto Sans JP, sans-serif', color: '#0372ac' }}>
                  サーバー接続診断ツール
                </h1>
                {bannerData?.icon?.url && (
                  <ImageWithFallback
                    src={bannerData.icon.url}
                    alt="装飾アイコン"
                    className="w-8 h-8 object-contain"
                  />
                )}
              </div>
              <p className="text-sm" style={{ color: '#204670' }}>
                サーバーへの接続状況を確認します
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#0372ac' }} className="flex items-center gap-2">
              <Server className="w-6 h-6" />
              サーバー接続テスト
            </CardTitle>
            <CardDescription>
              サーバーへの接続状況を確認します
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button
              onClick={runTests}
              disabled={testing}
              style={{ backgroundColor: '#0372ac' }}
              className="w-full flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <Wifi className="w-4 h-4 animate-pulse" />
                  テスト実行中...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  接続テストを開始
                </>
              )}
            </Button>
            
            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">テスト結果</h3>
                
                {results.map((result, index) => (
                  <Card key={index} className={`p-4 ${
                    result.status === 'success' ? 'bg-green-50 border-green-300' :
                    result.status === 'error' ? 'bg-red-50 border-red-300' :
                    'bg-blue-50 border-blue-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      {result.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      )}
                      {result.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      {result.status === 'info' && (
                        <Wifi className="w-5 h-5 text-blue-600 mt-0.5" />
                      )}
                      
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{result.name}</div>
                        <div className="text-sm text-gray-700 mb-1">
                          {result.details}
                        </div>
                        {result.responseTime !== '-' && (
                          <div className="text-xs text-gray-500">
                            応答時間: {result.responseTime}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {results.every(r => r.status === 'success' || r.status === 'info') && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      ✅ 全てのテストに成功しました！サーバーは正常に動作しています。
                    </AlertDescription>
                  </Alert>
                )}
                
                {results.some(r => r.status === 'error') && (
                  <Alert className="border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      ❌ 一部のテストが失敗しました。ブラウザのコンソール（F12）で詳細を確認してください。
                    </AlertDescription>
                  </Alert>
                )}
                
                {results.some(r => r.details?.includes('Error 521')) && (
                  <Alert className="border-orange-500 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700 space-y-2">
                      <div className="font-semibold">⚠️ データベースサーバーエラー（Error 521）</div>
                      <div className="text-sm">
                        Supabaseデータベースサーバーに接続できません。以下を確認してください：
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li>Supabaseプロジェクトが一時停止していないか</li>
                        <li>データベースが起動しているか</li>
                        <li>環境変数（SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY）が正しく設定されているか</li>
                        <li>Supabaseダッシュボードで「Pause」されていないか確認</li>
                      </ul>
                      <div className="text-sm font-semibold mt-2">
                        対処方法: <a 
                          href={`https://supabase.com/dashboard/project/${projectId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline text-blue-600"
                        >
                          Supabaseダッシュボード
                        </a> でプロジェクトの状態を確認してください。
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {results.some(r => r.details?.includes('schema cache')) && (
                  <Alert className="border-yellow-500 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 space-y-2">
                      <div className="font-semibold">⏳ データベース起動中（コールドスタート）</div>
                      <div className="text-sm">
                        データベースが起動中です。これは無料プランで一定期間使用がなかった場合に発生します。
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li>初回アクセス時は30秒〜1分程度かかる場合があります</li>
                        <li>数分待ってから再度テストを実行してください</li>
                        <li>サーバーは自動的にリトライを行います（最大5回）</li>
                      </ul>
                      <div className="text-sm font-semibold mt-2">
                        💡 ヒント: 1〜2分待ってから、もう一度「接続テストを開始」ボタンをクリックしてください。
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <div className="bg-gray-100 p-4 rounded">
              <h4 className="font-semibold text-sm mb-2">デバッグ情報</h4>
              <div className="text-xs font-mono space-y-1">
                <div>Project ID: {projectId || '未設定'}</div>
                <div>Base URL: https://{projectId}.supabase.co/functions/v1/make-server-5f24a873</div>
                <div>API Key: {publicAnonKey ? '設定済み' : '未設定'}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <div className="text-xs text-gray-600">
                  💡 エラーの詳細な対処方法については、
                  <a 
                    href="/DATABASE_ERRORS.md" 
                    target="_blank" 
                    className="underline text-blue-600 ml-1"
                  >
                    データベースエラー対処ガイド
                  </a>
                  を参照してください。
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}