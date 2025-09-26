import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';

import type { FC } from 'react';
import type { Group, Material } from 'three';

import { Button } from '@src/component/atoms/Button';
import { FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { fontSizes } from '@src/styles/style';

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
      };
};

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
  const name = (model as Group).name || 'Model';
  return `ObjectToggleList:${mapName}:${name}`;
};

const Component: FC<ObjectToggleListProps> = ({ className, model, mapName }) => {
  const storageKey = useMemo(() => makeStorageKey(mapName, model), [mapName, model]);

  // child.uuid -> { visible, opacity }
  const [displayState, setDisplayState] = useState<DisplayState>({});

  // material キャッシュ: child.uuid -> { '1.0'?: mat, '0.5'?: mat }
  const matCacheRef = useRef<Map<string, Partial<Record<OpacityLevel, Material | Material[]>>>>(new Map());

  // 初期化：localStorage から復元 or デフォルト可視(1.0)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    const init: DisplayState = {};
    model.children.forEach((child) => {
      init[child.uuid] = { visible: true, opacity: 1.0 };
    });
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DisplayState;
        // 既存 child のみ復帰
        for (const uuid of Object.keys(init)) {
          if (parsed[uuid]) init[uuid] = parsed[uuid];
        }
      } catch {
        // 破損時は無視
      }
    }
    setDisplayState(init);
  }, [storageKey, model]);

  // displayState が変わったら Three 側へ反映 + 保存
  useEffect(() => {
    // Threeに適用
    model.children.forEach((child) => {
      const s = displayState[child.uuid];
      if (!s) return;
      child.visible = s.visible;
      if (!s.visible) return;

      if ('material' in child) {
        // キャッシュから取り出す or 生成
        const cache = matCacheRef.current.get(child.uuid) ?? {};
        let cloned = cache[s.opacity];
        if (!cloned) {
          const base = cache[1.0] ?? child.material; // 既に1.0をクローンしていればそれをベースにしてもOK
          if (base) {
            cloned = cloneWithOpacity(base, s.opacity);
            cache[s.opacity] = cloned;
            matCacheRef.current.set(child.uuid, cache);
          }
        }
        child.material = cloned;
      }
    });

    // 保存
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

  return (
    <div className={className}>
      {/* 親ラベル */}
      <FlexRow className={`${className}__parent-label`} align={'center'} gap={8}>
        <Text text={(model as Group).name || 'Mesh'} fontSize={fontSizes.medium} />
        {/* 全体 visible トグル */}
        <Button
          scheme={'none'}
          fontSize={'large1'}
          className={`${className}__visibleButton`}
          onClick={() => setAllVisible(!allVisible)}
          aria-label={allVisible ? 'Hide all' : 'Show all'}
        >
          {allVisible ? <IoMdEye /> : anyVisible ? <IoMdEye /> : <IoMdEyeOff />}
        </Button>
        {/* 全体 opacity トグル（visible時のデフォルトを合わせるイメージ） */}
        <Button
          scheme={'none'}
          fontSize={'smallest'}
          className={`${className}__opacityButton`}
          onClick={() => setAllOpacity(majorityOpacity === 1.0 ? 0.5 : 1.0)}
          disabled={!anyVisible}
          aria-label={'Toggle opacity for all visible'}
        >
          <Text text={majorityOpacity.toFixed(1)} fontSize={fontSizes.small} fontWeight={'bold'} />
        </Button>
      </FlexRow>

      {/* 子要素リスト */}
      <ul className={`${className}__child-list`}>
        {model.children.map((child) => {
          const s = displayState[child.uuid];
          const visible = s?.visible ?? true;
          const opacity = s?.opacity ?? 1.0;
          return (
            <li key={child.uuid}>
              <InlineFlexRow align={'center'} gap={6}>
                <Text text={child.name || child.type} fontSize={fontSizes.small} />
                {/* 個別 visible */}
                <Button
                  onClick={() => toggleChildVisible(child.uuid)}
                  scheme={'none'}
                  fontSize={'large1'}
                  className={`${className}__visibleButton`}
                  aria-label={visible ? 'Hide' : 'Show'}
                >
                  {visible ? <IoMdEye /> : <IoMdEyeOff />}
                </Button>
                {/* 個別 opacity：visible の時だけ表示 */}
                {visible && (
                  <Button
                    fontSize={'smallest'}
                    onClick={() => toggleChildOpacity(child.uuid)}
                    scheme={'none'}
                    className={`${className}__opacityButton`}
                    aria-label={'Toggle opacity'}
                  >
                    <Text text={opacity.toFixed(1)} fontSize={fontSizes.small} fontWeight={'bold'} />
                  </Button>
                )}
              </InlineFlexRow>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const ObjectToggleList = styled(Component)`
  position: relative;

  &__parent-label {
    position: relative;
    left: 6px;
    height: 20px;
    padding: 4px 0;
    font-weight: bold;
  }

  &__parent-label::after {
    position: absolute;
    top: 50%;
    left: -20px;
    width: 20px;
    height: 2px;
    content: '';
    background: #ccc;
  }

  &__child-list {
    position: relative;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__child-list li {
    position: relative;
    padding: 2px 0;
    padding-left: 20px;
  }

  &__child-list li::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 18px;
    height: 2px;
    content: '';
    background: #ccc;
  }

  &__child-list li::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -2px;
    width: 2px;
    content: '';
    background: #ccc;
  }

  &__child-list li:last-child::after {
    bottom: calc(50% - 2px);
  }

  &__child-list li:first-of-type::after {
    top: -8px;
  }

  &__visibleButton,
  &__opacityButton {
    display: flex;
    align-content: center;
    min-width: 28px;
  }
`;
