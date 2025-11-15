import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Vector3 } from 'three';

import type { Vec3 } from '@src/slices/selectionSlice';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { getLiveObject } from '@src/features/heatmap/selection/liveObjectRegistry';
import { useAppDispatch, useAppSelector } from '@src/hooks/useDispatch';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { followLive, setFocusTarget, setSelected, stopFollow } from '@src/slices/selectionSlice';

export function useLiveWorldPosition(liveRefKey?: string, fps = 15) {
  const [pos, setPos] = useState<Vec3 | null>(null);
  const tmp = useRef(new Vector3()).current;

  useEffect(() => {
    if (!liveRefKey) return;
    let raf = 0,
      last = 0;

    const loop = (t: number) => {
      if (t - last >= 1000 / fps) {
        const obj = getLiveObject(liveRefKey);
        if (obj) {
          obj.getWorldPosition(tmp);
          setPos({ x: tmp.x, y: tmp.y, z: tmp.z });
        }
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [liveRefKey, fps, tmp]);

  return pos;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      <div style={{ opacity: 0.7 }}>{label}</div>
      <div style={{ fontFamily: 'monospace' }}>{value}</div>
    </div>
  );
}

export const InspectorModalComponent: FC<{ className?: string }> = ({ className }) => {
  const sel = useAppSelector((s) => s.selection.selected);
  const focus = useAppSelector((s) => s.selection.focusTarget);
  const dispatch = useAppDispatch();
  const { theme } = useSharedTheme();

  // ライブ座標（player-arrowのみ）
  const livePos = useLiveWorldPosition((sel?.kind === 'player-arrow' && sel?.liveRefKey) || '', 15);

  const pos = livePos ?? sel?.worldPosition;

  const title = useMemo(() => {
    switch (sel?.kind) {
      case 'map-mesh':
        return sel.name ?? 'Map Mesh';
      case 'heatmap-cell':
        return `Heatmap Cell #${sel.index}`;
      case 'player-arrow':
        return `Player ${sel.playerId} @ ${sel.tick}`;
      case 'point':
        return sel.label ?? 'Point';
    }
  }, [sel]);

  const isFollowingThis = focus?.type === 'follow' && sel?.kind === 'player-arrow' && !!sel.liveRefKey && focus.liveRefKey === sel.liveRefKey;

  const focusHere = () => {
    if (pos) {
      dispatch(setFocusTarget({ type: 'point', point: pos, keepDistance: false }));
    }
  };

  const toggleFollow = useCallback(() => {
    if (sel?.kind !== 'player-arrow' || !sel.liveRefKey) return;
    if (isFollowingThis) dispatch(stopFollow());
    else dispatch(followLive({ liveRefKey: sel.liveRefKey, keepDistance: true, smooth: 0.15 }));
  }, [dispatch, isFollowingThis, sel]);

  if (!sel) return null;

  return (
    <Card className={className} color={theme.colors.surface.sunken} border={theme.colors.border.default} blur>
      {title && <Text text={title} fontSize={theme.typography.fontSize['2xl']} />}

      <div style={{ display: 'grid', gap: 6 }}>
        <Field label='Position' value={`${pos?.x.toFixed(3)}, ${pos?.y.toFixed(3)}, ${pos?.z.toFixed(3)}`} />

        {sel.kind === 'map-mesh' && <Field label='UUID' value={sel.uuid} />}
        {sel.kind === 'heatmap-cell' && <Field label='Density' value={sel.density ?? '-'} />}
      </div>

      <hr style={{ margin: '12px 0', opacity: 0.2 }} />

      <InlineFlexRow align={'center'} gap={8}>
        <Button onClick={focusHere} scheme={'surface'} fontSize={'sm'}>
          Center camera
        </Button>

        {sel.kind === 'player-arrow' && sel.liveRefKey && <button onClick={toggleFollow}>{isFollowingThis ? 'Stop following' : 'Follow this player'}</button>}
      </InlineFlexRow>
      <Button className={`${className}__close`} onClick={() => dispatch(setSelected(null))} scheme={'none'} fontSize={'sm'}>
        <IoClose />
      </Button>
    </Card>
  );
};

export const InspectorModal = styled(InspectorModalComponent)`
  position: relative;

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
  }
`;
