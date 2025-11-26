import styled from '@emotion/styled';
import { useState } from 'react';
import { BiBarChartAlt2, BiPlus, BiX, BiPlay, BiChevronDown, BiChevronUp } from 'react-icons/bi';

import type { AggregateResponse, AggregationConfig, MetadataKeyInfo, AggregationOperation } from '@src/hooks/useSessionFilters';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SessionAggregationPanelProps = {
  className?: string;
  numericMetadataKeys: MetadataKeyInfo[];
  aggregationConfigs: AggregationConfig[];
  aggregateResult?: AggregateResponse;
  isAggregating: boolean;
  onAddAggregation: (field: string, operations?: AggregationOperation[]) => void;
  onRemoveAggregation: (field: string) => void;
  onClearAggregations: () => void;
  onRunAggregate: () => void;
  hasActiveFilters: boolean;
};

const ALL_OPERATIONS: AggregationOperation[] = ['count', 'sum', 'avg', 'min', 'max'];

const Component: FC<SessionAggregationPanelProps> = ({
  className,
  numericMetadataKeys,
  aggregationConfigs,
  aggregateResult,
  isAggregating,
  onAddAggregation,
  onRemoveAggregation,
  onClearAggregations,
  onRunAggregate,
  hasActiveFilters,
}) => {
  const { theme } = useSharedTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedField, setSelectedField] = useState('');

  const handleAddAggregation = () => {
    if (selectedField) {
      onAddAggregation(selectedField, ALL_OPERATIONS);
      setSelectedField('');
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '-';
    return num.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
  };

  const availableFields = numericMetadataKeys.filter((k) => !aggregationConfigs.some((c) => c.field === k.key));

  return (
    <div className={className}>
      <FlexRow className={`${className}__header`} align='center'>
        <FlexRow gap={8} align='center'>
          <BiBarChartAlt2 size={18} />
          <Text text='集計' fontSize={theme.typography.fontSize.base} fontWeight='bold' />
        </FlexRow>
        <button
          type='button'
          className={`${className}__toggleButton`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? '折りたたむ' : '展開する'}
        >
          {isExpanded ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
        </button>
      </FlexRow>

      {isExpanded && (
        <FlexColumn className={`${className}__content`} gap={16}>
          {/* Add Aggregation Field */}
          {numericMetadataKeys.length > 0 && (
            <FlexColumn gap={8}>
              <Text text='数値フィールドを選択して集計' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
              <FlexRow gap={8} align='center'>
                <select
                  className={`${className}__fieldSelect`}
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  disabled={availableFields.length === 0}
                >
                  <option value=''>フィールドを選択...</option>
                  {availableFields.map((k) => (
                    <option key={k.key} value={k.key}>
                      {k.key} ({k.count}件)
                    </option>
                  ))}
                </select>
                <Button onClick={handleAddAggregation} scheme='primary' fontSize='sm' disabled={!selectedField}>
                  <BiPlus size={16} />
                  追加
                </Button>
              </FlexRow>
            </FlexColumn>
          )}

          {numericMetadataKeys.length === 0 && (
            <Text text='集計可能な数値フィールドがありません' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
          )}

          {/* Selected Aggregation Fields */}
          {aggregationConfigs.length > 0 && (
            <FlexColumn gap={8}>
              <FlexRow align='center'>
                <Text text='集計対象フィールド' fontSize={theme.typography.fontSize.sm} fontWeight='bold' />
                <Button onClick={onClearAggregations} scheme='surface' fontSize='sm'>
                  <BiX size={14} />
                  すべてクリア
                </Button>
              </FlexRow>
              <FlexRow gap={8} className={`${className}__tags`}>
                {aggregationConfigs.map((config) => (
                  <span key={config.field} className={`${className}__tag`}>
                    {config.field}
                    <button type='button' onClick={() => onRemoveAggregation(config.field)} aria-label={`${config.field}を削除`}>
                      <BiX size={14} />
                    </button>
                  </span>
                ))}
              </FlexRow>
            </FlexColumn>
          )}

          {/* Run Aggregate Button */}
          <Button onClick={onRunAggregate} scheme='primary' fontSize='base' disabled={isAggregating}>
            <BiPlay size={18} />
            {isAggregating ? '集計中...' : '集計を実行'}
          </Button>

          {hasActiveFilters && <Text text='※ 現在のフィルター条件が適用されます' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />}

          {/* Aggregate Results */}
          {aggregateResult && (
            <FlexColumn gap={16} className={`${className}__results`}>
              <Text text='集計結果' fontSize={theme.typography.fontSize.base} fontWeight='bold' />

              {/* Session Counts */}
              <div className={`${className}__countGrid`}>
                <div className={`${className}__countCard`}>
                  <span className={`${className}__countLabel`}>合計セッション</span>
                  <span className={`${className}__countValue`}>{formatNumber(aggregateResult.totalCount)}</span>
                </div>
                <div className={`${className}__countCard`}>
                  <span className={`${className}__countLabel`}>終了</span>
                  <span className={`${className}__countValue ${className}__countValue--finished`}>{formatNumber(aggregateResult.finishedCount)}</span>
                </div>
                <div className={`${className}__countCard`}>
                  <span className={`${className}__countLabel`}>プレイ中</span>
                  <span className={`${className}__countValue ${className}__countValue--playing`}>{formatNumber(aggregateResult.playingCount)}</span>
                </div>
              </div>

              {/* Field Aggregations */}
              {aggregateResult.aggregations && aggregateResult.aggregations.length > 0 && (
                <FlexColumn gap={12}>
                  <Text text='フィールド別集計' fontSize={theme.typography.fontSize.sm} fontWeight='bold' />
                  <div className={`${className}__aggregationTable`}>
                    <table>
                      <thead>
                        <tr>
                          <th>フィールド</th>
                          <th>件数</th>
                          <th>合計</th>
                          <th>平均</th>
                          <th>最小</th>
                          <th>最大</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aggregateResult.aggregations.map((agg) => (
                          <tr key={agg.field}>
                            <td className={`${className}__fieldName`}>{agg.field}</td>
                            <td>{formatNumber(agg.count)}</td>
                            <td>{formatNumber(agg.sum)}</td>
                            <td>{formatNumber(agg.avg)}</td>
                            <td>{formatNumber(agg.min)}</td>
                            <td>{formatNumber(agg.max)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </FlexColumn>
              )}
            </FlexColumn>
          )}
        </FlexColumn>
      )}
    </div>
  );
};

export const SessionAggregationPanel = styled(Component)`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface.raised};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;

  &__header {
    padding: 12px 16px;
    background: ${({ theme }) => theme.colors.surface.base};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &__toggleButton {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
    }
  }

  &__content {
    padding: 16px;
  }

  &__fieldSelect {
    flex: 1;
    padding: 8px 12px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 6px;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    option {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.base};
    }
  }

  &__tags {
    flex-wrap: wrap;
  }

  &__tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 8px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      color: ${({ theme }) => theme.colors.text.secondary};
      cursor: pointer;
      background: none;
      border: none;
      border-radius: 2px;

      &:hover {
        color: ${({ theme }) => theme.colors.text.primary};
        background: ${({ theme }) => theme.colors.surface.hover};
      }
    }
  }

  &__results {
    padding: 16px;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: 8px;
  }

  &__countGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  &__countCard {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    text-align: center;
    background: ${({ theme }) => theme.colors.surface.sunken ?? 'rgba(0, 0, 0, 0.1)'};
    border-radius: 6px;
  }

  &__countLabel {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__countValue {
    font-size: 24px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text.primary};

    &--finished {
      color: ${({ theme }) => theme.colors.semantic.success.main ?? '#4caf50'};
    }

    &--playing {
      color: ${({ theme }) => theme.colors.semantic.warning.main ?? '#ff9800'};
    }
  }

  &__aggregationTable {
    overflow-x: auto;

    table {
      width: 100%;
      font-size: 13px;
      border-collapse: collapse;

      th,
      td {
        padding: 8px 12px;
        text-align: right;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
      }

      th {
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text.secondary};
        background: ${({ theme }) => theme.colors.surface.sunken ?? 'rgba(0, 0, 0, 0.05)'};
      }

      td {
        color: ${({ theme }) => theme.colors.text.primary};
      }

      tr:last-child td {
        border-bottom: none;
      }

      tr:hover td {
        background: ${({ theme }) => theme.colors.surface.hover};
      }
    }
  }

  &__fieldName {
    font-weight: 500;
    text-align: left !important;
  }
`;
