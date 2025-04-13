import styled from '@emotion/styled';

import type { TextProps } from '../atoms/Text';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';

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
  text-overflow: ellipsis;
  -webkit-line-clamp: ${({ lines }) => lines || 1};
  line-clamp: ${({ lines }) => lines || 1};
  -webkit-box-orient: vertical;
`;
