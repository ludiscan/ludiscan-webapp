import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { HeatmapTask } from '@src/modeles/heatmaptask';
import type { createClient } from '@src/modeles/qeury';

// v0.1 API - normalized density (0-1 range)
async function sessionCreateTask(apiClient: ReturnType<typeof createClient>, projectId: number, sessionId: number, stepSize: number, zVisible: boolean) {
  return await apiClient.POST('/api/v0.1/heatmap/projects/{project_id}/play_session/{session_id}/tasks', {
    params: {
      path: {
        project_id: projectId,
        session_id: sessionId,
      },
    },
    body: {
      stepSize: stepSize,
      zVisible: zVisible,
    },
  });
}

// v0.1 API - normalized density (0-1 range)
async function projectCreateTask(apiClient: ReturnType<typeof createClient>, projectId: number, stepSize: number, zVisible: boolean, sessionIds?: number[]) {
  return await apiClient.POST('/api/v0.1/heatmap/projects/{project_id}/tasks', {
    params: {
      path: {
        project_id: projectId,
      },
    },
    body: {
      stepSize: stepSize,
      zVisible: zVisible,
      ...(sessionIds && sessionIds.length > 0 ? { sessionIds } : {}),
    },
  });
}

export function useHeatmapTask(
  apiClient: ReturnType<typeof createClient>,
  isAuthorized: boolean,
  projectId: number | undefined,
  sessionId: number | null,
  taskId: number | null,
  setTaskId: (taskId: number | null) => void,
  sessionHeatmap: boolean,
  sessionHeatmapIds: number[] | undefined,
  stepSize: number,
  initialTaskId: number | null,
) {
  const timer = useRef<NodeJS.Timeout>(undefined);
  const queryClient = useQueryClient();

  // プロジェクトデータを取得してis2Dフラグを取得
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await apiClient.GET('/api/v0/projects/{id}', {
        params: { path: { id: projectId } },
      });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5分
    enabled: !!projectId && isAuthorized,
  });

  // is2Dフラグに基づいてzVisibleを動的に決定（2Dの場合はzVisible=false）
  const zVisible = !(project?.is2D ?? false);

  const { data: createdTask } = useQuery({
    queryKey: [projectId, sessionId, stepSize, zVisible, sessionHeatmap, sessionHeatmapIds, apiClient],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!projectId) {
        return null;
      }

      const { data, error } =
        sessionHeatmap && sessionId && sessionId !== 0
          ? await sessionCreateTask(apiClient, projectId, sessionId, stepSize, zVisible)
          : await projectCreateTask(apiClient, projectId, stepSize, zVisible, sessionHeatmapIds);
      if (error) throw error;
      return data;
    },
    enabled: isAuthorized && projectId !== undefined && projectId !== 0 && initialTaskId === null,
    retry: 3,
  });

  useEffect(() => {
    if (!createdTask) return;
    setTaskId(createdTask.taskId);
  }, [createdTask, setTaskId]);

  // v0.1 API - normalized density (0-1 range)
  const { data: task } = useQuery({
    queryKey: ['heatmap', isAuthorized, taskId],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!taskId || isNaN(Number(taskId))) return null;
      if (!isAuthorized) return null;
      const { data, error } = await apiClient.GET('/api/v0.1/heatmap/tasks/{task_id}', {
        params: { path: { task_id: Number(taskId) } },
      });
      if (error) throw error;
      return data;
    },
    initialData: null,
    enabled: taskId !== null && isAuthorized,
    // apiClientは関数なので、依存配列に含めない（Contextから毎回取得されるため）
  });

  useEffect(() => {
    if (!task) return;

    if (task.status === 'pending' || task.status === 'processing') {
      timer.current = setInterval(async () => {
        await queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      }, 500);
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [queryClient, task]);

  return {
    task: task || createdTask || undefined,
  };
}
