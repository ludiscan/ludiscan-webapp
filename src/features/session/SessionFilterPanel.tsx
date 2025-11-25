import styled from '@emotion/styled';
import { useState } from 'react';
import { BiFilter, BiX, BiChevronDown, BiChevronUp } from 'react-icons/bi';

import type { SessionFilterState, MetadataKeyInfo, FilterOptions } from '@src/hooks/useSessionFilters';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SessionFilterPanelProps = {
  className?: string;
  filters: SessionFilterState;
  filterOptions?: FilterOptions;
  metadataKeys: MetadataKeyInfo[];
  isLoadingOptions: boolean;
  hasActiveFilters: boolean;
  onUpdateFilter: <K extends keyof SessionFilterState>(key: K, value: SessionFilterState[K]) => void;
  onClearFilters: () => void;
};

const Component: FC<SessionFilterPanelProps> = ({
  className,
  filters,
  filterOptions,
  metadataKeys,
  isLoadingOptions,
  hasActiveFilters,
  onUpdateFilter,
  onClearFilters,
}) => {
  const { theme } = useSharedTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className={className}>
      <FlexRow className={`${className}__header`} justify="space-between" align="center">
        <FlexRow gap={8} align="center">
          <BiFilter size={18} />
          <Text text="フィルター" fontSize={theme.typography.fontSize.base} fontWeight="bold" />
          {hasActiveFilters && (
            <span className={`${className}__badge`}>
              {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
            </span>
          )}
        </FlexRow>
        <FlexRow gap={8}>
          {hasActiveFilters && (
            <Button onClick={onClearFilters} scheme="surface" fontSize="sm">
              <BiX size={16} />
              クリア
            </Button>
          )}
          <button
            type="button"
            className={`${className}__toggleButton`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? '折りたたむ' : '展開する'}
          >
            {isExpanded ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
          </button>
        </FlexRow>
      </FlexRow>

      {isExpanded && (
        <FlexColumn className={`${className}__content`} gap={16}>
          {/* Basic Filters */}
          <div className={`${className}__filterGrid`}>
            {/* Platform */}
            <div className={`${className}__filterItem`}>
              <label htmlFor="filter-platform">プラットフォーム</label>
              <select
                id="filter-platform"
                value={filters.platform ?? ''}
                onChange={(e) => onUpdateFilter('platform', e.target.value || undefined)}
                disabled={isLoadingOptions}
              >
                <option value="">すべて</option>
                {filterOptions?.platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* App Version */}
            <div className={`${className}__filterItem`}>
              <label htmlFor="filter-app-version">アプリバージョン</label>
              <select
                id="filter-app-version"
                value={filters.appVersion ?? ''}
                onChange={(e) => onUpdateFilter('appVersion', e.target.value || undefined)}
                disabled={isLoadingOptions}
              >
                <option value="">すべて</option>
                {filterOptions?.appVersions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Device ID */}
            <div className={`${className}__filterItem`}>
              <label htmlFor="filter-device-id">デバイスID</label>
              <select
                id="filter-device-id"
                value={filters.deviceId ?? ''}
                onChange={(e) => onUpdateFilter('deviceId', e.target.value || undefined)}
                disabled={isLoadingOptions}
              >
                <option value="">すべて</option>
                {filterOptions?.deviceIds.map((d) => (
                  <option key={d} value={d}>
                    {d.length > 20 ? `${d.slice(0, 20)}...` : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Playing Status */}
            <div className={`${className}__filterItem`}>
              <label htmlFor="filter-status">ステータス</label>
              <select
                id="filter-status"
                value={filters.isPlaying === undefined ? '' : filters.isPlaying ? 'playing' : 'finished'}
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdateFilter('isPlaying', value === '' ? undefined : value === 'playing');
                }}
              >
                <option value="">すべて</option>
                <option value="playing">プレイ中</option>
                <option value="finished">終了</option>
              </select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className={`${className}__filterGrid`}>
            <div className={`${className}__filterItem`}>
              <label htmlFor="filter-start-from">開始日（From）</label>
              <input
                id="filter-start-from"
                type="datetime-local"
                value={filters.startTimeFrom ?? ''}
                onChange={(e) => onUpdateFilter('startTimeFrom', e.target.value || undefined)}
              />
            </div>
            <div className={`${className}__filterItem`}>
              <label htmlFor="filter-start-to">開始日（To）</label>
              <input
                id="filter-start-to"
                type="datetime-local"
                value={filters.startTimeTo ?? ''}
                onChange={(e) => onUpdateFilter('startTimeTo', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            type="button"
            className={`${className}__advancedToggle`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Text
              text={showAdvanced ? '詳細フィルターを隠す' : '詳細フィルターを表示'}
              fontSize={theme.typography.fontSize.sm}
              color={theme.colors.primary.main}
            />
            {showAdvanced ? <BiChevronUp size={16} /> : <BiChevronDown size={16} />}
          </button>

          {showAdvanced && (
            <FlexColumn gap={16}>
              {/* Metadata Filters */}
              <div className={`${className}__filterGrid`}>
                <div className={`${className}__filterItem`}>
                  <label htmlFor="filter-metadata-key">メタデータキー</label>
                  <select
                    id="filter-metadata-key"
                    value={filters.metadataKey ?? ''}
                    onChange={(e) => {
                      onUpdateFilter('metadataKey', e.target.value || undefined);
                      if (!e.target.value) {
                        onUpdateFilter('metadataValue', undefined);
                      }
                    }}
                  >
                    <option value="">選択してください</option>
                    {metadataKeys.map((k) => (
                      <option key={k.key} value={k.key}>
                        {k.key} ({k.count}件)
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${className}__filterItem`}>
                  <label htmlFor="filter-metadata-value">メタデータ値</label>
                  <input
                    id="filter-metadata-value"
                    type="text"
                    value={filters.metadataValue ?? ''}
                    onChange={(e) => onUpdateFilter('metadataValue', e.target.value || undefined)}
                    placeholder="値を入力..."
                    disabled={!filters.metadataKey}
                  />
                </div>
              </div>

              {/* Query Filter */}
              <div className={`${className}__filterItem ${className}__filterItem--full`}>
                <label htmlFor="filter-query">統合クエリ（GitHub風フィルター構文）</label>
                <input
                  id="filter-query"
                  type="text"
                  value={filters.q ?? ''}
                  onChange={(e) => onUpdateFilter('q', e.target.value || undefined)}
                  placeholder="例: platform:Android is:finished score:>100"
                />
                <span className={`${className}__hint`}>
                  例: platform:Android, is:playing, is:finished, app_version:1.0.0
                </span>
              </div>
            </FlexColumn>
          )}
        </FlexColumn>
      )}
    </div>
  );
};

export const SessionFilterPanel = styled(Component)`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface.raised};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;

  &__header {
    padding: 12px 16px;
    background: ${({ theme }) => theme.colors.surface.base};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary.contrast};
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 10px;
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

  &__filterGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  &__filterItem {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 12px;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.text.secondary};
    }

    select,
    input {
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

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__hint {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.7;
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
`;
