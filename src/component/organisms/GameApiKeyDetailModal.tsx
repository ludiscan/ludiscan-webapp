import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import type { GameApiKey } from '@src/types/api-keys';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes, fontWeights } from '@src/styles/style';

export type GameApiKeyDetailModalProps = {
  className?: string;
  isOpen: boolean;
  selectedKey: GameApiKey | null;
  userProjects: { id: number; name: string }[];
  isUpdatingProjects?: boolean;
  onClose: () => void;
  onUpdateProjects: (keyId: string, projectIds: number[]) => Promise<void>;
};

const Component: FC<GameApiKeyDetailModalProps> = ({ className, isOpen, selectedKey, userProjects, isUpdatingProjects = false, onClose, onUpdateProjects }) => {
  const { theme } = useSharedTheme();
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

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

  const maskKeyValue = (value: string): string => {
    if (!value || value.length < 20) return '••••••••••••••••••••';
    return value.slice(0, 4) + '••••••••••••••••••••' + value.slice(-4);
  };

  const handleOpenEdit = useCallback(() => {
    if (selectedKey) {
      setSelectedProjectIds(selectedKey.projects.map((p) => p.id));
      setIsEditingProjects(true);
    }
  }, [selectedKey]);

  const handleSaveProjects = useCallback(async () => {
    if (!selectedKey) return;
    try {
      await onUpdateProjects(selectedKey.id, selectedProjectIds);
      setIsEditingProjects(false);
    } catch {
      // Error is handled by the caller
    }
  }, [selectedKey, selectedProjectIds, onUpdateProjects]);

  const handleCloseModal = useCallback(() => {
    setIsEditingProjects(false);
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title='API Key Details'>
      <div className={`${className}__modal`}>
        <FlexColumn gap={16}>
          {selectedKey && (
            <>
              <div>
                <Text text='Name' fontSize={fontSizes.small} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={4} />
                <Text text={selectedKey.name} fontSize={fontSizes.medium} color={theme.colors.secondary.main} />
              </div>

              <div>
                <Text text='Key ID' fontSize={fontSizes.small} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={4} />
                <div className={`${className}__keyValueContainer`}>
                  <Text text={maskKeyValue(selectedKey.id)} fontSize={fontSizes.smallest} color={theme.colors.secondary.main} />
                </div>
              </div>

              <div>
                <Text text='Created' fontSize={fontSizes.small} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={4} />
                <Text text={formatDate(selectedKey.createdAt)} fontSize={fontSizes.small} color={theme.colors.secondary.main} />
              </div>

              {selectedKey.lastUsedAt && (
                <div>
                  <Text text='Last Used' fontSize={fontSizes.small} color={theme.colors.text} fontWeight={fontWeights.bold} />
                  <VerticalSpacer size={4} />
                  <Text text={formatDate(selectedKey.lastUsedAt)} fontSize={fontSizes.small} color={theme.colors.secondary.main} />
                </div>
              )}

              <div>
                <FlexRow gap={8} align='center' className={`${className}__projectsHeader`}>
                  <Text text='Projects' fontSize={fontSizes.small} color={theme.colors.text} fontWeight={fontWeights.bold} />
                  {!isEditingProjects && (
                    <Button onClick={handleOpenEdit} scheme='none' fontSize='small' className={`${className}__editButton`}>
                      <Text text='Edit' fontSize={fontSizes.smallest} color={theme.colors.primary.main} fontWeight={fontWeights.bold} />
                    </Button>
                  )}
                </FlexRow>
                <VerticalSpacer size={8} />

                {isEditingProjects ? (
                  <FlexColumn gap={8} className={`${className}__projectSelection`}>
                    {userProjects.map((proj) => (
                      <label key={proj.id} className={`${className}__projectCheckbox`}>
                        <input
                          type='checkbox'
                          checked={selectedProjectIds.includes(proj.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjectIds([...selectedProjectIds, proj.id]);
                            } else {
                              setSelectedProjectIds(selectedProjectIds.filter((id) => id !== proj.id));
                            }
                          }}
                        />
                        <Text text={proj.name} fontSize={fontSizes.small} color={theme.colors.text} />
                      </label>
                    ))}
                  </FlexColumn>
                ) : (
                  <FlexColumn gap={4}>
                    {selectedKey.projects.length > 0 ? (
                      selectedKey.projects.map((proj) => <Text key={proj.id} text={proj.name} fontSize={fontSizes.small} color={theme.colors.secondary.main} />)
                    ) : (
                      <Text text='No projects assigned' fontSize={fontSizes.small} color={theme.colors.secondary.main} fontWeight='lighter' />
                    )}
                  </FlexColumn>
                )}
              </div>
            </>
          )}

          <FlexRow gap={8} className={`${className}__buttonRow`}>
            {isEditingProjects ? (
              <>
                <Button
                  onClick={() => {
                    setIsEditingProjects(false);
                    setSelectedProjectIds(selectedKey?.projects.map((p) => p.id) || []);
                  }}
                  scheme='none'
                  fontSize='small'
                  disabled={isUpdatingProjects}
                >
                  <Text text='Cancel' fontSize={fontSizes.small} />
                </Button>
                <Button onClick={handleSaveProjects} scheme='primary' fontSize='small' disabled={isUpdatingProjects}>
                  <Text text={isUpdatingProjects ? 'Saving...' : 'Save'} fontSize={fontSizes.small} />
                </Button>
              </>
            ) : (
              <Button onClick={handleCloseModal} scheme='primary' fontSize='small'>
                <Text text='Close' fontSize={fontSizes.small} />
              </Button>
            )}
          </FlexRow>
        </FlexColumn>
      </div>
    </Modal>
  );
};

export const GameApiKeyDetailModal = styled(Component)`
  &__modal {
    padding: 16px;
    color: ${({ theme }) => theme.colors.text};
  }

  &__keyValueContainer {
    padding: 8px 12px;
    font-family: monospace;
    word-break: break-all;
    background-color: ${({ theme }) => theme.colors.surface.main};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: 4px;
  }

  &__projectsHeader {
    justify-content: space-between;
  }

  &__editButton {
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.light};
    }
  }

  &__projectSelection {
    padding: 12px;
    background-color: ${({ theme }) => theme.colors.surface.light};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: 6px;
  }

  &__projectCheckbox {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.main};
    }

    input[type='checkbox'] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }

  &__buttonRow {
    justify-content: flex-end;
    margin-top: 16px;
  }
`;
