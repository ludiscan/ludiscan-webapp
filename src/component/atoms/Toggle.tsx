import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';

import type { FC, ReactNode } from 'react';

import { FlexColumn, InlineFlexRow } from '@/component/atoms/Flex.tsx';

export type ToggleProps = {
  className?: string;
  label?: ReactNode;
  opened?: boolean;
  onChange?: (opened: boolean) => void;
  children: ReactNode;
  maxHeight?: number;
};

const Component: FC<ToggleProps> = ({ className, label, opened, onChange, children }) => {
  const [visible, setVisible] = useState(opened || false);
  const handleToggle = useCallback(() => {
    setVisible(!visible);
    if (onChange) {
      onChange(!visible);
    }
  }, [onChange, visible]);
  return (
    <FlexColumn className={className}>
      <button onClick={handleToggle} className={`${className}__button`}>
        <InlineFlexRow align={'center'} style={{ width: '100%' }}>
          <IoMdArrowDropdown className={`${className}__arrow ${visible ? 'open' : ''}`} size={20} />
          <div style={{ flex: 1 }}>{label}</div>
        </InlineFlexRow>
      </button>
      <div className={`${className}__content ${visible ? 'open' : ''}`}>{children}</div>
    </FlexColumn>
  );
};

export const Toggle = styled(Component)`
  &__button {
    display: flex;
    width: 100%;
    padding: 2px 16px 2px 2px;
    font-size: unset;
    background: ${({ theme }) => theme.colors.surface.dark};
    border: none;
  }

  &__content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.6s ease;
  }

  &__arrow {
    width: fit-content;
    height: fit-content;
    transform: rotate(-90deg);
    transition: transform 0.3s ease;
  }

  &__arrow.open {
    transform: rotate(0deg);
  }

  &__content.open {
    max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : '300px')};
  }
`;
