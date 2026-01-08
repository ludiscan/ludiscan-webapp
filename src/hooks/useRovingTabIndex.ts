import { useCallback, useEffect, useRef, useState } from 'react';

import type { RefObject } from 'react';

export interface UseRovingTabIndexOptions {
  /** 有効/無効 */
  enabled?: boolean;
  /** 循環するかどうか */
  loop?: boolean;
  /** 方向（vertical: 上下矢印、horizontal: 左右矢印、both: 両方） */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Home/Endキーを有効にするか */
  homeEndKeys?: boolean;
  /** 初期フォーカスインデックス */
  initialIndex?: number;
  /** フォーカス変更時のコールバック */
  onFocusChange?: (index: number) => void;
  /** Enter/Spaceキー押下時のコールバック */
  onSelect?: (index: number) => void;
}

export interface UseRovingTabIndexReturn<T extends HTMLElement> {
  /** コンテナRef */
  containerRef: RefObject<T | null>;
  /** 現在のフォーカスインデックス */
  focusedIndex: number;
  /** フォーカスインデックスを設定 */
  setFocusedIndex: (index: number) => void;
  /** 各アイテムに適用するpropsを取得 */
  getItemProps: (index: number) => RovingItemProps;
}

export interface RovingItemProps {
  tabIndex: number;
  'aria-selected'?: boolean;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onFocus: () => void;
  onClick: () => void;
}

/**
 * ロービングタブインデックスフック
 * リスト/メニュー内で矢印キーによるフォーカス移動を実現
 *
 * WAI-ARIA APG パターン準拠:
 * - 1つの要素のみtabIndex=0、他はtabIndex=-1
 * - 矢印キーでフォーカス移動
 * - Home/Endで先頭/末尾へ
 *
 * @example
 * ```tsx
 * const { containerRef, getItemProps, focusedIndex } = useRovingTabIndex<HTMLUListElement>({
 *   orientation: 'vertical',
 *   onSelect: (index) => handleSelect(items[index]),
 * });
 *
 * return (
 *   <ul ref={containerRef} role="listbox">
 *     {items.map((item, index) => (
 *       <li key={item.id} role="option" {...getItemProps(index)}>
 *         {item.label}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useRovingTabIndex<T extends HTMLElement>(options: UseRovingTabIndexOptions = {}): UseRovingTabIndexReturn<T> {
  const { enabled = true, loop = true, orientation = 'vertical', homeEndKeys = true, initialIndex = 0, onFocusChange, onSelect } = options;

  const containerRef = useRef<T>(null);
  const [focusedIndex, setFocusedIndexState] = useState(initialIndex);
  const itemCountRef = useRef(0);

  // アイテム数を更新
  const updateItemCount = useCallback(() => {
    if (!containerRef.current) return;
    const focusableItems = containerRef.current.querySelectorAll('[data-roving-item]');
    itemCountRef.current = focusableItems.length;
  }, []);

  // フォーカスインデックスを設定し、実際にフォーカスを移動
  const setFocusedIndex = useCallback(
    (index: number) => {
      if (!enabled) return;
      updateItemCount();

      const count = itemCountRef.current;
      if (count === 0) return;

      let newIndex = index;
      if (loop) {
        newIndex = ((index % count) + count) % count;
      } else {
        newIndex = Math.max(0, Math.min(index, count - 1));
      }

      setFocusedIndexState(newIndex);
      onFocusChange?.(newIndex);

      // 実際の要素にフォーカスを移動
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll<HTMLElement>('[data-roving-item]');
        items[newIndex]?.focus();
      }
    },
    [enabled, loop, onFocusChange, updateItemCount],
  );

  // キーボードハンドラ
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (!enabled) return;
      updateItemCount();

      const count = itemCountRef.current;
      if (count === 0) return;

      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';

      let handled = false;

      switch (event.key) {
        case 'ArrowDown':
          if (isVertical) {
            event.preventDefault();
            setFocusedIndex(index + 1);
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            event.preventDefault();
            setFocusedIndex(index - 1);
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (isHorizontal) {
            event.preventDefault();
            setFocusedIndex(index + 1);
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (isHorizontal) {
            event.preventDefault();
            setFocusedIndex(index - 1);
            handled = true;
          }
          break;
        case 'Home':
          if (homeEndKeys) {
            event.preventDefault();
            setFocusedIndex(0);
            handled = true;
          }
          break;
        case 'End':
          if (homeEndKeys) {
            event.preventDefault();
            setFocusedIndex(count - 1);
            handled = true;
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect?.(index);
          handled = true;
          break;
      }

      if (handled) {
        event.stopPropagation();
      }
    },
    [enabled, orientation, homeEndKeys, setFocusedIndex, onSelect, updateItemCount],
  );

  // 各アイテムに適用するpropsを生成
  const getItemProps = useCallback(
    (index: number): RovingItemProps =>
      ({
        tabIndex: focusedIndex === index ? 0 : -1,
        'aria-selected': focusedIndex === index,
        'data-roving-item': true,
        onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event, index),
        onFocus: () => {
          if (focusedIndex !== index) {
            setFocusedIndexState(index);
            onFocusChange?.(index);
          }
        },
        onClick: () => {
          setFocusedIndex(index);
          onSelect?.(index);
        },
      }) as RovingItemProps,
    [focusedIndex, handleKeyDown, setFocusedIndex, onFocusChange, onSelect],
  );

  // 初期化時にアイテム数を更新
  useEffect(() => {
    updateItemCount();
  }, [updateItemCount]);

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    getItemProps,
  };
}
