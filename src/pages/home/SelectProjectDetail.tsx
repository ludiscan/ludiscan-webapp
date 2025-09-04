import styled from '@emotion/styled';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { SessionItemRow } from './SessionItemRow';

import type { CreateHeatmapItemData } from '@src/component/templates/CreateHeatmapTaskModal';
import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Observer } from '@src/component/atoms/Observer';
import { Text } from '@src/component/atoms/Text';
import { CreateHeatmapTaskModal } from '@src/component/templates/CreateHeatmapTaskModal';
import { createClient, DefaultStaleTime } from '@src/modeles/qeury';

const fetchCount = 20;

export type SelectProjectDetailProps = {
  className?: string;
  project: Project;
};

const Component: FC<SelectProjectDetailProps> = ({ className, project }) => {
  const [selectItem, setSelectedItem] = useState<undefined | CreateHeatmapItemData>(undefined);
  const router = useRouter();
  const {
    data: sessions,
    hasNextPage: hasNextPageSessions,
    fetchNextPage: fetchNextPageSessions,
    isLoading: isLoadingSessions,
    isError: isErrorSessions,
  } = useInfiniteQuery({
    queryKey: ['sessions', project.id],
    queryFn: async ({ pageParam }) => {
      if (!project.id || project.id === 0) return [];
      const { data, error } = await createClient().GET('/api/v0/projects/{project_id}/play_session', {
        params: {
          query: {
            limit: fetchCount,
            offset: pageParam ? pageParam : 0,
          },
          path: {
            project_id: project.id,
          },
        },
      });
      if (error) return [];
      return data;
    },
    staleTime: DefaultStaleTime,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < fetchCount) return undefined;
      return allPages.length * fetchCount;
    },
  });

  const onClickCreateProjectTask = useCallback(async () => {
    setSelectedItem({ projectId: project.id });
  }, [project.id]);
  useEffect(() => {
    if (project.id <= 0) {
      return router.replace('/home');
    }
  }, [project.id, router]);
  return (
    <FlexColumn className={className}>
      <InlineFlexRow>
        <Button onClick={onClickCreateProjectTask} scheme={'primary'} fontSize={'small'}>
          <Text text={'SELECT All'} fontWeight={'bold'} />
        </Button>
      </InlineFlexRow>
      {!isErrorSessions &&
        !isLoadingSessions &&
        sessions?.pages.map((page, i) => (
          <div key={i}>
            {page.map((session) => (
              <SessionItemRow className={`${className}__session`} session={session} key={session.sessionId} />
            ))}
          </div>
        ))}
      {hasNextPageSessions && !isLoadingSessions && <Observer callback={fetchNextPageSessions} />}
      <CreateHeatmapTaskModal isOpen={selectItem !== undefined} onClose={() => setSelectedItem(undefined)} projectId={project.id} />
    </FlexColumn>
  );
};

export const SelectProjectDetail = styled(Component)`
  width: 100%;

  &__session {
    margin-bottom: 2px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }
`;
