import styled from '@emotion/styled';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter} from 'next/navigation';
import {useCallback, useEffect, useState} from 'react';

import { ProjectItemRow } from './ProjectItemRow';
import { SelectProjectDetail } from './SelectProjectDetail';

import type { Env } from '@src/modeles/env';
import type { Project } from '@src/modeles/project';
import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Observer } from '@src/component/atoms/Observer';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import { fontSizes, fontWeights } from '@src/styles/style';

const fetchCount = 20;

export type HomePageProps = {
  className?: string | undefined;
  env?: Env;
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  // This function is not used in the component, but it's here to demonstrate how you might fetch data server-side.
  // You can replace this with actual server-side logic if needed.
  const { env } = await import('@src/config/env');
  return {
    props: {
      env,
    },
  };
};

const Component: FC<HomePageProps> = ({ className, env }) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const { isAuthorized, isLoading, ready } = useAuth({ env });
  const router = useRouter();
  const {
    data: projects,
    hasNextPage: hasNextPageProjects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    fetchNextPage: fetchNextPageProjects,
  } = useInfiniteQuery({
    queryKey: ['projects', isAuthorized, env],
    queryFn: async ({ pageParam }): Promise<Project[] | undefined> => {
      if (!isAuthorized || !env) return undefined;
      const { data, error } = await createClient(env).GET('/api/v0/projects', {
        params: {
          query: {
            limit: fetchCount,
            offset: pageParam ? pageParam : undefined,
          },
        },
      });
      if (error) return undefined;
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < fetchCount) return undefined;
      return allPages.length * fetchCount;
    },
  });

  const onProjectClick = useCallback(
    async (projectId: number) => {
      setSelectedProject(selectedProject === projectId ? null : projectId);
    },
    [selectedProject],
  );
  const { theme } = useSharedTheme();

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      return router.replace('/');
    }
  }, [isAuthorized, isLoading, router]);
  return (
    <div className={className}>
      <Text text={'Home'} fontSize={fontSizes.largest} color={theme.colors.text} fontWeight={fontWeights.bolder} />
      <VerticalSpacer size={24} />
      <Card className={`${className}__card`} shadow={'medium'} color={theme.colors.surface.main} border={theme.colors.border.main}>
        <FlexColumn gap={20}>
          <Text text={'Projects'} fontSize={fontSizes.large1} color={theme.colors.secondary.main} fontWeight={fontWeights.bold} />
          {!isErrorProjects &&
            !isLoadingProjects &&
            projects?.pages?.map((page, i) => (
              <ol key={i} className={`${className}__nolist`}>
                {page &&
                  page.map((project) => (
                    <li key={project.id} className={`${className}__listItem`}>
                      <FlexColumn>
                        <Button onClick={() => onProjectClick(project.id)} scheme={'none'} fontSize={'medium'} width={'full'}>
                          <ProjectItemRow key={project.id} project={project} />
                        </Button>
                        <div className={`${className}__selectProjectDetail ${selectedProject === project.id ? 'active' : ''}`}>
                          {selectedProject === project.id && (
                            <Card key={project.id} shadow={'large'} color={'transparent'}>
                              <SelectProjectDetail project={project} env={env} />
                            </Card>
                          )}
                        </div>
                      </FlexColumn>
                    </li>
                  ))}
                {hasNextPageProjects && !isLoadingProjects && <Observer callback={fetchNextPageProjects} />}
              </ol>
            ))}
        </FlexColumn>
      </Card>
    </div>
  );
};

const IndexPage = styled(Component)`
  &__card {
    margin: 0 20px;
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
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  &__selectProjectDetail {
    width: calc(100% - 32px);
    height: 0;
    margin: 0 16px;
    overflow: hidden;
    transition: height 0.3s ease-in-out;
  }

  &__selectProjectDetail.active {
    height: 500px;
  }
`;

export default IndexPage;
