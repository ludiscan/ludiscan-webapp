import styled from '@emotion/styled';
import React, { useCallback } from 'react';
import { IconContext } from 'react-icons';

import type { MouseEventHandler, ReactNode, FC } from 'react';

import { commonTypography } from '@src/styles/commonTheme';

export type ButtonProps = {
  className?: string | undefined;
  onClick: (() => Promise<void> | void) | MouseEventHandler<HTMLButtonElement>;
  scheme: 'primary' | 'surface' | 'warning' | 'none' | 'error' | 'secondary' | 'tertiary';
  fontSize: keyof typeof commonTypography.fontSize;
  width?: 'full' | 'fit-content';
  radius?: 'small' | 'default';
  border?: boolean;
  children: ReactNode;
  disabled?: boolean | undefined;
  title?: string;
};

export const ButtonIconSize = (props: Pick<ButtonProps, 'fontSize'>) => {
  if (props.fontSize === 'xs') {
    return '12px';
  }
  if (props.fontSize === 'sm') {
    return '14px';
  }
  if (props.fontSize === 'base') {
    return '16px';
  }
  if (props.fontSize === 'lg') {
    return '18px';
  }
  if (props.fontSize === 'xl') {
    return '20px';
  }
  if (props.fontSize === '2xl') {
    return '24px';
  }
  if (props.fontSize === '3xl') {
    return '30px';
  }
  if (props.fontSize === '4xl') {
    return '36px';
  }
  if (props.fontSize === '5xl') {
    return '48px';
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
  if (props.fontSize === 'xs') {
    return '24px';
  }
  if (props.fontSize === 'sm') {
    return '28px';
  }
  if (props.fontSize === 'base') {
    return '32px';
  }
  if (props.fontSize === 'lg') {
    return '36px';
  }
  if (props.fontSize === 'xl') {
    return '40px';
  }
  if (props.fontSize === '2xl') {
    return '44px';
  }
  if (props.fontSize === '3xl') {
    return '44px';
  }
  if (props.fontSize === '4xl') {
    return '44px';
  }
  if (props.fontSize === '5xl') {
    return '44px';
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
  if (props.fontSize === 'xs') {
    return '0 12px';
  }
  if (props.fontSize === 'sm') {
    return '0 14px';
  }
  if (props.fontSize === 'base') {
    return '0 16px';
  }
  return '0 22px';
};

const ButtonBorderRadius = (props: ButtonProps) => {
  if (props.fontSize === 'xs') {
    return props.radius === 'default' ? '16px' : '8px';
  }
  if (props.fontSize === 'sm') {
    return props.radius === 'default' ? '18px' : '9px';
  }
  if (props.fontSize === 'base') {
    return props.radius === 'default' ? '20px' : '10px';
  }
  if (props.fontSize === 'lg') {
    return props.radius === 'default' ? '22px' : '11px';
  }
  if (props.fontSize === 'xl') {
    return props.radius === 'default' ? '24px' : '12px';
  }
  if (props.fontSize === '2xl') {
    return props.radius === 'default' ? '26px' : '13px';
  }
  if (props.fontSize === '3xl') {
    return props.radius === 'default' ? '28px' : '14px';
  }
  if (props.fontSize === '4xl') {
    return props.radius === 'default' ? '30px' : '15px';
  }
  if (props.fontSize === '5xl') {
    return props.radius === 'default' ? '32px' : '16px';
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
  font-size: ${(props) => props.theme.typography.fontSize[props.fontSize] || commonTypography.fontSize.base};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  border: none;
  border-radius: ${(props) => ButtonBorderRadius(props)};
  transition: opacity 0.2s;

  &.primary {
    color: ${({ theme }) => theme.colors.primary.contrast};
    background-color: ${({ theme }) => theme.colors.primary.main};
  }

  &.surface {
    background-color: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &.warning {
    color: ${({ theme }) => theme.colors.semantic.warning.contrast};
    background-color: ${({ theme }) => theme.colors.semantic.warning.main};
  }

  &.none {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: transparent;
    ${({ theme, border }) => border && `border: 1px solid ${theme.colors.border.default};`}
  }

  &.error {
    color: ${({ theme }) => theme.colors.semantic.warning.contrast};
    background-color: ${({ theme }) => theme.colors.semantic.error.main};
  }

  &.secondary {
    color: ${({ theme }) => theme.colors.secondary.contrast};
    background-color: ${({ theme }) => theme.colors.secondary.light};
    border: 1px solid ${({ theme }) => theme.colors.border.strong};
  }

  &.tertiary {
    color: ${({ theme }) => theme.colors.tertiary.contrast};
    background-color: ${({ theme }) => theme.colors.tertiary.main};
    border: 1px solid ${({ theme }) => theme.colors.border.strong};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.surface.pressed};
  }

  &:hover:not(:disabled) {
    opacity: 0.7;
  }
`;
