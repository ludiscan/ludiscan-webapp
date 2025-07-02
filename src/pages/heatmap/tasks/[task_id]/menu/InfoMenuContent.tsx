import { useCallback } from 'react';
import { FaFileExport } from 'react-icons/fa';

import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useVersion } from '@src/hooks/useHeatmapState';
import { fontSizes, fontWeights } from '@src/styles/style';

export const InfoMenuContent: FC<HeatmapMenuProps> = ({ task, handleExportView }) => {
  const { data: version } = useVersion();

  const handleExportHeatmap = useCallback(async () => {
    await handleExportView();
  }, [handleExportView]);

  return (
    <InlineFlexColumn gap={4}>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`version: ${version}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`taskId: ${task.taskId}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`project: ${task.project.name}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      {task.session && (
        <InlineFlexRow align={'center'} gap={4}>
          <Text text={`session: ${task.session.name}`} fontSize={fontSizes.small} />
        </InlineFlexRow>
      )}
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`step size: ${task.stepSize}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`mode: ${task.zVisible ? '3D' : '2D'}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={8} style={{ marginTop: 8, justifyContent: 'center' }}>
        <Button onClick={handleExportHeatmap} scheme={'primary'} fontSize={'small'}>
          <FaFileExport style={{ marginRight: 4 }} />
          <Text text={'エクスポート'} fontSize={fontSizes.small} fontWeight={fontWeights.bold} />
        </Button>
      </InlineFlexRow>
    </InlineFlexColumn>
  );
};
