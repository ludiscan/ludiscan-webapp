import styled from '@emotion/styled';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { useRouteCoachApi } from '@src/features/heatmap/routecoach/api';
import { useGeneralPatch, useGeneralSelect } from '@src/hooks/useGeneral';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

const PRESETS = [25, 50, 75, 100, 150, 200, 300, 400];

type Props = { className?: string; service: HeatmapDataService };

function Toolbar({ className, service }: Props) {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(100);
  const [selectSessionId, setSelectSessionId] = useState<string | undefined>(undefined);
  const qc = useQueryClient();
  const apiClient = useApiClient();
  const routeCoachApi = useRouteCoachApi();

  // 2D/3Dモード切り替え用のstate取得
  const dimensionalityOverride = useGeneralSelect((s) => s.dimensionalityOverride);
  const patchGeneral = useGeneralPatch();

  const { data: sessions } = useQuery({
    queryKey: ['sessions', service.projectId],
    queryFn: async () => {
      if (!service.projectId) return;
      const { data, error } = await apiClient.GET('/api/v0/projects/{project_id}/play_session', {
        params: {
          path: {
            project_id: service.projectId,
          },
          query: {
            limit: 200,
            offset: 0,
          },
        },
      });
      if (error) return;
      return data;
    },
    staleTime: DefaultStaleTime,
    enabled: service.projectId !== undefined,
  });

  const sessionIds = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];
    return sessions?.map((session) => String(session.sessionId)) || [];
  }, [sessions]);

  // RouteCoach改善ルート生成
  const { mutate: startRouteCoach, isPending: isRouteCoachPending } = useMutation({
    mutationFn: async () => {
      if (!service.projectId) throw new Error('Project is required');
      return routeCoachApi.generateImprovementRoutes(service.projectId);
    },
    onSuccess: async () => {
      // 生成後、RouteCoachメニューのキャッシュを無効化
      await qc.invalidateQueries({ queryKey: ['eventClusters'] });
      await qc.invalidateQueries({ queryKey: ['improvementRoutesJob'] });
      // メニューを自動開く
      heatMapEventBus.emit('click-menu-icon', { name: 'routecoach' });
    },
  });

  useEffect(() => {
    const onPercent = (e: CustomEvent<{ percent: number }>) => setPercent(e.detail.percent);
    heatMapEventBus.on('camera:percent', onPercent);
    return () => heatMapEventBus.off('camera:percent', onPercent);
  }, []);

  const step = useCallback(
    (dir: -1 | 1) => {
      const idx = PRESETS.findIndex((v) => v >= percent);
      const safeIdx = idx === -1 ? PRESETS.length - 1 : idx;
      const next = PRESETS[Math.min(PRESETS.length - 1, Math.max(0, safeIdx + dir))];
      heatMapEventBus.emit('camera:set-zoom-percent', { percent: next });
    },
    [percent],
  );

  const setPreset = (p: number) => {
    heatMapEventBus.emit('camera:set-zoom-percent', { percent: p });
    setOpen(false);
  };

  const fit = () => heatMapEventBus.emit('camera:fit');
  const oneToOne = () => heatMapEventBus.emit('camera:set-zoom-percent', { percent: 100 });

  // 2D/3Dモード切り替えハンドラー
  const toggleDimensionality = useCallback(() => {
    if (!dimensionalityOverride) {
      // nullの場合は、最初にクリックしたら2Dに固定
      patchGeneral({ dimensionalityOverride: '2d' });
    } else if (dimensionalityOverride === '2d') {
      // 2Dの場合は3Dに切り替え
      patchGeneral({ dimensionalityOverride: '3d' });
    } else {
      // 3Dの場合はnullに戻す（project.is2Dに従う）
      patchGeneral({ dimensionalityOverride: null });
    }
  }, [dimensionalityOverride, patchGeneral]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === '+') step(1);
      if (ev.key === '-') step(-1);
      if (ev.key === '0') fit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [percent, step]);

  return (
    <div className={className} role='toolbar' aria-label='Viewer quick tools'>
      <Button className='btn' onClick={() => step(-1)} aria-label='Zoom out' scheme={'surface'} fontSize={'sm'}>
        −
      </Button>
      <div className='select'>
        <Button className='btn wide' onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup='listbox' fontSize={'sm'} scheme={'surface'}>
          <span className='tabnum'>{percent}%</span>
          <span className='caret'>▾</span>
        </Button>
        {open && (
          <ul className='dropdown' role='listbox'>
            {PRESETS.map((p) => (
              <li key={p}>
                <button className='item' role='option' aria-selected={p === percent} onClick={() => setPreset(p)}>
                  {p}%
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button onClick={() => step(1)} aria-label='Zoom in' scheme={'surface'} fontSize={'sm'}>
        ＋
      </Button>
      <Button className='btn wide' onClick={fit} title='Fit (0)' scheme={'surface'} fontSize={'sm'}>
        Fit
      </Button>
      <Button className='btn wide' onClick={oneToOne} title='1:1' scheme={'surface'} fontSize={'sm'}>
        1:1
      </Button>
      <InlineFlexRow align={'center'} wrap={'nowrap'}>
        <Selector
          placement={'top'}
          align={'right'}
          label={'session'}
          options={sessionIds}
          value={selectSessionId}
          onChange={setSelectSessionId}
          maxHeight={250}
        />
        <Button
          fontSize={'sm'}
          onClick={() => service.setSessionId(Number(selectSessionId) || null)}
          scheme={'primary'}
          disabled={selectSessionId === undefined}
        >
          <Text text={'filter'} />
        </Button>
        <Button
          fontSize={'sm'}
          onClick={toggleDimensionality}
          scheme={'surface'}
          title={`現在: ${dimensionalityOverride || 'Auto'}モード。クリックして切り替え`}
          className='dimension-toggle'
        >
          <Text text={dimensionalityOverride === '2d' ? '2D' : dimensionalityOverride === '3d' ? '3D' : 'Auto'} />
        </Button>
        <Button
          fontSize={'sm'}
          onClick={() => startRouteCoach()}
          scheme={'primary'}
          disabled={!service.projectId || isRouteCoachPending}
          title='プロジェクトの改善ルートを生成'
        >
          <Text text={isRouteCoachPending ? '生成中…' : 'Generate Routes'} />
        </Button>
      </InlineFlexRow>
    </div>
  );
}

export const QuickToolbar = memo(
  styled(Toolbar)`
    /* 行としてレイアウトに参加させる（オーバーレイにしない） */
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    justify-content: end;
    width: calc(100% - 64px);
    padding: 4px 32px;
    background: ${({ theme }) => theme.colors.surface.base};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

    .wide {
      min-width: 56px;
    }

    .tabnum {
      font-variant-numeric: tabular-nums;
    }

    .select {
      position: relative;
    }

    .caret {
      margin-left: 6px;
      font-size: 10px;
    }

    .dropdown {
      position: absolute;
      top: 36px;
      left: 0;
      z-index: 10;
      width: 90px;
      padding: 4px;
      list-style: none;
      background: ${({ theme }) => theme.colors.surface.base};
      border: 1px solid ${({ theme }) => theme.colors.border.default};
      border-radius: 8px;
      box-shadow: 0 6px 16px rgb(0 0 0 / 8%);
    }

    .item {
      width: 100%;
      padding: 8px;
      color: ${({ theme }) => theme.colors.text.primary};
      text-align: left;
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: 6px;

      &:hover {
        background: ${({ theme }) => theme.colors.surface.raised};
      }
    }
  `,
  (prev, next) => {
    return prev.className === next.className && prev.service.projectId === next.service.projectId;
  },
);

QuickToolbar.displayName = 'QuickToolbar';
