import styled from '@emotion/styled';

import type { FC } from 'react';

export type SpacerProps = {
  className?: string;
  size: number;
};

const Component: FC<SpacerProps> = ({ className }) => {
  return <div className={className} />;
};

export const HorizontalSpacer = styled(Component)`
  width: ${({ size }) => size}px;
`;

export const VerticalSpacer = styled(Component)`
  height: ${({ size }) => size}px;
`;
