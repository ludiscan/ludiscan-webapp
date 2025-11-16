# デザイン実装（統合スキル）

## 目的
公開ガイドライン（Material Design 3、Apple HIG、Fluent 2、GOV.UK、WCAG 2.2）に基づき、デザイントークンから実装までをキーボード操作・コントラスト・流体スケール・多言語対応で検証可能な形で提供する。

## 使う場面
- フォーム・ボタン・エラー表示を含むインタラクティブUIを新規作成する
- 既存コンポーネントのアクセシビリティ（ARIA・キーボード操作・コントラスト）を修正する
- デザイントークンをWeb/iOS/Android各プラットフォームへ自動出力する
- レスポンシブ環境でタイポ・余白を流体スケールで統一する
- 多言語・縦書き・RTL対応でレイアウトを論理プロパティへ移行する

## ルール
1. **トークンを明示せよ**  
   色・余白・文字サイズは全てCSS Custom Propertyで定義し、生値を直書きするな（Material Design 3のトーン命名: `--md-sys-color-primary`、`--md-ref-palette-primary40`）。Style Dictionary形式JSON (`tokens.json`) でプラットフォーム出力を可能にせよ。  
   *根拠: [Material 3 Color System](https://m3.material.io/styles/color/system/overview), [Design Tokens Community Group](https://www.designtokens.org/), [Style Dictionary](https://styledictionary.com/)*

2. **コントラスト比を数値で保証せよ**  
   本文は4.5:1以上（WCAG AA）、18pt以上または太字14pt以上は3:1以上を維持せよ。背景色変更時は[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)で再検証せよ。状態色（success/warning/error/info）は各トーンで同一比率を確保せよ。  
   *根拠: [WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum), [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)*

3. **可変フォントとclamp()で流体スケールを実装せよ**  
   文字サイズは `clamp(1rem, 0.875rem + 0.5vw, 1.125rem)` のように下限・可変・上限を明記せよ。行長は45～75文字を維持せよ（`max-inline-size: 65ch`）。行間は1.5倍を基本とし、見出しは1.2倍まで詰めてよい。  
   *根拠: [Google Fonts Knowledge — Using type](https://fonts.google.com/knowledge/using_type), [Utopia — Fluid Responsive Design](https://utopia.fyi/)*

4. **論理プロパティで物理方向依存を排除せよ**  
   `margin-left` → `margin-inline-start`、`padding-top` → `padding-block-start`、`width` → `inline-size`、`height` → `block-size` を用いよ。RTL・縦書き・多言語対応が自動化される。  
   *根拠: [MDN — CSS論理プロパティ](https://developer.mozilla.org/ja/docs/Web/CSS/Guides/Logical_properties_and_values)*

5. **全インタラクティブ要素をキーボード到達可能にせよ**  
   `<button>`, `<a>`, `<input>` 等のネイティブ要素を優先せよ。カスタム要素は `tabindex="0"`、`role`、`aria-label` を付与し、Enter/Spaceで動作を実装せよ（WAI-ARIA APGパターンに準拠）。  
   *根拠: [WCAG 2.2 SC 2.1.1](https://www.w3.org/WAI/WCAG22/quickref/#keyboard), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/)*

6. **状態（hover/focus/active/disabled）を視覚とARIAで二重に伝達せよ**  
   `:focus-visible` でフォーカスリングを表示し、`aria-disabled="true"` でスクリーンリーダーへ通知せよ。色だけで状態を示すな（アイコン・テキスト・ボーダー太さを併用）。  
   *根拠: [Material Design 3 — Components (State layers)](https://m3.material.io/components), [WCAG 2.2 SC 1.4.1](https://www.w3.org/WAI/WCAG22/quickref/#use-of-color)*

7. **エラーは要約→詳細の順で構造化せよ**  
   フォーム送信失敗時、ページ上部に `role="alert"` でエラー数と各フィールドへのアンカーリンクを配置せよ。個別エラーは `aria-describedby` で入力と紐付け、フォーカスを最初のエラーフィールドへ移動せよ。  
   *根拠: [GOV.UK Design System — Error Summary](https://design-system.service.gov.uk/components/error-summary/), [Inclusive Components — Forms](https://inclusive-components.design/a-todo-list/)*

8. **エラーメッセージは行動を明示せよ**  
   ❌「入力が無効です」→ ✅「メールアドレスに@を含めてください」。エラー理由と解決策を1文で示せ。GOV.UKの「何が起きたか＋どうすればよいか」原則に従え。  
   *根拠: [GOV.UK Design System — Error Message](https://design-system.service.gov.uk/components/error-message/)*

9. **同期検証はaria-live、非同期はrole="status"を使い分けよ**  
   入力中のリアルタイム検証（文字数カウント等）は `aria-live="polite"`。非同期API応答（メール重複チェック等）は `role="status"` でスクリーンリーダーへ即座に通知せよ。  
   *根拠: [WAI-ARIA 1.2 — live regions](https://www.w3.org/TR/wai-aria-1.2/#live_region_roles), [Inclusive Components — Notifications](https://inclusive-components.design/notifications/)*

10. **モバイルは44×44px、デスクトップは24×24pxの最小タッチターゲットを守れ**  
    iOS/Androidは44dp、Webは少なくとも24px四方を確保せよ。余白で視覚サイズを小さく見せてもターゲット領域は維持せよ（Material Design 3の最小48dp、Appleの44pt推奨）。  
    *根拠: [Apple HIG — Touch Targets](https://developer.apple.com/design/human-interface-guidelines/inputs), [Material Design 3 — Accessibility (Touch targets)](https://m3.material.io/foundations/accessibility/overview)*

11. **レスポンシブブレークポイントは流体スケールで不要とせよ**  
    `clamp()` による連続スケールで段階的変化を排除せよ。どうしても必要な場合は、コンテナクエリ（`@container`）をメディアクエリより優先せよ（Figma変数との同期が容易）。  
    *根拠: [Utopia — Fluid Responsive Design](https://utopia.fyi/), [Figma — Variables](https://help.figma.com/hc/en-us/articles/18490793776023)*

12. **プラットフォーム出力は自動化せよ**  
    `tokens.json` からStyle Dictionaryで `iOS/Tokens.swift`, `Android/colors.xml`, `Web/tokens.css` を生成し、手動コピーを禁止せよ。変更はトークン定義1箇所で全環境へ反映させよ。  
    *根拠: [Style Dictionary](https://styledictionary.com/), [Design Tokens Community Group](https://www.designtokens.org/)*

## 実装手順

### 1) 設計のベース（デザイントークンの定義と命名）

**手順:**

1. **`tokens.json` を作成し、Material 3命名規則で階層化**  
   ```json
   {
     "color": {
       "primary": { "value": "#6750A4" },
       "on-primary": { "value": "#FFFFFF" },
       "surface": { "value": "#FEF7FF" }
     },
     "spacing": {
       "xs": { "value": "4px" },
       "sm": { "value": "8px" },
       "md": { "value": "16px" }
     },
     "typography": {
       "body": {
         "size": { "value": "clamp(1rem, 0.875rem + 0.5vw, 1.125rem)" },
         "line-height": { "value": "1.5" }
       }
     }
   }
   ```

2. **Style Dictionaryで各プラットフォーム用ファイルを自動生成**  
   設定例（`config.json`）:
   ```json
   {
     "source": ["tokens.json"],
     "platforms": {
       "css": {
         "transformGroup": "css",
         "buildPath": "build/web/",
         "files": [{
           "destination": "tokens.css",
           "format": "css/variables"
         }]
       }
     }
   }
   ```
   実行: `style-dictionary build`

3. **CSS Custom Propertyで読み込み、生値を排除**  
   ```css
   @import url('tokens.css');
   
   button {
     background: var(--color-primary);
     color: var(--color-on-primary);
     padding-inline: var(--spacing-md);
   }
   ```

4. **Figma変数と同期し、デザイン→コードを一元化**  
   Figma Variablesでトークン名を統一し、エクスポートしたJSONを `tokens.json` へマージ。

*根拠: [Material 3 Color System](https://m3.material.io/styles/color/system/overview), [Style Dictionary](https://styledictionary.com/), [Figma Variables](https://help.figma.com/hc/en-us/articles/18490793776023)*

---

### 2) 色とコントラスト（状態色/トーン/数値基準）

**手順:**

1. **状態色をロール別にトーン定義**  
   ```json
   {
     "color": {
       "error": { "value": "#BA1A1A" },
       "on-error": { "value": "#FFFFFF" },
       "success": { "value": "#4CAF50" },
       "on-success": { "value": "#FFFFFF" }
     }
   }
   ```
   各ペアで4.5:1以上を確保（WebAIM Checkerで検証）。

2. **ダークモードは別トーンパレットで定義**  
   ```json
   {
     "color-dark": {
       "primary": { "value": "#D0BCFF" },
       "on-primary": { "value": "#381E72" }
     }
   }
   ```
   `prefers-color-scheme: dark` で自動切替。

3. **状態層（State layer）を半透明で重ねる**  
   ```css
   button:hover::before {
     content: '';
     position: absolute;
     inset: 0;
     background: var(--color-on-primary);
     opacity: 0.08; /* Material 3規定 */
   }
   ```

4. **コントラスト比を自動テストに組み込む**  
   ```js
   // axe-coreなどでCIパイプラインに追加
   await axe.run({ rules: { 'color-contrast': { enabled: true } } });
   ```

*根拠: [Material 3 Color System](https://m3.material.io/styles/color/system/overview), [WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum), [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)*

---

### 3) タイポとレイアウト（可変フォント/clamp()/論理プロパティ）

**手順:**

1. **可変フォントで複数ウェイトを1ファイル化**  
   ```css
   @font-face {
     font-family: 'Inter';
     src: url('Inter-Variable.woff2') format('woff2-variations');
     font-weight: 100 900;
   }
   ```

2. **clamp()で流体タイポスケールを定義**  
   ```css
   :root {
     --font-size-body: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
     --font-size-h1: clamp(2rem, 1.5rem + 2vw, 3rem);
   }
   ```

3. **論理プロパティで多言語対応**  
   ```css
   .container {
     padding-inline: var(--spacing-md); /* 左右→inline */
     padding-block: var(--spacing-sm);  /* 上下→block */
     max-inline-size: 65ch; /* 行長制限 */
   }
   ```

4. **行間・行長をコンテンツタイプ別に調整**  
   - 本文: `line-height: 1.5`, `max-inline-size: 65ch`
   - 見出し: `line-height: 1.2`
   - コード: `line-height: 1.6`, `font-variant-ligatures: none`

*根拠: [Google Fonts Knowledge](https://fonts.google.com/knowledge/using_type), [Utopia](https://utopia.fyi/), [MDN 論理プロパティ](https://developer.mozilla.org/ja/docs/Web/CSS/Guides/Logical_properties_and_values)*

---

### 4) コンポーネント（状態管理/相互作用/ARIAロール）

**手順:**

1. **ネイティブ要素を優先し、ARIAは補完のみ**  
   ```html
   <!-- Good -->
   <button type="submit">送信</button>
   
   <!-- Bad: カスタム要素は最小限に -->
   <div role="button" tabindex="0" onclick="...">送信</div>
   ```

2. **状態を視覚とARIA両方で伝達**  
   ```html
   <button aria-disabled="true" disabled class="btn-disabled">
     <span aria-hidden="true">🚫</span> 送信不可
   </button>
   ```
   ```css
   .btn-disabled {
     background: var(--color-surface-variant);
     color: var(--color-on-surface-variant);
     opacity: 0.38; /* Material 3規定 */
   }
   ```

3. **フォーカス管理をWAI-ARIA APGパターンで実装**  
   - Tab/Shift+Tab: 要素間移動
   - Enter/Space: 決定
   - Escape: キャンセル/閉じる
   - 矢印キー: リスト内移動（roving tabindex）

   ```js
   // ダイアログ例
   dialog.addEventListener('keydown', (e) => {
     if (e.key === 'Escape') {
       dialog.close();
       triggerButton.focus();
     }
   });
   ```

4. **最小タッチターゲットを余白で確保**  
   ```css
   button {
     min-block-size: 44px; /* iOS/Android推奨 */
     min-inline-size: 44px;
     padding: 0; /* 余白で視覚サイズ調整 */
   }
   button::before {
     content: '';
     position: absolute;
     inset: -8px; /* タッチ領域拡張 */
   }
   ```

*根拠: [Material Design 3 Components](https://m3.material.io/components), [Apple HIG Touch Targets](https://developer.apple.com/design/human-interface-guidelines/inputs), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/), [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/quickref/#target-size-minimum)*

---

### 5) 入力チェック（同期/非同期/UI連携）

**手順:**

1. **HTML5バリデーションで基本チェック**  
   ```html
   <input type="email" required 
          aria-describedby="email-error"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$">
   <span id="email-error" role="alert" class="error-text"></span>
   ```

2. **同期検証をaria-live="polite"で通知**  
   ```html
   <label for="username">ユーザー名 
     <span aria-live="polite" id="username-hint">
       残り<span id="char-count">20</span>文字
     </span>
   </label>
   <input id="username" maxlength="20" 
          aria-describedby="username-hint">
   ```
   ```js
   input.addEventListener('input', (e) => {
     const remaining = 20 - e.target.value.length;
     document.getElementById('char-count').textContent = remaining;
   });
   ```

3. **非同期検証をrole="status"で通知**  
   ```html
   <input id="email" type="email" aria-describedby="email-status">
   <div id="email-status" role="status"></div>
   ```
   ```js
   async function checkEmailAvailability(email) {
     const response = await fetch(`/api/check-email?email=${email}`);
     const data = await response.json();
     const status = document.getElementById('email-status');
     
     if (data.available) {
       status.textContent = '✓ 利用可能';
       status.className = 'success';
     } else {
       status.textContent = '✗ すでに登録済み';
       status.className = 'error';
     }
   }
   
   input.addEventListener('blur', (e) => {
     if (e.target.validity.valid) {
       checkEmailAvailability(e.target.value);
     }
   });
   ```

4. **エラー時にaria-invalidとaria-describedbyを更新**  
   ```js
   function showError(input, message) {
     input.setAttribute('aria-invalid', 'true');
     const errorId = input.id + '-error';
     input.setAttribute('aria-describedby', errorId);
     
     const errorSpan = document.getElementById(errorId);
     errorSpan.textContent = message;
     errorSpan.style.display = 'block';
   }
   ```

*根拠: [GOV.UK Design System Forms](https://design-system.service.gov.uk/patterns/validation/), [Inclusive Components Forms](https://inclusive-components.design/a-todo-list/), [WAI-ARIA live regions](https://www.w3.org/TR/wai-aria-1.2/#live_region_roles)*

---

### 6) エラーメッセージ（コピー原則/エラー要約/フォーカス管理）

**手順:**

1. **エラー要約をページ上部に配置**  
   ```html
   <div id="error-summary" role="alert" tabindex="-1" hidden>
     <h2>以下の問題を修正してください</h2>
     <ul>
       <li><a href="#email">メールアドレスに@を含めてください</a></li>
       <li><a href="#password">パスワードは8文字以上必要です</a></li>
     </ul>
   </div>
   ```

2. **送信失敗時、要約へフォーカス移動**  
   ```js
   form.addEventListener('submit', async (e) => {
     e.preventDefault();
     const errors = validateForm(form);
     
     if (errors.length > 0) {
       const summary = document.getElementById('error-summary');
       summary.hidden = false;
       summary.focus(); // フォーカス移動
       
       // 各フィールドにエラー表示
       errors.forEach(err => showError(err.field, err.message));
     }
   });
   ```

3. **エラーメッセージは行動を明示**  
   - ❌「無効な入力」
   - ✅「メールアドレスに@を含めてください（例: user@example.com）」
   
   テンプレート: 「[何が問題か] + [どうすればよいか]」

4. **個別エラーをaria-describedbyで紐付け**  
   ```html
   <label for="password">パスワード</label>
   <input id="password" type="password" 
          aria-describedby="password-hint password-error"
          aria-invalid="true">
   <span id="password-hint">8文字以上、数字を含む</span>
   <span id="password-error" role="alert" class="error-text">
     パスワードは8文字以上必要です
   </span>
   ```

*根拠: [GOV.UK Error Summary](https://design-system.service.gov.uk/components/error-summary/), [GOV.UK Error Message](https://design-system.service.gov.uk/components/error-message/), [Inclusive Components](https://inclusive-components.design/)*

---

### 7) レスポンシブ最適化（流体スケール/多言語・縦書き配慮）

**手順:**

1. **流体スケールでブレークポイント不要化**  
   ```css
   :root {
     --space-s: clamp(0.5rem, 0.25rem + 1vw, 1rem);
     --space-m: clamp(1rem, 0.5rem + 2vw, 2rem);
     --space-l: clamp(2rem, 1rem + 4vw, 4rem);
   }
   
   .container {
     padding-inline: var(--space-m);
     gap: var(--space-s);
   }
   ```

2. **コンテナクエリで部分的な条件分岐**  
   ```css
   .card-container {
     container-type: inline-size;
   }
   
   @container (min-width: 400px) {
     .card {
       grid-template-columns: 1fr 1fr;
     }
   }
   ```

3. **論理プロパティで自動RTL対応**  
   ```css
   /* 物理方向（悪い例） */
   margin-left: 1rem; /* RTLで反転しない */
   
   /* 論理プロパティ（良い例） */
   margin-inline-start: 1rem; /* RTLで自動反転 */
   ```

4. **writing-modeで縦書き対応**  
   ```css
   .vertical-text {
     writing-mode: vertical-rl; /* 右から左への縦書き */
     text-orientation: upright; /* 文字を正立 */
   }
   ```

5. **ビューポート単位とclamp()の組み合わせ**  
   Utopiaツールで計算例:
   - 最小画面（320px）で16px
   - 最大画面（1280px）で20px
   - 計算式: `clamp(1rem, 0.875rem + 0.5vw, 1.25rem)`

*根拠: [Utopia](https://utopia.fyi/), [MDN 論理プロパティ](https://developer.mozilla.org/ja/docs/Web/CSS/Guides/Logical_properties_and_values), [MDN writing-mode](https://developer.mozilla.org/ja/docs/Web/CSS/writing-mode)*

---

## よくある落とし穴

1. **トークンを使わず生値を直書き**  
   各所に `#6750A4` を散らすと変更が困難に。必ずCSS Custom Propertyで集約せよ。

2. **aria-labelだけで状態を伝え、視覚変化を欠く**  
   スクリーンリーダーユーザー以外（ロービジョン・色覚異常）が見落とす。色・アイコン・テキストを併用せよ。

3. **clamp()の下限・上限が極端**  
   `clamp(0.5rem, 5vw, 5rem)` のように変化幅が大きすぎると、特定画面幅で読みづらい。Utopiaで適切な範囲を算出せよ。

4. **カスタムコンポーネントにキーボード操作を実装し忘れ**  
   `<div onclick="...">` だけではTabで到達不可。`tabindex="0"` + Enter/Space処理 + ARIAロールが必須。

5. **エラーメッセージが曖昧**  
   「入力エラー」だけでは何をすべきか不明。具体的な修正方法（例付き）を必ず示せ。

6. **非同期検証の結果をaria-liveで通知しない**  
   スクリーンリーダーが変化を検出できず、ユーザーはエラーに気づかない。`role="status"` か `aria-live="polite"` を付与せよ。

7. **物理プロパティで左右を決め打ち**  
   `margin-left` はRTL環境で逆向きにならない。`margin-inline-start` を使い、論理軸で考えよ。

---

## QAチェックリスト

1. **Tab**キーで全インタラクティブ要素（ボタン・リンク・入力）へ順番に到達できる
2. エラー発生時、フォーカスがエラー要約（`role="alert"`）へ自動移動する
3. 各エラーメッセージが対応する入力フィールドに`aria-describedby`で紐付いている
4. 本文のコントラスト比が4.5:1以上、大見出し（18pt以上）が3:1以上である（WebAIM Checkerで検証済み）
5. キーボードのみで全コンポーネントの状態（hover/focus/active/disabled）が識別可能である（色・アイコン・テキストで区別）
6. ビューポート幅320px～1280pxで文字サイズ・余白が`clamp()`により連続的に変化する
7. `margin-inline-start`等の論理プロパティを使用し、`margin-left`等の物理プロパティがない
8. 状態色（success/warning/error/info）が各トーンで一貫したコントラスト比を保つ
9. `tokens.json`がStyle Dictionary設定ファイル経由でCSS/iOS/Android各形式へ出力可能である
10. 各ルール・手順に参照元ソース（Material Design 3、WCAG、GOV.UK等）の具体的URLを付与している

---

## 最小サンプル

**トークン定義（tokens.json）:**
```json
{
  "color": {
    "primary": { "value": "#6750A4" },
    "on-primary": { "value": "#FFFFFF" },
    "error": { "value": "#BA1A1A" },
    "on-error": { "value": "#FFFFFF" },
    "surface": { "value": "#FEF7FF" }
  },
  "spacing": {
    "sm": { "value": "8px" },
    "md": { "value": "16px" }
  },
  "typography": {
    "body-size": { "value": "clamp(1rem, 0.875rem + 0.5vw, 1.125rem)" },
    "body-line-height": { "value": "1.5" }
  }
}
```

**HTML（ボタン + 入力 + エラー要約）:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>実装サンプル</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <!-- エラー要約 -->
    <div id="error-summary" role="alert" tabindex="-1" hidden>
      <h2>以下の問題を修正してください</h2>
      <ul id="error-list"></ul>
    </div>

    <form id="sample-form" novalidate>
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          aria-describedby="email-error"
          aria-invalid="false">
        <span id="email-error" class="error-text" role="alert"></span>
      </div>

      <button type="submit" class="btn-primary">送信</button>
    </form>
  </div>

  <script src="script.js"></script>
</body>
</html>
```

**CSS（tokens.css生成後）:**
```css
/* Style Dictionaryで生成されたトークン */
:root {
  --color-primary: #6750A4;
  --color-on-primary: #FFFFFF;
  --color-error: #BA1A1A;
  --color-on-error: #FFFFFF;
  --color-surface: #FEF7FF;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --typography-body-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  --typography-body-line-height: 1.5;
}

* {
  box-sizing: border-box;
}

body {
  font-size: var(--typography-body-size);
  line-height: var(--typography-body-line-height);
  background: var(--color-surface);
  margin: 0;
  padding: var(--spacing-md);
}

.container {
  max-inline-size: 600px;
  margin-inline: auto;
}

/* エラー要約 */
#error-summary {
  background: var(--color-error);
  color: var(--color-on-error);
  padding: var(--spacing-md);
  margin-block-end: var(--spacing-md);
  border-inline-start: 4px solid currentColor;
}

#error-summary:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

#error-summary ul {
  margin: 0;
  padding-inline-start: var(--spacing-md);
}

#error-summary a {
  color: var(--color-on-error);
  text-decoration: underline;
}

/* フォーム */
.form-group {
  margin-block-end: var(--spacing-md);
}

label {
  display: block;
  margin-block-end: var(--spacing-sm);
  font-weight: 600;
}

input {
  inline-size: 100%;
  padding-block: var(--spacing-sm);
  padding-inline: var(--spacing-sm);
  font-size: inherit;
  border: 2px solid currentColor;
  border-radius: 4px;
}

input:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

input[aria-invalid="true"] {
  border-color: var(--color-error);
}

.error-text {
  display: none;
  color: var(--color-error);
  margin-block-start: var(--spacing-sm);
  font-size: 0.875rem;
}

.error-text:not(:empty) {
  display: block;
}

/* ボタン */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding-block: 12px;
  padding-inline: var(--spacing-md);
  min-block-size: 44px;
  min-inline-size: 44px;
  font-size: inherit;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  position: relative;
}

.btn-primary:hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-on-primary);
  opacity: 0.08;
  border-radius: inherit;
}

.btn-primary:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary:active::before {
  opacity: 0.12;
}
```

**JavaScript（バリデーション・エラー管理）:**
```js
const form = document.getElementById('sample-form');
const emailInput = document.getElementById('email');
const errorSummary = document.getElementById('error-summary');
const errorList = document.getElementById('error-list');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // エラーをリセット
  clearErrors();
  
  // バリデーション
  const errors = [];
  
  if (!emailInput.value) {
    errors.push({
      field: emailInput,
      message: 'メールアドレスを入力してください'
    });
  } else if (!emailInput.validity.valid) {
    errors.push({
      field: emailInput,
      message: 'メールアドレスに@を含めてください（例: user@example.com）'
    });
  }
  
  if (errors.length > 0) {
    showErrors(errors);
  } else {
    alert('送信成功！');
  }
});

function showErrors(errors) {
  // エラー要約を表示
  errorSummary.hidden = false;
  errorList.innerHTML = '';
  
  errors.forEach(error => {
    const { field, message } = error;
    
    // 要約にリンクを追加
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${field.id}`;
    link.textContent = message;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      field.focus();
    });
    li.appendChild(link);
    errorList.appendChild(li);
    
    // 個別フィールドにエラー表示
    field.setAttribute('aria-invalid', 'true');
    const errorSpan = document.getElementById(`${field.id}-error`);
    errorSpan.textContent = message;
  });
  
  // エラー要約へフォーカス移動
  errorSummary.focus();
}

function clearErrors() {
  errorSummary.hidden = true;
  errorList.innerHTML = '';
  
  document.querySelectorAll('[aria-invalid="true"]').forEach(field => {
    field.setAttribute('aria-invalid', 'false');
  });
  
  document.querySelectorAll('.error-text').forEach(span => {
    span.textContent = '';
  });
}
```

---

## 参考

- **Material Design 3 — Components**: https://m3.material.io/components  
  部品の状態・動作・視覚仕様（ボタン・入力・トーン管理）

- **Material 3 — Color System**: https://m3.material.io/styles/color/system/overview  
  トーンパレット・ダイナミックカラー・状態色の設計原則

- **Apple Human Interface Guidelines**: https://developer.apple.com/jp/design/human-interface-guidelines/  
  タッチターゲット（44pt）・キーボードナビゲーション・プラットフォーム標準

- **Fluent 2 Design System**: https://fluent2.microsoft.design/  
  Microsoftのコンポーネント実装・アクセシビリティパターン

- **GOV.UK Design System**: https://design-system.service.gov.uk/  
  フォームバリデーション・エラー要約・明確なエラーメッセージのベストプラクティス

- **Inclusive Components**: https://inclusive-components.design/  
  ARIA・キーボード操作・エラー連携の具体実装（Toggle、Forms等）

- **WCAG 2.2 Quick Reference**: https://www.w3.org/WAI/WCAG22/quickref/  
  達成基準（コントラスト・キーボード・エラー特定）と実装テクニック

- **WAI-ARIA Authoring Practices Guide**: https://www.w3.org/WAI/ARIA/apg/  
  ロール・プロパティ・キーボードパターン（ダイアログ・メニュー・ロービングタブ）の正規実装

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/  
  コントラスト比の数値検証ツール（AA/AAA基準）

- **Design Tokens Community Group**: https://www.designtokens.org/  
  トークン標準仕様（交換フォーマット・命名規則・構造化）

- **Style Dictionary**: https://styledictionary.com/  
  トークンからiOS/Android/Web各形式への自動変換ツール

- **Google Fonts Knowledge — Using type**: https://fonts.google.com/knowledge/using_type  
  行長・行間・可変フォント・Webタイポの実務指針

- **MDN — CSS論理プロパティ**: https://developer.mozilla.org/ja/docs/Web/CSS/Guides/Logical_properties_and_values  
  inline/block軸・RTL/縦書き対応の基礎

- **Utopia — Fluid Responsive Design**: https://utopia.fyi/  
  clamp()による流体タイポ/スペースのスケール計算ツール

- **Figma — Variables & Styles**: https://help.figma.com/hc/en-us/articles/18490793776023  
  変数/トークン管理でデザインと実装を同期する手法
