import styled from '@emotion/styled';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { Button } from '../../component/atoms/Button.tsx';
import { Card } from '../../component/atoms/Card.tsx';
import { FlexColumn } from '../../component/atoms/Flex.tsx';
import { Observer } from '../../component/atoms/Observer.tsx';
import { VerticalSpacer } from '../../component/atoms/Spacer.tsx';
import { Text } from '../../component/atoms/Text.tsx';
import { useSharedTheme } from '../../hooks/useSharedTheme.tsx';
import { query } from '../../modeles/qeury';
import { fontSizes, fontWeights } from '../../styles/style.ts';

import { ProjectItemRow } from './ProjectItemRow.tsx';
import { SelectProjectDetail } from './SelectProjectDetail.tsx';

import type { Project } from '../../modeles/project.ts';
import type { FC } from 'react';

const fetchCount = 20;

export type HomePageProps = {
  className?: string | undefined;
};

const Component: FC<HomePageProps> = ({ className }) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const {
    data: projects,
    hasNextPage: hasNextPageProjects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    fetchNextPage: fetchNextPageProjects,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: async ({ pageParam }): Promise<Project[] | undefined> => {
      const { data, error } = await query.GET('/api/v0/projects', {
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
                              <SelectProjectDetail project={project} />
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

export const HomePage = styled(Component)`
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
