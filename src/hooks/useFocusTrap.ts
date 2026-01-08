import { useCallback, useEffect } from 'react';

import type { RefObject } from 'react';

import { containsFocus, getFirstFocusable, getFocusableElements, moveFocusTo } from '@src/utils/a11y';

export interface UseFocusTrapOptions {
  /** フォーカストラップを有効にするかどうか */
  enabled?: boolean;
  /** Escapeキー押下時のコールバック */
  onEscape?: () => void;
  /** 初期フォーカスを当てる要素のRef */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** トラップ終了時にフォーカスを戻す要素のRef */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** 初期フォーカスを自動的に設定するかどうか */
  autoFocus?: boolean;
}

/**
 * フォーカストラップフック
 * モーダルやダイアログ内にフォーカスを閉じ込める
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(containerRef, {
 *   enabled: isOpen,
 *   onEscape: handleClose,
 * });
 * ```
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, options: UseFocusTrapOptions = {}): void {
  const { enabled = true, onEscape, initialFocusRef, returnFocusRef, autoFocus = true } = options;

  // Escapeキーとタブキーのハンドリング
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return;

      // Escapeキー
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Tabキーでフォーカスを循環
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift+Tabで最初の要素から最後へ
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          moveFocusTo(lastElement);
          return;
        }

        // Tabで最後の要素から最初へ
        if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          moveFocusTo(firstElement);
          return;
        }

        // コンテナ外にフォーカスがある場合は最初の要素へ
        if (!containsFocus(containerRef.current)) {
          event.preventDefault();
          moveFocusTo(firstElement);
        }
      }
    },
    [enabled, containerRef, onEscape],
  );

  // 初期フォーカスの設定
  useEffect(() => {
    if (!enabled || !autoFocus || !containerRef.current) return;

    // 前のフォーカス位置を保存
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    // returnFocusRefの現在値をキャプチャ（クリーンアップ時に使用）
    const returnFocusElement = returnFocusRef?.current;

    // 初期フォーカスを設定
    const targetElement = initialFocusRef?.current ?? getFirstFocusable(containerRef.current);

    if (targetElement) {
      // 少し遅延させてDOMが安定してからフォーカス
      requestAnimationFrame(() => {
        moveFocusTo(targetElement);
      });
    }

    // クリーンアップ時にフォーカスを戻す
    return () => {
      const returnElement = returnFocusElement ?? previouslyFocusedElement;
      if (returnElement && typeof returnElement.focus === 'function') {
        returnElement.focus();
      }
    };
  }, [enabled, autoFocus, containerRef, initialFocusRef, returnFocusRef]);

  // キーボードイベントリスナーの設定
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // コンテナ外クリック時のフォーカス復帰
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (containerRef.current && event.target instanceof Node && !containerRef.current.contains(event.target)) {
        const firstFocusable = getFirstFocusable(containerRef.current);
        if (firstFocusable) {
          moveFocusTo(firstFocusable);
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [enabled, containerRef]);
}
