# Argos CI Visual Regression Testing Setup

このドキュメントでは、Argos CIを使ったビジュアルリグレッションテストのセットアップ手順を説明します。

## 概要

Argos CIは、Pull Request上でStorybookコンポーネントの見た目の差分を自動で検出し、レビューを支援するツールです。
このプロジェトでは、すべてのPRに対して自動的にビジュアル差分が生成され、PRコメントに表示されます。

## セットアップ手順

### 1. Argosアカウントの作成

1. [argos-ci.com](https://argos-ci.com) にアクセス
2. GitHubアカウントでサインアップ
3. リポジトリ (`ludiscan/ludiscan-webapp`) を接続

### 2. Argosトークンの取得

1. Argosダッシュボードでプロジェクト設定を開く
2. "Settings" → "Tokens" から **ARGOS_TOKEN** を取得
3. トークンをコピー（後で使用）

### 3. GitHub Secretsの設定

1. GitHubリポジトリの "Settings" → "Secrets and variables" → "Actions" を開く
2. "New repository secret" をクリック
3. 以下を設定：
   - **Name**: `ARGOS_TOKEN`
   - **Secret**: 先ほどコピーしたトークンを貼り付け
4. "Add secret" をクリック

### 4. 動作確認

1. 新しいブランチを作成し、コンポーネントの見た目を変更
2. PRを作成
3. GitHub Actionsで `storybook-test` ジョブが実行される
4. Argosがビジュアル差分を生成し、PRにコメントが投稿される

## 使い方

### PRでのビジュアル差分確認

1. PRを作成すると、Argos botが自動でコメントを投稿
2. コメント内のリンクから、すべてのビジュアル差分を確認できる
3. 変更を **Approve** または **Reject** して、レビューを進める

### ローカルでのテスト

Argosへのアップロードは不要ですが、Storybookをローカルで確認できます：

```bash
# Storybookを起動
bun run storybook

# ビルドして静的ファイルを確認
bun run build-storybook
```

## 設定ファイル

### argos.config.js

プロジェクトルートにある `argos.config.js` で、Argosの動作を設定できます：

```javascript
export default {
  upload: {
    path: './storybook-static', // Storybookビルド出力先
  },
  // threshold: 0.5, // 差分検出の感度（0-1）
  // reference: {
  //   branch: 'main', // 比較対象ブランチ
  // },
};
```

### GitHub Actions (.github/workflows/pr.yml)

PRワークフローの `storybook-test` ジョブで、Argosへのアップロードが実行されます：

```yaml
- name: Upload screenshots to Argos
  continue-on-error: true
  run: bunx @argos-ci/cli upload ./storybook-static --token ${{ secrets.ARGOS_TOKEN }}
```

## トラブルシューティング

### Argosアップロードが失敗する

- GitHub Secretsに `ARGOS_TOKEN` が正しく設定されているか確認
- Argosダッシュボードでトークンが有効か確認
- `continue-on-error: true` により、アップロード失敗でもCIは通過します

### ビジュアル差分が表示されない

- Storybookが正しくビルドされているか確認（`bun run build-storybook`）
- `.storybook/main.ts` の `stories` パターンが正しいか確認
- Argosダッシュボードでビルドログを確認

### 差分が多すぎる

- `argos.config.js` の `threshold` を調整（0に近いほど厳密）
- フォントレンダリングやアニメーションが原因の場合、Storybookで無効化を検討

## リソース

- [Argos公式ドキュメント](https://argos-ci.com/docs)
- [Storybook統合ガイド](https://argos-ci.com/docs/storybook)
- [GitHub Actions統合](https://argos-ci.com/docs/github-actions)

## サポート

問題が発生した場合：
- Argosサポート: support@argos-ci.com
- プロジェクトIssue: https://github.com/ludiscan/ludiscan-webapp/issues
