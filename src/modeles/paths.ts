import { HeatMapTaskIdPage } from '../pages/heatmap/tasks/[task_id]/HeatmapTasksTaskId.page.tsx';
import { HomePage } from '../pages/home/home.page';
import { IndexPage } from '../pages/index.page';

export const PageRoutes = [
  {
    path: '/',
    Component: IndexPage,
  },
  {
    path: '/home',
    Component: HomePage,
  },
  {
    path: '/heatmap/tasks/:task_id',
    Component: HeatMapTaskIdPage,
    params: ['task_id'] as const,
  }
] as const;

// PageRoutes 配列の各要素の型を PagePathWithParams として定義
export type PagePathWithParams = (typeof PageRoutes)[number];
