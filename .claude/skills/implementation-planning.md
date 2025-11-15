# Implementation Planning Skill

実装タスクを計画的に進めるためのスキルです。複雑な実装や複数ステップを要するタスクの場合、まず計画を立ててから実装を進めます。

## When to Use This Skill

以下の場合にこのスキルを使用してください:

1. **複雑な実装タスク** - 3つ以上のステップや複数のファイル変更が必要な場合
2. **新機能の追加** - 新しいコンポーネント、API、機能を追加する場合
3. **リファクタリング** - 複数のファイルにまたがる変更が必要な場合
4. **バグ修正** - 調査と修正が複数ステップにわたる場合
5. **明確な計画が必要な場合** - ユーザーが計画的な進行を希望している場合

## When NOT to Use This Skill

以下の場合は計画ファイルを作成せず、直接実装してください:

1. 単一ファイルの小さな変更（数行の修正）
2. タイポ修正やコメント追加
3. 既存のパターンを使った簡単な追加
4. 明らかに1ステップで完了するタスク

## Implementation Planning Process

### Step 1: Create Implementation Plan File

リポジトリのルートに一時的な計画ファイルを作成します:

**ファイル名形式**: `.implementation-plan-{session-id-suffix}.md`
- `session-id-suffix`: セッションIDの最後の8文字を使用
- 例: `.implementation-plan-n2CmeYid.md`

**計画ファイルの構造**:

```markdown
# Implementation Plan: [タスク名]

**Created**: [日時]
**Status**: PLANNING

## Overview

[実装全体の概要を2-3文で説明]

## Goals

- [ ] ゴール1
- [ ] ゴール2
- [ ] ゴール3

## Background Context

[このタスクの背景や理由を説明]

## Implementation Steps

### 1. [ステップ名]
**Status**: PENDING

**What to do**:
- 具体的なアクション1
- 具体的なアクション2

**Files to modify**:
- `path/to/file1.ts` - [変更内容]
- `path/to/file2.tsx` - [変更内容]

**Technical notes**:
- [技術的な注意点やヒント]

**Completion criteria**:
- [このステップの完了条件]

---

### 2. [次のステップ名]
**Status**: PENDING

[同様の構造で続ける]

---

## Testing Plan

- [ ] テスト項目1
- [ ] テスト項目2
- [ ] ビルドが成功すること
- [ ] Lintエラーがないこと

## Rollback Plan

もし実装中に問題が発生した場合:
1. [ロールバック手順]

## Notes & Considerations

- [その他の注意事項や考慮点]

## Progress Log

<!-- 実装中にここに進捗を記録 -->

```

### Step 2: Generate Comprehensive Plan

計画を作成する際は以下を考慮してください:

**Overview**:
- タスク全体の目的を明確に記載
- 何を実装するのか、なぜ実装するのかを説明
- ユーザーが得られる価値を明記

**Goals**:
- 測定可能な目標を設定
- チェックボックス形式で進捗を追跡可能に
- 3-7個程度の主要ゴールに絞る

**Implementation Steps**:
- **各ステップは独立して実行可能**にする
- **順序が明確**で、依存関係がわかるようにする
- **具体的なファイル名とアクション**を記載する
- **技術的な詳細**を含める（使用するhook、component、API等）
- **完了条件**を明確にする

**ステップの粒度**:
- 1ステップは10-30分程度で完了できる作業量
- 大きすぎる場合はサブステップに分割
- 小さすぎる場合は統合

**避けるべき曖昧な表現**:
- ❌ "必要に応じて修正する" → ✅ "XComponentのpropsにYを追加する"
- ❌ "適切に実装する" → ✅ "useCallbackでhandleClickをメモ化する"
- ❌ "テストを書く" → ✅ "Button.test.tsxにクリックイベントのテストを追加"

**実装中に判断が必要な箇所**:
- 複数の実装方法がある場合は、各選択肢と推奨理由を記載
- プロジェクトの既存パターンに従うことを明記
- 不明点があれば計画段階で明示し、ユーザーに確認

### Step 3: User Confirmation

計画ファイルを作成したら、**必ずユーザーに確認を求める**:

