import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { BiRefresh, BiSearch, BiChevronDown, BiChevronUp, BiFilter } from 'react-icons/bi';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Pagination } from '@src/component/molecules/Pagination';
import { useToast } from '@src/component/templates/ToastContext';
import { SessionAggregationPanel } from '@src/features/session/SessionAggregationPanel';
import { SessionFilterPanel } from '@src/features/session/SessionFilterPanel';
import { useSessionFiltersAndAggregate } from '@src/hooks/useSessionFilters';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { SessionItemRow } from '@src/pages/home/SessionItemRow';

const ITEMS_PER_PAGE = 10;

export type ProjectDetailsSessionsTabProps = {
  className?: string;
  project: Project;
};

type SortOption = 'newest' | 'oldest' | 'name' | 'updated';

type ApiSortBy = 'id' | 'name' | 'start_time' | 'end_time' | 'updated_at';
type ApiSortOrder = 'asc' | 'desc';

const sortOptionToApiParams: Record<SortOption, { sortBy: ApiSortBy; sortOrder: ApiSortOrder }> = {
  newest: { sortBy: 'start_time', sortOrder: 'desc' },
  oldest: { sortBy: 'start_time', sortOrder: 'asc' },
  name: { sortBy: 'name', sortOrder: 'asc' },
  updated: { sortBy: 'updated_at', sortOrder: 'desc' },
};

