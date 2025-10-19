import styled from '@emotion/styled';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BiRefresh } from 'react-icons/bi';

import { ProjectItemRow } from './ProjectItemRow';

import type { Project } from '@src/modeles/project';
import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Observer } from '@src/component/atoms/Observer';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useToast } from '@src/component/templates/ToastContext';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import { InnerContent } from '@src/pages/_app.page';
import { fontSizes, fontWeights } from '@src/styles/style';

const fetchCount = 20;

export type HomePageProps = {
  className?: string | undefined;
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  return {
    props: {},
  };
};

type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc' | 'updated_desc' | 'updated_asc';
type DisplayMode = 'card' | 'list';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: '作成日 (新しい順)', value: 'created_desc' },
  { label: '作成日 (古い順)', value: 'created_asc' },
  { label: 'プロジェクト名 (A-Z)', value: 'name_asc' },
  { label: 'プロジェクト名 (Z-A)', value: 'name_desc' },
  { label: '更新日 (新しい順)', value: 'updated_desc' },
  { label: '更新日 (古い順)', value: 'updated_asc' },
];

const Component: FC<HomePageProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const { isAuthorized, isLoading, ready } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const toastShownRef = useRef<boolean>(false);

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
      const { data, error } = await createClient().GET('/api/v0.1/projects', {
        params: {
          query: {
            limit: fetchCount,
            offset: pageParam ? pageParam : undefined,
            search: searchQuery || undefined,
          },
        },
      });
      if (error) {
        throw new Error('プロジェクト一覧の取得に失敗しました');
      }
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < fetchCount) return undefined;
      return allPages.length * fetchCount;
    },
  });

  // エラー通知（一度だけ表示）
  useEffect(() => {
    if (isErrorProjects && !toastShownRef.current) {
      showToast(projectsError?.message || 'プロジェクト一覧の取得に失敗しました', 3, 'error');
      toastShownRef.current = true;
    }
  }, [isErrorProjects, projectsError, showToast]);

  const { theme } = useSharedTheme();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(() => {
    toastShownRef.current = false;
    queryClient.invalidateQueries({ queryKey: ['projects', isAuthorized, searchQuery] });
    showToast('プロジェクト一覧を更新しました', 2, 'success');
  }, [queryClient, isAuthorized, searchQuery, showToast]);

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

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      return router.replace('/');
    }
  }, [isAuthorized, isLoading, router, ready]);
  return (
    <div className={className}>
      <SidebarLayout />
      <InnerContent>
        <Header title={'Heatmap'} onClick={handleBack} />
        <FlexRow className={`${className}__titleRow`}>
          <Text text={'Home'} fontSize={fontSizes.largest} color={theme.colors.text} fontWeight={fontWeights.bolder} />
        </FlexRow>
        <VerticalSpacer size={16} />
        <div className={`${className}__projects`}>
          <Text text={'Projects'} fontSize={fontSizes.large1} color={theme.colors.secondary.main} fontWeight={fontWeights.bold} />
          <VerticalSpacer size={16} />
          <Card blur color={theme.colors.surface.main}>
            <FlexRow className={`${className}__filtersRow`} gap={16}>
              <Button onClick={handleRefresh} scheme={'surface'} disabled={isLoadingProjects} fontSize={'small'}>
                <BiRefresh size={20} />
              </Button>
              <div className={`${className}__searchContainer`}>
                <OutlinedTextField value={searchQuery} onChange={setSearchQuery} placeholder={'プロジェクト名で検索...'} fontSize={fontSizes.medium} />
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={`${className}__sortSelect`}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className={`${className}__displayToggle`}>
                <Button onClick={() => setDisplayMode('list')} scheme={displayMode === 'list' ? 'primary' : 'none'} fontSize={'small'} title={'リスト表示'}>
                  <Text text={'📋'} fontSize={fontSizes.medium} />
                </Button>
                <Button onClick={() => setDisplayMode('card')} scheme={displayMode === 'card' ? 'primary' : 'none'} fontSize={'small'} title={'カード表示'}>
                  <Text text={'🗂️'} fontSize={fontSizes.medium} />
                </Button>
              </div>
            </FlexRow>
            <FlexColumn gap={20}>
              {/* ローディング状態 */}
              {isLoadingProjects && !isErrorProjects && (
                <div className={`${className}__loadingState`}>
                  <Text text={'プロジェクトを読み込み中...'} fontSize={fontSizes.medium} color={theme.colors.text} />
                </div>
              )}

              {/* エラー状態 */}
              {isErrorProjects && (
                <div className={`${className}__errorState`}>
                  <Text text={'プロジェクト一覧の取得に失敗しました。リトライしてください。'} fontSize={fontSizes.medium} color={theme.colors.text} />
                </div>
              )}

              {/* プロジェクト一覧 - リスト表示 */}
              {!isErrorProjects && !isLoadingProjects && displayMode === 'list' && (
                <>
                  {projects?.pages?.map((page, i) => {
                    const sortedPage = page ? sortProjects(page) : [];
                    return (
                      <ol key={i} className={`${className}__nolist`}>
                        {sortedPage &&
                          sortedPage.map((project: Project) => (
                            <li key={project.id} className={`${className}__listItem`}>
                              <ProjectItemRow key={project.id} project={project} />
                            </li>
                          ))}
                        {hasNextPageProjects && !isLoadingProjects && <Observer callback={fetchNextPageProjects} />}
                      </ol>
                    );
                  })}
                </>
              )}

              {/* プロジェクト一覧 - カード表示 */}
              {!isErrorProjects && !isLoadingProjects && displayMode === 'card' && (
                <>
                  <div className={`${className}__cardGrid`}>
                    {projects?.pages?.map((page) => {
                      const sortedPage = page ? sortProjects(page) : [];
                      return sortedPage.map((project: Project) => (
                        <Card
                          key={project.id}
                          className={`${className}__projectCard`}
                          shadow={'medium'}
                          color={theme.colors.surface.main}
                          border={theme.colors.border.main}
                        >
                          <FlexColumn gap={8}>
                            <FlexColumn gap={4}>
                              <Text text={project.name} fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={'bold'} />
                              <Text text={project.description} fontSize={fontSizes.small} color={theme.colors.secondary.main} fontWeight={fontWeights.bold} />
                              <Text
                                text={`📊 ${project.session_count ?? 0} sessions`}
                                fontSize={fontSizes.smallest}
                                color={theme.colors.secondary.main}
                                fontWeight={'lighter'}
                              />
                              <Text
                                text={`Created: ${new Date(project.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                                fontSize={fontSizes.smallest}
                                color={theme.colors.secondary.main}
                                fontWeight={'lighter'}
                              />
                            </FlexColumn>
                          </FlexColumn>
                        </Card>
                      ));
                    })}
                  </div>
                  {hasNextPageProjects && !isLoadingProjects && <Observer callback={fetchNextPageProjects} />}
                </>
              )}

              {/* 空状態 */}
              {!isLoadingProjects && !isErrorProjects && (!projects?.pages || projects.pages.length === 0) && (
                <div className={`${className}__emptyState`}>
                  <Text text={'プロジェクトがありません'} fontSize={fontSizes.medium} color={theme.colors.secondary.main} />
                </div>
              )}
            </FlexColumn>
          </Card>
        </div>
      </InnerContent>
    </div>
  );
};

const IndexPage = styled(Component)`
  height: 100vh;

  &__titleRow {
    padding: 0 20px;
    margin-bottom: 8px;
  }

  &__filtersRow {
    align-items: flex-start;
  }

  &__searchContainer {
    flex: 1;
    min-width: 200px;
  }

  &__sortSelect {
    min-width: 200px;
    padding: 8px 12px;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.surface.main};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${fontSizes.medium}px;
    cursor: pointer;
  }

  &__sortSelect:hover {
    border-color: ${({ theme }) => theme.colors.border.dark};
  }

  &__sortSelect:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary.main};
  }

  &__displayToggle {
    display: flex;
    gap: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: 4px;
    padding: 4px;
  }

  &__projects {
    margin: 0 24px;
  }

  &__cardGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    width: 100%;
  }

  &__projectCard {
    min-height: 160px;
    display: flex;
    flex-direction: column;
    transition:
      box-shadow 0.2s ease-in-out,
      transform 0.2s ease-in-out;

    &:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }

  &__nolist {
    width: 100%;
    padding: 0;
    margin-block: 0;
    list-style: none;
  }

  &__listItem {
    width: 100%;
    padding: 0;
    margin-bottom: 8px;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border.main};
  }

  &__loadingState {
    padding: 32px 0;
    text-align: center;
    opacity: 0.6;
  }

  &__errorState {
    padding: 32px 0;
    text-align: center;
    color: #ef5350;
  }

  &__emptyState {
    padding: 32px 0;
    text-align: center;
    opacity: 0.6;
  }
`;

export default IndexPage;
