import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';

import type { FC } from 'react';
import type { Group, Material } from 'three';

import { Button } from '@src/component/atoms/Button';
import { FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { fontSizes } from '@src/styles/style';

export type ObjectToggleListProps = {
  className?: string;
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

/**
 * material のクローンを生成して、透明度（opacity）を設定する
 */
const updateAlpha = (material: Material | Material[], alpha: number): Material | Material[] => {
  if (Array.isArray(material)) {
    return material.map((mat) => {
      const clone = mat.clone();
      clone.transparent = true;
      clone.opacity = alpha;
      clone.needsUpdate = true;
      return clone;
    });
  }
  const clone = material.clone();
  clone.transparent = true;
  clone.opacity = alpha;
  clone.needsUpdate = true;
  return clone;
};

/**
 * child の表示状態（0: フル表示, 1: 半透明表示, 2: 非表示）を更新する関数
 */
const updateChildDisplay = (child: { visible: boolean; material?: Material | Material[] } & { uuid: string }, state: number) => {
  if (state === 0) {
    // フル表示
    child.visible = true;
    if ('material' in child && child.material) {
      child.material = updateAlpha(child.material, 1);
    }
  } else if (state === 1) {
    // 半透明表示 (opacity: 0.5)
    child.visible = true;
    if ('material' in child && child.material) {
      child.material = updateAlpha(child.material, 0.5);
    }
  } else if (state === 2) {
    // 非表示
    child.visible = false;
  }
};

/**
 * 各子要素の表示状態を 0: フル表示, 1: 半透明表示, 2: 非表示 とする
 */
const Component: FC<ObjectToggleListProps> = ({ className, model }) => {
  // displayState は各子要素の状態を uuid ごとに管理する
  const [displayState, setDisplayState] = useState<Record<string, number>>({});

  // 0: フル表示, 1: 半透明表示, 2: 非表示, 3: custom(個別設定)
  const [allToggleState, setAllToggleState] = useState<number>(0);

  // 初回または model が変更された際、各子要素の状態（0: フル表示）を一括で設定する
  useEffect(() => {
    const initState: Record<string, number> = {};
    model.children.forEach((child) => {
      initState[child.uuid] = 0;
      // 初期状態としてフル表示に合わせて更新
      updateChildDisplay(child, 0);
    });
    setDisplayState(initState);
  }, [model]);

  // クリックごとに状態をローテーション (0 -> 1 -> 2 -> 0) し、対象の child のみ更新する
  const toggleDisplayState = useCallback(
    (uuid: string) => {
      setDisplayState((prev) => {
        const current = prev[uuid] ?? 0;
        const newState = (current + 1) % 3;
        // 対象の child を特定
        const targetChild = model.children.find((child) => child.uuid === uuid);
        if (targetChild) {
          updateChildDisplay(targetChild, newState);
        }
        return { ...prev, [uuid]: newState };
      });
      setAllToggleState(3);
    },
    [model.children],
  );

  useEffect(() => {
    if (allToggleState === 3) return;
    model.children.forEach((child) => {
      updateChildDisplay(child, allToggleState);
      setDisplayState((prev) => ({ ...prev, [child.uuid]: allToggleState }));
    });
  }, [allToggleState, model]);

  return (
    <div className={className}>
      {/* 親ラベル */}
      <FlexRow className={`${className}__parent-label`} align={'center'} gap={8}>
        <Text text={(model as Group).name || 'Mesh'} fontSize={fontSizes.medium} />
        <Button scheme={'none'} fontSize={'large1'} className={`${className}__visibleButton`} onClick={() => setAllToggleState((allToggleState + 1) % 3)}>
          {allToggleState === 0 ? (
            <IoMdEye />
          ) : allToggleState === 1 ? (
            <Text text={'0.5'} fontSize={fontSizes.small} fontWeight={'bold'} />
          ) : allToggleState === 2 ? (
            <IoMdEyeOff />
          ) : (
            <Text text={'--'} fontSize={fontSizes.small} fontWeight={'bold'} />
          )}
        </Button>
      </FlexRow>

      {/* 子要素リスト */}
      <ul className={`${className}__child-list`}>
        {model.children.map((child) => (
          <li key={child.uuid}>
            <InlineFlexRow align={'center'} gap={4}>
              <Text text={child.name || child.type} fontSize={fontSizes.small} />
              <Button onClick={() => toggleDisplayState(child.uuid)} scheme={'none'} fontSize={'large1'} className={`${className}__visibleButton`}>
                {displayState[child.uuid] === 0 ? (
                  <IoMdEye />
                ) : displayState[child.uuid] === 1 ? (
                  <Text text={'0.5'} fontSize={fontSizes.small} fontWeight={'bold'} />
                ) : (
                  <IoMdEyeOff />
                )}
              </Button>
            </InlineFlexRow>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ObjectToggleList = styled(Component)`
  /* 全体の余白やフォント */
  position: relative;

  /* 親ラベル ("Mesh") のスタイル */
  &__parent-label {
    position: relative;
    left: 6px;
    height: 20px;
    padding: 4px 0;
    font-weight: bold;
  }

  /* 親ラベルから子リストへ続く短い横線 */
  &__parent-label::after {
    position: absolute;
    top: 50%;
    left: -20px;
    width: 20px;
    height: 2px;
    content: '';
    background: #ccc;
  }

  /* 子リスト */
  &__child-list {
    position: relative;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  /* 各子要素 (li) */
  &__child-list li {
    position: relative;
    padding: 2px 0;
    padding-left: 20px;
  }

  /* 横線 */
  &__child-list li::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 18px;
    height: 2px;
    content: '';
    background: #ccc;
  }

  /* 縦線 */
  &__child-list li::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -2px;
    width: 2px;
    content: '';
    background: #ccc;
  }

  /* 最後の li 要素だけは縦線を途中で止める */
  &__child-list li:last-child::after {
    bottom: calc(50% - 2px);
  }

  /* 1行目の場合、上寄りに線を調整する */
  &__child-list li:first-of-type::after {
    top: -8px;
  }

  /* ボタン（眼アイコン） */
  &__visibleButton {
    display: flex;
    align-content: center;
  }
`;
