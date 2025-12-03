import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { BiTrash, BiRefresh, BiPlus, BiSearch, BiUser, BiCrown } from 'react-icons/bi';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { MemberSuggestionInput } from '@src/component/molecules/MemberSuggestionInput';
import { Modal } from '@src/component/molecules/Modal';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['members', project.id] });
      showToast('メンバー一覧を更新しました', 2, 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const getRoleIcon = (role: string) => {
    return role.toLowerCase() === 'admin' ? <BiCrown size={16} /> : <BiUser size={16} />;
  };

  const getRoleColor = (role: string) => {
    return role.toLowerCase() === 'admin' ? theme.colors.secondary.main : theme.colors.tertiary.main;
  };

  return (
    <div className={className}>
      {/* Card */}
      <div className={`${className}__card`}>
        <div className={`${className}__cardBorder`} />

        {/* Header */}
        <div className={`${className}__header`}>
          <FlexRow gap={16} align={'center'}>
            <button onClick={handleRefresh} disabled={isLoadingMembers || isRefreshing} className={`${className}__refreshButton`}>
              <BiRefresh size={18} className={isRefreshing ? 'spinning' : ''} />
            </button>
            <div className={`${className}__headerStats`}>
              <span className={`${className}__statValue`}>{members.length}</span>
              <span className={`${className}__statLabel`}>Members</span>
            </div>
          </FlexRow>
          <Button onClick={() => setIsAddMemberModalOpen(true)} scheme='primary' fontSize={'sm'} className={`${className}__addButton`}>
            <BiPlus size={18} />
            Add Member
          </Button>
        </div>

        {/* Search */}
        <div className={`${className}__controls`}>
          <div className={`${className}__searchWrapper`}>
            <BiSearch size={16} className={`${className}__searchIcon`} />
            <input
              type='text'
              placeholder='Search members...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${className}__searchInput`}
            />
          </div>
        </div>

        {/* Member List */}
        <div className={`${className}__memberList`}>
          {/* ローディング状態 */}
          {isLoadingMembers && !isErrorMembers && (
            <div className={`${className}__loadingState`}>
              <div className={`${className}__loadingSpinner`} />
              <Text text='Loading members...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
            </div>
          )}

          {/* エラー状態 */}
          {isErrorMembers && (
            <div className={`${className}__errorState`}>
              <div className={`${className}__errorIcon`}>!</div>
              <Text text='Failed to load members' fontSize={theme.typography.fontSize.base} color={theme.colors.semantic.error.main} />
            </div>
          )}

          {/* メンバー一覧 */}
          {!isErrorMembers && !isLoadingMembers && filteredMembers.length > 0 && (
            <FlexColumn gap={0}>
              {filteredMembers.map((member) => (
                <div key={member.user_id} className={`${className}__memberItem`}>
                  <FlexRow className={`${className}__memberRow`} align='center' gap={16}>
                    <div className={`${className}__memberAvatar`} style={{ '--role-color': getRoleColor(member.role) } as React.CSSProperties}>
                      {getRoleIcon(member.role)}
                    </div>
                    <FlexColumn gap={4} className={`${className}__memberInfo`}>
                      <Text
                        text={member.name}
                        fontSize={theme.typography.fontSize.base}
                        color={theme.colors.text.primary}
                        fontWeight={theme.typography.fontWeight.semibold}
                      />
                      <Text text={member.email} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.tertiary} />
                      <span className={`${className}__memberDate`}>Added: {formatDate(member.created_at)}</span>
                    </FlexColumn>
                    <span className={`${className}__roleBadge`} style={{ '--role-color': getRoleColor(member.role) } as React.CSSProperties}>
                      {getRoleIcon(member.role)}
                      {member.role}
                    </span>
                    <button onClick={() => handleDeleteMember(member)} className={`${className}__deleteButton`} title='Remove member'>
                      <BiTrash size={16} />
                    </button>
                  </FlexRow>
                </div>
              ))}
            </FlexColumn>
          )}

          {/* 空状態 */}
          {!isLoadingMembers && !isErrorMembers && filteredMembers.length === 0 && (
            <div className={`${className}__emptyState`}>
              <div className={`${className}__emptyIcon`}>
                <BiUser size={32} />
              </div>
              <Text text='No members found' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
              {!searchQuery && (
                <Text text='Add team members to collaborate on this project' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.tertiary} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* メンバー追加モーダル */}
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title='Add Member'>
        <div className={`${className}__modalContent`}>
          <FlexColumn gap={20}>
            <FlexColumn gap={8}>
              <span className={`${className}__inputLabel`}>Email Address</span>
              <MemberSuggestionInput
                value={newMemberEmail}
                onChange={setNewMemberEmail}
                placeholder='member@example.com'
                fontSize={theme.typography.fontSize.base}
              />
            </FlexColumn>

            <FlexColumn gap={8}>
              <span className={`${className}__inputLabel`}>Role</span>
              <div className={`${className}__roleSelector`}>
                <button
                  type='button'
                  className={`${className}__roleOption ${newMemberRole === 'viewer' ? 'active' : ''}`}
                  onClick={() => setNewMemberRole('viewer')}
                >
                  <BiUser size={18} />
                  <span>Viewer</span>
                  <span className={`${className}__roleDescription`}>Can view project data</span>
                </button>
                <button
                  type='button'
                  className={`${className}__roleOption ${newMemberRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setNewMemberRole('admin')}
                >
                  <BiCrown size={18} />
                  <span>Admin</span>
                  <span className={`${className}__roleDescription`}>Full project access</span>
                </button>
              </div>
            </FlexColumn>

            <FlexRow gap={12} style={{ justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button onClick={() => setIsAddMemberModalOpen(false)} scheme='secondary' fontSize={'base'}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} scheme='primary' fontSize={'base'} disabled={isSubmittingMember || !newMemberEmail.trim()}>
                {isSubmittingMember ? 'Adding...' : 'Add Member'}
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
        <div className={`${className}__modalContent`}>
          <FlexColumn gap={20}>
            <Text
              text={`Remove ${memberToDelete?.name} (${memberToDelete?.email}) from this project?`}
              fontSize={theme.typography.fontSize.base}
              color={theme.colors.text.primary}
            />
            <FlexRow gap={12} style={{ justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  if (!isDeleting) setIsConfirmDeleteOpen(false);
                }}
                scheme='secondary'
                fontSize={'base'}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} scheme='primary' fontSize={'base'} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </FlexRow>
          </FlexColumn>
        </div>
      </Modal>

      <VerticalSpacer size={42} />
    </div>
  );
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const ProjectDetailsMembersTab = styled(Component)`
  width: 100%;

  &__card {
    position: relative;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surface.base};
    border-radius: ${({ theme }) => theme.borders.radius.lg};
  }

  &__cardBorder {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.lg};
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__headerStats {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__statValue {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.tertiary.main};
  }

  &__statLabel {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.normal};
  }

  &__refreshButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.primary.main};
      border-color: ${({ theme }) => theme.colors.primary.main}80;
    }

    .spinning {
      animation: ${spin} 1s linear infinite;
    }
  }

  &__addButton {
    box-shadow: 0 0 16px ${({ theme }) => theme.colors.primary.main}33;
  }

  &__controls {
    padding: 16px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__searchWrapper {
    position: relative;
    max-width: 400px;
  }

  &__searchIcon {
    position: absolute;
    top: 50%;
    left: 12px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    transform: translateY(-50%);
    transition: color 0.2s ease;
  }

  &__searchInput {
    width: 100%;
    padding: 10px 12px 10px 38px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    outline: none;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.tertiary};
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main}80;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }
  }

  &__searchWrapper:focus-within &__searchIcon {
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &__memberList {
    min-height: 150px;
  }

  &__memberItem {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
    }
  }

  &__memberRow {
    padding: 16px 20px;
  }

  &__memberAvatar {
    --role-color: ${({ theme }) => theme.colors.tertiary.main};

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--role-color);
    background: color-mix(in srgb, var(--role-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--role-color) 25%, transparent);
    border-radius: ${({ theme }) => theme.borders.radius.md};
  }

  &__memberInfo {
    flex: 1;
    min-width: 0;
  }

  &__memberDate {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &__roleBadge {
    --role-color: ${({ theme }) => theme.colors.tertiary.main};

    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 6px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: var(--role-color);
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.normal};
    background: color-mix(in srgb, var(--role-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--role-color) 25%, transparent);
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__deleteButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    opacity: 0;
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.semantic.error.main};
      background: ${({ theme }) => theme.colors.semantic.error.main}10;
      border-color: ${({ theme }) => theme.colors.semantic.error.main}30;
    }
  }

  &__memberItem:hover &__deleteButton {
    opacity: 1;
  }

  &__loadingState,
  &__errorState,
  &__emptyState {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  &__loadingSpinner {
    width: 32px;
    height: 32px;
    border: 3px solid ${({ theme }) => theme.colors.border.default};
    border-top-color: ${({ theme }) => theme.colors.tertiary.main};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }

  &__errorIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.semantic.error.main};
    background: ${({ theme }) => theme.colors.semantic.error.main}15;
    border: 1px solid ${({ theme }) => theme.colors.semantic.error.main}40;
    border-radius: 50%;
  }

  &__emptyIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px dashed ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.lg};
  }

  /* Modal */
  &__modalContent {
    min-width: 320px;
    padding: 8px;
  }

  &__inputLabel {
    display: block;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__roleSelector {
    display: flex;
    gap: 12px;
  }

  &__roleOption {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    padding: 16px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.border.strong};
    }

    &.active {
      color: ${({ theme }) => theme.colors.primary.main};
      background: ${({ theme }) => theme.colors.primary.main}0d;
      border-color: ${({ theme }) => theme.colors.primary.main}4d;
    }
  }

  &__roleDescription {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  @media (width <= 768px) {
    &__header {
      flex-direction: column;
      align-items: flex-start;
    }

    &__searchWrapper {
      width: 100%;
      max-width: none;
    }

    &__memberRow {
      flex-wrap: wrap;
    }

    &__roleBadge {
      margin-top: 8px;
    }

    &__roleSelector {
      flex-direction: column;
    }
  }
`;
