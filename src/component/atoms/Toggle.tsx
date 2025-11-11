import styled from '@emotion/styled';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { IoIosArrowForward } from 'react-icons/io';

import type { FC, ReactNode, CSSProperties } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { fontSizes } from '@src/styles/style';

export type ToggleProps = {
  className?: string;
  buttonStyle?: CSSProperties;
  label?: ReactNode;
  trailingIcon?: ReactNode;
  onTrailingIconClick?: () => void;
  opened?: boolean;
  onChange?: (opened: boolean) => void;
  children: ReactNode;
  maxHeight?: number;
};

const Component: FC<ToggleProps> = ({ className, buttonStyle, label, trailingIcon, opened, onChange, children, onTrailingIconClick }) => {
  const [visible, setVisible] = useState(opened || false);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleToggle = useCallback(() => {
    setVisible(!visible);
    if (onChange) {
      onChange(!visible);
    }
  }, [onChange, visible]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (visible) {
      // Opening: animate to scrollHeight, then remove clamp
      el.style.overflow = 'hidden';
      el.style.maxHeight = '0px';
      // force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.style.maxHeight = `${el.scrollHeight}px`;

      const onEnd = () => {
        el.style.maxHeight = 'none'; // allow textarea resize beyond
        el.style.overflow = 'visible';
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    } else {
      // Closing: go from current auto to pixel, then to 0
      const current = el.scrollHeight;
      el.style.overflow = 'hidden';
      el.style.maxHeight = `${current}px`;
      // force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.style.maxHeight = '0px';
    }
  }, [visible]);
  return (
    <FlexColumn className={className}>
      <InlineFlexRow align={'center'} wrap={'nowrap'} className={`${className}__header`}>
        <button onClick={handleToggle} className={`${className}__button`} style={buttonStyle}>
          <InlineFlexRow align={'center'} style={{ width: '100%' }} gap={8}>
            <IoIosArrowForward className={`${className}__arrow ${visible ? 'open' : ''}`} size={16} />
            {label}
          </InlineFlexRow>
        </button>
        <div style={{ flexGrow: 1 }} />
        {trailingIcon && onTrailingIconClick && (
          <Button onClick={onTrailingIconClick} scheme={'none'} fontSize={'xs'}>
            {trailingIcon}
          </Button>
        )}
      </InlineFlexRow>
      <div ref={contentRef} className={`${className}__content ${visible ? 'open' : ''}`}>
        {children}
      </div>
    </FlexColumn>
  );
};

export const Toggle = styled(Component)`
  font-size: ${fontSizes.medium};

  &__header {
    width: 100%;
    cursor: pointer;
  }

  &__button {
    display: flex;
    width: 100%;
    padding: 2px 16px 2px 2px;
    font-size: unset;
    background: none;
    border: none;
  }

  &__content {
    display: flex;
    flex-direction: column;
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
    max-height: none;
    overflow: visible;
  }
`;
