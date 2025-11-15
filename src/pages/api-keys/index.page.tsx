import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { CreateGameApiKeyResponse, GameApiKey } from '@src/types/api-keys';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { GameApiKeyCreateModal } from '@src/component/organisms/GameApiKeyCreateModal';
import { GameApiKeyDeleteConfirmModal } from '@src/component/organisms/GameApiKeyDeleteConfirmModal';
import { GameApiKeyDetailModal } from '@src/component/organisms/GameApiKeyDetailModal';
import { GameApiKeyList } from '@src/component/organisms/GameApiKeyList';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useToast } from '@src/component/templates/ToastContext';
import { useAuth } from '@src/hooks/useAuth';
import { useGameApiKeys } from '@src/hooks/useGameApiKeys';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { InnerContent } from '@src/pages/_app.page';

export type ApiKeysPageProps = {
  className?: string;
};

const Component: FC<ApiKeysPageProps> = ({ className }) => {
  const { isAuthorized, isLoading, ready } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { theme } = useSharedTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [newKeyName, setNewKeyName] = useState('');
  const [selectedKey, setSelectedKey] = useState<GameApiKey | null>(null);
  const [isUpdatingProjects, setIsUpdatingProjects] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<CreateGameApiKeyResponse | null>(null);

  const { allApiKeys, isLoadingKeys, isErrorKeys, userProjects, handleCreateKey, handleDeleteKey, handleUpdateKeyProjects } = useGameApiKeys();

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      router.replace('/');
    }
  }, [isAuthorized, isLoading, ready, router]);

  const handleBack = () => {
    router.back();
  };

  const handleCreateKeyClick = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateKeySubmit = useCallback(async () => {
    if (!newKeyName.trim()) {
      showToast('API-keyの名前を入力してください', 2, 'error');
      return;
    }

    try {
      const response = await handleCreateKey(newKeyName);
      if (response) {
        setCreatedApiKey(response);
        showToast('API-keyを作成しました', 2, 'success');
        setNewKeyName('');
      }
    } catch (err) {
      showToast((err as Error).message, 3, 'error');
    }
  }, [newKeyName, handleCreateKey, showToast]);

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

  if (!ready || isLoading) {
    return (
      <div className={className}>
        <SidebarLayout />
        <InnerContent>
          <div className={`${className}__centerContent`}>
            <Text text='Loading...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
          </div>
        </InnerContent>
      </div>
    );
  }

  return (
    <div className={className}>
      <SidebarLayout />
      <InnerContent>
        <Header title='API Keys' onClick={handleBack} />

        <div className={`${className}__container`}>
          <GameApiKeyList
            apiKeys={allApiKeys}
            isLoading={isLoadingKeys}
            isError={isErrorKeys}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onShowDetails={handleShowDetails}
            onDeleteKey={handleDeleteKeyClick}
            onCreateKeyClick={handleCreateKeyClick}
            showProjectFilter={false}
          />
        </div>

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
      </InnerContent>
    </div>
  );
};

const ApiKeysPage = styled(Component)`
  height: 100vh;

  &__container {
    padding: 0 24px;
    margin-bottom: 24px;
  }

  &__centerContent {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
`;

export default ApiKeysPage;
