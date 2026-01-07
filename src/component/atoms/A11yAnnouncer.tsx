import styled from '@emotion/styled';

import { A11Y_ANNOUNCER_ASSERTIVE_ID, A11Y_ANNOUNCER_ID, A11Y_ANNOUNCER_POLITE_ID } from '@src/hooks/useA11yAnnounce';

const AnnouncerContainer = styled.div`
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0, 0, 0, 0);
`;

const AnnouncerRegion = styled.div`
  /* 視覚的には非表示だが、スクリーンリーダーには読み上げられる */
`;

/**
 * グローバルaria-live領域コンポーネント
 * スクリーンリーダーへの動的アナウンスを提供
 *
 * _app.page.tsxに1つだけ配置する
 *
 * @example
 * ```tsx
 * // _app.page.tsx
 * function App({ Component, pageProps }: AppProps) {
 *   return (
 *     <>
 *       <A11yAnnouncer />
 *       <Component {...pageProps} />
 *     </>
 *   );
 * }
 * ```
 */
export const A11yAnnouncer = () => {
  return (
    <AnnouncerContainer id={A11Y_ANNOUNCER_ID}>
      {/* aria-live="polite": 現在の読み上げ後にアナウンス */}
      <AnnouncerRegion id={A11Y_ANNOUNCER_POLITE_ID} aria-live='polite' aria-atomic='true' role='status' />
      {/* aria-live="assertive": 即座にアナウンス（エラーなど） */}
      <AnnouncerRegion id={A11Y_ANNOUNCER_ASSERTIVE_ID} aria-live='assertive' aria-atomic='true' role='alert' />
    </AnnouncerContainer>
  );
};
