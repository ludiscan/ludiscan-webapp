import { useCallback, useEffect, useState } from 'react';

import { heatMapEventBus } from '@src/utils/canvasEventBus';

export function useSessionModal() {
  // セッション選択モーダルの状態
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // モーダル開閉ハンドラー
  const handleOpenModal = useCallback(() => {
    setIsSessionModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsSessionModalOpen(false);
  }, []);

  // イベントバスからのモーダル開閉リクエストをリッスン
  useEffect(() => {
    const handleOpenFromEvent = () => {
      setIsSessionModalOpen(true);
    };
    heatMapEventBus.on('session-modal:open', handleOpenFromEvent);
    return () => {
      heatMapEventBus.off('session-modal:open', handleOpenFromEvent);
    };
  }, []);

  return {
    isSessionModalOpen,
    handleOpenModal,
    handleCloseModal,
  };
}
