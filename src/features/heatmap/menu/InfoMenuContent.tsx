import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { FaFileExport } from 'react-icons/fa';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { DefaultStaleTime } from '@src/modeles/qeury';

export const InfoMenuContent: FC<HeatmapMenuProps> = ({ handleExportView, service }) => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const handleExportHeatmap = useCallback(async () => {
    await handleExportView();
  }, [handleExportView]);

  const { data: project } = useQuery({
    queryKey: ['project', service.projectId],
    queryFn: () => service.getProject(),
    staleTime: DefaultStaleTime,
    enabled: service.projectId !== undefined,
  });

  return (
    <>
      {project && (
        <>
          <InlineFlexRow align={'center'} gap={4}>
            <Text text={`${t('heatmap.info.projectId')} ${project.id}`} fontSize={theme.typography.fontSize.sm} />
          </InlineFlexRow>
          <InlineFlexRow align={'center'} gap={4}>
            <Text text={`${t('heatmap.info.name')} ${project.name}`} fontSize={theme.typography.fontSize.sm} />
          </InlineFlexRow>
          <InlineFlexRow align={'center'} gap={4}>
            <Text text={`${t('heatmap.info.mode')} ${project.is2D ? '2D' : '3D'}`} fontSize={theme.typography.fontSize.sm} />
          </InlineFlexRow>
        </>
      )}
      <InlineFlexRow align={'center'} gap={8} style={{ marginTop: 8, justifyContent: 'center' }}>
        <Button onClick={handleExportHeatmap} scheme={'primary'} fontSize={'sm'}>
          <FaFileExport style={{ marginRight: 4 }} />
          <Text text={t('heatmap.info.export')} fontSize={theme.typography.fontSize.sm} fontWeight={theme.typography.fontWeight.bold} />
        </Button>
      </InlineFlexRow>
    </>
  );
};
