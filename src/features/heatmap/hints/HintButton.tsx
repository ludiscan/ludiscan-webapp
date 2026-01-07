import styled from '@emotion/styled';
import { useCallback } from 'react';
import { IoHelpCircleOutline } from 'react-icons/io5';

import { useHintContext } from './HintContext';

import type { HintId } from './types';
import type { FC } from 'react';

export type HintButtonProps = {
  className?: string;
  hintId: HintId;
  size?: number;
};

const Component: FC<HintButtonProps> = ({ className, hintId, size = 20 }) => {
  const { showHintById } = useHintContext();

  const handleClick = useCallback(() => {
    showHintById(hintId);
  }, [hintId, showHintById]);

  return (
    <button className={className} onClick={handleClick} type='button' aria-label='Show help'>
      <IoHelpCircleOutline size={size} />
    </button>
  );
};

export const HintButton = styled(Component)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  background: none;
  border: none;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;