```
実装計画を作成しました: `.implementation-plan-{suffix}.md`

この計画で実装を進めてよろしいでしょうか？
もし修正が必要な箇所があれば、お知らせください。

計画の概要:
- [ゴール1]
- [ゴール2]
- [ゴール3]

実装ステップ数: X
推定作業時間: Y分

承認いただけましたら、実装を開始します。
```

**ユーザーからの承認を得るまで実装を開始しない**ことが重要です。

### Step 4: Execute Implementation with Progress Tracking

ユーザーの承認を得たら、実装を開始します。

**各ステップの実行プロセス**:

1. **ステップ開始時**:
   - 計画ファイルのステータスを `PENDING` → `IN_PROGRESS` に更新
   - Progress Logに開始時刻を記録

   ```markdown
   ### 1. [ステップ名]
   **Status**: IN_PROGRESS

   ## Progress Log

   ### 2024-01-15 14:30 - Step 1 Started
   Starting implementation of [ステップ名]
   ```

2. **実装中**:
   - ファイルを作成・編集する
   - コードを書く
   - 必要に応じてテストを実行

3. **ステップ完了時**:
   - 計画ファイルのステータスを `IN_PROGRESS` → `COMPLETED` に更新
   - Progress Logに完了内容を記録
   - 次のステップに移る前に、完了条件が満たされているか確認

   ```markdown
   ### 1. [ステップ名]
   **Status**: COMPLETED

   ## Progress Log

   ### 2024-01-15 14:30 - Step 1 Started
   Starting implementation of [ステップ名]

   ### 2024-01-15 14:45 - Step 1 Completed
   - Created Button.tsx with primary/secondary schemes
   - Added Emotion styled component pattern
   - Used theme tokens for colors
   - Added className prop for extensibility

   **Files changed**:
   - `src/component/atoms/Button.tsx` (created)

   **Issues encountered**: None
   ```

4. **問題が発生した場合**:
   - Progress Logに問題内容を記録
   - 解決方法を記載
   - 必要に応じて計画を調整（新しいステップを追加等）

   ```markdown
   ### 2024-01-15 15:00 - Issue Encountered
   **Problem**: TypeScript error in Button.tsx - theme type not found
   **Solution**: Imported useSharedTheme hook and accessed theme from context
   **Impact**: Added extra import, no changes to plan
   ```

**Progress Logの記録タイミング**:
- 各ステップの開始時
- 各ステップの完了時
- 問題やエラーが発生した時
- 計画からの逸脱が発生した時
- 重要な発見や学びがあった時

### Step 5: Testing & Validation

全ステップ完了後、Testing Planに従ってテストを実行:

```markdown
## Testing Plan

- [x] Button component renders correctly
- [x] Primary/secondary schemes apply correct colors
- [x] onClick handler fires on click
- [x] Build succeeds: `bun run build:dev`
- [x] Lint passes: `bun run lint`

## Progress Log

### 2024-01-15 16:00 - Testing Phase
- Ran `bun run build:dev` - SUCCESS
- Ran `bun run lint` - SUCCESS
- Manual testing in Storybook - All variants render correctly
```

### Step 6: Final Update & Completion

実装完了時:

1. 計画ファイルのステータスを `PLANNING` → `COMPLETED` に更新
2. Goals セクションの全チェックボックスを完了にする
3. Progress Logに最終サマリーを記録
4. ユーザーに完了報告

```markdown
# Implementation Plan: [タスク名]

**Created**: 2024-01-15 14:00
**Completed**: 2024-01-15 16:30
**Status**: COMPLETED

## Goals

- [x] ゴール1
- [x] ゴール2
- [x] ゴール3

## Progress Log

### 2024-01-15 16:30 - Implementation Completed

**Summary**:
All implementation steps completed successfully.

**Files changed**:
- `src/component/atoms/Button.tsx` (created)
- `src/component/atoms/Button.stories.tsx` (created)
- `src/component/atoms/index.ts` (updated)

**Testing results**:
- Build: ✅ SUCCESS
- Lint: ✅ SUCCESS
- Manual testing: ✅ PASSED

**Total time**: 2 hours

**Next steps**:
- User can now use the Button component
- Ready for PR creation if needed
```

ユーザーへの報告:

