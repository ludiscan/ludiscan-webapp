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
  playerId: string;
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
    if (!feedbackRating) return;

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
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgb(0 0 0 / 15%);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #eee;
  }

  &__badge {
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    border-radius: 4px;

    &--divergence {
      background-color: #ff6b6b;
    }

    &--safety_passage {
      background-color: #4ecdc4;
    }

    &--faster {
      background-color: #45b7d1;
    }
  }

  &__successRate {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__progressBar {
    width: 100px;
    height: 6px;
    overflow: hidden;
    background-color: #eee;
    border-radius: 3px;

    &__fill {
      height: 100%;
      background-color: #4caf50;
      transition: width 0.3s ease;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    padding: 12px;
    margin-bottom: 12px;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  &__statItem {
    & > div {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      font-weight: bold;
      color: #666;
    }

    & > span {
      display: block;
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    &__highlight {
      color: #4caf50 !important;
    }
  }

  &__evidence {
    padding: 12px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #555;
    background-color: #f5f5f5;
    border-radius: 4px;

    & > p {
      margin: 4px 0;
    }
  }

  &__feedback {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    margin-top: 12px;
    background-color: #fafafa;
    border-radius: 4px;
  }

  &__feedbackStats {
    margin-bottom: 8px;
    font-size: 12px;
    color: #666;

    & > span {
      margin-right: 16px;
    }
  }

  &__feedbackPrompt {
    display: block;
    margin-bottom: 8px;
  }

  &__feedbackActions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  &__actionButton {
    padding: 8px 12px;
    font-size: 13px;
    font-weight: bold;
    color: #fff;
    cursor: pointer;
    background-color: #2196f3;
    border: none;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      background-color: #ccc;
    }

    &:hover:not(:disabled) {
      background-color: #1976d2;
    }

    &--cancel {
      background-color: #999;

      &:hover:not(:disabled) {
        background-color: #777;
      }
    }

    &--visualize {
      margin-top: 12px;
      background-color: #ff9800;

      &:hover {
        background-color: #f57c00;
      }
    }
  }
`;
