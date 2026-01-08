import styled from '@emotion/styled';
import { forwardRef } from 'react';

import type { CSSProperties, ReactNode } from 'react';

export type FlexProps = {
  className?: string | undefined;
  children: ReactNode;
  align?: 'center' | 'flex-start' | 'flex-end' | 'space-between';
  wrap?: 'wrap' | 'nowrap';
  gap?: number;
  style?: CSSProperties;
};

const Component = forwardRef<HTMLDivElement, FlexProps>(({ className, children, style }, ref) => {
  return (
    <div ref={ref} className={className} style={{ ...style }}>
      {children}
    </div>
  );
});

Component.displayName = 'Flex';

export const Flex = styled(Component)`
  display: flex;
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
  gap: ${({ gap }) => gap || 0}px;
  align-content: ${({ align }) => align || 'flex-start'};
  align-items: ${({ align }) => align || 'flex-start'};
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
