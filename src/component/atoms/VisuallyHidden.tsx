import styled from '@emotion/styled';

import type { ElementType, HTMLAttributes, ReactNode } from 'react';

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

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /** レンダリングする要素のタグ */
  as?: ElementType;
  /** 子要素 */
  children: ReactNode;
}

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
 * ```
 */
export const VisuallyHidden = ({ as: Component = 'span', children, ...props }: VisuallyHiddenProps) => {
  return (
    <HiddenElement as={Component} {...props}>
      {children}
    </HiddenElement>
  );
};
