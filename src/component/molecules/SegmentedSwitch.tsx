/**
 * File: SegmentedSwitch.tsx
 *
 * - A custom two-option switch component with an animated sliding indicator.
 * - Does NOT use styled props for `disabled`: instead uses `&.disable { ... }`.
 * - Uses Emotion (styled) for styling.
 * - All comments inside the code are in English.
 */

import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button'; // adjust path if needed
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SegmentedSwitchProps = Omit<ButtonProps, 'onClick' | 'scheme' | 'children'> & {
  /** className for styled-components */
  className?: string;
  /** two labels for left and right segments */
  options: [string, string];
  /** currently selected value; should match one of options */
  value?: string;
  /** called when the user clicks on a segment */
  onChange: (newValue: string) => void;
  /** if true, the switch cannot be changed */
  disabled?: boolean;
  /** optional fontSize override (ignored in this example) */
  fontSize?: ButtonProps['fontSize'];
};

/**
 * Component logic:
 * - Manages a local state for the selected value (falls back to options[0])
 * - Renders the RootContainer with two Segment children and the sliding Indicator
 * - Calculates Indicator’s left position: 0% for left, 50% for right
 * - Disabled behavior is toggled by adding `.disable` class to RootContainer
 */
const Component: FC<SegmentedSwitchProps> = (props) => {
  const { className, options, value, onChange, disabled = false, fontSize = 'base' } = props;
  const { theme } = useSharedTheme();
  // Local state to control which segment is active.
  // Initialize to provided `value` or fallback to options[0].
  const [selectedValue, setSelectedValue] = useState<string>(value != null ? value : options[0]);

  useEffect(() => {
    // Update local state when `value` prop changes
    if (value != null) {
      setSelectedValue(value);
    }
  }, [value]);

  const [leftOption, rightOption] = options;
  const isLeftActive = selectedValue === leftOption;
  const isRightActive = selectedValue === rightOption;

  // Compute CSS `left` for Indicator as "0%" or "50%"
  const indicatorPosition = isLeftActive ? '0%' : '50%';

  return (
    <div className={`${className} ${disabled ? 'disable' : ''}`}>
      {/** Sliding colored indicator */}
      <div className={`${className}__indicator`} style={{ left: indicatorPosition }} />

      {/**
       * Left segment:
       * - onClick toggles to leftOption if not already active
       */}
      <Button
        {...props}
        className={`${className}__segment ${isLeftActive ? 'active' : ''}`}
        scheme={'none'}
        fontSize={fontSize}
        onClick={() => {
          if (!disabled && !isLeftActive) {
            onChange(leftOption);
            setSelectedValue(leftOption);
          }
        }}
      >
        <Text text={leftOption} color={isLeftActive ? theme.colors.text.inverse : theme.colors.text.secondary} />
      </Button>

      {/**
       * Right segment:
       * - onClick toggles to rightOption if not already active
       */}
      <Button
        {...props}
        className={`${className}__segment ${isRightActive ? 'active' : ''}`}
        scheme={'none'}
        fontSize={fontSize}
        onClick={() => {
          if (!disabled && !isRightActive) {
            onChange(rightOption);
            setSelectedValue(rightOption);
          }
        }}
      >
        <Text text={rightOption} color={isRightActive ? theme.colors.text.inverse : theme.colors.text.secondary} fontSize={fontSize} />
      </Button>
    </div>
  );
};

const SegmentButtonWidth = (props: SegmentedSwitchProps) => {
  // Calculate width based on fontSize
  switch (props.fontSize) {
    case 'xs':
      return '60px';
    case 'sm':
      return '80px';
    case 'base':
      return '100px';
    case 'lg':
      return '120px';
    case 'xl':
      return '140px';
    case '2xl':
      return '160px';
    case '3xl':
      return '180px';
    case '4xl':
      return '180px';
    case '5xl':
      return '180px';
    default:
      return '100px'; // Default fallback
  }
};

export const SegmentedSwitch = styled(Component)`
  position: relative; /* English comment: for absolute positioning of Indicator */
  display: inline-flex;
  overflow: hidden; /* English comment: clip child elements */
  background-color: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 9999px; /* English comment: fully rounded corners */

  &.disable {
    pointer-events: none;

    /* English comment: dim and prevent interaction when disabled */
    opacity: 0.5;
  }

  &__indicator {
    position: absolute;
    top: 0;
    left: 0; /* English comment: overridden inline based on active index */
    z-index: 0; /* English comment: behind Segment texts */
    width: 50%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.primary.dark};
    border-radius: 9999px; /* English comment: fully rounded corners */
    transition: left 0.2s ease; /* English comment: smooth animation */
  }

  &__segment {
    position: relative;
    flex: 1;
    min-width: ${SegmentButtonWidth};
    padding: 6px !important;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    user-select: none; /* English comment: prevent text selection */
    transition: color 0.2s ease;
  }
`;
