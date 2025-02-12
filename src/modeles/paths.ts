import { HeatMapTaskIdPage } from '../pages/heatmap/tasks/[task_id]/HeatmapTasksTaskId.page.tsx';
import { HomePage } from '../pages/home/home.page';
import { IndexPage } from '../pages/index.page';

import { LoginPage } from '@/pages/login/login.page.tsx';

export const PageRoutes = [
  {
    path: '/ludiscan/view',
    Component: IndexPage,
  },
  {
    path: '/ludiscan/view/home',
    Component: HomePage,
  },
  {
    path: '/ludiscan/view/heatmap/tasks/:task_id',
    Component: HeatMapTaskIdPage,
    params: ['task_id'] as const,
    style: { margin: '0 auto', maxWidth: '1200px' },
  },
  {
    path: '/ludiscan/view/login',
    Component: LoginPage,
  },
] as const;

// PageRoutes 配列の各要素の型を PagePathWithParams として定義
export type PagePathWithParams = (typeof PageRoutes)[number];
