// atoms/Divider.tsx
import styled from '@emotion/styled';

import type { Theme } from '@emotion/react';

export type DividerProps = {
  className?: string;
  /**
   * Divider の向き。水平の場合は横幅いっぱい、垂直の場合は高さいっぱいとなります。
   * デフォルトは 'horizontal' です。
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Divider の色。テーマの border 色を利用する場合は省略可。
   */
  color?: string;
  /**
   * Divider の太さ。水平の場合は高さ、垂直の場合は横幅として適用されます。
   * 例: '1px', '2px'
   */
  thickness?: string;
  /**
   * Divider のマージン。水平の場合は上下、垂直の場合は左右に適用されます。
   * 例: '8px 0', '0 8px'
   */
  margin?: string;
};

const DividerComponent = ({ className }: DividerProps) => {
  return <div className={className} />;
};

const Orientation = (props: DividerProps & { theme: Theme }) => {
  const { orientation, thickness, margin, theme } = props;
  if (orientation === 'vertical') {
    return {
      width: thickness || theme.borders.width.thin,
      height: '100%',
      margin: margin || `0 ${theme.spacing.sm}`,
    };
  }
  return {
    height: thickness || theme.borders.width.thin,
    width: '100%',
    margin: margin || `${theme.spacing.sm} 0`,
  };
};

export const Divider = styled(DividerComponent)<DividerProps>`
  background-color: ${({ color, theme }) => color || theme.colors.border.default};
  ${(props) => Orientation({ ...props, theme: props.theme })}
`;
