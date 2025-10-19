import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiBarChart, BiUser, BiKey } from 'react-icons/bi';

import { ProjectDetailsApiKeysTab } from './tabs/ProjectDetailsApiKeysTab';
import { ProjectDetailsMembersTab } from './tabs/ProjectDetailsMembersTab';
import { ProjectDetailsSessionsTab } from './tabs/ProjectDetailsSessionsTab';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useToast } from '@src/component/templates/ToastContext';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import { InnerContent } from '@src/pages/_app.page';
import { fontSizes, fontWeights } from '@src/styles/style';

type TabType = 'sessions' | 'members' | 'api-keys';

export type ProjectDetailsPageProps = {
  className?: string;
};

const Component: FC<ProjectDetailsPageProps> = ({ className }) => {
  const { isAuthorized, isLoading, ready } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { theme } = useSharedTheme();

  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [project, setProject] = useState<Project | null>(null);
  const [isErrorProject, setIsErrorProject] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();

  // URLパスからprojectIdを取得
  useEffect(() => {
    const pathname = window.location.pathname;
    const match = pathname.match(/\/home\/projects\/(\d+)/);
    if (match) {
      setProjectId(match[1]);
    }
  }, []);

  // プロジェクト情報を取得
  useEffect(() => {
    if (!projectId || !isAuthorized) return;

    const fetchProject = async () => {
      try {
        const { data, error } = await createClient().GET('/api/v0.1/projects', {
          params: {
            query: {
              limit: 100,
              offset: 0,
            },
          },
        });

        if (error || !data) {
          throw new Error('プロジェクト情報の取得に失敗しました');
        }

        const found = data.find((p: Project) => p.id === Number(projectId));
        if (!found) {
          throw new Error('プロジェクトが見つかりません');
        }

        setProject(found);
        setIsErrorProject(false);
      } catch (err) {
        setIsErrorProject(true);
        showToast((err as Error).message || 'プロジェクト情報の取得に失敗しました', 3, 'error');
      }
    };

    fetchProject();
  }, [projectId, isAuthorized, showToast]);

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      router.replace('/');
    }
  }, [isAuthorized, isLoading, ready, router]);

  useEffect(() => {
    if (isErrorProject && projectId) {
      setTimeout(() => router.replace('/home'), 2000);
    }
  }, [isErrorProject, projectId, router]);

  const handleBack = () => {
    router.back();
  };

  if (!ready || isLoading) {
    return (
      <div className={className}>
        <SidebarLayout />
        <InnerContent>
          <div className={`${className}__centerContent`}>
            <Text text='Loading...' fontSize={fontSizes.medium} color={theme.colors.text} />
          </div>
        </InnerContent>
      </div>
    );
  }

  if (isErrorProject || !project) {
    return (
      <div className={className}>
        <SidebarLayout />
        <InnerContent>
          <Header title='Project Details' onClick={handleBack} />
          <div className={`${className}__centerContent`}>
            <Text text='プロジェクトが見つかりません' fontSize={fontSizes.medium} color={theme.colors.error} />
          </div>
        </InnerContent>
      </div>
    );
  }

  return (
    <div className={className}>
      <SidebarLayout />
      <InnerContent>
        <Header title='Project Details' onClick={handleBack} />

        {/* プロジェクト基本情報 */}
        <div className={`${className}__header`}>
          <FlexColumn gap={8}>
            <Text text={project.name} fontSize={fontSizes.largest} color={theme.colors.text} fontWeight={fontWeights.bolder} />
            <Text text={project.description} fontSize={fontSizes.small} color={theme.colors.secondary.main} fontWeight={fontWeights.bold} />
          </FlexColumn>
        </div>

        {/* タブナビゲーション */}
        <div className={`${className}__tabsContainer`}>
          <div className={`${className}__tabsNav`}>
            <Button
              onClick={() => setActiveTab('sessions')}
              scheme={activeTab === 'sessions' ? 'primary' : 'none'}
              fontSize='small'
              className={`${className}__tabButton`}
              title='Sessions'
            >
              <BiBarChart size={20} />
              <Text text='Sessions' fontSize={fontSizes.medium} />
            </Button>
            <Button
              onClick={() => setActiveTab('members')}
              scheme={activeTab === 'members' ? 'primary' : 'none'}
              fontSize='small'
              className={`${className}__tabButton`}
              title='Members'
            >
              <BiUser size={20} />
              <Text text='Members' fontSize={fontSizes.medium} />
            </Button>
            <Button
              onClick={() => setActiveTab('api-keys')}
              scheme={activeTab === 'api-keys' ? 'primary' : 'none'}
              fontSize='small'
              className={`${className}__tabButton`}
              title='API Keys'
            >
              <BiKey size={20} />
              <Text text='API Keys' fontSize={fontSizes.medium} />
            </Button>
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className={`${className}__tabContent`}>
          {activeTab === 'sessions' && <ProjectDetailsSessionsTab project={project} />}
          {activeTab === 'members' && <ProjectDetailsMembersTab project={project} />}
          {activeTab === 'api-keys' && <ProjectDetailsApiKeysTab project={project} />}
        </div>
      </InnerContent>
    </div>
  );
};

const ProjectDetailsPage = styled(Component)`
  height: 100vh;

  &__header {
    padding: 0 24px 24px;
    margin-bottom: 24px;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border.main};
  }

  &__tabsContainer {
    padding: 0 24px;
    margin-bottom: 24px;
  }

  &__tabsNav {
    display: flex;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border.main};
  }

  &__tabButton {
    padding: 8px 16px;
    white-space: nowrap;
    border-radius: 4px 4px 0 0;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.light};
    }
  }

  &__tabContent {
    padding: 0 24px;
  }

  &__centerContent {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
`;

export default ProjectDetailsPage;
