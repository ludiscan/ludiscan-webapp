// src/features/heatmap/routecoach/RouteCoachMenuContent.tsx
import styled from '@emotion/styled';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect, useCallback } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { createRouteCoachTask, fetchRouteCoachSummary } from '@src/features/heatmap/routecoach/api';
import { fontSizes } from '@src/styles/style';
import { toISOAboutStringWithTimezone } from '@src/utils/locale';

const POLL_MS = 1000;

/* ===== Styles ===== */
const Hint = styled.div`
  font-size: 12px;
  color: #666;
`;

const EmptyBox = styled.div`
  padding: 10px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  border: 1px dashed #bbb;
  border-radius: 8px;

  &[data-disabled='true'] > u {
    cursor: not-allowed;
  }
`;

const ErrorBox = styled.div`
  padding: 10px 12px;
  font-size: 12px;
  color: #b00020;
  background: #fff2f2;
  border-radius: 8px;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 12px;
  font-size: 12px;
  color: #555;
`;

const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
`;

const RouteCard = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  background: #f5f5f5;
  border-left: 3px solid #0a7a31;
  border-radius: 6px;

  & > div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  & span {
    font-weight: 600;
    color: #333;
  }
`;

const Component: FC<HeatmapMenuProps> = ({ className, service }) => {
  const qc = useQueryClient();
  const projectId = service.projectId;
  const sessionId = service.sessionId;
  const enabled = useMemo(() => Number.isFinite(projectId) && sessionId != null, [projectId, sessionId]);

  // ルートサマリーを取得（実行中の場合はポーリング）
  const {
    data: summary,
    isFetching,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['routeCoachSummary', projectId, sessionId],
    enabled,
    queryFn: () => {
      return fetchRouteCoachSummary(projectId!, sessionId!);
    },
    // 404の場合は無限再試行しない
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // タスク実行（queue=true で投入）→ 直後に再取得
  const { mutate: startAnalysis, isPending: isAnalyzing } = useMutation({
    mutationFn: () => createRouteCoachTask(projectId!, sessionId!),
    onSuccess: async () => {
      // タスク実行完了後、すぐに再取得開始
      await qc.invalidateQueries({ queryKey: ['routeCoachSummary', projectId, sessionId] });
    },
  });

  // ポーリング設定：タスク未実行（null）の場合は再取得しない
  useEffect(() => {
    if (summary === null && !isAnalyzing) {
      // タスク未実行状態 - ポーリング不要
      return;
    }

    // タスク実行中 or データ取得中の場合はポーリング開始
    const interval = setInterval(() => {
      if (!isAnalyzing) {
        qc.invalidateQueries({ queryKey: ['routeCoachSummary', projectId, sessionId] });
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [summary, isAnalyzing, projectId, sessionId, qc]);

  // 離脱時にポーリング停止
  useEffect(() => {
    return () => {
      qc.cancelQueries({ queryKey: ['routeCoachSummary'] });
    };
  }, [qc]);

  const busy = isAnalyzing || isFetching;
  const disabled = !enabled || busy;

  const onStartAnalysis = useCallback(() => {
    if (disabled) return;
    startAnalysis();
  }, [disabled, startAnalysis]);

  return (
    <FlexColumn gap={12}>
      <Text text={'Route Coach'} fontSize={fontSizes.large3} />
      <Button onClick={onStartAnalysis} disabled={disabled} title='セッションのルート分析を開始' scheme={'primary'} fontSize={'small'}>
        {busy ? '分析中…' : '分析開始'}
      </Button>

      {isLoading && <Hint>読み込み中…</Hint>}
      {isError && <ErrorBox>読み込みに失敗しました：{String(error?.message ?? '')}</ErrorBox>}

      {/* まだ分析がない（404→null） */}
      {!isLoading && !summary && (
        <EmptyBox onClick={onStartAnalysis} data-disabled={disabled}>
          まだ分析がありません。<u>分析開始</u>ボタンで実行できます。
        </EmptyBox>
      )}

      {/* 分析結果表示 */}
      {summary && Array.isArray(summary) && summary.length > 0 && (
        <>
          <MetaGrid>
            <span>検出ルート数: {summary.length}</span>
            <span>更新: {toISOAboutStringWithTimezone(new Date())}</span>
          </MetaGrid>

          <div>
            <Text text={'ルート一覧'} fontSize={fontSizes.small} />
            <RouteList className={`${className}__routeList`}>
              {summary.slice(0, 10).map((route, idx) => (
                <RouteCard key={idx}>
                  <div>
                    <span>Route {idx + 1}</span>
                    <span>通過: {route.traversal_count}</span>
                  </div>
                  <div>
                    <span>
                      From: ({Number(route.from.x).toFixed(0)}, {Number(route.from.z ?? 0).toFixed(0)})
                    </span>
                  </div>
                  <div>
                    <span>
                      To: ({Number(route.to.x).toFixed(0)}, {Number(route.to.z ?? 0).toFixed(0)})
                    </span>
                  </div>
                  <div>
                    <span>死亡率: {(Number(route.death_rate) * 100).toFixed(1)}%</span>
                    <span>成功率: {(Number(route.success_rate) * 100).toFixed(1)}%</span>
                  </div>
                </RouteCard>
              ))}
            </RouteList>
          </div>

          {summary.length > 10 && <Hint>最初の10ルートのみを表示しています（全{summary.length}ルート）</Hint>}
        </>
      )}

      {summary && Array.isArray(summary) && summary.length === 0 && <Hint>このセッションではルートが検出されませんでした。</Hint>}
    </FlexColumn>
  );
};

export const RouteCoachMenuContent = styled(Component)`
  &__routeList {
    /* RouteListのスタイルはRouteListコンポーネントで定義済み */
  }
`;
