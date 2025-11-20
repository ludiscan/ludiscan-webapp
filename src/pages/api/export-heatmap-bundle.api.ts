import fs from 'fs';
import path from 'path';

import type { NextApiRequest, NextApiResponse } from 'next';

import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

/**
 * HeatMapViewerコンポーネントをスタンドアロンで使用するためのバンドルJSを提供するAPI
 *
 * このAPIでは事前に生成されたバンドルファイルを返します。
 * 本番環境では、ビルド時にバンドルファイルを生成する方法が推奨されます。
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting
  const rateLimit = rateLimitMiddleware(RATE_LIMITS.API)(req, res);
  if (!rateLimit.allowed) return;

  try {
    // 事前にビルドされたバンドルファイルのパスを指定
    // この例では、publicフォルダに配置されたファイルを使用
    const bundlePath = path.join(process.cwd(), 'public', 'heatmap-viewer-bundle.js');

    // ファイルが存在するか確認
    if (fs.existsSync(bundlePath)) {
      // ファイルを読み込み
      const bundleContent = fs.readFileSync(bundlePath, 'utf-8');

      // JavaScriptとして返す
      res.setHeader('Content-Type', 'application/javascript');
      res.status(200).send(bundleContent);
    } else {
      // ファイルが存在しない場合は、エラーを返す
      res.status(404).json({ error: 'バンドルファイルが見つかりません。ビルドが必要かもしれません。' });
    }
  } catch (error) {
    // console.error('バンドルの提供中にエラーが発生しました:', error);
    res.status(500).json({ error: 'バンドルの提供に失敗しました' + error });
  }
}
