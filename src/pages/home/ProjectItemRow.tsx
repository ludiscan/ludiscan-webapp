import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { BiEdit, BiChevronRight } from 'react-icons/bi';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { FlexColumn, FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { ClampText } from '@src/component/molecules/ClampText';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type ProjectItemRowProps = {
  className?: string;
  project: Project;
  onEdit?: (project: Project) => void;
};

const Component: FC<ProjectItemRowProps> = memo(({ className, project, onEdit }) => {
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
      <div className={`${className}__accent`} />
      <FlexRow align={'center'} className={`${className}__content`}>
        <FlexColumn gap={6} className={`${className}__info`}>
          <FlexRow align={'center'} gap={8}>
            <ClampText
              text={project.name}
              fontSize={theme.typography.fontSize.base}
              color={theme.colors.text.primary}
              fontWeight={theme.typography.fontWeight.semibold}
              lines={1}
            />
            <span className={`${className}__badge`}>{project.is2D ? '2D' : '3D'}</span>
          </FlexRow>
          <ClampText
            text={project.description || 'No description'}
            fontSize={theme.typography.fontSize.sm}
            fontWeight={theme.typography.fontWeight.regular}
            lines={1}
            color={theme.colors.text.tertiary}
          />
          <InlineFlexRow gap={16} className={`${className}__meta`}>
            <span className={`${className}__metaItem`}>
              <span className={`${className}__metaValue`}>{project.session_count ?? 0}</span>
              <span className={`${className}__metaLabel`}>sessions</span>
            </span>
            <span className={`${className}__metaDivider`} />
            <span className={`${className}__metaItem`}>
              <span className={`${className}__metaLabel`}>ID:</span>
              <span className={`${className}__metaValue`}>{project.id}</span>
            </span>
            <span className={`${className}__metaDivider`} />
            <span className={`${className}__metaItem`}>
              <span className={`${className}__metaLabel`}>Created:</span>
              <span className={`${className}__metaValue`}>{formatDate(project.createdAt)}</span>
            </span>
          </InlineFlexRow>
        </FlexColumn>
        <FlexRow gap={8} align={'center'} className={`${className}__actions`}>
          {onEdit && (
            <button className={`${className}__editButton`} onClick={handleEdit} title={'Edit project'}>
              <BiEdit size={18} />
            </button>
          )}
          <div className={`${className}__chevron`}>
            <BiChevronRight size={20} />
          </div>
        </FlexRow>
      </FlexRow>
    </div>
  );
});
Component.displayName = 'ProjectItemRow';

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

export const ProjectItemRow = styled(Component)`
  position: relative;
  width: 100%;
  height: fit-content;
  padding: 16px 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;

  &::before {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(90deg, transparent 0%, rgb(0 245 255 / 3%) 50%, transparent 100%);
    opacity: 0;
    transform: translateX(-100%);
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
    animation: ${shimmer} 1.5s ease-in-out;
  }

  &__accent {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary.main} 0%, ${({ theme }) => theme.colors.tertiary.main} 100%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover &__accent {
    opacity: 1;
  }

  &__content {
    position: relative;
    z-index: 1;
    width: 100%;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.primary.main};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
    background: ${({ theme }) => theme.colors.primary.main}1a;
    border: 1px solid ${({ theme }) => theme.colors.primary.main}33;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__meta {
    flex-wrap: wrap;
    margin-top: 4px;
  }

  &__metaItem {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  &__metaValue {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__metaLabel {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &__metaDivider {
    width: 1px;
    height: 12px;
    background: ${({ theme }) => theme.colors.border.default};
  }

  &__actions {
    flex-shrink: 0;
  }

  &__editButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: ${({ theme }) => theme.borders.radius.md};
    opacity: 0;
    transform: translateX(8px);
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
      background: ${({ theme }) => theme.colors.primary.main}14;
      border-color: ${({ theme }) => theme.colors.primary.main}33;
    }
  }

  &:hover &__editButton {
    opacity: 1;
    transform: translateX(0);
  }

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.tertiary};
    transform: translateX(0);
    transition: all 0.2s ease;
  }

  &:hover &__chevron {
    color: ${({ theme }) => theme.colors.primary.main};
    transform: translateX(4px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main}80;
    outline-offset: -2px;
  }
`;
