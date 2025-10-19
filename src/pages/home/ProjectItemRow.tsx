import styled from '@emotion/styled';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { FlexColumn, FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { ClampText } from '@src/component/molecules/ClampText';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes } from '@src/styles/style';

export type ProjectItemRowProps = {
  className?: string;
  project: Project;
};

const Component: FC<ProjectItemRowProps> = ({ className, project }) => {
  const { theme } = useSharedTheme();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <FlexRow className={className} align={'center'}>
      <FlexColumn gap={2} className={`${className}__info`}>
        <ClampText text={project.name} fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={'bold'} lines={1} />
        <ClampText text={project.description} fontSize={fontSizes.small} fontWeight={'lighter'} lines={1} color={theme.colors.secondary.main} />
        <InlineFlexRow gap={8} className={`${className}__meta`}>
          {project.session_count !== undefined && (
            <Text text={`📊 ${project.session_count} sessions`} fontSize={fontSizes.smallest} color={theme.colors.secondary.main} fontWeight={'lighter'} />
          )}
          <Text text={`Created: ${formatDate(project.createdAt)}`} fontSize={fontSizes.smallest} color={theme.colors.secondary.main} fontWeight={'lighter'} />
        </InlineFlexRow>
      </FlexColumn>
    </FlexRow>
  );
};

export const ProjectItemRow = styled(Component)`
  height: fit-content;
  width: 100%;

  &__info {
    flex: 1;
  }

  &__meta {
    margin-top: 4px;
  }
`;
