# Design System Implementation Guide

このドキュメントは、ludiscan-webappのデザインシステム実装について説明します。Material Design 3、Apple HIG、WCAG 2.2などの業界標準ガイドラインに準拠しています。

## 📋 目次

1. [概要](#概要)
2. [デザイントークン](#デザイントークン)
3. [アクセシビリティ](#アクセシビリティ)
4. [レスポンシブデザイン](#レスポンシブデザイン)
5. [フォーム・エラーハンドリング](#フォームエラーハンドリング)
6. [コンポーネント使用ガイド](#コンポーネント使用ガイド)
7. [トークンの更新方法](#トークンの更新方法)

---

## 概要

### 実装された主要機能

✅ **デザイントークンシステム** (tokens.json + Style Dictionary)
- CSS Custom Propertyの自動生成
- Material Design 3準拠の命名規則
- プラットフォーム間の一貫性

✅ **流体タイポグラフィ** (clamp()による可変フォントサイズ)
- ビューポート幅に応じた自動スケーリング
- ブレークポイント不要の連続的な変化

✅ **論理プロパティ** (RTL/LTR自動対応)
- `margin-inline-start` 等の使用
- 多言語・縦書き対応

✅ **アクセシビリティ** (WCAG 2.2準拠)
- フォーカス管理
- ARIAプロパティ
- コントラスト比保証
- 最小タッチターゲット（44×44px）

✅ **フォームエラーハンドリング** (GOV.UK Design System準拠)
- エラー要約コンポーネント
- アクション可能なエラーメッセージ
- スクリーンリーダー対応

---

## デザイントークン

### トークンの構造

デザイントークンは `tokens.json` で定義され、以下のカテゴリに分類されています：

#### 色 (Color)
```json
{
  "color": {
    "primary": { "40": "#C41E3A", "80": "#E63946", "90": "#FF6B7A" },
    "secondary": { "40": "#B8860B", "80": "#D4AF37", "90": "#FFD700" },
    "neutral": { "10": "#1A0F0F", ..., "100": "#FFFFFF" },
    "error": { "40": "#A00020", "60": "#DC143C", "80": "#FF6B8B" },
    "warning": { "40": "#CC7000", "60": "#FF8C00", "80": "#FFB347" },
    "success": { "40": "#1B4D1B", "60": "#2D7D2D", "80": "#90EE90" }
  }
}
```

**使用例:**
```css
background-color: var(--color-primary-80);
color: var(--color-neutral-100);
border-color: var(--color-error-60);
```

#### スペーシング (Spacing)
流体スケールを使用した可変スペーシング：

```json
{
  "spacing": {
    "xs": "clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem)",
    "sm": "clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)",
    "md": "clamp(1rem, 0.875rem + 0.625vw, 1.5rem)",
    "lg": "clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem)"
  }
}
```

**使用例:**
```css
/* 論理プロパティを使用 */
padding-inline: var(--spacing-md);
margin-block: var(--spacing-lg);
gap: var(--spacing-sm);
```

#### タイポグラフィ (Typography)
流体タイポグラフィで可変フォントサイズ：

```json
{
  "typography": {
    "fontSize": {
      "xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
      "base": "clamp(1rem, 0.875rem + 0.625vw, 1.25rem)",
      "3xl": "clamp(1.875rem, 1.5rem + 1.875vw, 3rem)"
    }
  }
}
```

**使用例:**
```css
font-size: var(--typography-font-size-base);
font-weight: var(--typography-font-weight-semibold);
line-height: var(--typography-line-height-normal); /* 1.5 */
```

---

## アクセシビリティ

### フォーカス管理

すべてのインタラクティブ要素で`:focus-visible`スタイルを実装：

```css
button:focus-visible {
  outline: var(--accessibility-focus-ring-width) solid var(--color-primary-80);
  outline-offset: var(--accessibility-focus-ring-offset);
}
```

**特徴:**
- フォーカスリング幅: 3px (WCAG 2.2推奨)
- オフセット: 2px (視認性向上)
- キーボードユーザーのみ表示（`:focus-visible`）

### コントラスト比

WCAG AA基準を満たすコントラスト比：

- **本文テキスト**: 4.5:1以上
- **大きなテキスト (18pt以上)**: 3:1以上
- **UIコンポーネント**: 3:1以上

**検証ツール:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 最小タッチターゲット

```css
button {
  min-block-size: var(--touch-target-min-size-mobile); /* 44px */
  min-inline-size: var(--touch-target-min-size-mobile); /* 44px */
}
```

**基準:**
- モバイル: 44×44px (iOS/Android推奨)
- デスクトップ: 24×24px (最小)

### スクリーンリーダー対応

```tsx
<input
  type="email"
  id="email"
  aria-describedby="email-hint email-error"
  aria-invalid={hasError ? 'true' : 'false'}
  aria-required="true"
/>
<span id="email-hint">メールアドレスを入力してください</span>
<span id="email-error" role="alert">無効なメールアドレスです</span>
```

---

## レスポンシブデザイン

### 流体スケール

`clamp()`を使用してブレークポイント不要のレスポンシブデザインを実現：

```css
/* 悪い例（固定値） */
font-size: 16px;
padding: 12px;

/* 良い例（流体スケール） */
font-size: var(--typography-font-size-base); /* clamp(1rem, 0.875rem + 0.625vw, 1.25rem) */
padding-inline: var(--spacing-md); /* clamp(1rem, 0.875rem + 0.625vw, 1.5rem) */
```

**利点:**
- 全ビューポートで滑らかなスケーリング
- メディアクエリの削減
- メンテナンス性向上

### 論理プロパティ

RTL/LTRレイアウトに自動対応：

```css
/* 悪い例（物理プロパティ） */
margin-left: 1rem;
margin-right: 2rem;
text-align: left;

/* 良い例（論理プロパティ） */
margin-inline-start: 1rem;
margin-inline-end: 2rem;
text-align: start;
```

**論理プロパティマッピング:**
| 物理プロパティ | 論理プロパティ |
|---|---|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `margin-top` | `margin-block-start` |
| `margin-bottom` | `margin-block-end` |
| `width` | `inline-size` |
| `height` | `block-size` |
| `padding-left/right` | `padding-inline` |
| `padding-top/bottom` | `padding-block` |

### 行長制限

可読性のため最大行長を制限：

```css
p, li, blockquote {
  max-inline-size: var(--layout-max-line-length); /* 65ch */
}
```

**推奨範囲:** 45〜75文字（最適: 65文字）

---

## フォーム・エラーハンドリング

### FormErrorSummary コンポーネント

GOV.UK Design Systemに準拠したエラー要約：

```tsx
import { FormErrorSummary } from '@src/component/molecules/FormErrorSummary';

const errors = [
  { fieldId: 'email', message: 'メールアドレスに@を含めてください（例: user@example.com）' },
  { fieldId: 'password', message: 'パスワードは8文字以上必要です' }
];

<FormErrorSummary
  errors={errors}
  show={errors.length > 0}
  title="以下の問題を修正してください"
/>
```

**機能:**
- `role="alert"` で即座に通知
- 自動フォーカス管理
- エラーフィールドへのリンク
- アクション可能なエラーメッセージ

### FormFieldWithError コンポーネント

個別フィールドのエラー表示：

```tsx
import { FormFieldWithError } from '@src/component/molecules/FormFieldWithError';

<FormFieldWithError
  label="Email Address"
  hint="We'll never share your email"
  error={emailError}
  required
>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormFieldWithError>
```

**自動管理される属性:**
- `id` (自動生成またはカスタム)
- `aria-describedby` (ヒント+エラーを関連付け)
- `aria-invalid` (検証状態)
- `aria-required` (必須フィールド)

### エラーメッセージのベストプラクティス

**❌ 悪い例:**
- "入力エラー"
- "無効な値です"
- "フォーマットが正しくありません"

**✅ 良い例:**
- "メールアドレスに@を含めてください（例: user@example.com）"
- "パスワードは8文字以上必要です"
- "確認用パスワードが一致しません。もう一度入力してください"

**原則:** "何が問題か" + "どうすればよいか" を1文で明示

---

## コンポーネント使用ガイド

### Button

```tsx
import { Button } from '@src/component/atoms/Button';

<Button
  onClick={handleSubmit}
  scheme="primary"
  fontSize="base"
  width="full"
  disabled={isLoading}
>
  送信
</Button>
```

**実装済み機能:**
- 最小タッチターゲット（44×44px）
- 論理プロパティ
- デザイントークン使用
- アクセシブルなフォーカススタイル

### TextField

```tsx
import { TextField } from '@src/component/molecules/TextField';

<TextField
  value={email}
  onChange={setEmail}
  label="Email"
  type="email"
  placeholder="user@example.com"
/>
```

**実装済み機能:**
- `aria-invalid`サポート
- フォーカスリング
- エラー状態スタイル
- 論理プロパティ

---

## トークンの更新方法

### 1. トークンの編集

`tokens.json` を編集：

```json
{
  "color": {
    "primary": {
      "80": { "value": "#FF0000", "type": "color" }
    }
  }
}
```

### 2. トークンの再生成

```bash
bun run tokens:build
```

これにより以下が自動生成されます：
- `src/styles/tokens/tokens.css` (CSS Custom Properties)
- `src/styles/tokens/tokens.ts` (TypeScript定数)

### 3. 開発中の自動再生成

```bash
bun run tokens:watch
```

### 4. ビルドプロセスへの統合

本番ビルド前に自動実行：

```json
{
  "scripts": {
    "prebuild:prod": "bun run tokens:build && bun run build:heatmap-bundle"
  }
}
```

---

## 参考資料

### デザインシステム
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)

### アクセシビリティ
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### デザイントークン
- [Design Tokens Community Group](https://www.designtokens.org/)
- [Style Dictionary](https://styledictionary.com/)

### タイポグラフィ・レイアウト
- [Utopia - Fluid Responsive Design](https://utopia.fyi/)
- [Google Fonts Knowledge](https://fonts.google.com/knowledge)
- [MDN CSS論理プロパティ](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_logical_properties_and_values)

---

## 開発フロー

### 新規コンポーネント作成時

1. **デザイントークンを使用**
   ```tsx
   const StyledComponent = styled.div`
     padding-inline: var(--spacing-md);
     color: var(--color-text-primary);
   `;
   ```

2. **論理プロパティを優先**
   ```css
   /* margin-left ❌ */
   /* margin-inline-start ✅ */
   ```

3. **アクセシビリティを考慮**
   - ARIAプロパティの追加
   - キーボード操作のサポート
   - フォーカス管理

4. **Storybookストーリーを作成**
   ```tsx
   export default {
     title: 'Atoms/NewComponent',
     component: NewComponent,
     tags: ['autodocs'],
   };
   ```

### コードレビュー時のチェックリスト

- [ ] デザイントークン使用（生値なし）
- [ ] 論理プロパティ使用（物理プロパティなし）
- [ ] アクセシビリティ（ARIA、フォーカス、コントラスト）
- [ ] 最小タッチターゲット（44×44px）
- [ ] レスポンシブ（流体スケール）
- [ ] エラーメッセージがアクション可能

---

## トラブルシューティング

### トークンが反映されない

1. トークンを再生成: `bun run tokens:build`
2. ブラウザキャッシュをクリア
3. `src/styles/tokens/tokens.css` が正しく生成されているか確認

### CSSカスタムプロパティが認識されない

`_app.page.tsx` で `globals.css` がインポートされているか確認：

```tsx
import '@src/styles/globals.css';
```

### 論理プロパティが動作しない

ブラウザの互換性を確認。主要ブラウザは全てサポート済み：
- Chrome 89+
- Firefox 66+
- Safari 12.1+
- Edge 89+

---

**最終更新:** 2025-11-16
**メンテナー:** ludiscan開発チーム
