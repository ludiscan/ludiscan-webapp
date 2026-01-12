import styled from '@emotion/styled';

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

const HiddenElement = styled.span`
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

/** コンポーネント固有のProps */
interface VisuallyHiddenOwnProps<T extends ElementType = 'span'> {
  /** レンダリングする要素のタグ */
  as?: T;
  /** 子要素 */
  children: ReactNode;
}

/** asに指定した要素の型に応じてpropsを推論する */
export type VisuallyHiddenProps<T extends ElementType = 'span'> = VisuallyHiddenOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof VisuallyHiddenOwnProps<T>>;

/**
 * スクリーンリーダー専用テキスト
 * 視覚的には非表示だが、スクリーンリーダーでは読み上げられる
 *
 * @example
 * ```tsx
 * <button>
 *   <Icon />
 *   <VisuallyHidden>メニューを開く</VisuallyHidden>
 * </button>
 *
 * // as="label"の場合、htmlForが使える
 * <VisuallyHidden as="label" htmlFor="input-id">ラベル</VisuallyHidden>
 * ```
 */
export const VisuallyHidden = <T extends ElementType = 'span'>({ as, children, ...props }: VisuallyHiddenProps<T>) => {
  const Component = as ?? 'span';
  return (
    <HiddenElement as={Component} {...props}>
      {children}
    </HiddenElement>
  );
};
