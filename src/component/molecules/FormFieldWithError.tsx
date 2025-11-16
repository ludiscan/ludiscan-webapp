import styled from '@emotion/styled';
import { useId } from 'react';

import type { FC, ReactNode } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

/**
 * Form field wrapper with accessible error handling
 * Design Implementation Guide Rule 7, 8, 9
 *
 * Features:
 * - aria-describedby for error association
 * - aria-invalid for validation state
 * - Actionable error messages
 * - Optional hint text
 *
 * @see https://www.w3.org/WAI/WCAG22/quickref/#error-identification
 * @see https://design-system.service.gov.uk/components/error-message/
 */

export interface FormFieldWithErrorProps {
  /** Field label text */
  label: string;
  /** Field ID (auto-generated if not provided) */
  fieldId?: string;
  /** The form input element */
  children: ReactNode;
  /** Error message (shown when present) */
  error?: string;
  /** Optional hint text */
  hint?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional class name */
  className?: string;
}

const FieldContainer = styled(FlexColumn)`
  margin-block-end: var(--spacing-md);
`;

const Label = styled.label`
  font-size: var(--typography-font-size-base);
  font-weight: var(--typography-font-weight-semibold);
  line-height: var(--typography-line-height-normal);
  margin-block-end: var(--spacing-xs);
  color: ${({ theme }) => theme.colors.text.primary};

  /* Ensure minimum touch target for clickable labels */
  min-block-size: var(--touch-target-min-size-desktop);
  display: flex;
  align-items: center;
`;

const RequiredIndicator = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error.main};
  margin-inline-start: var(--spacing-xs);
  font-weight: var(--typography-font-weight-bold);

  /* Screen reader text for asterisk */
  &::after {
    content: ' (required)';
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

const HintText = styled.span`
  font-size: var(--typography-font-size-sm);
  line-height: var(--typography-line-height-normal);
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-block-end: var(--spacing-xs);
  display: block;
`;

const ErrorText = styled.span`
  /* Use role="alert" for immediate announcement */
  display: block;
  font-size: var(--typography-font-size-sm);
  font-weight: var(--typography-font-weight-medium);
  line-height: var(--typography-line-height-normal);
  color: ${({ theme }) => theme.colors.semantic.error.main};
  margin-block-start: var(--spacing-xs);

  /* Visual indicator (not relying on color alone - WCAG 2.2 SC 1.4.1) */
  &::before {
    content: '⚠ ';
    font-size: var(--typography-font-size-base);
    margin-inline-end: var(--spacing-xs);
  }
`;

const FieldWrapper = styled.div`
  /* Wrapper for applying error styling to child input */
  & > input,
  & > textarea,
  & > select {
    inline-size: 100%;

    /* Logical properties for padding */
    padding-block: var(--spacing-sm);
    padding-inline: var(--spacing-sm);

    font-size: var(--typography-font-size-base);
    line-height: var(--typography-line-height-normal);

    border: var(--border-width-default) solid ${({ theme }) => theme.colors.border.default};
    border-radius: var(--border-radius-sm);

    background-color: ${({ theme }) => theme.colors.surface.base};
    color: ${({ theme }) => theme.colors.text.primary};

    transition: border-color 0.2s ease;

    &:focus {
      outline: var(--accessibility-focus-ring-width) solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: var(--accessibility-focus-ring-offset);
      border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &:focus-visible {
      outline: var(--accessibility-focus-ring-width) solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: var(--accessibility-focus-ring-offset);
    }

    /* Error state (Design Guide Rule 7) */
    &[aria-invalid='true'] {
      border-color: ${({ theme }) => theme.colors.semantic.error.main};
      border-width: var(--border-width-default);

      &:focus {
        outline-color: ${({ theme }) => theme.colors.semantic.error.main};
      }
    }

    &:disabled {
      background-color: ${({ theme }) => theme.colors.surface.sunken};
      color: ${({ theme }) => theme.colors.text.disabled};
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
`;

/**
 * FormFieldWithError Component
 *
 * Wraps form inputs with accessible labels, hints, and error messages.
 * Automatically manages ARIA attributes for screen reader support.
 *
 * @example
 * ```tsx
 * <FormFieldWithError
 *   label="Email Address"
 *   hint="We'll never share your email"
 *   error={emailError}
 *   required
 * >
 *   <input
 *     type="email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *   />
 * </FormFieldWithError>
 * ```
 */
export const FormFieldWithError: FC<FormFieldWithErrorProps> = ({ label, fieldId: providedFieldId, children, error, hint, required = false, className }) => {
  const { theme } = useSharedTheme();
  const autoFieldId = useId();
  const fieldId = providedFieldId || autoFieldId;

  // Generate IDs for hint and error for aria-describedby
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  // Combine hint and error IDs for aria-describedby
  const describedBy = [hintId, errorId].filter(Boolean).join(' ');

  // Clone children to add necessary ARIA attributes
  const childWithProps =
    typeof children === 'object' && children !== null && 'props' in children
      ? {
          ...children,
          props: {
            ...children.props,
            id: fieldId,
            'aria-describedby': describedBy || undefined,
            'aria-invalid': error ? 'true' : 'false',
            'aria-required': required ? 'true' : undefined,
          },
        }
      : children;

  return (
    <FieldContainer gap={0} className={className}>
      <Label htmlFor={fieldId}>
        {label}
        {required && <RequiredIndicator aria-hidden="true">*</RequiredIndicator>}
      </Label>

      {hint && <HintText id={hintId}>{hint}</HintText>}

      <FieldWrapper>{childWithProps}</FieldWrapper>

      {error && (
        <ErrorText
          id={errorId}
          role="alert" // Immediate announcement for errors
          aria-live="polite" // For dynamic validation
          data-testid={`${fieldId}-error`}
        >
          {error}
        </ErrorText>
      )}
    </FieldContainer>
  );
};
