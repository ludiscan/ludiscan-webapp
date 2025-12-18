import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { MdOpacity } from 'react-icons/md';

import type { FC } from 'react';
import type { Group, Material, Object3D } from 'three';

import { FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { layers } from '@src/styles/style';

export type ObjectToggleListProps = {
  className?: string;
  mapName: string;
  model:
    | Group
    | {
        name?: string;
        children: {
          uuid: string;
          name?: string;
          type: string;
          visible: boolean;
          material?: Material | Material[];
        }[];
      }
    | undefined;
};

export function setRaycastLayerRecursive(obj: Object3D, enabled: boolean) {
  if (enabled) obj.layers?.enable(layers.raycast);
  else obj.layers?.disable(layers.raycast);
  if ('children' in obj) {
    for (const c of obj.children) setRaycastLayerRecursive(c, enabled);
  }
}

// ---- helpers ----
type OpacityLevel = 0.5 | 1.0;
type ChildState = { visible: boolean; opacity: OpacityLevel };
type DisplayState = Record<string, ChildState>;

/** 配列/単体どちらの Material でも clone + opacity 設定 */
const cloneWithOpacity = (mat: Material | Material[], opacity: number): Material | Material[] => {
  const apply = (m: Material) => {
    const c = m.clone();
    c.transparent = opacity < 1.0 ? true : c.transparent || false;
    c.opacity = opacity;
    c.needsUpdate = true;
    return c;
  };
  return Array.isArray(mat) ? mat.map(apply) : apply(mat);
};

/** key 生成（モデル名 + 子uuid列） */
const makeStorageKey = (mapName: string, model: ObjectToggleListProps['model']) => {
  const name = model && 'name' in model ? model.name : 'Model';
  return `ObjectToggleList:${mapName}:${name}`;
};

const Component: FC<ObjectToggleListProps> = ({ className, model, mapName }) => {
  const { theme } = useSharedTheme();
  const storageKey = useMemo(() => makeStorageKey(mapName, model), [mapName, model]);

  // child.uuid -> { visible, opacity }
  const [displayState, setDisplayState] = useState<DisplayState>({});

  // material キャッシュ: child.uuid -> { '1.0'?: mat, '0.5'?: mat }
  const matCacheRef = useRef<Map<string, Partial<Record<OpacityLevel, Material | Material[]>>>>(new Map());

  // 初期化：localStorage から復元 or デフォルト可視(1.0)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    const init: DisplayState = {};
    model?.children.forEach((child) => {
      // any: Object3D を受ける
      init[child.uuid] = { visible: true, opacity: 1.0 };
    });
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DisplayState;
        for (const uuid of Object.keys(init)) {
          if (parsed[uuid]) init[uuid] = parsed[uuid];
        }
      } catch {
        // 破損時は無視
      }
    }
    setDisplayState(init);

    // ★ レイヤー初期化（現在の可視状態に合わせる）
    model?.children.forEach((child) => {
      const s = init[child.uuid];
      setRaycastLayerRecursive(child as Object3D, !!s?.visible);
    });
  }, [storageKey, model]);

  // displayState が変わったら Three 側へ反映 + 保存
  useEffect(() => {
    model?.children.forEach((child) => {
      const s = displayState[child.uuid];
      if (!s) return;

      // 描画の可視/透明度
      child.visible = s.visible;
      if ('material' in child && s.visible) {
        const cache = matCacheRef.current.get(child.uuid) ?? {};
        let cloned = cache[s.opacity];
        if (!cloned) {
          const base = cache[1.0] ?? child.material;
          if (base) {
            cloned = cloneWithOpacity(base, s.opacity);
            cache[s.opacity] = cloned;
            matCacheRef.current.set(child.uuid, cache);
          }
        }
        child.material = cloned;
      }

      // ★ レイキャスト可否（可視に連動）
      setRaycastLayerRecursive(child as unknown as Object3D, s.visible);
    });

    if (typeof window !== 'undefined' && Object.keys(displayState).length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(displayState));
    }
  }, [displayState, model, storageKey]);

  // アンマウント時: クローンを dispose
  useEffect(() => {
    // ref.current のスナップショットを取る
    const cache = matCacheRef.current;
    const levels: (0.5 | 1.0)[] = [1.0, 0.5];

    return () => {
      cache.forEach((entry) => {
        levels.forEach((lv) => {
          const m = entry[lv];
          if (!m) return;
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose?.());
          else m.dispose?.();
        });
      });
      cache.clear();
    };
  }, []);

  // ---- UI handlers ----
  const setAllVisible = useCallback((visible: boolean) => {
    setDisplayState((prev) => {
      const next: DisplayState = {};
      for (const [uuid, s] of Object.entries(prev)) next[uuid] = { ...s, visible };
      return next;
    });
  }, []);

  const setAllOpacity = useCallback((opacity: OpacityLevel) => {
    setDisplayState((prev) => {
      const next: DisplayState = {};
      for (const [uuid, s] of Object.entries(prev)) next[uuid] = { ...s, opacity };
      return next;
    });
  }, []);

  const toggleChildVisible = useCallback((uuid: string) => {
    setDisplayState((prev) => ({ ...prev, [uuid]: { ...prev[uuid], visible: !prev[uuid].visible } }));
  }, []);

  const toggleChildOpacity = useCallback((uuid: string) => {
    setDisplayState((prev) => {
      const cur = prev[uuid];
      const nextOpacity: OpacityLevel = cur.opacity === 1.0 ? 0.5 : 1.0;
      return { ...prev, [uuid]: { ...cur, opacity: nextOpacity } };
    });
  }, []);

  // 親 UI の現在集計
  const anyVisible = useMemo(() => Object.values(displayState).some((s) => s.visible), [displayState]);
  const allVisible = useMemo(() => Object.values(displayState).length > 0 && Object.values(displayState).every((s) => s.visible), [displayState]);
  const majorityOpacity: OpacityLevel = useMemo(() => {
    const vs = Object.values(displayState);
    if (vs.length === 0) return 1.0;
    const half = vs.filter((s) => s.opacity === 0.5).length;
    return half > vs.length / 2 ? 0.5 : 1.0;
  }, [displayState]);

  if (model === undefined) {
    return null;
  }

  return (
    <div className={className}>
      {/* ヘッダー: モデル名 + 一括操作 */}
      <div className={`${className}__header`}>
        <Text text={(model as Group).name || 'Objects'} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
        <FlexRow gap={2}>
          <button
            type='button'
            className={`${className}__bulk-btn`}
            onClick={() => setAllVisible(!allVisible)}
            aria-label={allVisible ? 'Hide all' : 'Show all'}
            title={allVisible ? 'Hide all' : 'Show all'}
          >
            {allVisible ? <IoMdEye size={14} /> : anyVisible ? <IoMdEye size={14} /> : <IoMdEyeOff size={14} />}
          </button>
          <button
            type='button'
            className={`${className}__bulk-btn ${!anyVisible ? `${className}__bulk-btn--disabled` : ''}`}
            onClick={() => setAllOpacity(majorityOpacity === 1.0 ? 0.5 : 1.0)}
            disabled={!anyVisible}
            aria-label={'Toggle opacity for all'}
            title={`Set all to ${majorityOpacity === 1.0 ? '50%' : '100%'}`}
          >
            <MdOpacity size={14} />
          </button>
        </FlexRow>
      </div>

      {/* レイヤーリスト */}
      <ul className={`${className}__list`}>
        {model.children.map((child) => {
          const s = displayState[child.uuid];
          const visible = s?.visible ?? true;
          const opacity = s?.opacity ?? 1.0;
          const isHalfOpacity = opacity === 0.5;

          return (
            <li
              key={child.uuid}
              className={`${className}__item ${visible ? `${className}__item--visible` : ''} ${isHalfOpacity ? `${className}__item--half` : ''}`}
            >
              <button
                type='button'
                className={`${className}__visibility`}
                onClick={() => toggleChildVisible(child.uuid)}
                aria-label={visible ? 'Hide' : 'Show'}
                title={visible ? 'Hide' : 'Show'}
              >
                {visible ? <IoMdEye size={14} /> : <IoMdEyeOff size={14} />}
              </button>
              <span className={`${className}__name`} title={child.name || child.type}>
                {child.name || child.type}
              </span>
              <button
                type='button'
                className={`${className}__opacity`}
                onClick={() => toggleChildOpacity(child.uuid)}
                disabled={!visible}
                aria-label={`Opacity: ${opacity * 100}%`}
                title={`Opacity: ${opacity * 100}%`}
              >
                <MdOpacity size={12} />
                <span className={`${className}__opacity-value`}>{Math.round(opacity * 100)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const ObjectToggleList = styled(Component)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borders.radius.md};

  /* ヘッダー */
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: ${({ theme }) => theme.colors.surface.raised};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  /* 一括操作ボタン */
  &__bulk-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition:
      background-color 0.12s ease,
      color 0.12s ease;

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.hover};
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.surface.pressed};
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.3;
    }
  }

  /* レイヤーリスト */
  &__list {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    list-style: none;
    background: ${({ theme }) => theme.colors.surface.base};
  }

  /* レイヤーアイテム */
  &__item {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 28px;
    padding: 0 6px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
    transition: background-color 0.1s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
    }
  }

  /* 表示トグルボタン */
  &__visibility {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    color: var(--visibility-color, ${({ theme }) => theme.colors.text.tertiary});
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition:
      background-color 0.1s ease,
      color 0.1s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.interactive};
    }
  }

  /* オブジェクト名 */
  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: var(--name-color, ${({ theme }) => theme.colors.text.secondary});
    white-space: nowrap;
    opacity: var(--name-opacity, 1);
  }

  /* 透明度ボタン */
  &__opacity {
    display: flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: center;
    justify-content: center;
    height: 18px;
    padding: 0 4px;
    font-size: 10px;
    color: var(--opacity-color, ${({ theme }) => theme.colors.text.tertiary});
    cursor: pointer;
    background: var(--opacity-bg, transparent);
    border: none;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition:
      background-color 0.1s ease,
      color 0.1s ease;

    &:disabled {
      cursor: default;
      opacity: 0.3;
    }

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.interactive};
    }
  }

  &__opacity-value {
    min-width: 18px;
    font-weight: 500;
    text-align: right;
  }

  /* アイテム状態: visible */
  &__item--visible {
    --visibility-color: ${({ theme }) => theme.colors.primary.main};
    --name-color: ${({ theme }) => theme.colors.text.primary};
  }

  /* アイテム状態: half opacity */
  &__item--half {
    --opacity-color: ${({ theme }) => theme.colors.text.inverse};
    --opacity-bg: ${({ theme }) => theme.colors.primary.main};
    --name-opacity: 0.6;
  }
`;
