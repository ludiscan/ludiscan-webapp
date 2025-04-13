import styled from '@emotion/styled';

import { FlexColumn, FlexRow } from '../../component/atoms/Flex';
import { ClampText } from '../../component/molecules/ClampText';
import { useSharedTheme } from '../../hooks/useSharedTheme';
import { fontSizes } from '../../styles/style';

import type { Project } from '../../modeles/project';
import type { FC } from 'react';

export type ProjectItemRowProps = {
  className?: string;
  project: Project;
};

const Component: FC<ProjectItemRowProps> = ({ className, project }) => {
  const { theme } = useSharedTheme();
  return (
    <FlexRow className={className}>
      <FlexColumn gap={2}>
        <ClampText text={project.name} fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={'bold'} lines={1} />
        <ClampText text={project.description} fontSize={fontSizes.small} fontWeight={'lighter'} lines={1} color={theme.colors.secondary.main} />
      </FlexColumn>
    </FlexRow>
  );
};

export const ProjectItemRow = styled(Component)`
  height: fit-content;
`;
