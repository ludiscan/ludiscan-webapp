#!/usr/bin/env node

/**
 * このスクリプトはHeatMapViewerコンポーネントをスタンドアロンのJavaScriptにバンドルします。
 * 生成されたファイルは、オフラインで使用可能な静的HTMLファイルに含めることができます。
 * すべての依存関係（ReactやReact DOMなど）を含む完全独立型のバンドルを生成します。
 *
 * 使用方法: node scripts/create-heatmap-bundle.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const esbuild = require('esbuild');

// 出力先のパス
const outputFile = path.join(__dirname, '..', 'public', 'heatmap-viewer-bundle.js');

// メイン処理
async function main() {
  try {
    // console.log('HeatMapViewerコンポーネントのバンドルを開始します...');

    // publicディレクトリが存在することを確認
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // esbuildでバンドル
    const result = await esbuild.build({
      entryPoints: [path.join(__dirname, '../src/utils/heatmap/exportHeatmap.tsx')],
      bundle: true,
      minify: true,
      format: 'iife',
      target: ['es2020'],
      outfile: outputFile,
      external: [], // 外部依存関係なし - すべてバンドルに含める
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
      // スタンドアロンのバンドルとして出力
      globalName: 'LudiscanHeatmap',
      // JSX変換設定
      jsx: 'automatic', // 自動的にJSXをReact.createElementに変換
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
      },
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
      // バンドル分割を無効化
      splitting: false,
      metafile: true, // 依存関係の分析用
    });

    // メタファイルを出力（依存関係の確認用）
    if (result.metafile) {
      fs.writeFileSync(path.join(publicDir, 'heatmap-bundle-meta.json'), JSON.stringify(result.metafile, null, 2));
    }

    // console.log(`バンドルが正常に完了しました: ${outputFile}`);
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('バンドル中にエラーが発生しました:', error);
    process.exit(1);
  }
}

main().then(() => {});
