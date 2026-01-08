import { useCallback, useEffect, useRef, useState } from 'react';

import { getHintDefinition, getHintForMenu, getWelcomeHint } from './hintDefinitions';

import type { HintDefinition, HintId } from './types';

import { disableHint, markHintAsViewed, shouldShowHint } from '@src/utils/localstrage';

export type UseHintSystemReturn = {
  currentHint: HintDefinition | null;
  isHintOpen: boolean;
  closeHint: (dontShowAgain: boolean) => void;
  showHintById: (id: HintId) => void;
  addHintForMenu: (menuId: string) => void;
};

/**
 * Custom hook to manage hint display system for the heatmap viewer.
 * Uses a queue system to show hints sequentially.
 * Welcome hint always shows first (priority).
 */
export function useHintSystem(): UseHintSystemReturn {
  const [currentHint, setCurrentHint] = useState<HintDefinition | null>(null);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const hintQueueRef = useRef<HintDefinition[]>([]);
  const processingRef = useRef(false);
  const processTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // キューを処理（次のヒントを表示）
  const processQueue = useCallback(() => {
    if (processingRef.current || hintQueueRef.current.length === 0) return;

    processingRef.current = true;
    const nextHint = hintQueueRef.current.shift()!;
    setCurrentHint(nextHint);
    setIsHintOpen(true);
  }, []);

  // 遅延してキューを処理（複数のヒントが追加されるのを待つ）
  const scheduleProcessQueue = useCallback(() => {
    if (processTimerRef.current) {
      clearTimeout(processTimerRef.current);
    }
    processTimerRef.current = setTimeout(() => {
      processTimerRef.current = null;
      processQueue();
    }, 600); // welcomeヒント(500ms)より後に処理
  }, [processQueue]);

  // ヒントをキューに追加（orderでソート）
  const addToQueue = useCallback(
    (hint: HintDefinition) => {
      if (!shouldShowHint(hint.id)) return;
      if (hintQueueRef.current.some((h) => h.id === hint.id)) return;
      if (currentHint?.id === hint.id) return;

      hintQueueRef.current.push(hint);
      // orderでソート（小さい順、未定義は100扱い）
      hintQueueRef.current.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));

      if (!isHintOpen) {
        scheduleProcessQueue();
      }
    },
    [currentHint?.id, isHintOpen, scheduleProcessQueue],
  );

  const showHintById = useCallback((id: HintId) => {
    const hint = getHintDefinition(id);
    if (hint) {
      setCurrentHint(hint);
      setIsHintOpen(true);
    }
  }, []);

  // メニューが開かれた時にヒントを追加
  const addHintForMenu = useCallback(
    (menuId: string) => {
      const menuHint = getHintForMenu(menuId);
      if (menuHint) {
        addToQueue(menuHint);
      }
    },
    [addToQueue],
  );

  const closeHint = useCallback(
    (dontShowAgain: boolean) => {
      if (currentHint) {
        markHintAsViewed(currentHint.id);
        if (dontShowAgain) {
          disableHint(currentHint.id);
        }
      }

      setIsHintOpen(false);
      setCurrentHint(null);
      processingRef.current = false;

      // 次のヒントを表示（モーダルアニメーション後）
      setTimeout(processQueue, 300);
    },
    [currentHint, processQueue],
  );

  // Welcome hint
  useEffect(() => {
    const welcomeHint = getWelcomeHint();
    addToQueue(welcomeHint);
  }, [addToQueue]);

  return { currentHint, isHintOpen, closeHint, showHintById, addHintForMenu };
}

/**
 * Reset all hint states (for testing/debugging purposes)
 */
export function resetAllHints(): void {
  if (typeof window === 'undefined') return;

  const storage = localStorage.getItem('ludiscan');
  if (storage) {
    const data = JSON.parse(storage);
    delete data.viewedHints;
    delete data.disabledHints;
    localStorage.setItem('ludiscan', JSON.stringify(data));
  }
}

/**
 * Get list of all hint IDs that can be shown
 */
export function getAllHintIds(): HintId[] {
  return [
    'heatmap-welcome',
    'menu-heatmap',
    'menu-hotspot',
    'menu-eventlog',
    'menu-routecoach',
    'menu-timeline',
    'menu-map',
    'menu-fieldObject',
    'menu-aggregation',
  ];
}
