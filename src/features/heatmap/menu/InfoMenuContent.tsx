import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { FaFileExport, FaGithub } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexColumn, FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { APP_INFO } from '@src/config/app';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { DefaultStaleTime } from '@src/modeles/qeury';

const SectionHeader = styled(FlexRow)`
  padding: 8px;
  margin-bottom: 4px;
  background: ${({ theme }) => theme.colors.surface.hover};
  border-radius: 4px;
`;

const LinkButton = styled.a`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface.raised};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 4px;
  transition:
    background 0.2s,
    border-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    border-color: ${({ theme }) => theme.colors.border.focus};
  }
`;

const ValueText = styled(Text)`
  overflow-wrap: break-word;
`;

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
    <FlexColumn gap={8}>
      {/* Project Information Section */}
      {project && (
        <>
          <SectionHeader align='center' gap={8}>
            <FiInfo size={16} color={theme.colors.text.secondary} />
            <Text text={t('heatmap.info.projectSection')} fontSize={theme.typography.fontSize.sm} fontWeight={theme.typography.fontWeight.bold} />
          </SectionHeader>

          <InputRow label={t('heatmap.info.projectId')}>
            <ValueText text={String(project.id)} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
          </InputRow>

          <InputRow label={t('heatmap.info.name')}>
            <ValueText text={project.name} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
          </InputRow>

          <InputRow label={t('heatmap.info.mode')}>
            <ValueText text={project.is2D ? '2D' : '3D'} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
          </InputRow>

          <InputRow label={t('heatmap.info.description')} align='flex-start'>
            <ValueText
              text={project.description || t('heatmap.info.noDescription')}
              fontSize={theme.typography.fontSize.sm}
              color={project.description ? theme.colors.text.secondary : theme.colors.text.tertiary}
            />
          </InputRow>

          <Divider margin='12px 0' />
        </>
      )}

      {/* Application Information Section */}
      <SectionHeader align='center' gap={8}>
        <FaGithub size={16} color={theme.colors.text.secondary} />
        <Text text={t('heatmap.info.productSection')} fontSize={theme.typography.fontSize.sm} fontWeight={theme.typography.fontWeight.bold} />
      </SectionHeader>

      <InputRow label={t('heatmap.info.name')}>
        <ValueText text={APP_INFO.name} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
      </InputRow>

      <InputRow label={t('heatmap.info.version')}>
        <ValueText text={`v${APP_INFO.version}`} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
      </InputRow>

      <InputRow label={t('heatmap.info.author')}>
        <ValueText text={APP_INFO.author} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
      </InputRow>

      <FlexRow gap={8} style={{ padding: '8px', flexWrap: 'wrap' }}>
        <LinkButton href={APP_INFO.organization} target='_blank' rel='noopener noreferrer'>
          <FaGithub size={14} />
          {t('heatmap.info.viewOrg')}
        </LinkButton>
        <LinkButton href={APP_INFO.repository} target='_blank' rel='noopener noreferrer'>
          <FaGithub size={14} />
          {t('heatmap.info.viewSource')}
        </LinkButton>
      </FlexRow>

      <Divider margin='12px 0' />

      {/* Export Button */}
      <InlineFlexRow align='center' gap={8} style={{ justifyContent: 'center', padding: '4px 0' }}>
        <Button onClick={handleExportHeatmap} scheme='primary' fontSize='sm'>
          <FaFileExport style={{ marginRight: 6 }} />
          <Text text={t('heatmap.info.export')} fontSize={theme.typography.fontSize.sm} fontWeight={theme.typography.fontWeight.bold} />
        </Button>
      </InlineFlexRow>
    </FlexColumn>
  );
};
