import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { FaFileExport } from 'react-icons/fa';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';

export const InfoMenuContent: FC<HeatmapMenuProps> = ({ handleExportView, service }) => {
  const { theme } = useSharedTheme();
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
            <Text text={`project_id: ${project.id}`} fontSize={theme.typography.fontSize.sm} />
          </InlineFlexRow>
          <InlineFlexRow align={'center'} gap={4}>
            <Text text={`name: ${project.name}`} fontSize={theme.typography.fontSize.sm} />
          </InlineFlexRow>
          <InlineFlexRow align={'center'} gap={4}>
            <Text text={`mode: ${project.is2D ? '2D' : '3D'}`} fontSize={theme.typography.fontSize.sm} />
          </InlineFlexRow>
        </>
      )}
      <InlineFlexRow align={'center'} gap={8} style={{ marginTop: 8, justifyContent: 'center' }}>
        <Button onClick={handleExportHeatmap} scheme={'primary'} fontSize={'sm'}>
          <FaFileExport style={{ marginRight: 4 }} />
          <Text text={'エクスポート'} fontSize={theme.typography.fontSize.sm} fontWeight={theme.typography.fontWeight.bold} />
        </Button>
      </InlineFlexRow>
    </>
  );
};
