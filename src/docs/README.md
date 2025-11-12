# ドキュメントシステム

このディレクトリには、ludiscan-webappのユーザー向けドキュメントが含まれています。

## ドキュメントの構造

```
src/docs/
├── index.md              # ドキュメントトップページ
├── general/              # 一般的なガイド
│   ├── quick-start.md
│   ├── account-settings.md
│   └── glossary.md
├── heatmap/              # ヒートマップ機能
│   ├── getting-started.md
│   ├── basic-usage.md
│   ├── viewer.md
│   ├── controls.md
│   ├── visualization.md
│   ├── timeline.md
│   ├── export.md
│   ├── route-coach.md
│   └── faq.md
└── project/              # プロジェクト情報（非公開）
    ├── overview.md
    ├── setup.md
    └── architecture.md
```

## Frontmatter

各Markdownファイルには、以下のfrontmatterを設定します：

```yaml
---
group: heatmap          # グループ名（ドキュメントの分類）
title: はじめに          # ページタイトル
order: 1                # グループ内での表示順序
description: ...        # ページの説明（オプション）
public: true            # 公開/非公開フラグ（デフォルト: true）
---
```

### グループ

- **general**: 一般的なガイド（クイックスタート、アカウント設定など）
- **heatmap**: ヒートマップビューアーの機能
- **project**: プロジェクト情報（開発者向け、非公開）

### 公開設定

- `public: true` または未設定: 公開ドキュメント（デフォルト）
- `public: false`: 非公開ドキュメント（サイドバーに表示されない）

非公開ドキュメントは、開発者やプロジェクト管理者向けの内部情報に使用します。
ファイルは残りますが、APIやサイドバーには表示されません。

## ドキュメントの追加

新しいドキュメントを追加する場合：

1. 適切なディレクトリにMarkdownファイルを作成
2. Frontmatterを設定
3. 内容を記述
4. 自動的にサイドバーに表示されます（public: falseの場合を除く）

## テスト

ドキュメントの表示を確認するには：

```bash
bun run dev
```

ブラウザで `/heatmap/docs` にアクセスして確認してください。
