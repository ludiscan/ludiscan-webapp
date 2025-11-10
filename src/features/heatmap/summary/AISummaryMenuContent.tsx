// src/features/heatmap/summary/AISummaryMenuContent.tsx
import styled from '@emotion/styled';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect, useCallback } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { SessionSummary } from '@src/modeles/heatmaptask';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { MarkDownText } from '@src/component/molecules/MarkDownText';
import { useSummaryApi } from '@src/features/heatmap/summary/api';
import { useApiClient } from '@src/modeles/ApiClientContext';
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

const StatusBadge = styled.span`
  padding: 2px 6px;
  font-weight: 600;
  border-radius: 6px;

  &[data-status='done'] {
    color: #0a7a31;
    background: #ecfff1;
  }

  &[data-status='running'],
  &[data-status='queued'] {
    color: #114eb8;
    background: #eef4ff;
  }

  &[data-status='error'] {
    color: #b00020;
    background: #fff2f2;
  }
`;
const ChatCard = styled.div`
  padding: 16px;
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
`;

const Component: FC<HeatmapMenuProps> = ({ className, service }) => {
  const qc = useQueryClient();
  const projectId = service.projectId;
  const sessionId = service.sessionId;
  const enabled = useMemo(() => Number.isFinite(projectId) && sessionId != null, [projectId, sessionId]);
  const apiClient = useApiClient();

  const summaryApi = useSummaryApi();

  // プロジェクトデータを取得してis2Dフラグを取得
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await apiClient.GET('/api/v0/projects/{id}', {
        params: { path: { id: projectId } },
      });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5分
    enabled: !!projectId,
  });

  // 最新のサマリ取得（queued/running の間だけ 500ms ポーリング）
  const {
    data: summary,
    isFetching,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sessionSummary', projectId, sessionId],
    enabled,
    queryFn: () => {
      return summaryApi.fetchLatestSummary(projectId!, sessionId!);
    },
    refetchInterval: (data) => {
      if (!data || data.state.data === null) return false;
      const d = data.state.data;
      if (d as SessionSummary) {
        if (d?.status === 'done') return false;
        return d?.status === 'queued' || d?.status === 'running' ? POLL_MS : false;
      }
      return false;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // 再生成（queue=true で投入）→ 直後に再取得
  const { mutate: regenMutate, isPending: isRegenPending } = useMutation({
    mutationFn: () =>
      summaryApi.enqueueSummary({
        projectId: projectId!,
        sessionId: sessionId!,
        lang: 'ja',
        stepSize: 50,
        zVisible: !(project?.is2D ?? false), // is2Dフラグに基づいて動的に設定
        provider: 'openai', // .envの既定と揃える(gpt-4o-mini)
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['sessionSummary'] });
    },
  });

  // 離脱時にポーリング停止（任意）
  useEffect(() => {
    return () => {
      qc.cancelQueries({ queryKey: ['sessionSummary'] });
    };
  }, [qc]);

  const busy = isRegenPending || isFetching || summary?.status === 'queued' || summary?.status === 'running';

  const disabled = !enabled || busy;

  const onRegenerateMessage = useCallback(() => {
    if (disabled) return;
    regenMutate();
  }, [disabled, regenMutate]);

  return (
    <FlexColumn gap={12}>
      <Text text={'AI要約'} fontSize={fontSizes.large3} />
      <Button onClick={() => regenMutate()} disabled={disabled} title='要約を再生成（キュー投入）' scheme={'primary'} fontSize={'sm'}>
        {busy ? '生成中…' : '再生成'}
      </Button>
      {isLoading && <Hint>読み込み中…</Hint>}
      {isError && <ErrorBox>読み込みに失敗しました：{String(error?.message ?? '')}</ErrorBox>}

      {/* まだサマリーがない（404→undefined 握り） */}
      {!isLoading && !summary && (
        <EmptyBox onClick={onRegenerateMessage} data-disabled={disabled}>
          まだ要約がありません。<u>再生成</u>ボタンで作成できます。
        </EmptyBox>
      )}

      {/* サマリー表示 */}
      {summary && (
        <>
          <MetaGrid>
            <span>
              状態: <StatusBadge data-status={summary.status}>{summary.status}</StatusBadge>
            </span>
            <span>モデル: {summary.model ?? '-'}</span>
            <span>プロバイダ: {summary.provider}</span>
            <span>作成: {toISOAboutStringWithTimezone(new Date(summary.created_at))}</span>
          </MetaGrid>

          {/* 本文（Markdownをそのまま表示。必要ならMDレンダラに差し替え可） */}
          {summary.summary_md && (
            <ChatCard>
              <MarkDownText className={`${className}__markdown`} markdown={summary.summary_md} />
            </ChatCard>
          )}

          {/* 失敗時の補足 */}
          {summary.status === 'error' && !summary.summary_md && <ErrorBox>生成に失敗しました。もう一度「再生成」をお試しください。</ErrorBox>}
        </>
      )}
    </FlexColumn>
  );
};

export const AISummaryMenuContent = styled(Component)`
  &__markdown {
    position: relative;
    flex: 1;
    margin: 0;
    overflow: auto;
    font-family: inherit;
    font-size: 12px;
    line-height: 1.3;
    text-align: start;
  }

  &__markdown::before {
    position: absolute;
    top: -10px;
    left: 0;
    font-size: 16px;
    content: '🤖';
  }

  &__markdown > ul {
    padding-inline-start: 10px;
  }
`;
