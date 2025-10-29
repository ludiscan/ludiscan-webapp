import styled from '@emotion/styled';

import type { FC } from 'react';

interface FeedbackRatingProps {
  className?: string;
  value?: 1 | 2 | 3;
  onChange: (rating: 1 | 2 | 3) => void;
  disabled?: boolean;
}

/**
 * 3段階フィードバック評価コンポーネント
 * 👎（1=Bad）/ 😐（2=Neutral）/ 👍（3=Good）
 */
const Component: FC<FeedbackRatingProps> = ({ className, value, onChange, disabled = false }) => {
  const ratings: Array<{
    value: 1 | 2 | 3;
    emoji: string;
    label: string;
  }> = [
    { value: 1, emoji: '👎', label: 'Bad' },
    { value: 2, emoji: '😐', label: 'Neutral' },
    { value: 3, emoji: '👍', label: 'Good' },
  ];

  return (
    <div className={className}>
      {ratings.map(({ value: ratingValue, emoji, label }) => (
        <button
          key={ratingValue}
          className={`${className}__button ${value === ratingValue ? `${className}__button--selected` : ''}`}
          onClick={() => !disabled && onChange(ratingValue)}
          disabled={disabled}
          title={label}
          type='button'
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export const FeedbackRating = styled(Component)`
  display: flex;
  gap: 8px;
  align-items: center;

  &__button {
    padding: 8px 12px;
    font-size: 24px;
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:hover:not(:disabled) {
      border-color: #999;
      transform: scale(1.1);
    }

    &--selected {
      background-color: #e3f2fd;
      border-color: #2196f3;
    }
  }
`;