```
実装が完了しました！

✅ 全ての目標を達成
✅ ビルド成功
✅ Lint通過
✅ テスト完了

詳細は `.implementation-plan-{suffix}.md` に記録しています。

変更されたファイル:
- src/component/atoms/Button.tsx (作成)
- src/component/atoms/Button.stories.tsx (作成)
- src/component/atoms/index.ts (更新)

次のステップが必要であればお知らせください。
```

### Step 7: Cleanup (Optional)

実装完了後、計画ファイルの扱い:

1. **保持する場合** (推奨):
   - ファイルは残しておき、履歴として参照可能に
   - .gitignoreに追加されているため、コミットされない

2. **削除する場合**:
   - ユーザーが明示的に削除を依頼した場合のみ
   - `rm .implementation-plan-{suffix}.md`

## Best Practices

### Planning Phase

1. **Be Specific**: 曖昧な表現を避け、具体的なアクションを記載
2. **Be Comprehensive**: 一度計画を立てたら、途中でユーザーに質問しなくて済むように
3. **Be Realistic**: 各ステップの作業量を現実的に見積もる
4. **Be Structured**: 論理的な順序でステップを配置
5. **Be Clear**: 完了条件を明確にする

### Implementation Phase

1. **Follow the Plan**: 計画に従って実装する（必要に応じて調整は可）
2. **Document Changes**: 計画からの逸脱は必ず記録
3. **Update Progress**: 各ステップの完了時に必ず更新
4. **Handle Issues**: 問題発生時は記録と解決策を明記
5. **Test Regularly**: 各ステップ完了後に動作確認

### Communication

1. **Initial Confirmation**: 計画作成後、必ずユーザー確認を取る
2. **Progress Updates**: 長時間かかる実装の場合、途中経過を報告
3. **Completion Report**: 完了時に明確なサマリーを提供
4. **Be Transparent**: 問題や変更があれば正直に報告

## Example Scenarios

### Scenario 1: New Feature Implementation

```markdown
# Implementation Plan: Add User Profile Edit Feature

**Created**: 2024-01-15 10:00
**Status**: PLANNING

## Overview

ユーザーがプロフィール情報（名前、メールアドレス、アバター）を編集できる機能を実装します。既存のユーザー情報表示ページに編集機能を追加し、APIと連携してデータを保存します。

## Goals

- [ ] ユーザーがプロフィール情報を編集できる
- [ ] 編集内容がAPIに保存される
- [ ] バリデーションエラーが適切に表示される
- [ ] レスポンシブデザインに対応

## Background Context

現在、ユーザープロフィールは表示のみで編集機能がありません。ユーザーからのフィードバックで編集機能の要望が多く、優先度の高い機能として実装します。

## Implementation Steps

### 1. Create Profile Edit Form Component
**Status**: PENDING

**What to do**:
- ProfileEditFormコンポーネントを作成
- LabeledInput, TextArea, Button を組み合わせて編集フォームを構築
- useStateでフォームの状態を管理

**Files to modify**:
- `src/component/organisms/ProfileEditForm.tsx` (create)

**Technical notes**:
- LabeledInputコンポーネントを使用（既存のmolecule）
- フォームのバリデーションはまだ実装しない（次のステップで）
- Emotion styled componentパターンに従う

**Completion criteria**:
- フォームが表示される
- 各フィールドに入力できる
- TypeScriptエラーがない

---

### 2. Add Form Validation
**Status**: PENDING

**What to do**:
- メールアドレスのバリデーションを追加
- 名前の文字数制限を追加（1-50文字）
- エラーメッセージを表示するロジックを実装

**Files to modify**:
- `src/component/organisms/ProfileEditForm.tsx` (update)
- `src/utils/validation.ts` (create) - バリデーション関数を追加

**Technical notes**:
- 既存のvalidateEmail関数がある場合はそれを使用
- エラーメッセージはTextコンポーネントで表示
- theme.colors.semantic.error を使用

**Completion criteria**:
- 無効なメールアドレスでエラーが表示される
- 文字数制限を超えるとエラーが表示される
- バリデーションが通る場合はエラーが表示されない

---

### 3. Connect to API
**Status**: PENDING

**What to do**:
- updateUserProfile API エンドポイントを実装
- useMutationでプロフィール更新のmutationを作成
- 送信ボタンのonClickでAPIを呼び出す

**Files to modify**:
- `src/hooks/useUpdateUserProfile.ts` (create)
- `src/component/organisms/ProfileEditForm.tsx` (update)

**Technical notes**:
- TanStack Query の useMutation を使用
- エラーハンドリングを実装
- 成功時はトースト通知を表示
- API型は @generated/api.d.ts から使用

**Completion criteria**:
- API呼び出しが成功する
- エラー時に適切なメッセージが表示される
- 成功時にトースト通知が表示される

---

### 4. Integrate into Profile Page
**Status**: PENDING

**What to do**:
- ProfilePageにProfileEditFormを統合
- 編集モード/表示モードの切り替えを実装
- 編集ボタンと保存/キャンセルボタンを追加

**Files to modify**:
- `src/pages/profile/index.page.tsx` (update)

**Technical notes**:
- useStateで編集モードを管理
- 編集モード時はフォーム、表示モード時は既存の表示コンポーネント
- キャンセル時は変更を破棄

**Completion criteria**:
- 編集ボタンで編集モードに切り替わる
- キャンセルボタンで元に戻る
- 保存成功後、表示モードに戻る

---

### 5. Add Responsive Design
**Status**: PENDING

**What to do**:
- モバイル表示の対応
- useIsDesktop()でレイアウトを調整

**Files to modify**:
- `src/component/organisms/ProfileEditForm.tsx` (update)

**Technical notes**:
- useIsDesktop() フックを使用
- モバイルでは縦並び、デスクトップでは横並びに配置

**Completion criteria**:
- モバイルで適切に表示される
- デスクトップで適切に表示される

---

## Testing Plan

- [ ] フォームが正しく表示される
- [ ] バリデーションが正しく動作する
- [ ] API呼び出しが成功する
- [ ] エラーケースが適切に処理される
- [ ] レスポンシブデザインが機能する
- [ ] ビルドが成功する: `bun run build:dev`
- [ ] Lintが通る: `bun run lint`

## Rollback Plan

もし実装中に問題が発生した場合:
1. 作成したファイルを削除
2. 変更したファイルをgit checkoutで元に戻す
3. 問題を分析して計画を再調整

## Notes & Considerations

- アバター画像のアップロード機能は今回のスコープ外（将来の拡張として検討）
- API のレスポンス時間が長い場合、ローディング状態を追加する必要があるかもしれない

## Progress Log

<!-- 実装開始後にここに記録 -->
```

