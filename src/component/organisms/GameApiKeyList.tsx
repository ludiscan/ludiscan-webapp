import styled from '@emotion/styled';
import { useMemo } from 'react';
import { BiTrash, BiShow } from 'react-icons/bi';

import type { GameApiKey } from '@src/types/api-keys';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes, fontWeights } from '@src/styles/style';

export type GameApiKeyListProps = {
  className?: string;
  apiKeys: GameApiKey[];
  isLoading?: boolean;
  isError?: boolean;
  searchQuery: string;
  projectFilter?: number | 'all';
  onSearchChange: (value: string) => void;
  onProjectFilterChange?: (value: number | 'all') => void;
  onShowDetails: (key: GameApiKey) => void;
  onDeleteKey: (key: GameApiKey) => void;
  userProjects?: { id: number; name: string }[];
  onCreateKeyClick: () => void;
  showProjectFilter?: boolean;
};

const Component: FC<GameApiKeyListProps> = ({
  className,
  apiKeys,
  isLoading = false,
  isError = false,
  searchQuery,
  projectFilter = 'all',
  onSearchChange,
  onProjectFilterChange,
  onShowDetails,
  onDeleteKey,
  userProjects = [],
  onCreateKeyClick,
  showProjectFilter = false,
}) => {
  const { theme } = useSharedTheme();

  const filteredKeys = useMemo(() => {
    let result = apiKeys;

    // Search filter
    result = result.filter((key) => key.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Project filter
    if (showProjectFilter && projectFilter !== 'all') {
      result = result.filter((key) => key.projects.some((p) => p.id === projectFilter));
    }

    return result;
  }, [apiKeys, searchQuery, projectFilter, showProjectFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={className}>
      <Card blur color={theme.colors.surface.main} className={`${className}__card`}>
        <FlexRow className={`${className}__header`} gap={16}>
          <div className={`${className}__searchContainer`}>
            <OutlinedTextField value={searchQuery} onChange={onSearchChange} placeholder='API-keyを検索...' fontSize={fontSizes.medium} />
          </div>
          {showProjectFilter && onProjectFilterChange && (
            <select
              value={projectFilter}
              onChange={(e) => onProjectFilterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className={`${className}__projectFilter`}
            >
              <option value='all'>All Projects</option>
              {userProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          <Button onClick={onCreateKeyClick} scheme='primary' fontSize='small'>
            <Text text='+ Create Key' fontSize={fontSizes.small} />
          </Button>
        </FlexRow>
        <VerticalSpacer size={16} />

        <FlexColumn gap={0}>
          {/* ローディング状態 */}
          {isLoading && !isError && (
            <div className={`${className}__loadingState`}>
              <Text text='API-keyを読み込み中...' fontSize={fontSizes.medium} color={theme.colors.text} />
            </div>
          )}

          {/* エラー状態 */}
          {isError && (
            <div className={`${className}__errorState`}>
              <Text text='API-key一覧の取得に失敗しました' fontSize={fontSizes.medium} color={theme.colors.text} />
            </div>
          )}

          {/* API-key一覧 */}
          {!isError &&
            !isLoading &&
            filteredKeys.length > 0 &&
            filteredKeys.map((key) => (
              <div key={key.id} className={`${className}__keyItem`}>
                <FlexRow className={`${className}__keyRow`} align='center' gap={12}>
                  <FlexColumn gap={4} className={`${className}__keyInfo`}>
                    <Text text={key.name} fontSize={fontSizes.medium} color={theme.colors.text} fontWeight={fontWeights.bold} />
                    <Text
                      text={`Created: ${formatDate(key.createdAt)}`}
                      fontSize={fontSizes.smallest}
                      color={theme.colors.secondary.main}
                      fontWeight='lighter'
                    />
                    {key.projects.length > 0 && (
                      <Text
                        text={`Projects: ${key.projects.map((p) => p.name).join(', ')}`}
                        fontSize={fontSizes.smallest}
                        color={theme.colors.secondary.main}
                        fontWeight='lighter'
                      />
                    )}
                  </FlexColumn>
                  <FlexRow gap={8} className={`${className}__keyActions`}>
                    <Button onClick={() => onShowDetails(key)} scheme='none' fontSize='small' title='View Details' className={`${className}__actionButton`}>
                      <BiShow size={18} color={theme.colors.secondary.main} />
                    </Button>
                    <Button onClick={() => onDeleteKey(key)} scheme='none' fontSize='small' title='Delete' className={`${className}__actionButton`}>
                      <BiTrash size={18} color={theme.colors.error} />
                    </Button>
                  </FlexRow>
                </FlexRow>
              </div>
            ))}

          {/* 空状態 */}
          {!isLoading && !isError && filteredKeys.length === 0 && (
            <div className={`${className}__emptyState`}>
              <Text text='API-keyがありません' fontSize={fontSizes.medium} color={theme.colors.secondary.main} />
            </div>
          )}
        </FlexColumn>
      </Card>
    </div>
  );
};

export const GameApiKeyList = styled(Component)`
  width: 100%;

  &__card {
    padding: 16px;
  }

  &__header {
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 8px;
  }

  &__searchContainer {
    flex: 1;
    min-width: 200px;
  }

  &__projectFilter {
    padding: 8px 12px;
    font-size: ${fontSizes.medium}px;
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.surface.main};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: 4px;

    &:hover {
      border-color: ${({ theme }) => theme.colors.border.dark};
    }

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.secondary.main};
    }
  }

  &__keyItem {
    width: 100%;
    padding: 12px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};

    &:last-child {
      border-bottom: none;
    }
  }

  &__keyRow {
    justify-content: space-between;
  }

  &__keyInfo {
    flex: 1;
  }

  &__keyActions {
    justify-content: flex-end;
  }

  &__actionButton {
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.light};
    }
  }

  &__loadingState,
  &__errorState,
  &__emptyState {
    padding: 32px 0;
    text-align: center;
    opacity: 0.6;
  }
`;
