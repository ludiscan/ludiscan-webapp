// atoms/Divider.tsx
import styled from '@emotion/styled';

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

export const Divider = styled(DividerComponent)<DividerProps>`
  background-color: ${({ color, theme }) => color || theme.colors.border.main || '#e0e0e0'};
  ${({ orientation, thickness, margin }) =>
  orientation === 'vertical'
    ? `
      width: ${thickness || '1px'};
      height: 100%;
      margin: ${margin || '0 8px'};
    `
    : `
      height: ${thickness || '1px'};
      width: 100%;
      margin: ${margin || '8px 0'};
    `}
`;
