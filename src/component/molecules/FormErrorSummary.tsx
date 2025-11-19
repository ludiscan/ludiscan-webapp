import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';

import type { FC } from 'react';

/**
 * Form error summary component following GOV.UK Design System and WCAG 2.2
 * Design Implementation Guide Rule 7: エラーは要約→詳細の順で構造化
 *
 * @see https://design-system.service.gov.uk/components/error-summary/
 * @see https://www.w3.org/WAI/WCAG22/quickref/#error-identification
 */

export interface FormError {
  /** Field ID that has the error */
  fieldId: string;
  /** Human-readable error message with actionable guidance */
  message: string;
}

export interface FormErrorSummaryProps {
  /** List of errors to display */
  errors: FormError[];
  /** Whether to show the error summary */
  show: boolean;
  /** Optional title for the error summary */
  title?: string;
  /** Callback when the summary is shown (for analytics/logging) */
  onShow?: () => void;
}

const ErrorSummaryContainer = styled.div`
  /* Use logical properties (Design Guide Rule 4) */
  padding-block: var(--spacing-md);
  padding-inline: var(--spacing-md);
  margin-block-end: var(--spacing-md);
  color: ${({ theme }) => theme.colors.semantic.error.contrast};

  /* Semantic error color with sufficient contrast (WCAG AA) */
  background-color: ${({ theme }) => theme.colors.semantic.error.light};

  /* Visual indicator using logical property */
  border-inline-start: var(--border-width-thick) solid ${({ theme }) => theme.colors.semantic.error.main};
  border-radius: var(--border-radius-sm);

  /* Ensure keyboard focus is visible (WCAG 2.2 SC 2.4.7) */
  &:focus {
    outline: var(--accessibility-focus-ring-width) solid ${({ theme }) => theme.colors.semantic.error.dark};
    outline-offset: var(--accessibility-focus-ring-offset);
  }

  /* Remove default focus for mouse users, keep for keyboard */
  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

const ErrorTitle = styled.h2`
  margin-block: 0 var(--spacing-sm);
  font-size: var(--typography-font-size-lg);
  font-weight: var(--typography-font-weight-bold);
  line-height: var(--typography-line-height-tight);
  color: ${({ theme }) => theme.colors.semantic.error.dark};
`;

const ErrorList = styled.ul`
  padding-inline-start: var(--spacing-md);
  margin: 0;
  list-style-type: disc;
`;

const ErrorListItem = styled.li`
  margin-block: var(--spacing-xs);
  line-height: var(--typography-line-height-normal);
`;

const ErrorLink = styled.a`
  /* Minimum touch target size (Design Guide Rule 10) */
  display: inline-block;
  min-block-size: var(--touch-target-min-size-desktop);
  padding-block: var(--spacing-xs);
  font-weight: var(--typography-font-weight-medium);
  color: ${({ theme }) => theme.colors.semantic.error.dark};
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.semantic.error.main};
    text-decoration-thickness: 3px;
  }

  &:focus-visible {
    outline: var(--accessibility-focus-ring-width) solid ${({ theme }) => theme.colors.semantic.error.dark};
    outline-offset: var(--accessibility-focus-ring-offset);
    border-radius: var(--border-radius-sm);
  }
`;

/**
 * FormErrorSummary Component
 *
 * Displays a summary of form validation errors following accessibility best practices:
 * - role="alert" for screen reader announcement
 * - Automatic focus management
 * - Links to error fields for easy navigation
 * - Actionable error messages
 *
 * @example
 * ```tsx
 * const errors = [
 *   { fieldId: 'email', message: 'メールアドレスに@を含めてください（例: user@example.com）' },
 *   { fieldId: 'password', message: 'パスワードは8文字以上必要です' }
 * ];
 *
 * <FormErrorSummary
 *   errors={errors}
 *   show={errors.length > 0}
 *   title="以下の問題を修正してください"
 * />
 * ```
 */
export const FormErrorSummary: FC<FormErrorSummaryProps> = ({ errors, show, title = '以下の問題を修正してください', onShow }) => {
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && summaryRef.current) {
      // Move focus to error summary (Design Guide Rule 7)
      summaryRef.current.focus();

      // Call onShow callback if provided
      onShow?.();
    }
  }, [show, onShow]);

  if (!show || errors.length === 0) {
    return null;
  }

  const handleErrorLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, fieldId: string) => {
    e.preventDefault();
    const field = document.getElementById(fieldId);
    if (field) {
      field.focus();
      // Scroll into view with smooth behavior
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <ErrorSummaryContainer
      ref={summaryRef}
      role='alert' // Announces to screen readers (WCAG 2.2 SC 3.3.1)
      aria-labelledby='error-summary-title'
      tabIndex={-1} // Allow focus but not in tab order
      data-testid='form-error-summary'
    >
      <ErrorTitle id='error-summary-title'>{title}</ErrorTitle>
      <ErrorList>
        {errors.map((error, index) => (
          <ErrorListItem key={`${error.fieldId}-${index}`}>
            <ErrorLink href={`#${error.fieldId}`} onClick={(e) => handleErrorLinkClick(e, error.fieldId)} data-testid={`error-link-${error.fieldId}`}>
              {error.message}
            </ErrorLink>
          </ErrorListItem>
        ))}
      </ErrorList>
    </ErrorSummaryContainer>
  );
};
