import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { createClient, DefaultStaleTime } from '@src/modeles/qeury';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

const PRESETS = [25, 50, 75, 100, 150, 200, 300, 400];

type Props = { className?: string; service: HeatmapDataService };

function Toolbar({ className, service }: Props) {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(100);
  const [selectSessionId, setSelectSessionId] = useState<string | undefined>(undefined);

  const { data: sessions } = useQuery({
    queryKey: ['sessions', service.projectId],
    queryFn: async () => {
      if (!service.projectId) return;
      const { data, error } = await createClient().GET('/api/v0/projects/{project_id}/play_session', {
        params: {
          path: {
            project_id: service.projectId,
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
      <Button className='btn' onClick={() => step(-1)} aria-label='Zoom out' scheme={'surface'} fontSize={'small'}>
        −
      </Button>
      <div className='select'>
        <Button className='btn wide' onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup='listbox' fontSize={'small'} scheme={'surface'}>
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

      <Button onClick={() => step(1)} aria-label='Zoom in' scheme={'surface'} fontSize={'small'}>
        ＋
      </Button>
      <Button className='btn wide' onClick={fit} title='Fit (0)' scheme={'surface'} fontSize={'small'}>
        Fit
      </Button>
      <Button className='btn wide' onClick={oneToOne} title='1:1' scheme={'surface'} fontSize={'small'}>
        1:1
      </Button>
      <InlineFlexRow align={'center'} wrap={'nowrap'}>
        <Selector placement={'top'} align={'right'} label={'session'} options={sessionIds} value={selectSessionId} onChange={setSelectSessionId} />
        <Button
          fontSize={'small'}
          onClick={() => service.setSessionId(Number(selectSessionId) || null)}
          scheme={'primary'}
          disabled={selectSessionId === undefined}
        >
          <Text text={'filter'} />
        </Button>
      </InlineFlexRow>
    </div>
  );
}

export const QuickToolbar = styled(Toolbar)`
  /* 行としてレイアウトに参加させる（オーバーレイにしない） */
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  justify-content: end;
  width: calc(100% - 64px);
  padding: 4px 32px;
  background: ${({ theme }) => theme.colors.surface.main};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};

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
    background: ${({ theme }) => theme.colors.surface.main};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: 8px;
    box-shadow: 0 6px 16px rgb(0 0 0 / 8%);
  }

  .item {
    width: 100%;
    padding: 8px;
    color: ${({ theme }) => theme.colors.text};
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.dark};
    }
  }
`;
