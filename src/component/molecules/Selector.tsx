import styled from '@emotion/styled';
import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { LabeledButtonProps } from '@src/component/atoms/LabeledButton';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { Menu } from '@src/component/molecules/Menu';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SelectorProps = Omit<LabeledButtonProps, 'onClick' | 'fontSize' | 'scheme' | 'children'> & {
  options: string[];
  value?: string;
  onChange?: (value: string) => void | Promise<void>;
  fontSize?: ButtonProps['fontSize'];
  placement?: 'top' | 'bottom';
  align?: 'left' | 'right';
  scheme?: ButtonProps['scheme'];
  maxHeight?: number;
};

// スクロール可能なContentColumnをラップ
const ScrollableContentColumn = styled(Menu.ContentColumn)`
  max-height: ${(props: { maxHeight?: number }) => props.maxHeight || 300}px;
  overflow: hidden auto;

  /* スクロールバーのスタイリング */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.main};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.border.light};
    }
  }
`;

const Component: FC<SelectorProps> = (props) => {
  const { theme } = useSharedTheme();
  const { className, options, value, onChange, fontSize = 'medium', scheme = 'none', border = true, radius = 'small', maxHeight = 300 } = props;
  const [valueRef, setValueRef] = useState<string>(value || options[0] || '');
  return (
    <Menu
      {...props}
      fontSize={fontSize}
      scheme={scheme}
      border={border}
      radius={radius}
      icon={
        <div className={`${className}__text`}>
          <Text text={valueRef} />
          <IoIosArrowDown size={16} color={theme.colors.secondary.light} />
        </div>
      }
    >
      <ScrollableContentColumn maxHeight={maxHeight} padding={'2px'} align={props.align} placement={props.placement}>
        {options.map((option, index) => {
          return (
            <Menu.ContentButton
              scheme={'none'}
              key={index}
              onClick={() => {
                setValueRef(option);
                onChange?.(option);
              }}
              radius={'small'}
              fontSize={'large1'}
            >
              <Text text={option} className={`${className}__text`} />
            </Menu.ContentButton>
          );
        })}
      </ScrollableContentColumn>
    </Menu>
  );
};

export const Selector = styled(Component)`
  width: fit-content;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  & option {
    padding: 8px;
  }

  &__text {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 80px;
    padding: 4px 6px;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.dark};
    }
  }
`;
