import styled from '@emotion/styled';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';

import type { components } from '@generated/api';
import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useToast } from '@src/component/templates/ToastContext';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';

type SearchSessionSummaryDto = components['schemas']['SearchSessionSummaryDto'];

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

const SessionItem = styled.div`
  padding: 12px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: 6px;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
  }
`;

const HintText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: 6px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Component: FC<HeatmapMenuProps> = ({ className, service }) => {
  const { theme } = useSharedTheme();
  const toast = useToast();
  const apiClient = useApiClient();
  const projectId = service.projectId;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchSessionSummaryDto[] | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // プロジェクトデータを取得してzVisibleを決定
  const [zVisible, setZVisible] = useState(true);

  useMemo(() => {
    if (!projectId) return;
    (async () => {
      const res = await apiClient.GET('/api/v0/projects/{id}', {
        params: { path: { id: projectId } },
      });
      if (res.data) {
        setZVisible(!(res.data.is2D ?? false));
      }
    })();
  }, [projectId, apiClient]);

  // 検索実行（デバウンス対応）
  useEffect(() => {
    if (!projectId) return;

    // 検索クエリが空の場合は検索をスキップ
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setTotalCount(0);
      return;
    }

    const timerId = setTimeout(async () => {
      setIsSearching(true);

      try {
        const res = await apiClient.GET('/api/v0.1/projects/{project_id}/sessions/search/summary', {
          params: {
            path: { project_id: projectId },
            query: { q: searchQuery.trim() },
          },
        });

        if (res.error) {
          toast.showToast(`検索に失敗しました: ${res.error}`, 5, 'error');
          setSearchResults(null);
          return;
        }

        if (res.data) {
          setSearchResults(res.data.sessions);
          setTotalCount(res.data.total);
        }
      } catch (error) {
        toast.showToast(`検索エラー: ${error}`, 5, 'error');
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 1000); // 1秒のデバウンス

    return () => clearTimeout(timerId);
  }, [projectId, searchQuery, apiClient, toast]);

  // Heatmap Task作成
  const handleCreateTask = useCallback(async () => {
    if (!projectId) {
      toast.showToast('プロジェクトIDが不正です', 5, 'error');
      return;
    }

    setIsCreatingTask(true);

    try {
      const sessionIds = searchResults?.map((s) => s.id) ?? undefined;

      const res = await apiClient.POST('/api/v0/heatmap/projects/{project_id}/tasks', {
        params: {
          path: { project_id: projectId },
        },
        body: {
          stepSize: 50,
          zVisible: zVisible,
          ...(sessionIds && sessionIds.length > 0 ? { sessionIds } : {}),
        },
      });

      if (res.error) {
        toast.showToast(`Heatmap Task作成に失敗しました: ${res.error}`, 5, 'error');
        return;
      }

      if (res.data) {
        toast.showToast('Heatmap Taskを作成しました。ページをリロードします...', 3, 'success');
        // ページをリロードして新しいheatmapを表示
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.showToast(`作成エラー: ${error}`, 5, 'error');
    } finally {
      setIsCreatingTask(false);
    }
  }, [projectId, searchResults, zVisible, apiClient, toast]);

  return (
    <FlexColumn gap={16} className={className}>
      <Text text={'Session Filter'} fontSize={theme.typography.fontSize['2xl']} fontWeight={'bold'} />

      <HintText>
        検索クエリを入力してセッションを絞り込むか、空のままSubmitして全セッションのheatmapを作成できます。
        <br />
        <br />
        <strong>検索例:</strong>
        <br />• <code>platform:Android is:finished</code>
        <br />• <code>Session_2025</code>
        <br />• <code>platform:iOS app_version:1.2.3</code>
      </HintText>

      {/* 検索クエリ入力 */}
      <FlexColumn gap={8}>
        <Text text={'検索クエリ'} fontSize={theme.typography.fontSize.base} fontWeight={'bold'} />
        <SearchInput
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='例: platform:Android is:finished'
          disabled={isCreatingTask}
        />
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
          <Text text={`検索結果 (${totalCount}件)`} fontSize={theme.typography.fontSize.base} fontWeight={'bold'} />
          <SessionList>
            {searchResults.map((session) => (
              <SessionItem key={session.id}>
                <strong>ID: {session.id}</strong>
                <br />
                {session.display}
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
        <Button onClick={handleCreateTask} disabled={isCreatingTask || isSearching} scheme={'primary'} fontSize={'base'}>
          {isCreatingTask ? '作成中...' : searchResults ? `${totalCount}件のセッションでHeatmap作成` : '全セッションでHeatmap作成'}
        </Button>
        {!searchResults && (
          <HintText>
            検索せずにSubmitすると、プロジェクトの全セッションでHeatmapを作成します。
            <br />
            検索してからSubmitすると、検索結果のセッションのみでHeatmapを作成します。
          </HintText>
        )}
      </FlexColumn>
    </FlexColumn>
  );
};

export const SessionFilterMenuContent = styled(Component)`
  code {
    padding: 2px 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    background: ${({ theme }) => theme.colors.surface.raised};
    border-radius: 4px;
  }
`;
