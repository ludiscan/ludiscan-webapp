import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

/**
 * フォーカス復帰フック
 * モーダルやドロップダウンが閉じた際に、元のトリガー要素にフォーカスを戻す
 *
 * @example
 * ```tsx
 * const triggerRef = useFocusReturn<HTMLButtonElement>(isOpen);
 *
 * return (
 *   <>
 *     <button ref={triggerRef} onClick={open}>Open Modal</button>
 *     {isOpen && <Modal onClose={close} />}
 *   </>
 * );
 * ```
 */
export function useFocusReturn<T extends HTMLElement>(isOpen: boolean): RefObject<T | null> {
  const triggerRef = useRef<T>(null);
  const previouslyOpenRef = useRef(false);

  useEffect(() => {
    // 閉じた時（isOpen: true → false）にフォーカスを戻す
    if (previouslyOpenRef.current && !isOpen) {
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        // 少し遅延させてアニメーション完了後にフォーカス
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      }
    }
    previouslyOpenRef.current = isOpen;
  }, [isOpen]);

  return triggerRef;
}

export interface UseFocusReturnExplicitOptions {
  /** 開閉状態 */
  isOpen: boolean;
  /** フォーカスを戻す要素のRef */
  returnRef: RefObject<HTMLElement | null>;
}

/**
 * 明示的なフォーカス復帰フック
 * 既存のRefを使用してフォーカスを復帰する
 *
 * @example
 * ```tsx
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * useFocusReturnExplicit({ isOpen, returnRef: buttonRef });
 * ```
 */
export function useFocusReturnExplicit(options: UseFocusReturnExplicitOptions): void {
  const { isOpen, returnRef } = options;
  const previouslyOpenRef = useRef(false);

  useEffect(() => {
    if (previouslyOpenRef.current && !isOpen) {
      if (returnRef.current && typeof returnRef.current.focus === 'function') {
        requestAnimationFrame(() => {
          returnRef.current?.focus();
        });
      }
    }
    previouslyOpenRef.current = isOpen;
  }, [isOpen, returnRef]);
}
