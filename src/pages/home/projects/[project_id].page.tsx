import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiBarChart, BiUser, BiKey, BiLineChart, BiChevronRight } from 'react-icons/bi';

import { ProjectDetailsApiKeysTab } from './tabs/ProjectDetailsApiKeysTab';
import { ProjectDetailsMembersTab } from './tabs/ProjectDetailsMembersTab';
import { ProjectDetailsSessionsTab } from './tabs/ProjectDetailsSessionsTab';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useToast } from '@src/component/templates/ToastContext';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import { InnerContent } from '@src/pages/_app.page';

type TabType = 'sessions' | 'members' | 'api-keys';

export type ProjectDetailsPageProps = {
  className?: string;
};

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'sessions', label: 'Sessions', icon: <BiBarChart size={18} /> },
  { id: 'members', label: 'Members', icon: <BiUser size={18} /> },
  { id: 'api-keys', label: 'API Keys', icon: <BiKey size={18} /> },
];

const Component: FC<ProjectDetailsPageProps> = ({ className }) => {
  const { isAuthorized, isLoading, ready } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { theme } = useSharedTheme();

  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [project, setProject] = useState<Project | null>(null);
  const [isErrorProject, setIsErrorProject] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

        const found = data.find((p) => p.id === Number(projectId));
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
          <div className={`${className}__loadingContainer`}>
            <div className={`${className}__loadingSpinner`} />
            <Text text='Loading...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
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
          <div className={`${className}__errorContainer`}>
            <div className={`${className}__errorIcon`}>!</div>
            <Text text='プロジェクトが見つかりません' fontSize={theme.typography.fontSize.lg} color={theme.colors.semantic.error.main} />
            <Text text='Redirecting to home...' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.tertiary} />
          </div>
        </InnerContent>
      </div>
    );
  }

  return (
    <div className={`${className} ${isVisible ? 'visible' : ''}`}>
      {/* Background decorations */}
      <div className={`${className}__orb ${className}__orb--1`} />
      <div className={`${className}__orb ${className}__orb--2`} />
      <div className={`${className}__grid-overlay`} />

      <SidebarLayout />
      <InnerContent>
        <Header title='Project Details' onClick={handleBack} />

        <div className={`${className}__mainContent`}>
          {/* Project Header Card */}
          <section className={`${className}__projectHeader`}>
            <div className={`${className}__headerGlow`} />
            <div className={`${className}__headerBorder`} />
            <div className={`${className}__headerContent`}>
              <FlexRow gap={20} align={'flex-start'} className={`${className}__headerMain`}>
                <FlexColumn gap={12} className={`${className}__headerInfo`}>
                  <FlexRow gap={12} align={'center'}>
                    <span className={`${className}__badge`}>{project.is2D ? '2D' : '3D'}</span>
                    <span className={`${className}__idBadge`}>ID: {project.id}</span>
                  </FlexRow>
                  <Text
                    text={project.name}
                    fontSize={theme.typography.fontSize['2xl']}
                    color={theme.colors.text.primary}
                    fontWeight={theme.typography.fontWeight.bold}
                  />
                  <Text text={project.description || 'No description'} fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
                </FlexColumn>
                <Link href={`/heatmap/projects/${project.id}`} className={`${className}__heatmapLink`}>
                  <BiLineChart size={20} />
                  <span>View Heatmap</span>
                  <BiChevronRight size={18} className={`${className}__linkChevron`} />
                </Link>
              </FlexRow>

              {/* Quick Stats */}
              <div className={`${className}__quickStats`}>
                <div className={`${className}__quickStat`} style={{ '--accent': theme.colors.primary.main } as React.CSSProperties}>
                  <span className={`${className}__quickStatValue`}>{project.session_count ?? 0}</span>
                  <span className={`${className}__quickStatLabel`}>Sessions</span>
                </div>
                <div className={`${className}__quickStatDivider`} />
                <div className={`${className}__quickStat`} style={{ '--accent': theme.colors.tertiary.main } as React.CSSProperties}>
                  <span className={`${className}__quickStatValue`}>
                    {new Date(project.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`${className}__quickStatLabel`}>Created</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Navigation */}
          <nav className={`${className}__tabNav`}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${className}__tabButton ${activeTab === tab.id ? 'active' : ''}`}>
                <span className={`${className}__tabIcon`}>{tab.icon}</span>
                <span className={`${className}__tabLabel`}>{tab.label}</span>
                {activeTab === tab.id && <span className={`${className}__tabIndicator`} />}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className={`${className}__tabContent`}>
            {activeTab === 'sessions' && <ProjectDetailsSessionsTab project={project} />}
            {activeTab === 'members' && <ProjectDetailsMembersTab project={project} />}
            {activeTab === 'api-keys' && <ProjectDetailsApiKeysTab project={project} />}
          </div>
        </div>
      </InnerContent>
    </div>
  );
};

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.02);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const ProjectDetailsPage = styled(Component)`
  position: relative;
  min-height: 100vh;
  overflow: hidden;

  /* Grid overlay */
  &__grid-overlay {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image:
      linear-gradient(${({ theme }) => theme.colors.primary.main}06 1px, transparent 1px),
      linear-gradient(90deg, ${({ theme }) => theme.colors.primary.main}06 1px, transparent 1px);
    background-size: 80px 80px;
  }

  /* Glowing orbs */
  &__orb {
    position: fixed;
    pointer-events: none;
    border-radius: 50%;
    opacity: 0;
    filter: blur(100px);
    transition: opacity 1s ease;

    &--1 {
      top: -10%;
      right: -5%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, ${({ theme }) => theme.colors.primary.main}33 0%, transparent 70%);
      animation: ${pulse} 10s ease-in-out infinite;
    }

    &--2 {
      bottom: -10%;
      left: -5%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, ${({ theme }) => theme.colors.tertiary.main}26 0%, transparent 70%);
      animation: ${pulse} 12s ease-in-out infinite 3s;
    }
  }

  &.visible &__orb {
    opacity: 1;
  }

  &__mainContent {
    position: relative;
    z-index: 1;
    padding: 0 24px 48px;
  }

  /* Loading State */
  &__loadingContainer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    height: 400px;
  }

  &__loadingSpinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${({ theme }) => theme.colors.border.default};
    border-top-color: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }

  /* Error State */
  &__errorContainer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    height: 400px;
  }

  &__errorIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.semantic.error.main};
    background: ${({ theme }) => theme.colors.semantic.error.main}15;
    border: 1px solid ${({ theme }) => theme.colors.semantic.error.main}40;
    border-radius: 50%;
  }

  /* Project Header Card */
  &__projectHeader {
    position: relative;
    margin-bottom: 24px;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surface.base};
    border-radius: ${({ theme }) => theme.borders.radius.xl};
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.1s forwards;
  }

  &__headerGlow {
    position: absolute;
    top: -50px;
    left: 50%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.primary.main}26 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(60px);
    transform: translateX(-50%);
  }

  &__headerBorder {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.xl};

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      content: '';
      background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.primary.main}, ${({ theme }) => theme.colors.tertiary.main}, transparent);
    }
  }

  &__headerContent {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 28px;
  }

  &__headerMain {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  &__headerInfo {
    flex: 1;
    min-width: 200px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.primary.main};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
    background: ${({ theme }) => theme.colors.primary.main}1a;
    border: 1px solid ${({ theme }) => theme.colors.primary.main}40;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__idBadge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.tertiary};
    background: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__heatmapLink {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 12px 20px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.background.default};
    text-decoration: none;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.main} 0%, ${({ theme }) => theme.colors.primary.dark} 100%);
    border-radius: ${({ theme }) => theme.borders.radius.md};
    box-shadow: 0 0 20px ${({ theme }) => theme.colors.primary.main}4d;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 0 30px ${({ theme }) => theme.colors.primary.main}80;
      transform: translateY(-2px);
    }
  }

  &__linkChevron {
    transition: transform 0.2s ease;
  }

  &__heatmapLink:hover &__linkChevron {
    transform: translateX(4px);
  }

  &__quickStats {
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 16px 20px;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: ${({ theme }) => theme.borders.radius.md};
  }

  &__quickStat {
    --accent: ${({ theme }) => theme.colors.primary.main};

    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__quickStatValue {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  &__quickStatLabel {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.normal};
  }

  &__quickStatDivider {
    width: 1px;
    height: 36px;
    background: ${({ theme }) => theme.colors.border.default};
  }

  /* Tab Navigation */
  &__tabNav {
    display: flex;
    gap: 4px;
    padding: 6px;
    margin-bottom: 24px;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.lg};
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.2s forwards;
  }

  &__tabButton {
    position: relative;
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 14px 20px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:hover:not(.active) {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.hover};
    }

    &.active {
      color: ${({ theme }) => theme.colors.primary.main};
      background: ${({ theme }) => theme.colors.primary.main}14;
    }
  }

  &__tabIcon {
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
  }

  &__tabButton.active &__tabIcon {
    transform: scale(1.1);
  }

  &__tabLabel {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  &__tabIndicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 40%;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.primary.main}, transparent);
    border-radius: 1px;
    transform: translateX(-50%);
  }

  /* Tab Content */
  &__tabContent {
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.3s forwards;
  }

  /* Responsive */
  @media (width <= 768px) {
    &__mainContent {
      padding: 0 16px 32px;
    }

    &__headerContent {
      padding: 20px;
    }

    &__headerMain {
      flex-direction: column;
      gap: 16px;
    }

    &__heatmapLink {
      align-self: flex-start;
    }

    &__quickStats {
      flex-wrap: wrap;
      gap: 16px;
    }

    &__tabNav {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__tabButton {
      flex: none;
      min-width: 100px;
      padding: 12px 16px;
    }

    &__orb {
      display: none;
    }
  }
`;

export default ProjectDetailsPage;
