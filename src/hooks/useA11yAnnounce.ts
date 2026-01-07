import { useCallback, useRef } from 'react';

export type AnnouncePriority = 'polite' | 'assertive';

export interface UseA11yAnnounceReturn {
  /**
   * スクリーンリーダーにメッセージをアナウンス
   * @param message アナウンスするメッセージ
   * @param priority 優先度（polite: 現在の読み上げ後、assertive: 即座に）
   */
  announce: (message: string, priority?: AnnouncePriority) => void;

  /**
   * ステータスメッセージをアナウンス（role="status"相当）
   * 非同期処理の結果通知などに使用
   */
  announceStatus: (message: string) => void;

  /**
   * アラートメッセージをアナウンス（role="alert"相当）
   * エラーや重要な通知に使用
   */
  announceAlert: (message: string) => void;

  /**
   * アナウンスをクリア
   */
  clear: () => void;
}

// グローバルなaria-live領域のID
export const A11Y_ANNOUNCER_ID = 'a11y-announcer';
export const A11Y_ANNOUNCER_POLITE_ID = 'a11y-announcer-polite';
export const A11Y_ANNOUNCER_ASSERTIVE_ID = 'a11y-announcer-assertive';

/**
 * aria-live領域へのアナウンスフック
 *
 * design-implementation-guide Rule 9準拠:
 * - 同期検証: aria-live="polite"
 * - 非同期結果: role="status"
 *
 * @example
 * ```tsx
 * const { announce, announceStatus, announceAlert } = useA11yAnnounce();
 *
 * // 同期検証結果
 * announce('入力が有効です', 'polite');
 *
 * // 非同期API結果
 * announceStatus('データを読み込みました');
 *
 * // エラー通知
 * announceAlert('送信に失敗しました');
 * ```
 */
export function useA11yAnnounce(): UseA11yAnnounceReturn {
  // 重複アナウンス防止用
  const lastMessageRef = useRef<string>('');
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const getAnnouncerElement = useCallback((priority: AnnouncePriority): HTMLElement | null => {
    const id = priority === 'assertive' ? A11Y_ANNOUNCER_ASSERTIVE_ID : A11Y_ANNOUNCER_POLITE_ID;
    return document.getElementById(id);
  }, []);

  const announce = useCallback(
    (message: string, priority: AnnouncePriority = 'polite') => {
      const element = getAnnouncerElement(priority);
      if (!element) {
        // eslint-disable-next-line no-console
        console.warn('A11yAnnouncer not found. Make sure <A11yAnnouncer /> is rendered in the app.');
        return;
      }

      // 同じメッセージの連続アナウンスを防ぐ
      if (message === lastMessageRef.current) {
        // 少し変更を加えて再アナウンス
        element.textContent = '';
        requestAnimationFrame(() => {
          element.textContent = message;
        });
      } else {
        element.textContent = message;
        lastMessageRef.current = message;
      }

      // 一定時間後にクリア
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      clearTimeoutRef.current = setTimeout(() => {
        element.textContent = '';
        lastMessageRef.current = '';
      }, 5000);
    },
    [getAnnouncerElement],
  );

  const announceStatus = useCallback(
    (message: string) => {
      announce(message, 'polite');
    },
    [announce],
  );

  const announceAlert = useCallback(
    (message: string) => {
      announce(message, 'assertive');
    },
    [announce],
  );

  const clear = useCallback(() => {
    const polite = getAnnouncerElement('polite');
    const assertive = getAnnouncerElement('assertive');

    if (polite) polite.textContent = '';
    if (assertive) assertive.textContent = '';

    lastMessageRef.current = '';

    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
  }, [getAnnouncerElement]);

  return {
    announce,
    announceStatus,
    announceAlert,
    clear,
  };
}
