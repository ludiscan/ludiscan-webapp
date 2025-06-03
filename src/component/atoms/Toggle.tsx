import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';

import type { FC, ReactNode, CSSProperties } from 'react';

import { FlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';

export type ToggleProps = {
  className?: string;
  buttonStyle?: CSSProperties;
  label?: ReactNode;
  opened?: boolean;
  onChange?: (opened: boolean) => void;
  children: ReactNode;
  maxHeight?: number;
};

const Component: FC<ToggleProps> = ({ className, buttonStyle, label, opened, onChange, children }) => {
  const [visible, setVisible] = useState(opened || false);
  const handleToggle = useCallback(() => {
    setVisible(!visible);
    if (onChange) {
      onChange(!visible);
    }
  }, [onChange, visible]);
  return (
    <FlexColumn className={className}>
      <button onClick={handleToggle} className={`${className}__button`} style={buttonStyle}>
        <InlineFlexRow align={'center'} style={{ width: '100%' }} gap={8}>
          <IoIosArrowForward className={`${className}__arrow ${visible ? 'open' : ''}`} size={16} />
          {label}
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
    transform: rotate(0deg);
    transition: transform 0.3s ease;
  }

  &__arrow.open {
    transform: rotate(90deg);
  }

  &__content.open {
    max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : '300px')};
  }
`;