### Scenario 2: Refactoring Task

```markdown
# Implementation Plan: Refactor Theme System to Use Context

**Created**: 2024-01-15 11:00
**Status**: PLANNING

## Overview

現在、テーマは直接importされているが、一貫性のためにuseSharedTheme()フックを使用するようにリファクタリングします。

## Goals

- [ ] 全コンポーネントでuseSharedTheme()を使用
- [ ] 直接importを削除
- [ ] 既存の動作を維持
- [ ] TypeScriptエラーがない

## Implementation Steps

### 1. Identify All Theme Imports
**Status**: PENDING

**What to do**:
- Grepで "from '@src/styles/style'" を検索
- 影響を受けるファイルをリストアップ

**Completion criteria**:
- 全ての対象ファイルが特定されている

---

### 2. Update Components One by One
**Status**: PENDING

**What to do**:
- 各コンポーネントを順番に更新
- import文を削除
- useSharedTheme()フックを追加
- theme.colors.xxx の形式で使用

**Files to modify**:
- [ステップ1で特定されたファイル]

**Completion criteria**:
- 全ファイルが更新されている
- ビルドエラーがない

---

## Testing Plan

- [ ] 全コンポーネントが正しく表示される
- [ ] テーマが正しく適用される
- [ ] ビルド成功
- [ ] Lint通過

## Progress Log

<!-- 実装中に記録 -->
```

## Summary

このスキルは以下を実現します:

1. **計画的な実装**: 事前に詳細な計画を立てることで、スムーズな実装を実現
2. **進捗の可視化**: 計画ファイルで進捗状況を常に把握
3. **ユーザーとの協調**: 計画段階でユーザー確認を取り、認識のずれを防ぐ
4. **問題の記録**: 実装中の問題や解決策を記録し、学びを蓄積
5. **完了の明確化**: 何が完了し、何が残っているかを常に明確に

**Remember**: 計画は柔軟に調整可能です。実装中に新たな発見や問題があれば、計画を更新し、その変更をProgress Logに記録してください。
