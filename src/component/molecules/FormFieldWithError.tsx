import styled from '@emotion/styled';
import { cloneElement, isValidElement, useId } from 'react';

import type { FC, ReactElement } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';

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
  /** The form input element (must be a single React element) */
  children: ReactElement;
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
  display: flex;
  align-items: center;

  /* Ensure minimum touch target for clickable labels */
  min-block-size: var(--touch-target-min-size-desktop);
  margin-block-end: var(--spacing-xs);
  font-size: var(--typography-font-size-base);
  font-weight: var(--typography-font-weight-semibold);
  line-height: var(--typography-line-height-normal);
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RequiredIndicator = styled.span`
  margin-inline-start: var(--spacing-xs);
  font-weight: var(--typography-font-weight-bold);
  color: ${({ theme }) => theme.colors.semantic.error.main};

  /* Screen reader text for asterisk */
  &::after {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    content: ' (required)';
    border-width: 0;
    clip: rect(0, 0, 0, 0);
  }
`;

const HintText = styled.span`
  display: block;
  margin-block-end: var(--spacing-xs);
  font-size: var(--typography-font-size-sm);
  line-height: var(--typography-line-height-normal);
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorText = styled.span`
  /* Use role="alert" for immediate announcement */
  display: block;
  margin-block-start: var(--spacing-xs);
  font-size: var(--typography-font-size-sm);
  font-weight: var(--typography-font-weight-medium);
  line-height: var(--typography-line-height-normal);
  color: ${({ theme }) => theme.colors.semantic.error.main};

  /* Visual indicator (not relying on color alone - WCAG 2.2 SC 1.4.1) */
  &::before {
    margin-inline-end: var(--spacing-xs);
    font-size: var(--typography-font-size-base);
    content: '⚠ ';
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
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.surface.base};
    border: var(--border-width-default) solid ${({ theme }) => theme.colors.border.default};
    border-radius: var(--border-radius-sm);
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
      color: ${({ theme }) => theme.colors.text.disabled};
      cursor: not-allowed;
      background-color: ${({ theme }) => theme.colors.surface.sunken};
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
  const autoFieldId = useId();
  const fieldId = providedFieldId || autoFieldId;

  // Generate IDs for hint and error for aria-describedby
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  // Combine hint and error IDs for aria-describedby
  const describedBy = [hintId, errorId].filter(Boolean).join(' ');

  // Clone child element to add necessary ARIA attributes
  const childWithProps = isValidElement(children)
    ? cloneElement(children, {
        id: fieldId,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? 'true' : 'false',
        'aria-required': required ? 'true' : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    : children;

  return (
    <FieldContainer gap={0} className={className}>
      <Label htmlFor={fieldId}>
        {label}
        {required && <RequiredIndicator aria-hidden='true'>*</RequiredIndicator>}
      </Label>

      {hint && <HintText id={hintId}>{hint}</HintText>}

      <FieldWrapper>{childWithProps}</FieldWrapper>

      {error && (
        <ErrorText
          id={errorId}
          role='alert' // Immediate announcement for errors
          aria-live='polite' // For dynamic validation
          data-testid={`${fieldId}-error`}
        >
          {error}
        </ErrorText>
      )}
    </FieldContainer>
  );
};
