import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useToast } from '@src/component/templates/ToastContext';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  padding: 8px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface.raised};
  border-radius: 8px;
`;

const SessionItem = styled.label`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: 6px;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
  }

  input[type='checkbox'] {
    margin-top: 2px;
    cursor: pointer;
  }
`;

const HintText = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
  word-break: break-all;
  white-space: pre-wrap;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: 6px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export type SessionFilterModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  service: HeatmapDataService;
};

export const Component: FC<SessionFilterModalProps> = ({ className, isOpen, onClose, service }) => {
  const { theme } = useSharedTheme();
  const toast = useToast();
  const apiClient = useApiClient();
  const projectId = service.projectId;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<number>>(new Set());

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 1000);

  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ['sessionSearchSummary', projectId, debouncedSearchQuery],
    queryFn: async () => {
      if (!projectId || !debouncedSearchQuery.trim()) return null;

      const res = await apiClient.GET('/api/v0.1/projects/{project_id}/sessions/search/summary', {
        params: {
          path: { project_id: projectId },
          query: { q: debouncedSearchQuery.trim() },
        },
      });

      if (res.error) {
        throw new Error(`検索に失敗しました: ${res.error}`);
      }

      return res.data ?? null;
    },
    enabled: !!projectId && debouncedSearchQuery.trim().length > 0,
    staleTime: 1000 * 60,
  });

  const searchResults = searchData?.sessions ?? null;
  const totalCount = searchData?.total ?? 0;

  useEffect(() => {
    if (searchResults) {
      setSelectedSessionIds(new Set(searchResults.map((s) => s.id)));
    }
  }, [searchResults]);

  useEffect(() => {
    if (searchError) {
      toast.showToast(`検索エラー: ${searchError}`, 5, 'error');
    }
  }, [searchError, toast]);

  const toggleSessionSelection = useCallback((sessionId: number) => {
    setSelectedSessionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  }, []);

  const selectAllSessions = useCallback(() => {
    if (searchResults) {
      setSelectedSessionIds(new Set(searchResults.map((s) => s.id)));
    }
  }, [searchResults]);

  const deselectAllSessions = useCallback(() => {
    setSelectedSessionIds(new Set());
  }, []);

  const handleCreateTask = useCallback(() => {
    const sessionIds = selectedSessionIds.size > 0 ? Array.from(selectedSessionIds) : undefined;
    service.setSessionHeatmapIds(sessionIds);
    toast.showToast('Heatmap Taskを作成中...', 3, 'info');
    onClose();
  }, [selectedSessionIds, service, toast, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='セッションフィルター' closeOutside className={className}>
      <FlexColumn gap={16} style={{ maxWidth: '90vw' }}>
        {/* 検索クエリ入力 */}
        <FlexColumn gap={8}>
          <Text text={'検索クエリ'} fontSize={theme.typography.fontSize.base} fontWeight={'bold'} />
          <SearchInput type='text' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder='例: platform:Android is:finished' />
          {isSearching && (
            <HintText>
              <FiFilter style={{ marginRight: 4 }} />
              検索中...
            </HintText>
          )}
        </FlexColumn>

        {/* 検索結果表示 */}
        {searchResults && searchResults.length > 0 && (
          <FlexColumn gap={8}>
            <FlexColumn gap={4}>
              <Text text={`検索結果 (${totalCount}件)`} fontSize={theme.typography.fontSize.base} fontWeight={'bold'} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={selectAllSessions} scheme={'surface'} fontSize={'sm'}>
                  <Text text={'全選択'} fontSize={theme.typography.fontSize.sm} />
                </Button>
                <Button onClick={deselectAllSessions} scheme={'surface'} fontSize={'sm'}>
                  <Text text={'全解除'} fontSize={theme.typography.fontSize.sm} />
                </Button>
              </div>
            </FlexColumn>
            <SessionList>
              {searchResults.map((session) => (
                <SessionItem key={session.id}>
                  <input type='checkbox' checked={selectedSessionIds.has(session.id)} onChange={() => toggleSessionSelection(session.id)} />
                  <div>
                    <strong>ID: {session.id}</strong>
                    <br />
                    {session.display}
                  </div>
                </SessionItem>
              ))}
            </SessionList>
          </FlexColumn>
        )}

        {searchResults && searchResults.length === 0 && (
          <HintText>
            <FiFilter style={{ marginRight: 4 }} />
            検索結果が見つかりませんでした。
          </HintText>
        )}

        {/* Submit ボタン */}
        <FlexColumn gap={8}>
          <Button
            onClick={handleCreateTask}
            disabled={isSearching || (searchResults !== null && selectedSessionIds.size === 0)}
            scheme={'primary'}
            fontSize={'base'}
          >
            {searchResults ? `選択した${selectedSessionIds.size}件のセッションでHeatmap作成` : '全セッションでHeatmap作成'}
          </Button>
          {!searchResults && (
            <HintText>
              検索せずにSubmitすると、プロジェクトの全セッションでHeatmapを作成します。
              <br />
              検索してからSubmitすると、選択したセッションのみでHeatmapを作成します。
            </HintText>
          )}
          {searchResults && selectedSessionIds.size === 0 && <HintText style={{ color: 'orange' }}>少なくとも1つのセッションを選択してください。</HintText>}
        </FlexColumn>
      </FlexColumn>
    </Modal>
  );
};

export const SessionFilterModal = styled(Component)`
  color: ${({ theme }) => theme.colors.text.primary};
`;
