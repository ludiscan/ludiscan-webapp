import styled from '@emotion/styled';
import React, { useCallback } from 'react';
import { IconContext } from 'react-icons';

import type { FontSize } from '@src/styles/style';
import type { MouseEventHandler, ReactNode, FC } from 'react';

import { colors, fontSizes } from '@src/styles/style';

export type ButtonProps = {
  className?: string | undefined;
  onClick: (() => Promise<void> | void) | MouseEventHandler<HTMLButtonElement>;
  scheme: 'primary' | 'surface' | 'warning' | 'none' | 'error' | 'secondary';
  fontSize: FontSize;
  width?: 'full' | 'fit-content';
  radius?: 'small' | 'default';
  border?: boolean;
  children: ReactNode;
  disabled?: boolean | undefined;
  title?: string;
};

export const ButtonIconSize = (props: Pick<ButtonProps, 'fontSize'>) => {
  if (props.fontSize === 'smallest') {
    return '14px';
  }
  if (props.fontSize === 'small') {
    return '16px';
  }
  if (props.fontSize === 'medium') {
    return '18px';
  }
  if (props.fontSize === 'large1') {
    return '20px';
  }
  if (props.fontSize === 'large2') {
    return '22px';
  }
  if (props.fontSize === 'large3') {
    return '24px';
  }
  if (props.fontSize === 'largest') {
    return '26px';
  }
};

const Component: FC<ButtonProps> = (props) => {
  const { className, onClick, scheme, children, disabled = false, title } = props;
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // stopping propagation to prevent parent click event by default
      e.stopPropagation();
      if (disabled) {
        return;
      }
      onClick(e);
    },
    [disabled, onClick],
  );
  return (
    <IconContext.Provider value={{ size: ButtonIconSize(props) }}>
      <button className={`${className} ${scheme}`} onClick={handleClick} disabled={disabled} title={title}>
        {children}
      </button>
    </IconContext.Provider>
  );
};

export const ButtonHeight = (props: Pick<ButtonProps, 'fontSize' | 'scheme'>) => {
  if (props.scheme === 'none') {
    return 'fit-content';
  }
  if (props.fontSize === 'smallest') {
    return '24px';
  }
  if (props.fontSize === 'small') {
    return '28px';
  }
  if (props.fontSize === 'medium') {
    return '32px';
  }
  if (props.fontSize === 'large1') {
    return '36px';
  }
  if (props.fontSize === 'large2') {
    return '40px';
  }
  if (props.fontSize === 'large3') {
    return '44px';
  }
  if (props.fontSize === 'largest') {
    return '48px';
  }
};

const ButtonWidth = (props: ButtonProps) => {
  if (props.width === 'full') {
    return '100%';
  }
  return 'fit-content';
};

const ButtonPadding = (props: ButtonProps) => {
  if (props.scheme === 'none') {
    return '2px';
  }
  if (props.fontSize === 'smallest') {
    return '0 12px';
  }
  if (props.fontSize === 'small') {
    return '0 14px';
  }
  if (props.fontSize === 'medium') {
    return '0 16px';
  }
  return '0 22px';
};

const ButtonBorderRadius = (props: ButtonProps) => {
  if (props.fontSize === 'small') {
    return props.radius === 'default' ? '16px' : '8px';
  }
  if (props.fontSize === 'medium') {
    return props.radius === 'default' ? '18px' : '9px';
  }
  if (props.fontSize === 'large1') {
    return props.radius === 'default' ? '20px' : '10px';
  }
  if (props.fontSize === 'large2') {
    return props.radius === 'default' ? '22px' : '11px';
  }
  if (props.fontSize === 'large3') {
    return props.radius === 'default' ? '24px' : '12px';
  }
  if (props.fontSize === 'largest') {
    return props.radius === 'default' ? '26px' : '13px';
  }
  return '18px';
};

export const Button = styled(Component)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => ButtonWidth(props)};
  height: ${(props) => ButtonHeight(props)};
  padding: ${(props) => ButtonPadding(props)};
  font-size: ${(props) => fontSizes[props.fontSize] || fontSizes.medium};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  border: none;
  border-radius: ${(props) => ButtonBorderRadius(props)};
  transition: opacity 0.2s;

  &.primary {
    color: ${colors.white};
    background-color: ${({ theme }) => theme.colors.primary.main};
  }

  &.surface {
    background-color: ${({ theme }) => theme.colors.surface.main};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  &.warning {
    color: ${colors.white};
    background-color: ${colors.honey05};
  }

  &.none {
    color: ${({ theme }) => theme.colors.text};
    background-color: transparent;
    ${({ theme, border }) => border && `border: 1px solid ${theme.colors.border.main};`}
  }

  &.error {
    color: ${colors.white};
    background-color: ${colors.error};
  }

  &.secondary {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.secondary.light};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  &:disabled {
    color: ${colors.white};
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.disabled};
  }

  &:hover:not(:disabled) {
    opacity: 0.7;
  }
`;
