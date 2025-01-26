import styled from '@emotion/styled';

import type { CSSProperties, FC, ReactNode } from 'react';

type FlexProps = {
  className?: string | undefined;
  children: ReactNode;
  align?: 'center' | 'flex-start' | 'flex-end' | 'space-between';
  wrap?: 'wrap' | 'nowrap';
  gap?: number;
  style?: CSSProperties;
};

const Component: FC<FlexProps> = ({ className, children, style }) => {
  return (
    <div className={className} style={{ ...style }}>
      {children}
    </div>
  );
};

export const Flex = styled(Component)`
  display: flex;
  flex-wrap: ${({ wrap }) => wrap || 'wrap'};
  gap: ${({ gap }) => gap || 0}px;
  align-content: ${({ align }) => align || 'center'};
  align-items: ${({ align }) => align || 'center'};
`;

export const FlexRow = styled(Flex)`
  flex-direction: row;
`;

export const InlineFlexRow = styled(FlexRow)`
  display: inline-flex;
`;

export const FlexColumn = styled(Flex)`
  flex-direction: column;
`;

export const InlineFlexColumn = styled(FlexColumn)`
  display: inline-flex;
`;
