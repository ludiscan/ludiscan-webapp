import type { PerformanceMonitorApi } from '@react-three/drei';
import type { FC } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';

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

export const PerformanceList = Component;