const Component: FC<ProjectDetailsSessionsTabProps> = ({ className, project }) => {
  const { theme } = useSharedTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAggregation, setShowAggregation] = useState(false);
  const apiClient = useApiClient();

  // Use the new filters and aggregation hook
  const {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    isLoadingFilterOptions,
    metadataKeys,
    numericMetadataKeys,
    isLoadingMetadataKeys,
    aggregationConfigs,
    addAggregation,
    removeAggregation,
    clearAggregations,
    runAggregate,
    aggregateResult,
    isAggregating,
  } = useSessionFiltersAndAggregate(project.id);

  const apiSortParams = sortOptionToApiParams[sortBy];

  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    isError: isErrorSessions,
  } = useQuery({
    queryKey: ['sessions', project.id, currentPage, apiSortParams.sortBy, apiSortParams.sortOrder],
    queryFn: async () => {
      if (!project.id || project.id === 0) return [];
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error } = await apiClient.GET('/api/v0/projects/{project_id}/play_session', {
        params: {
          query: {
            limit: ITEMS_PER_PAGE,
            offset,
            sortBy: apiSortParams.sortBy,
            sortOrder: apiSortParams.sortOrder,
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
      await queryClient.invalidateQueries({ queryKey: ['filterOptions', project.id] });
      await queryClient.invalidateQueries({ queryKey: ['metadataKeys', project.id] });
      showToast('セッション一覧を更新しました', 2, 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunAggregate = async () => {
    try {
      await runAggregate();
      showToast('集計が完了しました', 2, 'success');
    } catch {
      showToast('集計に失敗しました', 3, 'error');
    }
  };

  // Filter sessions by search query (sorting is done server-side)
  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter((session) => {
      return (
        session.name.toLowerCase().includes(query) ||
        (session.deviceId?.toLowerCase().includes(query) ?? false) ||
        (session.platform?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [sessions, searchQuery]);

  return (
    <div className={className}>
      {/* Filter Toggle */}
      <div className={`${className}__filterToggle`}>
        <button onClick={() => setShowFilters(!showFilters)} className={`${className}__filterButton ${showFilters ? 'active' : ''}`}>
          <BiFilter size={18} />
          <span>Filters & Aggregation</span>
          {hasActiveFilters && <span className={`${className}__filterBadge`}>{Object.values(filters).filter((v) => v !== undefined).length}</span>}
          {showFilters ? <BiChevronUp size={16} /> : <BiChevronDown size={16} />}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={`${className}__filterPanel`}>
          <SessionFilterPanel
            filters={filters}
            filterOptions={filterOptions}
            metadataKeys={metadataKeys}
            isLoadingOptions={isLoadingFilterOptions || isLoadingMetadataKeys}
            hasActiveFilters={hasActiveFilters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
          />

          <button onClick={() => setShowAggregation(!showAggregation)} className={`${className}__aggregationToggle`}>
            {showAggregation ? <BiChevronUp size={16} /> : <BiChevronDown size={16} />}
            Aggregation Panel
          </button>

          {showAggregation && (
            <SessionAggregationPanel
              numericMetadataKeys={numericMetadataKeys}
              aggregationConfigs={aggregationConfigs}
              aggregateResult={aggregateResult}
              isAggregating={isAggregating}
              onAddAggregation={addAggregation}
              onRemoveAggregation={removeAggregation}
              onClearAggregations={clearAggregations}
              onRunAggregate={handleRunAggregate}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </div>
      )}

      <VerticalSpacer size={16} />

      {/* Main Card */}
      <div className={`${className}__card`}>
        <div className={`${className}__cardBorder`} />

        {/* Header */}
        <div className={`${className}__header`}>
          <FlexRow gap={16} align={'center'}>
            <button onClick={handleRefresh} disabled={isLoadingSessions || isRefreshing} className={`${className}__refreshButton`}>
              <BiRefresh size={18} className={isRefreshing ? 'spinning' : ''} />
            </button>
            <div className={`${className}__headerStats`}>
              <span className={`${className}__statValue`}>{project.session_count ?? 0}</span>
              <span className={`${className}__statLabel`}>Total Sessions</span>
            </div>
            {searchQuery && <span className={`${className}__matchCount`}>{filteredSessions.length} matches</span>}
          </FlexRow>
        </div>

        {/* Search and Sort Controls */}
        <div className={`${className}__controls`}>
          <div className={`${className}__searchWrapper`}>
            <BiSearch size={16} className={`${className}__searchIcon`} />
            <input
              type='text'
              placeholder='Search sessions...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${className}__searchInput`}
            />
          </div>

          <div className={`${className}__sortWrapper`}>
            <select
              className={`${className}__sortSelect`}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setCurrentPage(1);
              }}
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
              <option value='name'>By Name</option>
              <option value='updated'>Recently Updated</option>
            </select>
            <BiChevronDown size={16} className={`${className}__sortChevron`} />
          </div>
        </div>

        {/* Session List */}
        <div className={`${className}__sessionList`}>
          {/* Loading */}
          {isLoadingSessions && !isErrorSessions && (
            <div className={`${className}__loadingState`}>
              <div className={`${className}__loadingSpinner`} />
              <Text text='Loading sessions...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
            </div>
          )}

          {/* Error */}
          {isErrorSessions && (
            <div className={`${className}__errorState`}>
              <div className={`${className}__errorIcon`}>!</div>
              <Text text='Failed to load sessions' fontSize={theme.typography.fontSize.base} color={theme.colors.semantic.error.main} />
            </div>
          )}

          {/* Sessions */}
          {!isErrorSessions && !isLoadingSessions && filteredSessions.length > 0 && (
            <FlexColumn gap={0}>
              {filteredSessions.map((session) => (
                <div key={session.sessionId} className={`${className}__sessionItem`}>
                  <SessionItemRow session={session} />
                </div>
              ))}
            </FlexColumn>
          )}

          {/* No Results */}
          {!isLoadingSessions && !isErrorSessions && searchQuery && filteredSessions.length === 0 && (
            <div className={`${className}__emptyState`}>
              <Text text={`No sessions matching "${searchQuery}"`} fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
            </div>
          )}

          {/* Empty */}
          {!isLoadingSessions && !isErrorSessions && sessions.length === 0 && !searchQuery && (
            <div className={`${className}__emptyState`}>
              <Text text='No sessions yet' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
              <Text
                text='Sessions will appear here when players start using your game'
                fontSize={theme.typography.fontSize.sm}
                color={theme.colors.text.tertiary}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isErrorSessions && (project.session_count ?? 0) > ITEMS_PER_PAGE && (
          <div className={`${className}__pagination`}>
            <Pagination
              currentPage={currentPage}
              totalItems={project.session_count ?? 0}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
      <VerticalSpacer size={42} />
    </div>
  );
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const ProjectDetailsSessionsTab = styled(Component)`
  width: 100%;

  &__filterToggle {
    margin-bottom: 12px;
  }

  &__filterButton {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
      border-color: ${({ theme }) => theme.colors.border.default};
    }

    &.active {
      color: ${({ theme }) => theme.colors.primary.main};
      background: ${({ theme }) => theme.colors.primary.main}0d;
      border-color: ${({ theme }) => theme.colors.primary.main}4d;
    }
  }

  &__filterBadge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.background.default};
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 9px;
  }

  &__filterPanel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.lg};
  }

  &__aggregationToggle {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  &__card {
    position: relative;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surface.base};
    border-radius: ${({ theme }) => theme.borders.radius.lg};
  }

  &__cardBorder {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.lg};
  }

  &__header {
    position: relative;
    padding: 16px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__headerStats {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__statValue {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &__statLabel {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.normal};
  }

  &__matchCount {
    padding: 4px 10px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__refreshButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.primary.main};
      border-color: ${({ theme }) => theme.colors.primary.main}80;
    }

    .spinning {
      animation: ${spin} 1s linear infinite;
    }
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__searchWrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  &__searchIcon {
    position: absolute;
    top: 50%;
    left: 12px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    transform: translateY(-50%);
    transition: color 0.2s ease;
  }

  &__searchInput {
    width: 100%;
    padding: 10px 12px 10px 38px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    outline: none;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.tertiary};
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main}80;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }
  }

  &__searchWrapper:focus-within &__searchIcon {
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &__sortWrapper {
    position: relative;
  }

  &__sortSelect {
    padding: 10px 36px 10px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    appearance: none;
    cursor: pointer;
    outline: none;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.border.strong};
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main}80;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }

    option {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.base};
    }
  }

  &__sortChevron {
    position: absolute;
    top: 50%;
    right: 12px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    pointer-events: none;
    transform: translateY(-50%);
  }

  &__sessionList {
    min-height: 200px;
  }

  &__sessionItem {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

    &:last-child {
      border-bottom: none;
    }
  }

  &__loadingState,
  &__errorState,
  &__emptyState {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  &__loadingSpinner {
    width: 32px;
    height: 32px;
    border: 3px solid ${({ theme }) => theme.colors.border.default};
    border-top-color: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }

  &__errorIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.semantic.error.main};
    background: ${({ theme }) => theme.colors.semantic.error.main}15;
    border: 1px solid ${({ theme }) => theme.colors.semantic.error.main}40;
    border-radius: 50%;
  }

  &__pagination {
    padding: 16px 20px;
    border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  @media (width <= 768px) {
    &__controls {
      flex-direction: column;
    }

    &__searchWrapper {
      max-width: none;
    }
  }
`;
