import styled from '@emotion/styled';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { BiTrash } from 'react-icons/bi';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { MemberSuggestionInput } from '@src/component/molecules/MemberSuggestionInput';
import { Modal } from '@src/component/molecules/Modal';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useToast } from '@src/component/templates/ToastContext';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';

export type ProjectDetailsMembersTabProps = {
  className?: string;
  project: Project;
};

interface Member {
  user_id: string;
  email: string;
  name: string;
  created_at: string;
  role: string;
}

const Component: FC<ProjectDetailsMembersTabProps> = ({ className, project }) => {
  const { theme } = useSharedTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'viewer' | 'admin'>('viewer');
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const apiClient = useApiClient();

  // メンバー一覧を取得
  const {
    data: members = [],
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
  } = useQuery({
    queryKey: ['members', project.id, apiClient],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/v0.1/projects/{project_id}/members', {
        params: {
          path: {
            project_id: project.id,
          },
          query: {
            limit: 100,
            offset: 0,
          },
        },
      });
      if (error) throw new Error('メンバー一覧の取得に失敗しました');
      return (data || []) as Member[];
    },
    staleTime: DefaultStaleTime,
  });

  // 検索フィルタリング
  const filteredMembers = members.filter(
    (member) => member.email.toLowerCase().includes(searchQuery.toLowerCase()) || member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddMember = useCallback(async () => {
    if (!newMemberEmail.trim()) {
      showToast('メールアドレスを入力してください', 2, 'error');
      return;
    }

    try {
      setIsSubmittingMember(true);
      const { error } = await apiClient.POST('/api/v0.1/projects/{project_id}/members/email', {
        params: {
          path: {
            project_id: project.id,
          },
        },
        body: {
          email: newMemberEmail,
          role: newMemberRole,
        },
      });

      if (error) {
        throw new Error('メンバーの追加に失敗しました');
      }

      showToast('メンバーを追加しました', 2, 'success');
      setNewMemberEmail('');
      setNewMemberRole('viewer');
      setIsAddMemberModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['members', project.id] });
    } catch (err) {
      showToast((err as Error).message, 3, 'error');
    } finally {
      setIsSubmittingMember(false);
    }
  }, [newMemberEmail, newMemberRole, project.id, queryClient, showToast, apiClient]);

  const handleDeleteMember = useCallback((member: Member) => {
    setMemberToDelete(member);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!memberToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await apiClient.DELETE('/api/v0.1/projects/{project_id}/members/{user_id}', {
        params: {
          path: {
            project_id: project.id,
            user_id: memberToDelete.user_id,
          },
        },
      });

      if (error) {
        throw new Error('メンバーの削除に失敗しました');
      }

      showToast('メンバーを削除しました', 2, 'success');
      setIsConfirmDeleteOpen(false);
      setMemberToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['members', project.id] });
    } catch (err) {
      showToast((err as Error).message, 3, 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [memberToDelete, project.id, queryClient, showToast, apiClient]);

  const formatDate = (dateString: string) => {
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
      <Card blur color={theme.colors.surface.base} className={`${className}__card`}>
        <FlexRow className={`${className}__header`} gap={16}>
          <div className={`${className}__searchContainer`}>
            <OutlinedTextField value={searchQuery} onChange={setSearchQuery} placeholder='メンバーを検索...' fontSize={theme.typography.fontSize.base} />
          </div>
          <Button onClick={() => setIsAddMemberModalOpen(true)} scheme='primary' fontSize={'sm'}>
            <Text text='+ Add Member' fontSize={theme.typography.fontSize.sm} />
          </Button>
        </FlexRow>
        <VerticalSpacer size={16} />

        <FlexColumn gap={0}>
          {/* ローディング状態 */}
          {isLoadingMembers && !isErrorMembers && (
            <div className={`${className}__loadingState`}>
              <Text text='メンバーを読み込み中...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            </div>
          )}

          {/* エラー状態 */}
          {isErrorMembers && (
            <div className={`${className}__errorState`}>
              <Text text='メンバー一覧の取得に失敗しました' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            </div>
          )}

          {/* メンバー一覧 */}
          {!isErrorMembers &&
            !isLoadingMembers &&
            filteredMembers.length > 0 &&
            filteredMembers.map((member) => (
              <div key={member.user_id} className={`${className}__memberItem`}>
                <FlexRow className={`${className}__memberRow`} align='center' gap={12}>
                  <FlexColumn gap={4} className={`${className}__memberInfo`}>
                    <Text
                      text={member.name}
                      fontSize={theme.typography.fontSize.base}
                      color={theme.colors.text.primary}
                      fontWeight={theme.typography.fontWeight.bold}
                    />
                    <Text
                      text={member.email}
                      fontSize={theme.typography.fontSize.sm}
                      color={theme.colors.text.secondary}
                      fontWeight={theme.typography.fontWeight.bold}
                    />
                    <Text
                      text={`Added: ${formatDate(member.created_at)}`}
                      fontSize={theme.typography.fontSize.xs}
                      color={theme.colors.text.secondary}
                      fontWeight='lighter'
                    />
                  </FlexColumn>
                  <div className={`${className}__memberRole`}>
                    <Text
                      text={member.role}
                      fontSize={theme.typography.fontSize.sm}
                      color={theme.colors.text.secondary}
                      fontWeight={theme.typography.fontWeight.bold}
                    />
                  </div>
                  <Button onClick={() => handleDeleteMember(member)} scheme='none' fontSize={'sm'} className={`${className}__deleteButton`}>
                    <BiTrash size={18} color={theme.colors.semantic.error.main} />
                  </Button>
                </FlexRow>
              </div>
            ))}

          {/* 空状態 */}
          {!isLoadingMembers && !isErrorMembers && filteredMembers.length === 0 && (
            <div className={`${className}__emptyState`}>
              <Text text='メンバーがありません' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
            </div>
          )}
        </FlexColumn>
      </Card>

      {/* メンバー追加モーダル */}
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title='Add Member'>
        <div className={`${className}__modal`}>
          <FlexColumn gap={16}>
            <div>
              <Text
                text='Email Address'
                fontSize={theme.typography.fontSize.sm}
                color={theme.colors.text.primary}
                fontWeight={theme.typography.fontWeight.bold}
              />
              <VerticalSpacer size={8} />
              <MemberSuggestionInput
                value={newMemberEmail}
                onChange={setNewMemberEmail}
                placeholder='member@example.com'
                fontSize={theme.typography.fontSize.base}
              />
            </div>

            <div>
              <Text text='Role' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
              <VerticalSpacer size={8} />
              <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value as 'viewer' | 'admin')} className={`${className}__roleSelect`}>
                <option value='viewer'>Viewer</option>
                <option value='admin'>Admin</option>
              </select>
            </div>

            <FlexRow gap={8} className={`${className}__buttonRow`}>
              <Button onClick={() => setIsAddMemberModalOpen(false)} scheme='none' fontSize={'sm'}>
                <Text text='Cancel' fontSize={theme.typography.fontSize.sm} />
              </Button>
              <Button onClick={handleAddMember} scheme='primary' fontSize={'sm'} disabled={isSubmittingMember}>
                <Text text={isSubmittingMember ? 'Adding...' : 'Add Member'} fontSize={theme.typography.fontSize.sm} />
              </Button>
            </FlexRow>
          </FlexColumn>
        </div>
      </Modal>

      {/* 削除確認ダイアログ */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          if (!isDeleting) setIsConfirmDeleteOpen(false);
        }}
        title='Delete Member'
      >
        <div className={`${className}__modal`}>
          <FlexColumn gap={16}>
            <Text
              text={`${memberToDelete?.name} (${memberToDelete?.email}) を削除してよろしいですか？`}
              fontSize={theme.typography.fontSize.base}
              color={theme.colors.text.primary}
            />
            <FlexRow gap={8} className={`${className}__buttonRow`}>
              <Button
                onClick={() => {
                  if (!isDeleting) setIsConfirmDeleteOpen(false);
                }}
                scheme='none'
                fontSize={'sm'}
                disabled={isDeleting}
              >
                <Text text='Cancel' fontSize={theme.typography.fontSize.sm} />
              </Button>
              <Button onClick={handleConfirmDelete} scheme='primary' fontSize={'sm'} disabled={isDeleting}>
                <Text text={isDeleting ? 'Deleting...' : 'Delete'} fontSize={theme.typography.fontSize.sm} />
              </Button>
            </FlexRow>
          </FlexColumn>
        </div>
      </Modal>
    </div>
  );
};

export const ProjectDetailsMembersTab = styled(Component)`
  width: 100%;

  &__card {
    padding: 16px;
  }

  &__header {
    align-items: center;
    margin-bottom: 8px;
  }

  &__searchContainer {
    flex: 1;
    min-width: 200px;
  }

  &__memberItem {
    padding: 12px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

    &:last-child {
      border-bottom: none;
    }
  }

  &__memberRow {
    justify-content: space-between;
  }

  &__memberInfo {
    flex: 1;
  }

  &__memberRole {
    min-width: 100px;
    text-align: right;
  }

  &__deleteButton {
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.sunken};
    }
  }

  &__loadingState,
  &__errorState,
  &__emptyState {
    padding: 32px 0;
    text-align: center;
    opacity: 0.6;
  }

  &__modal {
    padding: 16px;
  }

  &__roleSelect {
    width: 100%;
    padding: 8px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;

    &:hover {
      border-color: ${({ theme }) => theme.colors.border.strong};
    }

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.text.secondary};
    }
  }

  &__buttonRow {
    justify-content: flex-end;
    margin-top: 16px;
  }
`;
