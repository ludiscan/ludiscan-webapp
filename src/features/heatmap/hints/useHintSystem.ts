import { useCallback, useEffect, useState } from 'react';

import { getHintForMenu, getWelcomeHint } from './hintDefinitions';

import type { HintDefinition, HintId } from './types';

import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { disableHint, markHintAsViewed, shouldShowHint } from '@src/utils/localstrage';

export type UseHintSystemReturn = {
  currentHint: HintDefinition | null;
  isHintOpen: boolean;
  closeHint: (dontShowAgain: boolean) => void;
};

/**
 * Custom hook to manage hint display system for the heatmap viewer.
 * Handles first-visit welcome hints and menu-specific hints.
 */
export function useHintSystem(): UseHintSystemReturn {
  const [currentHint, setCurrentHint] = useState<HintDefinition | null>(null);
  const [isHintOpen, setIsHintOpen] = useState(false);

  // Show hint if it should be displayed
  const showHint = useCallback((hint: HintDefinition) => {
    if (shouldShowHint(hint.id)) {
      setCurrentHint(hint);
      setIsHintOpen(true);
    }
  }, []);

  // Close the current hint
  const closeHint = useCallback(
    (dontShowAgain: boolean) => {
      if (currentHint) {
        // Always mark as viewed when closed
        markHintAsViewed(currentHint.id);

        // If user chose "don't show again", disable the hint permanently
        if (dontShowAgain) {
          disableHint(currentHint.id);
        }
      }

      setIsHintOpen(false);
      setCurrentHint(null);
    },
    [currentHint],
  );

  // Check for first-visit hint on mount
  useEffect(() => {
    const welcomeHint = getWelcomeHint();
    if (shouldShowHint(welcomeHint.id)) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        showHint(welcomeHint);
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showHint]);

  // Listen for menu open events
  useEffect(() => {
    const handleMenuOpen = (event: CustomEvent<{ name: string }>) => {
      // Don't show menu hints if a hint is already open
      if (isHintOpen) return;

      const menuId = event.detail.name;
      const menuHint = getHintForMenu(menuId);

      if (menuHint && shouldShowHint(menuHint.id)) {
        // Small delay to let the menu animation complete
        setTimeout(() => {
          showHint(menuHint);
        }, 300);
      }
    };

    heatMapEventBus.on('click-menu-icon', handleMenuOpen);

    return () => {
      heatMapEventBus.off('click-menu-icon', handleMenuOpen);
    };
  }, [isHintOpen, showHint]);

  return {
    currentHint,
    isHintOpen,
    closeHint,
  };
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
    'menu-general',
    'menu-hotspot',
    'menu-eventlog',
    'menu-routecoach',
    'menu-timeline',
    'menu-map',
    'menu-fieldObject',
    'menu-aggregation',
  ];
}
