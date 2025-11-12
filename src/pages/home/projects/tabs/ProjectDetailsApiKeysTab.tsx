import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';

import type { Project } from '@src/modeles/project';
import type { CreateGameApiKeyResponse, GameApiKey } from '@src/types/api-keys';
import type { FC } from 'react';

import { GameApiKeyCreateModal } from '@src/component/organisms/GameApiKeyCreateModal';
import { GameApiKeyDeleteConfirmModal } from '@src/component/organisms/GameApiKeyDeleteConfirmModal';
import { GameApiKeyDetailModal } from '@src/component/organisms/GameApiKeyDetailModal';
import { GameApiKeyList } from '@src/component/organisms/GameApiKeyList';
import { useToast } from '@src/component/templates/ToastContext';
import { useGameApiKeys } from '@src/hooks/useGameApiKeys';

export type ProjectDetailsApiKeysTabProps = {
  className?: string;
  project: Project;
};

const Component: FC<ProjectDetailsApiKeysTabProps> = ({ className, project }) => {
  const { showToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [newKeyName, setNewKeyName] = useState('');
  const [selectedKey, setSelectedKey] = useState<GameApiKey | null>(null);
  const [isUpdatingProjects, setIsUpdatingProjects] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState<CreateGameApiKeyResponse | null>(null);

  const { allApiKeys, isLoadingKeys, isErrorKeys, userProjects, handleCreateKey, handleDeleteKey, handleUpdateKeyProjects } = useGameApiKeys([
    'api-keys',
    project.id,
  ]);

  // 現在のプロジェクトに属するAPI-keysをフィルタリング
  const projectApiKeys = useMemo(() => {
    return allApiKeys.filter((key) => key.projects.some((p) => p.id === project.id));
  }, [allApiKeys, project.id]);

  const handleCreateKeyClick = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateKeySubmit = useCallback(async () => {
    if (!newKeyName.trim()) {
      showToast('API-keyの名前を入力してください', 2, 'error');
      return;
    }

    try {
      const response = await handleCreateKey(newKeyName, [project.id]);
      if (response) {
        setCreatedApiKey(response);
        showToast('API-keyを作成しました', 2, 'success');
        setNewKeyName('');
      }
    } catch (err) {
      showToast((err as Error).message, 3, 'error');
    }
  }, [newKeyName, showToast, handleCreateKey, project.id]);

  const handleShowDetails = useCallback((key: GameApiKey) => {
    setSelectedKey(key);
    setIsDetailModalOpen(true);
  }, []);

  const handleDeleteKeyClick = useCallback((key: GameApiKey) => {
    setSelectedKey(key);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedKey) return;

    try {
      setIsDeleting(true);
      await handleDeleteKey(selectedKey.id);
      showToast('API-keyを削除しました', 2, 'success');
      setIsConfirmDeleteOpen(false);
      setSelectedKey(null);
    } catch (err) {
      showToast((err as Error).message, 3, 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedKey, handleDeleteKey, showToast]);

  const handleUpdateKeyProjectsWrapper = useCallback(
    async (keyId: string, projectIds: number[]) => {
      try {
        setIsUpdatingProjects(true);
        const updated = await handleUpdateKeyProjects(keyId, projectIds);
        setSelectedKey(updated);
        showToast('プロジェクトアクセスを更新しました', 2, 'success');
      } catch (err) {
        showToast((err as Error).message, 3, 'error');
        throw err;
      } finally {
        setIsUpdatingProjects(false);
      }
    },
    [handleUpdateKeyProjects, showToast],
  );

  return (
    <div className={className}>
      <GameApiKeyList
        apiKeys={projectApiKeys}
        isLoading={isLoadingKeys}
        isError={isErrorKeys}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onShowDetails={handleShowDetails}
        onDeleteKey={handleDeleteKeyClick}
        onCreateKeyClick={handleCreateKeyClick}
        showProjectFilter={false}
      />

      <GameApiKeyCreateModal
        isOpen={isCreateModalOpen}
        newKeyName={newKeyName}
        createdApiKey={createdApiKey}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewKeyName('');
          setCreatedApiKey(null);
        }}
        onKeyNameChange={setNewKeyName}
        onCreateKey={handleCreateKeySubmit}
      />

      <GameApiKeyDetailModal
        isOpen={isDetailModalOpen}
        selectedKey={selectedKey}
        userProjects={userProjects}
        isUpdatingProjects={isUpdatingProjects}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateProjects={handleUpdateKeyProjectsWrapper}
      />

      <GameApiKeyDeleteConfirmModal
        isOpen={isConfirmDeleteOpen}
        selectedKey={selectedKey}
        isDeleting={isDeleting}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export const ProjectDetailsApiKeysTab = styled(Component)`
  width: 100%;
`;
