import styled from '@emotion/styled';
import { useState } from 'react';
import { BiBarChartAlt2, BiChevronDown, BiChevronUp, BiFilter, BiPlay, BiPlus, BiX } from 'react-icons/bi';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { AggregationOperation, MetadataKeyInfo, SessionFilterState } from '@src/hooks/useSessionFilters';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSessionFiltersAndAggregate } from '@src/hooks/useSessionFilters';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

const ALL_OPERATIONS: AggregationOperation[] = ['count', 'sum', 'avg', 'min', 'max'];

const formatNumber = (num: number | undefined) => {
  if (num === undefined) return '-';
  return num.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
};

type AggregationMenuContentComponentProps = HeatmapMenuProps & {
  className?: string;
};

const AggregationMenuContentComponent: FC<AggregationMenuContentComponentProps> = ({ className, service }) => {
  const { theme } = useSharedTheme();
  const [selectedField, setSelectedField] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const projectId = service.projectId ?? 0;

  const {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    isLoadingFilterOptions,
    metadataKeys,
    numericMetadataKeys,
    aggregationConfigs,
    addAggregation,
    removeAggregation,
    clearAggregations,
    runAggregate,
    aggregateResult,
    isAggregating,
  } = useSessionFiltersAndAggregate(projectId);

  const handleAddAggregation = () => {
    if (selectedField) {
      addAggregation(selectedField, ALL_OPERATIONS);
      setSelectedField('');
    }
  };

  const handleRunAggregate = async () => {
    try {
      await runAggregate();
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleUpdateFilter = <K extends keyof SessionFilterState>(key: K, value: SessionFilterState[K]) => {
    updateFilter(key, value);
  };

  const availableFields = numericMetadataKeys.filter((k: MetadataKeyInfo) => !aggregationConfigs.some((c) => c.field === k.key));

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  if (!projectId) {
    return (
      <div className={className}>
        <FlexRow gap={8} align='center'>
          <BiBarChartAlt2 size={20} />
          <Text text='集計' fontSize={theme.typography.fontSize.lg} fontWeight='bold' />
        </FlexRow>
        <Text text='プロジェクトが選択されていません' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <FlexRow gap={8} align='center' className={`${className}__header`}>
        <BiBarChartAlt2 size={20} />
        <Text text='集計' fontSize={theme.typography.fontSize.lg} fontWeight='bold' />
      </FlexRow>

      <FlexColumn gap={16} className={`${className}__content`}>
        {/* Filter Section */}
        <div className={`${className}__filterSection`}>
          <button type='button' className={`${className}__filterToggle`} onClick={() => setShowFilters(!showFilters)}>
            <FlexRow gap={8} align='center'>
              <BiFilter size={18} />
              <Text text='フィルター' fontSize={theme.typography.fontSize.sm} fontWeight='bold' />
              {activeFilterCount > 0 && <span className={`${className}__badge`}>{activeFilterCount}</span>}
            </FlexRow>
            {showFilters ? <BiChevronUp size={18} /> : <BiChevronDown size={18} />}
          </button>

          {showFilters && (
            <FlexColumn gap={12} className={`${className}__filterContent`}>
              {hasActiveFilters && (
                <FlexRow>
                  <Button onClick={clearFilters} scheme='surface' fontSize='sm'>
                    <BiX size={14} />
                    フィルターをクリア
                  </Button>
                </FlexRow>
              )}

              {/* Basic Filters */}
              <div className={`${className}__filterGrid`}>
                {/* Platform */}
                <div className={`${className}__filterItem`}>
                  <label htmlFor='agg-filter-platform'>プラットフォーム</label>
                  <select
                    id='agg-filter-platform'
                    value={filters.platform ?? ''}
                    onChange={(e) => handleUpdateFilter('platform', e.target.value || undefined)}
                    disabled={isLoadingFilterOptions}
                  >
                    <option value=''>すべて</option>
                    {filterOptions?.platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* App Version */}
                <div className={`${className}__filterItem`}>
                  <label htmlFor='agg-filter-app-version'>アプリバージョン</label>
                  <select
                    id='agg-filter-app-version'
                    value={filters.appVersion ?? ''}
                    onChange={(e) => handleUpdateFilter('appVersion', e.target.value || undefined)}
                    disabled={isLoadingFilterOptions}
                  >
                    <option value=''>すべて</option>
                    {filterOptions?.appVersions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Playing Status */}
                <div className={`${className}__filterItem`}>
                  <label htmlFor='agg-filter-status'>ステータス</label>
                  <select
                    id='agg-filter-status'
                    value={filters.isPlaying === undefined ? '' : filters.isPlaying ? 'playing' : 'finished'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleUpdateFilter('isPlaying', value === '' ? undefined : value === 'playing');
                    }}
                  >
                    <option value=''>すべて</option>
                    <option value='playing'>プレイ中</option>
                    <option value='finished'>終了</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <button type='button' className={`${className}__advancedToggle`} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <Text
                  text={showAdvancedFilters ? '詳細フィルターを隠す' : '詳細フィルターを表示'}
                  fontSize={theme.typography.fontSize.sm}
                  color={theme.colors.primary.main}
                />
                {showAdvancedFilters ? <BiChevronUp size={16} /> : <BiChevronDown size={16} />}
              </button>

              {showAdvancedFilters && (
                <FlexColumn gap={12}>
                  {/* Date Range */}
                  <div className={`${className}__filterGrid`}>
                    <div className={`${className}__filterItem`}>
                      <label htmlFor='agg-filter-start-from'>開始日（From）</label>
                      <input
                        id='agg-filter-start-from'
                        type='datetime-local'
                        value={filters.startTimeFrom ?? ''}
                        onChange={(e) => handleUpdateFilter('startTimeFrom', e.target.value || undefined)}
                      />
                    </div>
                    <div className={`${className}__filterItem`}>
                      <label htmlFor='agg-filter-start-to'>開始日（To）</label>
                      <input
                        id='agg-filter-start-to'
                        type='datetime-local'
                        value={filters.startTimeTo ?? ''}
                        onChange={(e) => handleUpdateFilter('startTimeTo', e.target.value || undefined)}
                      />
                    </div>
                  </div>

                  {/* Metadata Filters */}
                  <div className={`${className}__filterGrid`}>
                    <div className={`${className}__filterItem`}>
                      <label htmlFor='agg-filter-metadata-key'>メタデータキー</label>
                      <select
                        id='agg-filter-metadata-key'
                        value={filters.metadataKey ?? ''}
                        onChange={(e) => {
                          handleUpdateFilter('metadataKey', e.target.value || undefined);
                          if (!e.target.value) {
                            handleUpdateFilter('metadataValue', undefined);
                          }
                        }}
                      >
                        <option value=''>選択してください</option>
                        {metadataKeys.map((k) => (
                          <option key={k.key} value={k.key}>
                            {k.key} ({k.count}件)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={`${className}__filterItem`}>
                      <label htmlFor='agg-filter-metadata-value'>メタデータ値</label>
                      <input
                        id='agg-filter-metadata-value'
                        type='text'
                        value={filters.metadataValue ?? ''}
                        onChange={(e) => handleUpdateFilter('metadataValue', e.target.value || undefined)}
                        placeholder='値を入力...'
                        disabled={!filters.metadataKey}
                      />
                    </div>
                  </div>

                  {/* Query Filter */}
                  <div className={`${className}__filterItem`}>
                    <label htmlFor='agg-filter-query'>クエリフィルター</label>
                    <input
                      id='agg-filter-query'
                      type='text'
                      value={filters.q ?? ''}
                      onChange={(e) => handleUpdateFilter('q', e.target.value || undefined)}
                      placeholder='例: platform:Android is:finished'
                    />
                  </div>
                </FlexColumn>
              )}
            </FlexColumn>
          )}
        </div>

        {/* Field Selection */}
        {numericMetadataKeys.length > 0 ? (
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
                {availableFields.map((k: MetadataKeyInfo) => (
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
        ) : (
          <Text text='集計可能な数値フィールドがありません' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
        )}

        {/* Selected Fields */}
        {aggregationConfigs.length > 0 && (
          <FlexColumn gap={8}>
            <FlexRow align='center'>
              <Text text='集計対象フィールド' fontSize={theme.typography.fontSize.sm} fontWeight='bold' />
              <Button onClick={clearAggregations} scheme='surface' fontSize='sm'>
                <BiX size={14} />
                クリア
              </Button>
            </FlexRow>
            <FlexRow gap={8} className={`${className}__tags`}>
              {aggregationConfigs.map((config) => (
                <span key={config.field} className={`${className}__tag`}>
                  {config.field}
                  <button type='button' onClick={() => removeAggregation(config.field)} aria-label={`${config.field}を削除`}>
                    <BiX size={14} />
                  </button>
                </span>
              ))}
            </FlexRow>
          </FlexColumn>
        )}

        {/* Run Button */}
        <Button onClick={handleRunAggregate} scheme='primary' fontSize='base' disabled={isAggregating}>
          <BiPlay size={18} />
          {isAggregating ? '集計中...' : '集計を実行'}
        </Button>

        {hasActiveFilters && <Text text='※ フィルター条件が適用されます' fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />}

        {/* Results */}
        {aggregateResult && (
          <FlexColumn gap={16} className={`${className}__results`}>
            <Text text='集計結果' fontSize={theme.typography.fontSize.base} fontWeight='bold' />

            {/* Session Counts */}
            <div className={`${className}__countGrid`}>
              <div className={`${className}__countCard`}>
                <span className={`${className}__countLabel`}>合計</span>
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
    </div>
  );
};

export const AggregationMenuContent = styled(AggregationMenuContentComponent)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;

  &__header {
    padding-bottom: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__content {
    width: 100%;
  }

  &__filterSection {
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
  }

  &__filterToggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
    }
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary.contrast};
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 9px;
  }

  &__filterContent {
    padding: ${({ theme }) => theme.spacing.md};
    border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__filterGrid {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  &__filterItem {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
      color: ${({ theme }) => theme.colors.text.secondary};
    }

    option {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.base};
    }

    select,
    input {
      padding: ${({ theme }) => theme.spacing.sm};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.raised};
      border: 1px solid ${({ theme }) => theme.colors.border.default};
      border-radius: ${({ theme }) => theme.borders.radius.sm};

      &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary.main};
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }

  &__advancedToggle {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 0;
    color: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__fieldSelect {
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};

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
    gap: ${({ theme }) => theme.spacing.xs};
    align-items: center;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.sm};

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
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.md};
  }

  &__countGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.sm};
  }

  &__countCard {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: center;
    background: ${({ theme }) => theme.colors.surface.sunken ?? 'rgba(0, 0, 0, 0.1)'};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__countLabel {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__countValue {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};

    &--finished {
      color: ${({ theme }) => theme.colors.semantic?.success?.main ?? '#4caf50'};
    }

    &--playing {
      color: ${({ theme }) => theme.colors.semantic?.warning?.main ?? '#ff9800'};
    }
  }

  &__aggregationTable {
    overflow-x: auto;

    table {
      width: 100%;
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      border-collapse: collapse;

      th,
      td {
        padding: ${({ theme }) => theme.spacing.sm};
        text-align: right;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
      }

      th {
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
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
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-align: left !important;
  }
`;
