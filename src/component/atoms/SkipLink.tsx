import styled from '@emotion/styled';

import { useLocale } from '@src/hooks/useLocale';

const StyledSkipLink = styled.a`
  /* 通常は非表示 */
  position: fixed;
  inset-block-start: -100%;
  inset-inline-start: var(--spacing-md);
  z-index: 9999;
  padding-block: var(--spacing-sm);
  padding-inline: var(--spacing-md);
  font-weight: var(--typography-font-weight-semibold);
  color: ${({ theme }) => theme.colors.primary.contrast};
  text-decoration: none;

  /* スタイル */
  background-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);

  /* フォーカス時に表示 */
  &:focus,
  &:focus-visible {
    inset-block-start: var(--spacing-md);
    outline: var(--accessibility-focus-ring-width) solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: var(--accessibility-focus-ring-offset);
  }

  /* ホバー時 */
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  /* アクティブ時 */
  &:active {
    transform: scale(0.98);
  }
`;

export interface SkipLinkProps {
  /** スキップ先の要素のID */
  targetId?: string;
  /** カスタムテキスト（指定しない場合はi18nを使用） */
  text?: string;
}

/**
 * スキップリンクコンポーネント
 * キーボードユーザーがナビゲーションをスキップしてメインコンテンツへ直接移動可能
 *
 * 通常は非表示で、Tabキーでフォーカス時に表示される
 *
 * @example
 * ```tsx
 * // _app.page.tsx
 * function App({ Component, pageProps }: AppProps) {
 *   return (
 *     <>
 *       <SkipLink targetId="main-content" />
 *       <Header />
 *       <main id="main-content">
 *         <Component {...pageProps} />
 *       </main>
 *     </>
 *   );
 * }
 * ```
 */
export const SkipLink = ({ targetId = 'main-content', text }: SkipLinkProps) => {
  const { t } = useLocale();
  const linkText = text ?? t('accessibility.skipToMainContent');

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // フォーカス可能にしてフォーカスを移動
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: false });
      // スムーズスクロール
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <StyledSkipLink href={`#${targetId}`} onClick={handleClick}>
      {linkText}
    </StyledSkipLink>
  );
};
