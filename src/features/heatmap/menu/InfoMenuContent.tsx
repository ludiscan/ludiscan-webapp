import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { FaFileExport } from 'react-icons/fa';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { fontSizes, fontWeights } from '@src/styles/style';

export const InfoMenuContent: FC<HeatmapMenuProps> = ({ handleExportView, service }) => {
  const handleExportHeatmap = useCallback(async () => {
    await handleExportView();
  }, [handleExportView]);
  const apiClient = useApiClient();

  const { data: project } = useQuery({
    queryKey: [service.projectId],
    queryFn: async () => {
      if (!service.projectId) return;
      const { data, error } = await apiClient.GET('/api/v0/projects/{id}', {
        params: {
          path: {
            id: service.projectId,
          },
        },
      });
      if (error) return;
      return data;
    },
    staleTime: DefaultStaleTime,
    enabled: service.projectId !== undefined,
  });

  return (
    <>
      {project && (
        <>
          <InlineFlexRow align={'center'} gap={4}>
            <Text text={`project_id: ${project.id}`} fontSize={fontSizes.small} />
          </InlineFlexRow>
          <InlineFlexRow align={'center'} gap={4}>
            <Text text={`name: ${project.name}`} fontSize={fontSizes.small} />
          </InlineFlexRow>
          {/*<InlineFlexRow align={'center'} gap={4}>*/}
          {/*  <Text text={`step size: ${task.stepSize}`} fontSize={fontSizes.small} />*/}
          {/*</InlineFlexRow>*/}
          {/*<InlineFlexRow align={'center'} gap={4}>*/}
          {/*  <Text text={`mode: ${task.zVisible ? '3D' : '2D'}`} fontSize={fontSizes.small} />*/}
          {/*</InlineFlexRow>*/}
        </>
      )}
      <InlineFlexRow align={'center'} gap={8} style={{ marginTop: 8, justifyContent: 'center' }}>
        <Button onClick={handleExportHeatmap} scheme={'primary'} fontSize={'small'}>
          <FaFileExport style={{ marginRight: 4 }} />
          <Text text={'エクスポート'} fontSize={fontSizes.small} fontWeight={fontWeights.bold} />
        </Button>
      </InlineFlexRow>
    </>
  );
};
