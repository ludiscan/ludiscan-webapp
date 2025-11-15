import styled from '@emotion/styled';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { BiRefresh, BiSearch } from 'react-icons/bi';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Pagination } from '@src/component/molecules/Pagination';
import { useToast } from '@src/component/templates/ToastContext';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { SessionItemRow } from '@src/pages/home/SessionItemRow';

const ITEMS_PER_PAGE = 10;

export type ProjectDetailsSessionsTabProps = {
  className?: string;
  project: Project;
};

type SortOption = 'newest' | 'oldest' | 'name';

const Component: FC<ProjectDetailsSessionsTabProps> = ({ className, project }) => {
  const { theme } = useSharedTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const apiClient = useApiClient();

  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    isError: isErrorSessions,
  } = useQuery({
    queryKey: ['sessions', project.id, currentPage, apiClient],
    queryFn: async () => {
      if (!project.id || project.id === 0) return [];
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error } = await apiClient.GET('/api/v0/projects/{project_id}/play_session', {
        params: {
          query: {
            limit: ITEMS_PER_PAGE,
            offset,
          },
          path: {
            project_id: project.id,
          },
        },
      });
      if (error) return [];
      return data;
    },
    staleTime: DefaultStaleTime,
  });

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['sessions', project.id] });
      showToast('セッション一覧を更新しました', 2, 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter/sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    // Filter by search query
    const filtered = sessions.filter((session) => {
      const query = searchQuery.toLowerCase();
      return (
        session.name.toLowerCase().includes(query) ||
        (session.deviceId?.toLowerCase().includes(query) ?? false) ||
        (session.platform?.toLowerCase().includes(query) ?? false)
      );
    });

    // Sort
    switch (sortBy) {
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }
  }, [sessions, searchQuery, sortBy]);

  return (
    <div className={className}>
      <Card blur color={theme.colors.surface.base} className={`${className}__card`}>
        {/* Header */}
        <FlexRow className={`${className}__header`} gap={16} align={'center'}>
          <Button onClick={handleRefresh} scheme='surface' disabled={isLoadingSessions || isRefreshing} fontSize={'sm'}>
            <BiRefresh size={20} />
          </Button>
          <Text text={`Total: ${project.session_count ?? 0}`} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
          {searchQuery && <Text text={`(${filteredAndSortedSessions.length}件一致)`} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />}
        </FlexRow>

        {/* Search and Sort Controls */}
        <FlexRow className={`${className}__controls`} gap={12} align={'center'}>
          <div className={`${className}__searchInput`}>
            <BiSearch size={16} />
            <input
              type='text'
              placeholder='セッション名、デバイスID、プラットフォームで検索...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className={`${className}__sortSelect`} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value='newest'>最新順</option>
            <option value='oldest'>古い順</option>
            <option value='name'>名前順</option>
          </select>
        </FlexRow>

        <VerticalSpacer size={12} />

        <FlexColumn className={`${className}__sessionList`} gap={0}>
          {/* ローディング状態 */}
          {isLoadingSessions && !isErrorSessions && (
            <div className={`${className}__loadingState`}>
              <Text text='セッションを読み込み中...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            </div>
          )}

          {/* エラー状態 */}
          {isErrorSessions && (
            <div className={`${className}__errorState`}>
              <Text text='セッション一覧の取得に失敗しました' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            </div>
          )}

          {/* セッション一覧 */}
          {!isErrorSessions && !isLoadingSessions && filteredAndSortedSessions.length > 0 && (
            <>
              {filteredAndSortedSessions.map((session) => (
                <div key={session.sessionId} className={`${className}__sessionItem`}>
                  <SessionItemRow session={session} />
                </div>
              ))}
            </>
          )}

          {/* 検索結果なし */}
          {!isLoadingSessions && !isErrorSessions && searchQuery && filteredAndSortedSessions.length === 0 && (
            <div className={`${className}__emptyState`}>
              <Text text={`「${searchQuery}」に一致するセッションが見つかりません`} fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
            </div>
          )}

          {/* 空状態 */}
          {!isLoadingSessions && !isErrorSessions && sessions.length === 0 && !searchQuery && (
            <div className={`${className}__emptyState`}>
              <Text text='セッションがありません' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
            </div>
          )}
        </FlexColumn>

        {/* ページネーション */}
        {!isErrorSessions && (project.session_count ?? 0) > 0 && (
          <>
            <VerticalSpacer size={12} />
            <Pagination
              currentPage={currentPage}
              totalItems={project.session_count ?? 0}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export const ProjectDetailsSessionsTab = styled(Component)`
  width: 100%;

  &__card {
    padding: 20px;
  }

  &__header {
    align-items: center;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &__controls {
    flex-wrap: wrap;
    padding: 12px 0;
  }

  &__searchInput {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    min-width: 250px;
    padding: 8px 12px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.surface.sunken ?? 'rgba(255, 255, 255, 0.02)'};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 6px;

    input {
      flex: 1;
      font-size: 14px;
      color: ${({ theme }) => theme.colors.text.primary};
      outline: none;
      background: none;
      border: none;

      &::placeholder {
        color: ${({ theme }) => theme.colors.text.secondary};
        opacity: 0.6;
      }
    }

    svg {
      flex-shrink: 0;
      color: ${({ theme }) => theme.colors.text.secondary};
      opacity: 0.7;
    }
  }

  &__sortSelect {
    padding: 8px 12px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.primary};
    white-space: nowrap;
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.surface.sunken ?? 'rgba(255, 255, 255, 0.02)'};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 6px;

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary.main};
      opacity: 0.8;
    }

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
    }

    option {
      color: ${({ theme }) => theme.colors.text.primary};
      background-color: ${({ theme }) => theme.colors.surface.base};
    }
  }

  &__sessionList {
    margin: 0 -4px;
  }

  &__sessionItem {
    padding: 0 4px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.sunken ?? 'rgba(255, 255, 255, 0.01)'};
    }
  }

  &__loadingState,
  &__errorState,
  &__emptyState {
    padding: 40px 16px;
    text-align: center;
    opacity: 0.7;
  }
`;
