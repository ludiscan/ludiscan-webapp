import { useEffect } from 'react';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { useGeneralSelect } from '@src/hooks/useGeneral';
import { focusByCoord, followLive, setSelected } from '@src/slices/selectionSlice';

// 数字3つ "a,b,c" をパース
function parseXYZ(s: string) {
  const m = s.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]), z: Number(m[3]) };
}

function parseHref(href: string) {
  // 1) xyz=...
  const m1 = href.match(/^xyz=(.+)$/i);
  if (m1) {
    const p = parseXYZ(m1[1]);
    if (p) return { kind: 'xyz', p } as const;
  }
  // 2) player=...
  const m2 = href.match(/^player=(.+)$/i);
  if (m2) {
    return { kind: 'player', playerId: String(m2[1]).trim() } as const;
  }
  // 3) 後方互換: focus:...
  if (href.startsWith('focus:')) {
    return { kind: 'focus', raw: href } as const;
  }
  return { kind: 'none' } as const;
}

export function FocusLinkBridge({ sessionId }: { sessionId?: string }) {
  const dispatch = useAppDispatch();
  const upZ = useGeneralSelect((s) => s.upZ);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const parsed = parseHref(href);
      if (parsed.kind === 'none') return;

      e.preventDefault();

      if (parsed.kind === 'xyz') {
        const { p } = parsed;
        // 単発フォーカス＋モーダル
        dispatch(focusByCoord({ point: p, openInspector: true }));
        dispatch(setSelected({ kind: 'point', worldPosition: { x: p.x, y: upZ ? p.z : p.y, z: upZ ? p.y : p.z }, label: 'point' }));
        return;
      }

      if (parsed.kind === 'player') {
        const playerId = parsed.playerId;
        const liveRefKey = `player:${playerId}:${sessionId ?? ''}`; // セッションIDで一意化
        // フォロー開始＋モーダル
        dispatch(followLive({ liveRefKey, keepDistance: true, smooth: 0.15 }));
        // 直近座標が不明でも選択は作る（座標は0で仮置き）
        dispatch(
          setSelected({
            kind: 'player-arrow',
            playerId,
            tick: 0,
            worldPosition: { x: 0, y: 0, z: 0 },
            liveRefKey,
          }),
        );
        return;
      }

      if (parsed.kind === 'focus') {
        // 既存の focus: スキームにも対応（任意）
        // 最低限 Point だけ拾いたければここで focusByCoord を呼ぶ
        // 既に実装済みなら何もしなくてOK
        return;
      }
    };

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [dispatch, sessionId, upZ]);

  return null;
}
