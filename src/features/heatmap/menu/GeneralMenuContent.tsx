import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { GeneralSettings } from '@src/modeles/heatmapView';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { SegmentedSwitch } from '@src/component/molecules/SegmentedSwitch';
import { Selector } from '@src/component/molecules/Selector';
import { useToast } from '@src/component/templates/ToastContext';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { useGeneralPatch, useGeneralPick } from '@src/hooks/useGeneral';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';

const Divider = styled.div`
  width: 100%;
  height: 1px;
  margin: 16px 0;
  background: ${({ theme }) => theme.colors.border.subtle};
`;

const SectionTitle = styled.div`
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
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
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
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

export const GeneralMenuContent: FC<HeatmapMenuProps> = ({ service }) => {
  const { theme } = useSharedTheme();
  const toast = useToast();
  const apiClient = useApiClient();
  const projectId = service.projectId;

  const { upZ, scale, heatmapOpacity, heatmapType, colorScale, blockSize, showHeatmap, minThreshold } = useGeneralPick(
    'upZ',
    'scale',
    'showHeatmap',
    'heatmapOpacity',
    'heatmapType',
    'blockSize',
    'minThreshold',
    'colorScale',
  );
  const setData = useGeneralPatch();
  const handleReload = useCallback(() => {}, []);

  // Session Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // デバウンスされた検索クエリ（1秒）
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 1000);

  // セッション検索（デバウンスされたクエリで実行）
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
    staleTime: 1000 * 60, // 1分
  });

  const searchResults = searchData?.sessions ?? null;
  const totalCount = searchData?.total ?? 0;

  // 検索エラーの表示
  useEffect(() => {
    if (searchError) {
      toast.showToast(`検索エラー: ${searchError}`, 5, 'error');
    }
  }, [searchError, toast]);

  // Heatmap Task作成
  const handleCreateTask = useCallback(() => {
    const sessionIds = searchResults?.map((s) => s.id) ?? undefined;
    service.setSessionHeatmapIds(sessionIds);
    toast.showToast('Heatmap Taskを作成中...', 3, 'info');
  }, [searchResults, service, toast]);
  return (
    <>
      <InputRow label={'上向ベクトル'}>
        <SegmentedSwitch
          fontSize={'xs'}
          value={upZ ? 'Z' : 'Y'}
          options={['Y', 'Z']}
          onChange={(v) => {
            setData({ upZ: v === 'Z' });
          }}
        />
      </InputRow>
      <InputRow label={'scale'}>
        <Slider value={scale} onChange={(scale) => setData({ scale })} min={0.1} step={0.05} max={1.0} textField />
      </InputRow>
      <InputRow label={'showHeatmap'}>
        <div>
          <Switch label={'showHeatmap'} onChange={(showHeatmap) => setData({ showHeatmap })} checked={showHeatmap} size={'small'} />
        </div>
      </InputRow>
      <InputRow label={'opacity'}>
        <Slider
          value={heatmapOpacity}
          min={0.0}
          max={1.0}
          step={0.1}
          onChange={(value) => setData({ heatmapOpacity: value })}
          disabled={!showHeatmap}
          textField
        />
      </InputRow>
      <InputRow label={'type'}>
        <Selector
          options={['object', 'fill']}
          value={heatmapType}
          onChange={(v) => {
            setData({ heatmapType: v as GeneralSettings['heatmapType'] });
          }}
          fontSize={'base'}
        />
      </InputRow>
      <InputRow label={'blockSize'}>
        <Slider value={blockSize} onChange={(blockSize) => setData({ blockSize })} min={50} step={50} max={500} textField />
      </InputRow>
      <InputRow label={'minThreshold'}>
        <Slider value={minThreshold} onChange={(minThreshold) => setData({ minThreshold })} min={0} step={0.001} max={0.5} textField />
      </InputRow>
      <InputRow label={'color scale'}>
        <Slider value={colorScale} onChange={(colorScale) => setData({ colorScale })} min={0.1} step={0.1} max={5} textField />
      </InputRow>
      <InputRow label={''}>
        <div style={{ flex: 1 }} />
        <Button onClick={handleReload} scheme={'surface'} fontSize={'sm'}>
          <Text text={'Reload'} fontSize={theme.typography.fontSize.sm} />
        </Button>
      </InputRow>

      {/* Session Filter セクション */}
      <Divider />
      <SectionTitle>Session Filter</SectionTitle>

      <FlexColumn gap={12}>
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
          <Button onClick={handleCreateTask} disabled={isSearching} scheme={'primary'} fontSize={'base'}>
            {searchResults ? `${totalCount}件のセッションでHeatmap作成` : '全セッションでHeatmap作成'}
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
    </>
  );
};
