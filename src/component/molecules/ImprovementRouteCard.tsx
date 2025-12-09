import styled from '@emotion/styled';
import { useState } from 'react';

import type { components } from '@generated/api';
import type { FC } from 'react';

import { FeedbackRating } from '@src/component/atoms/FeedbackRating';
import { useSubmitFeedback } from '@src/hooks/useSubmitFeedback';

export type ImprovementRoute = components['schemas']['ImprovementRouteDto'];

interface ImprovementRouteCardProps {
  className?: string;
  route: ImprovementRoute;
  playerId?: string;
  onRouteVisualize?: (route: ImprovementRoute) => void;
  /** コンパクトモード: 1行サマリー形式で表示 */
  compact?: boolean;
}

/**
 * 改善案ルートカード
 */
const Component: FC<ImprovementRouteCardProps> = ({ className, route, playerId, onRouteVisualize, compact = false }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<1 | 2 | 3 | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const handleSubmitFeedback = () => {
    if (!feedbackRating || !playerId) return;

    submitFeedback(
      {
        improvementRouteId: route.id,
        playerId,
        rating: feedbackRating,
      },
      {
        onSuccess: () => {
          setFeedbackRating(undefined);
          setShowFeedback(false);
        },
      },
    );
  };

  const getStrategyLabel = (strategy: string) => {
    const labels = {
      divergence: '分岐',
      safety_passage: '安全',
      faster: '高速',
    };
    return labels[strategy as keyof typeof labels] || strategy;
  };

  const getStrategyLabelFull = (strategy: string) => {
    const labels = {
      divergence: '分岐点検出',
      safety_passage: '安全通過',
      faster: '時間短縮',
    };
    return labels[strategy as keyof typeof labels] || strategy;
  };

  const successPercentage = route.success_rate ? Math.round(route.success_rate * 100) : 0;

  // コンパクトモード: 1行サマリー表示
  if (compact) {
    return (
      <div className={`${className} ${className}--compact`}>
        <div
          className={`${className}__compactRow`}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsExpanded(!isExpanded);
            }
          }}
          role='button'
          tabIndex={0}
        >
          <span className={`${className}__badge ${className}__badge--${route.strategy_type} ${className}__badge--small`}>
            {getStrategyLabel(route.strategy_type)}
          </span>
          <span className={`${className}__compactStats`}>
            <span className={`${className}__compactStat`}>{successPercentage}%</span>
            <span className={`${className}__compactStatLabel`}>成功</span>
          </span>
          <span className={`${className}__compactStats`}>
            <span className={`${className}__compactStat`}>{((route?.avg_duration_ms ?? 0) / 1000).toFixed(1)}s</span>
          </span>
          {route.time_saved_ms ? (
            <span className={`${className}__compactStats ${className}__compactStats--highlight`}>
              <span className={`${className}__compactStat`}>-{(route.time_saved_ms / 1000).toFixed(1)}s</span>
            </span>
          ) : null}
          <span className={`${className}__expandToggle`}>{isExpanded ? '−' : '+'}</span>
        </div>

        {isExpanded ? (
          <div className={`${className}__expandedContent`}>
            <div className={`${className}__expandedStats`}>
              <div className={`${className}__expandedStatItem`}>
                <span className={`${className}__expandedStatLabel`}>タイプ</span>
                <span>{getStrategyLabelFull(route.strategy_type)}</span>
              </div>
              <div className={`${className}__expandedStatItem`}>
                <span className={`${className}__expandedStatLabel`}>成功数</span>
                <span>{route.success_count}</span>
              </div>
              {route.safety_score !== undefined ? (
                <div className={`${className}__expandedStatItem`}>
                  <span className={`${className}__expandedStatLabel`}>安全スコア</span>
                  <span>{(route.safety_score * 100).toFixed(0)}%</span>
                </div>
              ) : null}
              {route.evidence ? (
                <div className={`${className}__expandedStatItem`}>
                  <span className={`${className}__expandedStatLabel`}>信頼度</span>
                  <span>{route.evidence.confidence === 'high' ? '高' : route.evidence.confidence === 'medium' ? '中' : '低'}</span>
                </div>
              ) : null}
            </div>
            <div className={`${className}__expandedActions`}>
              {onRouteVisualize ? (
                <button className={`${className}__actionButton ${className}__actionButton--small`} onClick={() => onRouteVisualize(route)} type='button'>
                  可視化
                </button>
              ) : null}
              <button
                className={`${className}__actionButton ${className}__actionButton--small ${className}__actionButton--secondary`}
                onClick={() => setShowFeedback(!showFeedback)}
                type='button'
              >
                評価
              </button>
            </div>
            {showFeedback ? (
              <div className={`${className}__compactFeedback`}>
                <FeedbackRating value={feedbackRating} onChange={setFeedbackRating} disabled={isPending} />
                <button
                  className={`${className}__actionButton ${className}__actionButton--small`}
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackRating || isPending}
                  type='button'
                >
                  {isPending ? '...' : '送信'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  // 通常モード: フル表示
  return (
    <div className={className}>
      <div className={`${className}__header`}>
        <span className={`${className}__badge ${className}__badge--${route.strategy_type}`}>{getStrategyLabelFull(route.strategy_type)}</span>
        <div className={`${className}__successRate`}>
          <span>成功率: {successPercentage}%</span>
          <div className={`${className}__progressBar`}>
            <div className={`${className}__progressBar__fill`} style={{ width: `${successPercentage}%` }} />
          </div>
        </div>
      </div>

      <div className={`${className}__stats`}>
        <div className={`${className}__statItem`}>
          <div>成功数</div>
          <span>{route.success_count}</span>
        </div>
        <div className={`${className}__statItem`}>
          <div>平均実行時間</div>
          <span>{((route?.avg_duration_ms ?? 0) / 1000).toFixed(1)}秒</span>
        </div>
        {route.time_saved_ms && (
          <div className={`${className}__statItem`}>
            <div>時間短縮</div>
            <span className={`${className}__statItem__highlight`}>{(route.time_saved_ms / 1000).toFixed(1)}秒</span>
          </div>
        )}
        {route.safety_score !== undefined && (
          <div className={`${className}__statItem`}>
            <div>安全スコア</div>
            <span>{(route.safety_score * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {route.evidence ? (
        <div className={`${className}__evidence`}>
          <p>
            | 信頼度:
            {route.evidence.confidence === 'high' ? '高' : route.evidence.confidence === 'medium' ? '中' : '低'}
          </p>
        </div>
      ) : null}

      <div className={`${className}__feedback`}>
        <div className={`${className}__feedbackStats`}>
          <span>フィードバック数: {route.feedback_total_count}</span>
          {route.feedback_avg_rating > 0 && <span>平均評価: {route.feedback_avg_rating.toFixed(2)} / 3.0</span>}
        </div>

        {!showFeedback ? (
          <button className={`${className}__actionButton`} onClick={() => setShowFeedback(true)} type='button'>
            このルートを評価する
          </button>
        ) : (
          <div>
            <div className={`${className}__feedbackPrompt`}>このルートはどう思いますか？</div>
            <FeedbackRating value={feedbackRating} onChange={setFeedbackRating} disabled={isPending} />
            <div className={`${className}__feedbackActions`}>
              <button className={`${className}__actionButton`} onClick={handleSubmitFeedback} disabled={!feedbackRating || isPending} type='button'>
                {isPending ? '送信中...' : '送信'}
              </button>
              <button
                className={`${className}__actionButton ${className}__actionButton--cancel`}
                onClick={() => {
                  setShowFeedback(false);
                  setFeedbackRating(undefined);
                }}
                disabled={isPending}
                type='button'
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>

      {onRouteVisualize && (
        <button className={`${className}__actionButton ${className}__actionButton--visualize`} onClick={() => onRouteVisualize(route)} type='button'>
          3D可視化
        </button>
      )}
    </div>
  );
};

export const ImprovementRouteCard = styled(Component)`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface.base};
  border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  /* コンパクトモード */
  &--compact {
    padding: 0;
    margin-bottom: 0;
    background-color: ${({ theme }) => theme.colors.surface.raised};
    border: none;
    border-radius: 4px;
    box-shadow: none;

    &:hover {
      box-shadow: none;
    }
  }

  &__compactRow {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.hover};
    }
  }

  &__compactStats {
    display: flex;
    gap: 2px;
    align-items: baseline;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.secondary};

    &--highlight {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.semantic.success.main};
    }
  }

  &__compactStat {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__compactStatLabel {
    font-size: 9px;
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &__expandToggle {
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__expandedContent {
    padding: 8px 10px 10px;
    border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__expandedStats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px 12px;
    margin-bottom: 8px;
    font-size: 11px;
  }

  &__expandedStatItem {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  &__expandedStatLabel {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &__expandedActions {
    display: flex;
    gap: 6px;
  }

  &__compactFeedback {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    border-bottom: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__badge {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.inverse};
    border-radius: ${({ theme }) => theme.borders.radius.sm};

    &--small {
      padding: 2px 6px;
      font-size: 9px;
    }

    &--divergence {
      background-color: ${({ theme }) => theme.colors.semantic.error.main};
    }

    &--safety_passage {
      background-color: ${({ theme }) => theme.colors.semantic.info.main};
    }

    &--faster {
      background-color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  &__successRate {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    align-items: center;
  }

  &__progressBar {
    width: 100px;
    height: 6px;
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: ${({ theme }) => theme.borders.radius.sm};

    &__fill {
      height: 100%;
      background-color: ${({ theme }) => theme.colors.semantic.success.main};
      transition: width 0.3s ease;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.surface.raised};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__statItem {
    & > div {
      display: block;
      margin-bottom: ${({ theme }) => theme.spacing.xs};
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text.secondary};
    }

    & > span {
      display: block;
      font-size: ${({ theme }) => theme.typography.fontSize.base};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text.primary};
    }

    &__highlight {
      color: ${({ theme }) => theme.colors.semantic.success.main};
    }
  }

  &__evidence {
    padding: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    background-color: ${({ theme }) => theme.colors.surface.raised};
    border-radius: ${({ theme }) => theme.borders.radius.sm};

    & > p {
      margin: ${({ theme }) => theme.spacing.xs} 0;
    }
  }

  &__feedback {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.surface.raised};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__feedbackStats {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.secondary};

    & > span {
      margin-right: ${({ theme }) => theme.spacing.md};
    }
  }

  &__feedbackPrompt {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  &__feedbackActions {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.sm};
  }

  &__actionButton {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary.contrast};
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.primary.main};
    border: none;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition: background-color 0.2s ease;

    &--small {
      padding: 4px 8px;
      font-size: 10px;
    }

    &--secondary {
      color: ${({ theme }) => theme.colors.text.primary};
      background-color: ${({ theme }) => theme.colors.surface.interactive};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.surface.hover};
      }
    }

    &:disabled {
      color: ${({ theme }) => theme.colors.text.disabled};
      cursor: not-allowed;
      background-color: ${({ theme }) => theme.colors.surface.sunken};
    }

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary.dark};
    }

    &--cancel {
      color: ${({ theme }) => theme.colors.text.primary};
      background-color: ${({ theme }) => theme.colors.surface.interactive};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.surface.hover};
      }
    }

    &--visualize {
      margin-top: ${({ theme }) => theme.spacing.sm};
      color: ${({ theme }) => theme.colors.secondary.contrast};
      background-color: ${({ theme }) => theme.colors.secondary.main};

      &:hover {
        background-color: ${({ theme }) => theme.colors.secondary.dark};
      }
    }
  }
`;
