import styled from '@emotion/styled';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { FC } from 'react';

import { FlexColumn } from '@/component/atoms/Flex.tsx';
import { Text } from '@/component/atoms/Text.tsx';

export type PerformanceListProps = {
  className?: string;
  api: PerformanceMonitorApi;
};

const Component: FC<PerformanceListProps> = ({ className, api }) => {
  return (
    <FlexColumn className={className}>
      <Text text={'Performance'} />
      <Text text={`FPS: ${api.fps}/ ${api.averages}`} />
    </FlexColumn>
  );
};

export const PerformanceList = styled(Component)``;
