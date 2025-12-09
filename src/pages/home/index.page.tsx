import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BiRefresh, BiMenuAltLeft, BiGridAlt, BiPlus, BiEdit, BiSearch, BiChevronDown } from 'react-icons/bi';

import { ProjectItemRow } from './ProjectItemRow';

import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Observer } from '@src/component/atoms/Observer';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { ProjectFormModal } from '@src/component/organisms/ProjectFormModal';
import { DashboardBackgroundCanvas } from '@src/component/templates/DashboardBackgroundCanvas';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useToast } from '@src/component/templates/ToastContext';
import { useAuth } from '@src/hooks/useAuth';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { InnerContent } from '@src/pages/_app.page';

const fetchCount = 20;

export type HomePageProps = {
  className?: string | undefined;
};

type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc' | 'updated_desc' | 'updated_asc';
type DisplayMode = 'card' | 'list';

const Component: FC<HomePageProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthorized, isLoading, ready, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useLocale();
  const toastShownRef = useRef<boolean>(false);
  const apiClient = useApiClient();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: t('home.sortOptions.createdDesc'), value: 'created_desc' },
    { label: t('home.sortOptions.createdAsc'), value: 'created_asc' },
    { label: t('home.sortOptions.nameAsc'), value: 'name_asc' },
    { label: t('home.sortOptions.nameDesc'), value: 'name_desc' },
    { label: t('home.sortOptions.updatedDesc'), value: 'updated_desc' },
    { label: t('home.sortOptions.updatedAsc'), value: 'updated_asc' },
  ];

  const {
    data: projects,
    hasNextPage: hasNextPageProjects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: projectsError,
    fetchNextPage: fetchNextPageProjects,
  } = useInfiniteQuery({
    queryKey: ['projects', isAuthorized, searchQuery],
    queryFn: async ({ pageParam }): Promise<Project[] | undefined> => {
      if (!isAuthorized) return undefined;
      const { data, error } = await apiClient.GET('/api/v0.1/projects', {
        params: {
          query: {
            limit: fetchCount,
            offset: pageParam ? pageParam : undefined,
            search: searchQuery || undefined,
          },
        },
      });
      if (error) {
        throw new Error(t('home.fetchError'));
      }
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < fetchCount) return undefined;
      return allPages.length * fetchCount;
    },
    staleTime: DefaultStaleTime,
  });

  // エラー通知（一度だけ表示）
  useEffect(() => {
    if (isErrorProjects && !toastShownRef.current) {
      showToast(projectsError?.message || t('home.fetchError'), 3, 'error');
      toastShownRef.current = true;
    }
  }, [isErrorProjects, projectsError, showToast, t]);

  const { theme } = useSharedTheme();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(() => {
    toastShownRef.current = false;
    queryClient.invalidateQueries({ queryKey: ['projects', isAuthorized, searchQuery] });
    showToast(t('home.listUpdated'), 2, 'success');
  }, [queryClient, isAuthorized, searchQuery, showToast, t]);

  const handleCreateProject = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setEditingProject(undefined);
  }, []);

  // ソート関数
  const sortProjects = useCallback(
    (projectsToSort: Project[]): Project[] => {
      const sorted = [...projectsToSort];
      switch (sortBy) {
        case 'name_asc':
          return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        case 'name_desc':
          return sorted.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
        case 'created_asc':
          return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'created_desc':
          return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'updated_asc':
          return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'updated_desc':
          return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        default:
          return sorted;
      }
    },
    [sortBy],
  );

  // Count total projects
  const totalProjects = projects?.pages?.reduce((acc, page) => acc + (page?.length || 0), 0) || 0;
  const totalSessions = projects?.pages?.reduce((acc, page) => acc + (page?.reduce((s, p) => s + (p.session_count || 0), 0) || 0), 0) || 0;

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      return router.replace('/');
    }
  }, [isAuthorized, isLoading, router, ready]);

  return (
    <div className={`${className} ${isVisible ? 'visible' : ''}`}>
      {/* Three.js Canvas Background - Mountain landscape */}
      <DashboardBackgroundCanvas />

      <SidebarLayout />
      <InnerContent>
        <Header title={t('home.title')} onClick={handleBack} />

        <div className={`${className}__mainContent`}>
          {/* Hero Section */}
          <section className={`${className}__hero`}>
            <div className={`${className}__heroContent`}>
              <div className={`${className}__greeting`}>
                <h1 className={`${className}__heroTitle`}>
                  <span className={`${className}__heroTitleLine`}>{user?.name ? `Welcome back,` : 'Welcome to'}</span>
                  <span className={`${className}__heroTitleAccent`}>{user?.name || 'Ludiscan'}</span>
                </h1>
              </div>

              {/* Stats Cards */}
              <div className={`${className}__statsGrid`}>
                <div className={`${className}__statCard`} style={{ '--accent': theme.colors.primary.main } as React.CSSProperties}>
                  <div className={`${className}__statGlow`} />
                  <div className={`${className}__statContent`}>
                    <span className={`${className}__statValue`}>{totalProjects}</span>
                    <span className={`${className}__statLabel`}>Projects</span>
                  </div>
                </div>
                <div className={`${className}__statCard`} style={{ '--accent': theme.colors.tertiary.main } as React.CSSProperties}>
                  <div className={`${className}__statGlow`} />
                  <div className={`${className}__statContent`}>
                    <span className={`${className}__statValue`}>{totalSessions}</span>
                    <span className={`${className}__statLabel`}>Sessions</span>
                  </div>
                </div>
                <div className={`${className}__statCard`} style={{ '--accent': theme.colors.secondary.main } as React.CSSProperties}>
                  <div className={`${className}__statGlow`} />
                  <div className={`${className}__statContent`}>
                    <span className={`${className}__statValue`}>Real-time</span>
                    <span className={`${className}__statLabel`}>Data Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <VerticalSpacer size={32} />

          {/* Projects Section */}
          <section className={`${className}__projectsSection`}>
            <div className={`${className}__sectionHeader`}>
              <div className={`${className}__sectionTitleGroup`}>
                <span className={`${className}__sectionEyebrow`}>Your Workspace</span>
                <Text
                  text={t('home.projects')}
                  fontSize={theme.typography.fontSize['2xl']}
                  color={theme.colors.text.primary}
                  fontWeight={theme.typography.fontWeight.bold}
                />
              </div>
              <Button onClick={handleCreateProject} scheme={'primary'} fontSize={'base'} className={`${className}__createButton`}>
                <BiPlus size={20} />
                {t('home.createProject')}
              </Button>
            </div>

            {/* Toolbar */}
            <Card className={`${className}__toolbar`} blur={'medium'} color={theme.colors.surface.raised} border={theme.colors.border.subtle}>
              <div className={`${className}__searchWrapper`}>
                <BiSearch className={`${className}__searchIcon`} size={18} />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('home.searchPlaceholder')}
                  className={`${className}__searchInput`}
                />
              </div>

              <div className={`${className}__toolbarActions`}>
                <div className={`${className}__sortWrapper`}>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={`${className}__sortSelect`}>
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <BiChevronDown className={`${className}__sortChevron`} size={16} />
                </div>

                <div className={`${className}__displayToggle`}>
                  <button
                    onClick={() => setDisplayMode('list')}
                    className={`${className}__toggleButton ${displayMode === 'list' ? 'active' : ''}`}
                    title={t('home.listView')}
                  >
                    <BiMenuAltLeft size={18} />
                  </button>
                  <button
                    onClick={() => setDisplayMode('card')}
                    className={`${className}__toggleButton ${displayMode === 'card' ? 'active' : ''}`}
                    title={t('home.cardView')}
                  >
                    <BiGridAlt size={18} />
                  </button>
                </div>

                <button onClick={handleRefresh} disabled={isLoadingProjects} className={`${className}__refreshButton`} title='Refresh'>
                  <BiRefresh size={20} className={isLoadingProjects ? 'spinning' : ''} />
                </button>
              </div>
            </Card>

            {/* Projects Container */}
            <Card className={`${className}__projectsContainer`} blur={'medium'} color={theme.colors.surface.raised} border={theme.colors.border.subtle}>
              {/* ローディング状態 */}
              {isLoadingProjects && !isErrorProjects && (
                <div className={`${className}__loadingState`}>
                  <div className={`${className}__loadingSpinner`} />
                  <Text text={t('home.loadingProjects')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
                </div>
              )}

              {/* エラー状態 */}
              {isErrorProjects && (
                <div className={`${className}__errorState`}>
                  <div className={`${className}__errorIcon`}>!</div>
                  <Text text={t('home.fetchError')} fontSize={theme.typography.fontSize.base} color={theme.colors.semantic.error.main} />
                </div>
              )}

              {/* プロジェクト一覧 - リスト表示 */}
              {!isErrorProjects && !isLoadingProjects && displayMode === 'list' && (
                <FlexColumn gap={0} className={`${className}__listView`}>
                  {projects?.pages?.map((page) => {
                    const sortedPage = page ? sortProjects(page) : [];
                    return sortedPage.map((project: Project) => (
                      <div key={project.id} className={`${className}__listItem`}>
                        <ProjectItemRow project={project} onEdit={handleEditProject} />
                      </div>
                    ));
                  })}
                  {hasNextPageProjects && !isLoadingProjects && <Observer callback={fetchNextPageProjects} />}
                </FlexColumn>
              )}

              {/* プロジェクト一覧 - カード表示 */}
              {!isErrorProjects && !isLoadingProjects && displayMode === 'card' && (
                <>
                  <div className={`${className}__cardGrid`}>
                    {projects?.pages?.map((page) => {
                      const sortedPage = page ? sortProjects(page) : [];
                      return sortedPage.map((project: Project, index: number) => (
                        <a
                          key={project.id}
                          href={`/home/projects/${project.id}`}
                          className={`${className}__projectCard`}
                          style={{ '--delay': `${index * 0.05}s` } as React.CSSProperties}
                        >
                          <div className={`${className}__cardGlow`} />
                          <div className={`${className}__cardBorder`} />
                          <div className={`${className}__cardInner`}>
                            <FlexRow align={'flex-start'} className={`${className}__cardHeader`}>
                              <FlexColumn gap={8} className={`${className}__cardInfo`}>
                                <Text
                                  text={project.name}
                                  fontSize={theme.typography.fontSize.lg}
                                  color={theme.colors.text.primary}
                                  fontWeight={theme.typography.fontWeight.bold}
                                />
                                <Text
                                  text={project.description || 'No description'}
                                  fontSize={theme.typography.fontSize.sm}
                                  color={theme.colors.text.secondary}
                                />
                              </FlexColumn>
                              <button
                                className={`${className}__cardEditButton`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditProject(project);
                                }}
                                title='Edit project'
                              >
                                <BiEdit size={18} />
                              </button>
                            </FlexRow>

                            <div className={`${className}__cardStats`}>
                              <div className={`${className}__cardStat`}>
                                <span className={`${className}__cardStatValue`}>{project.session_count ?? 0}</span>
                                <span className={`${className}__cardStatLabel`}>sessions</span>
                              </div>
                              <div className={`${className}__cardStatDivider`} />
                              <div className={`${className}__cardStat`}>
                                <span className={`${className}__cardStatValue`}>
                                  {new Date(project.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className={`${className}__cardStatLabel`}>created</span>
                              </div>
                            </div>
                          </div>
                        </a>
                      ));
                    })}
                  </div>
                  {hasNextPageProjects && !isLoadingProjects && <Observer callback={fetchNextPageProjects} />}
                </>
              )}

              {/* 空状態 */}
              {!isLoadingProjects && !isErrorProjects && (!projects?.pages || projects.pages.every((p) => !p || p.length === 0)) && (
                <div className={`${className}__emptyState`}>
                  <div className={`${className}__emptyIcon`}>
                    <BiGridAlt size={48} />
                  </div>
                  <Text text={t('home.noProjects')} fontSize={theme.typography.fontSize.lg} color={theme.colors.text.secondary} />
                  <p className={`${className}__emptyHint`}>Create your first project to start tracking player data</p>
                  <Button onClick={handleCreateProject} scheme={'primary'} fontSize={'base'}>
                    <BiPlus size={20} />
                    {t('home.createProject')}
                  </Button>
                </div>
              )}
            </Card>
          </section>
        </div>
      </InnerContent>
      <ProjectFormModal isOpen={isCreateModalOpen || !!editingProject} onClose={handleCloseModal} project={editingProject} />
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

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const IndexPage = styled(Component)`
  position: relative;

  &__mainContent {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    padding: 0 24px 48px;
  }

  /* Hero Section */
  &__hero {
    padding: 32px 0;
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.1s forwards;
  }

  &__heroContent {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  &__greeting {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__heroTitle {
    margin: 0;
    font-size: clamp(${({ theme }) => theme.typography.fontSize['2xl']}, 5vw, ${({ theme }) => theme.typography.fontSize['4xl']});
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  }

  &__heroTitleLine {
    display: block;
    font-size: 0.7em;
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__heroTitleAccent {
    display: block;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__heroSubtitle {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  /* Stats Grid */
  &__statsGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  &__statCard {
    --accent: #00f5ff;

    position: relative;
    padding: 20px;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: 16px;
    transition: all 0.3s ease;

    &:hover {
      border-color: color-mix(in srgb, var(--accent) 40%, transparent);
      box-shadow: 0 8px 32px color-mix(in srgb, var(--accent) 15%, transparent);
      transform: translateY(-2px);
    }
  }

  &__statGlow {
    position: absolute;
    top: 0;
    left: 50%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    filter: blur(40px);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s ease;
  }

  &__statCard:hover &__statGlow {
    opacity: 0.1;
  }

  &__statContent {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__statValue {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: var(--accent);
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  }

  &__statLabel {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  }

  /* Projects Section */
  &__projectsSection {
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.3s forwards;
  }

  &__sectionHeader {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__sectionTitleGroup {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__sectionEyebrow {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.primary.main};
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  &__createButton {
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 20px rgb(0 245 255 / 20%);

    &::before {
      position: absolute;
      inset: 0;
      content: '';
      background: linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 30%) 50%, transparent 100%);
      background-size: 200% 100%;
      opacity: 0;
      transition: opacity 0.3s ease;
      animation: ${shimmer} 3s linear infinite;
    }

    &:hover::before {
      opacity: 1;
    }
  }

  /* Toolbar */
  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  &__searchWrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 400px;
  }

  &__searchIcon {
    position: absolute;
    top: 50%;
    left: 14px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    transform: translateY(-50%);
    transition: color 0.2s ease;
  }

  &__searchInput {
    width: 100%;
    padding: 10px 14px 10px 42px;
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

    &:focus + &__searchIcon,
    &:focus ~ &__searchIcon {
      color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  &__searchWrapper:focus-within &__searchIcon {
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &__toolbarActions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__sortWrapper {
    position: relative;
  }

  &__sortSelect {
    min-width: 160px;
    padding: 10px 36px 10px 14px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    appearance: none;
    cursor: pointer;
    outline: none;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.border.strong};
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main}80;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }

    option {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.base};
    }
  }

  &__sortChevron {
    position: absolute;
    top: 50%;
    right: 12px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    pointer-events: none;
    transform: translateY(-50%);
  }

  &__displayToggle {
    display: flex;
    gap: 2px;
    padding: 4px;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 10px;
  }

  &__toggleButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 32px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.hover};
    }

    &.active {
      color: ${({ theme }) => theme.colors.primary.main};
      background: ${({ theme }) => theme.colors.primary.main}1a;
    }
  }

  &__refreshButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
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

  /* Projects Container */
  &__projectsContainer {
    min-height: 200px;
  }

  /* List View */
  &__listView {
    overflow: hidden;
  }

  &__listItem {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
    }
  }

  /* Card Grid */
  &__cardGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  &__projectCard {
    --delay: 0s;

    position: relative;
    overflow: hidden;
    text-decoration: none;
    background: ${({ theme }) => theme.colors.surface.base};
    border-radius: 20px;
    opacity: 0;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    animation: ${slideUp} 0.5s ease-out forwards;
    animation-delay: var(--delay);

    &:hover {
      box-shadow:
        0 0 40px rgb(0 245 255 / 15%),
        0 20px 40px rgb(0 0 0 / 20%);
      transform: translateY(-6px);
    }
  }

  &__cardGlow {
    position: absolute;
    top: 0;
    left: 50%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgb(0 245 255 / 40%) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    filter: blur(40px);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s ease;
  }

  &__projectCard:hover &__cardGlow {
    opacity: 0.15;
  }

  &__cardBorder {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: 20px;
    transition: border-color 0.3s ease;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      content: '';
      background: linear-gradient(90deg, transparent, #00f5ff, transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  &__projectCard:hover &__cardBorder {
    border-color: rgb(0 245 255 / 30%);

    &::before {
      opacity: 1;
    }
  }

  &__cardInner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  &__cardHeader {
    justify-content: space-between;
  }

  &__cardInfo {
    flex: 1;
    min-width: 0;
  }

  &__cardEditButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
      border-color: ${({ theme }) => theme.colors.primary.main}80;
    }
  }

  &__projectCard:hover &__cardEditButton {
    opacity: 1;
    transform: translateX(0);
  }

  &__cardStats {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: 12px;
  }

  &__cardStat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__cardStatValue {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__cardStatLabel {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  }

  &__cardStatDivider {
    width: 1px;
    height: 28px;
    background: ${({ theme }) => theme.colors.border.default};
  }

  /* Loading State */
  &__loadingState {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
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
  &__errorState {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
  }

  &__errorIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.semantic.error.main};
    background: ${({ theme }) => theme.colors.semantic.error.main}15;
    border: 1px solid ${({ theme }) => theme.colors.semantic.error.main}40;
    border-radius: 50%;
  }

  /* Empty State */
  &__emptyState {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
  }

  &__emptyIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px dashed ${({ theme }) => theme.colors.border.default};
    border-radius: 20px;
  }

  &__emptyHint {
    max-width: 300px;
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  /* Responsive */
  @media (width <= 1024px) {
    &__statsGrid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 768px) {
    &__mainContent {
      padding: 0 16px 32px;
    }

    &__statsGrid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    &__statCard {
      padding: 16px;
    }

    &__toolbar {
      flex-direction: column;
      align-items: stretch;
      padding: 12px;
    }

    &__searchWrapper {
      max-width: none;
    }

    &__toolbarActions {
      justify-content: space-between;
    }

    &__cardGrid {
      grid-template-columns: 1fr;
    }
  }
`;

export default IndexPage;
