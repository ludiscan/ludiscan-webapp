import styled from '@emotion/styled';
import { useState } from 'react';

import type { FC } from 'react';

import { FeedbackRating } from '@src/component/atoms/FeedbackRating';
import { useSubmitFeedback } from '@src/hooks/useSubmitFeedback';

interface ImprovementRoute {
  id: number;
  strategy_type: 'divergence' | 'safety_passage' | 'faster';
  trajectory_points: Array<{ x: number; y: number; z: number }>;
  success_rate: number;
  success_count: number;
  avg_duration_ms: number;
  time_saved_ms?: number;
  divergence_analysis?: {
    divergence_point: { x: number; y: number; z: number };
    distance_to_event_cluster: number;
    common_prefix_length: number;
    improvement_segment: Array<{ x: number; y: number; z: number }>;
  };
  safety_score?: number;
  evidence: {
    description: string;
    reference_player_count: number;
    data_source: string;
    sample_count: number;
    confidence: 'high' | 'medium' | 'low';
  };
  feedback_total_count: number;
  feedback_avg_rating: number;
}

interface ImprovementRouteCardProps {
  className?: string;
  route: ImprovementRoute;
  playerId?: string;
  onRouteVisualize?: (route: ImprovementRoute) => void;
}

/**
 * 改善案ルートカード
 */
const Component: FC<ImprovementRouteCardProps> = ({ className, route, playerId, onRouteVisualize }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<1 | 2 | 3 | undefined>(undefined);
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
      divergence: '分岐点検出',
      safety_passage: '安全通過',
      faster: '時間短縮',
    };
    return labels[strategy as keyof typeof labels] || strategy;
  };

  const successPercentage = Math.round(route.success_rate * 100);

  return (
    <div className={className}>
      <div className={`${className}__header`}>
        <span className={`${className}__badge ${className}__badge--${route.strategy_type}`}>{getStrategyLabel(route.strategy_type)}</span>
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
          <span>{(route.avg_duration_ms / 1000).toFixed(1)}秒</span>
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

      <div className={`${className}__evidence`}>
        <p>
          <strong>根拠:</strong> {route.evidence.description}
        </p>
        <p>
          参考プレイヤー数: {route.evidence.reference_player_count} | サンプル数: {route.evidence.sample_count} | 信頼度:
          {route.evidence.confidence === 'high' ? '高' : route.evidence.confidence === 'medium' ? '中' : '低'}
        </p>
      </div>

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

    &:disabled {
      cursor: not-allowed;
      background-color: ${({ theme }) => theme.colors.surface.sunken};
      color: ${({ theme }) => theme.colors.text.disabled};
    }

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary.dark};
    }

    &--cancel {
      background-color: ${({ theme }) => theme.colors.surface.interactive};
      color: ${({ theme }) => theme.colors.text.primary};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.surface.hover};
      }
    }

    &--visualize {
      margin-top: ${({ theme }) => theme.spacing.sm};
      background-color: ${({ theme }) => theme.colors.secondary.main};
      color: ${({ theme }) => theme.colors.secondary.contrast};

      &:hover {
        background-color: ${({ theme }) => theme.colors.secondary.dark};
      }
    }
  }
`;
