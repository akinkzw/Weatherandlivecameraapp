// microCMS API接続テスト用エンドポイント（デバッグ用）
export const testMicroCmsEndpoint = `
app.get("/make-server-5f24a873/test-microcms", async (c) => {
  try {
    const envKey = Deno.env.get('MICROCMS_API_KEY');
    const expectedKey = 'eBXEDCb4QuRDBrqBs9YoOzdpTYH10Los';
    
    console.log('=== microCMS API Connection Test ===');
    console.log('Env API Key exists:', !!envKey);
    console.log('Env API Key length:', envKey?.length || 0);
    console.log('Env API Key value:', envKey);
    console.log('Expected API Key:', expectedKey);
    console.log('Keys match:', envKey === expectedKey);
    
    // 3つのパターンでテスト
    const testResults = [];
    
    // パターン1: 環境変数のキー
    if (envKey) {
      console.log('\\n--- Testing with env variable key ---');
      try {
        const res1 = await fetch('https://0jb94z3dca.microcms.io/api/v1/banner', {
          headers: { 'X-MICROCMS-API-KEY': envKey },
        });
        const text1 = await res1.text();
        testResults.push({
          pattern: '環境変数のキー',
          status: res1.status,
          statusText: res1.statusText,
          success: res1.ok,
          preview: envKey ? \`\${envKey.substring(0, 8)}...\${envKey.substring(envKey.length - 4)}\` : 'N/A',
          fullKey: envKey,
          response: res1.ok ? JSON.parse(text1) : text1,
        });
      } catch (err) {
        testResults.push({
          pattern: '環境変数のキー',
          error: String(err),
        });
      }
    }
    
    // パターン2: 期待されるキー
    console.log('\\n--- Testing with expected key ---');
    try {
      const res2 = await fetch('https://0jb94z3dca.microcms.io/api/v1/banner', {
        headers: { 'X-MICROCMS-API-KEY': expectedKey },
      });
      const text2 = await res2.text();
      testResults.push({
        pattern: '期待されるキー（ハードコード）',
        status: res2.status,
        statusText: res2.statusText,
        success: res2.ok,
        preview: \`\${expectedKey.substring(0, 8)}...\${expectedKey.substring(expectedKey.length - 4)}\`,
        fullKey: expectedKey,
        response: res2.ok ? JSON.parse(text2) : text2,
      });
    } catch (err) {
      testResults.push({
        pattern: '期待されるキー（ハードコード）',
        error: String(err),
      });
    }
    
    // パターン3: エンドポイント一覧を取得してみる
    console.log('\\n--- Testing to list all endpoints ---');
    try {
      const res3 = await fetch('https://0jb94z3dca.microcms.io/api/v1/', {
        headers: { 'X-MICROCMS-API-KEY': expectedKey },
      });
      const text3 = await res3.text();
      testResults.push({
        pattern: 'エンドポイント一覧',
        status: res3.status,
        statusText: res3.statusText,
        success: res3.ok,
        response: res3.ok ? JSON.parse(text3) : text3,
      });
    } catch (err) {
      testResults.push({
        pattern: 'エンドポイント一覧',
        error: String(err),
      });
    }
    
    return c.json({
      message: 'microCMS API Connection Test Results',
      envKeyExists: !!envKey,
      envKeyLength: envKey?.length || 0,
      envKeyMatchesExpected: envKey === expectedKey,
      results: testResults,
      recommendation: testResults.some(r => r.success) 
        ? '✅ 少なくとも1つのパターンが成功しました'
        : '❌ すべてのパターンが失敗しました。microCMS管理画面でAPIキーを確認してください',
    });
  } catch (error) {
    console.error('Error testing microCMS API:', error);
    return c.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, 500);
  }
});
`;
