import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { HeatmapIdPageLayout } from './index.page';

import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { ApiClientProvider } from '@src/modeles/ApiClientContext';
import { createMockApiClient } from '@src/modeles/MockApiClient';
import { useOnlineHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

export type HeatMapTaskIdMockPageProps = {
  className?: string;
  project_id?: number;
  mockDataDir?: string;
};

export const getServerSideProps: GetServerSideProps<HeatMapTaskIdMockPageProps> = async (context) => {
  const { params } = context;
  if (!params || !params.project_id) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      project_id: Number(params.project_id as string),
      mockDataDir: '/mocks/heatmap', // デフォルトのmockデータディレクトリ
    },
  };
};

// ApiClientProvider内でサービスを使用するコンポーネント
const MockHeatMapTaskIdPageContent: FC<{ className?: string; project_id: number; onBackClick: () => void }> = ({ className, project_id, onBackClick }) => {
  // sessionHeatmapはfalseに設定（プロジェクト全体のheatmapを表示）
  const service = useOnlineHeatmapDataService(project_id, null, false);

  return <HeatmapIdPageLayout className={className} service={service} onBackClick={onBackClick} />;
};

const MockHeatMapTaskIdPage: FC<HeatMapTaskIdMockPageProps> = ({ className, project_id, mockDataDir = '/mocks/heatmap' }) => {
  const router = useRouter();

  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  // Mock APIクライアントを作成（useMemoで再作成を防ぐ）
  const mockApiClient = useMemo(() => createMockApiClient(mockDataDir), [mockDataDir]);

  if (!project_id || isNaN(Number(project_id))) {
    return <div>Invalid Project ID</div>;
  }

  // ApiClientProvider内でserviceを作成する必要がある
  return (
    <ApiClientProvider createClient={() => mockApiClient}>
      <MockHeatMapTaskIdPageContent className={className} project_id={project_id} onBackClick={handleBackClick} />
    </ApiClientProvider>
  );
};

export default MockHeatMapTaskIdPage;
