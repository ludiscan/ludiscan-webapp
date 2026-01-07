import { createContext, useContext } from 'react';

import { HintModal } from './HintModal';
import { useHintSystem } from './useHintSystem';

import type { HintId } from './types';
import type { FC, ReactNode } from 'react';

export type HintContextValue = {
  showHintById: (id: HintId) => void;
  addHintForMenu: (menuId: string) => void;
};

const HintContext = createContext<HintContextValue | null>(null);

export type HintProviderProps = {
  children: ReactNode;
};

/**
 * HintProvider - Provides hint system context to children
 * Manages hint modal display and provides showHintById function
 */
export const HintProvider: FC<HintProviderProps> = ({ children }) => {
  const { currentHint, isHintOpen, closeHint, showHintById, addHintForMenu } = useHintSystem();

  return (
    <HintContext.Provider value={{ showHintById, addHintForMenu }}>
      {children}
      <HintModal isOpen={isHintOpen} hint={currentHint} onClose={closeHint} />
    </HintContext.Provider>
  );
};

/**
 * useHintContext - Access hint system from any child component
 * @returns showHintById function to manually trigger hints
 */
export function useHintContext(): HintContextValue {
  const context = useContext(HintContext);
  if (!context) {
    throw new Error('useHintContext must be used within a HintProvider');
  }
  return context;
}
