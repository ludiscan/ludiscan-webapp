# Argos CI Visual Regression Testing Setup

このドキュメントでは、Argos CIを使ったビジュアルリグレッションテストのセットアップ手順を説明します。

## 概要

Argos CIは、Pull Request上でStorybookコンポーネントの見た目の差分を自動で検出し、レビューを支援するツールです。
このプロジェクトでは、Storybook Test Runnerと連携して各Storyのスクリーンショットを自動撮影し、PRに対して自動的にビジュアル差分が生成され、PRコメントに表示されます。

## セットアップ手順

### 1. Argosアカウントの作成

1. [argos-ci.com](https://argos-ci.com) にアクセス
2. GitHubアカウントでサインアップ
3. リポジトリ (`ludiscan/ludiscan-webapp`) を接続

### 2. Argos GitHub Appのインストール（重要！）

**PRに自動でコメントを投稿するために必須です**

1. Argosダッシュボードでプロジェクトを開く
2. "Settings" → "GitHub" に移動
3. "Install GitHub App" ボタンをクリック
4. GitHubの認証画面で、リポジトリへのアクセスを許可
5. インストール完了後、Argosがリポジトリのステータスチェックとコメント投稿ができるようになる

**重要**: GitHub ActionsワークフローにもArgosがPRコメントを投稿するための適切なパーミッションが設定されている必要があります：
- `pull-requests: write` - PRにコメントを投稿
- `checks: write` - チェックステータスを更新
- `statuses: write` - ステータスを更新

これらのパーミッションは `.github/workflows/pr.yml` に既に設定されています。

### 3. Argosトークンの取得

1. Argosダッシュボードでプロジェクト設定を開く
2. "Settings" → "Tokens" から **ARGOS_TOKEN** を取得
3. トークンをコピー（後で使用）

### 4. GitHub Secretsの設定

1. GitHubリポジトリの "Settings" → "Secrets and variables" → "Actions" を開く
2. "New repository secret" をクリック
3. 以下を設定：
   - **Name**: `ARGOS_TOKEN`
   - **Secret**: 先ほどコピーしたトークンを貼り付け
4. "Add secret" をクリック

### 5. ベースライン（基準）ビルドの作成と承認

**重要**: 初回セットアップ時は、ベースラインビルドを作成して承認する必要があります。これを行わないと、全てのスクリーンショットが「added」として表示されます。

#### 方法1: develop/mainブランチへのマージで自動作成（推奨）

1. このPRをdevelopブランチにマージ
2. GitHub Actionsが自動的にdevelopブランチでArgosを実行
3. Argosダッシュボードで新しいビルドを確認
4. ビルドの「Approve」ボタンをクリックして承認
5. これ以降、PRで作成されたビルドは、このベースラインと比較される

#### 方法2: 手動でベースラインを作成

developブランチにマージできない場合：

```bash
# developブランチをチェックアウト
git checkout develop
git pull

# Storybookをビルドしてテストを実行
bun run build-storybook
bun run test-storybook

# Argosにアップロード（ベースラインとして）
bunx argos upload ./screenshots --token <ARGOS_TOKEN>
```

その後、Argosダッシュボードでビルドを承認します。

#### 自動承認の設定（オプション）

Argosダッシュボードで自動承認を設定すると、手動承認が不要になります：

1. Argosダッシュボードで "Settings" → "Branches" に移動
2. "Auto-approved branches" に `develop` と `main` を追加
3. 以降、これらのブランチのビルドは自動的に承認される

### 6. 動作確認

1. 新しいブランチを作成し、コンポーネントの見た目を変更
2. PRを作成
3. GitHub Actionsで `storybook-test` ジョブが実行される
4. Argosがビジュアル差分を生成（ベースラインと比較）
5. **Argos GitHub Appがインストール済みの場合**、PRに自動でコメントが投稿される
6. コメント内のリンクから差分を確認できる

**注意**:
- GitHub Appをインストールしていない場合は、Argosダッシュボードで直接差分を確認する必要があります。PRコメントは投稿されません。
- ベースラインビルドが承認されていない場合、全てのスクリーンショットが「added」として表示されます。

## 使い方

### PRでのビジュアル差分確認

1. PRを作成すると、GitHub Actionsで以下が自動実行される：
   - Storybookのビルド
   - Storybook Test Runnerの実行（各Storyのスクリーンショット撮影）
   - Argosへのスクリーンショットアップロード
2. Argos botが自動でPRにコメントを投稿
3. コメント内のリンクから、すべてのビジュアル差分を確認できる
4. 変更を **Approve** または **Reject** して、レビューを進める

### ローカルでのテスト

ローカルでスクリーンショットを確認する場合：

```bash
# Storybookを起動
bun run storybook

# Storybookをビルドしてテストを実行（スクリーンショット撮影）
bun run build-storybook
bun run test-storybook

# ./screenshots ディレクトリにスクリーンショットが生成される
```

## 設定ファイル

### .storybook/test-runner.ts

Storybook Test Runnerの設定ファイルで、各Storyのスクリーンショット撮影を設定：

```typescript
import type { TestRunnerConfig } from '@storybook/test-runner';
import { argosScreenshot } from '@argos-ci/storybook/test-runner';

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // 各Storyのスクリーンショットを ./screenshots に保存
    await argosScreenshot(page, context);
  },
};

export default config;
```

### argos.config.js

プロジェクトルートにある `argos.config.js` で、Argosの動作を設定できます：

```javascript
export default {
  upload: {
    path: './screenshots', // スクリーンショット保存先
  },
  // threshold: 0.5, // 差分検出の感度（0-1）
  reference: {
    branch: 'develop', // 比較対象ブランチ（ベースライン）
  },
};
```

**重要**: `reference.branch` を設定することで、Argosがどのブランチと比較するかを明示的に指定します。この設定がないと、全てのスクリーンショットが「added」として扱われる可能性があります。

### GitHub Actions (.github/workflows/pr.yml)

#### トリガー設定

ワークフローは以下の場合に実行されます：

```yaml
on:
  pull_request:  # PRの作成・更新時
    paths:
      - 'src/**'
      - '.github/workflows/pr.yml'
      - 'package.json'
      - 'bun.lock'
  push:  # main/developブランチへのプッシュ時（ベースライン作成）
    branches:
      - main
      - develop
    paths:
      - 'src/**'
      - '.storybook/**'
```

**重要**: main/developブランチへのプッシュ時にもArgosを実行することで、ベースラインビルドが自動的に作成されます。

#### パーミッション設定

ArgosがPRにコメントを投稿するための適切なパーミッションが設定されています：

```yaml
permissions:
  contents: read
  pull-requests: write  # PRにコメントを投稿
  checks: write         # チェックステータスを更新
  statuses: write       # ステータスを更新
```

#### Storybookテストとアップロード

`storybook-test` ジョブで、スクリーンショット撮影とArgosへのアップロードが実行されます：

```yaml
- name: Serve Storybook and run tests
  run: |
    bunx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
      "bunx http-server storybook-static --port 6006 --silent" \
      "bunx wait-on tcp:6006 && bun run test-storybook"

- name: Upload screenshots to Argos
  continue-on-error: true
  run: bunx argos upload ./screenshots --token ${{ secrets.ARGOS_TOKEN }}
```

## トラブルシューティング

### 全てのスクリーンショットが「added」として表示される

**原因**: ベースラインビルドが存在しないか、承認されていない

**解決策**:

1. **ベースラインビルドを作成**:
   - developブランチにこのPRをマージ（GitHub Actionsが自動実行される）
   - または、developブランチで手動でArgosを実行（上記「方法2」参照）

2. **ベースラインビルドを承認**:
   - Argosダッシュボードでdevelopブランチのビルドを開く
   - 「Approve」ボタンをクリック
   - または、"Settings" → "Branches" で `develop` を自動承認ブランチに追加

3. **argos.config.jsを確認**:
   ```javascript
   reference: {
     branch: 'develop', // 正しいベースブランチが設定されているか確認
   }
   ```

4. **次回のPR作成時**: ベースラインと正しく比較され、実際の変更のみが表示される

### PRにコメントが投稿されない

**最も多い原因**: Argos GitHub Appがインストールされていない

1. Argosダッシュボードで "Settings" → "GitHub" を確認
2. "Install GitHub App" ボタンが表示されている場合、まだインストールされていない
3. ボタンをクリックしてGitHub Appをインストール
4. インストール後、次のPRから自動でコメントが投稿される

**その他の確認事項**:
- GitHubリポジトリの "Settings" → "Integrations" → "GitHub Apps" でArgosが表示されているか確認
- Argosダッシュボードで該当のビルドが成功しているか確認
- GitHub Actionsワークフローに適切なパーミッション（`pull-requests: write`, `checks: write`, `statuses: write`）が設定されているか確認

### Argosアップロードが失敗する

- GitHub Secretsに `ARGOS_TOKEN` が正しく設定されているか確認
- Argosダッシュボードでトークンが有効か確認
- `continue-on-error: true` により、アップロード失敗でもCIは通過します

### ビジュアル差分が表示されない

- Storybookが正しくビルドされているか確認（`bun run build-storybook`）
- `.storybook/main.ts` の `stories` パターンが正しいか確認
- `.storybook/test-runner.ts` が存在し、正しく設定されているか確認
- ローカルで `bun run test-storybook` を実行して `./screenshots` ディレクトリが生成されるか確認
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
