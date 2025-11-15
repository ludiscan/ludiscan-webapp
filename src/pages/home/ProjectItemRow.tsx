import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { BiEdit } from 'react-icons/bi';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { ClampText } from '@src/component/molecules/ClampText';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type ProjectItemRowProps = {
  className?: string;
  project: Project;
  onEdit?: (project: Project) => void;
};

const Component: FC<ProjectItemRowProps> = ({ className, project, onEdit }) => {
  const { theme } = useSharedTheme();
  const router = useRouter();

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

  const handleClick = () => {
    router.push(`/home/projects/${project.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(project);
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      role='button'
      tabIndex={0}
    >
      <FlexRow align={'center'} className={`${className}__content`}>
        <FlexColumn gap={2} className={`${className}__info`}>
          <ClampText text={project.name} fontSize={theme.typography.fontSize.lg} color={theme.colors.text.primary} fontWeight={'bold'} lines={1} />
          <ClampText text={project.description} fontSize={theme.typography.fontSize.sm} fontWeight={'lighter'} lines={1} color={theme.colors.text.secondary} />
          <InlineFlexRow gap={8} className={`${className}__meta`}>
            {project.session_count !== undefined && (
              <Text text={`${project.session_count} sessions`} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} fontWeight={'lighter'} />
            )}
            <Text text={`Created: ${formatDate(project.createdAt)}`} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} fontWeight={'lighter'} />
          </InlineFlexRow>
        </FlexColumn>
        {onEdit && (
          <Button className={`${className}__editButton`} onClick={handleEdit} scheme={'surface'} fontSize={'sm'} title={'プロジェクトを編集'}>
            <BiEdit size={20} />
          </Button>
        )}
      </FlexRow>
    </div>
  );
};

export const ProjectItemRow = styled(Component)`
  width: 100%;
  height: fit-content;
  padding: 4px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    padding: 4px 8px;
    background-color: ${({ theme }) => theme.colors.surface.sunken};
  }

  &__content {
    width: 100%;
  }

  &__info {
    flex: 1;
  }

  &__meta {
    margin-top: 4px;
  }

  &__editButton {
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`;
