import styled from '@emotion/styled';

import { Text } from '../atoms/Text.tsx';

import type { TextProps } from '../atoms/Text.tsx';
import type { FC } from 'react';

export type ClampTextProps = TextProps & {
  width?: string;
  lines?: number;
};

const Component: FC<ClampTextProps> = (props) => {
  return <Text {...props} />;
};

export const ClampText = styled(Component)`
  display: -webkit-box;
  width: ${({ width }) => width || 'fit-content'};
  overflow: hidden;
  -webkit-line-clamp: ${({ lines }) => lines || 1};
  line-clamp: ${({ lines }) => lines || 1};
  -webkit-box-orient: vertical;
`;
