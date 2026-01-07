import styled from '@emotion/styled';
import { memo, useCallback, useState, useEffect } from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';

import type { Session } from '@src/modeles/session';
import type { FC, ChangeEvent } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { Modal } from '@src/component/molecules/Modal';
import { SessionDetail } from '@src/features/heatmap/SessionPickerModal/SessionDetail';
import { SessionList } from '@src/features/heatmap/SessionPickerModal/SessionList';

export type SessionFilters = {
  searchQuery: string;
  deviceId: string | null;
  deviceIdEnabled: boolean; // トグル状態（initialDeviceIdがある場合に使用）
};

export type SessionPickerModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  currentSessionId: number | null;
  onSelectSession: (sessionId: number) => void;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  isLoading?: boolean;
  // フィルタ関連
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
  // embedモードでの初期deviceId（表示用）
  initialDeviceId?: string | null;
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 800px;
  max-width: 90vw;
  height: 500px;
  max-height: 70vh;

  @media (width <= 768px) {
    width: 100%;
    height: 80vh;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 10px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 32px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 6px;
  transition: all 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.raised};
  }
`;

const DeviceIdBadge = styled.button<{ isEnabled: boolean }>`
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme, isEnabled }) => (isEnabled ? theme.colors.primary.contrast : theme.colors.text.secondary)};
  cursor: pointer;
  background: ${({ theme, isEnabled }) => (isEnabled ? theme.colors.primary.main : theme.colors.surface.base)};
  border: 1px solid ${({ theme, isEnabled }) => (isEnabled ? theme.colors.primary.dark : theme.colors.border.default)};
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, isEnabled }) => (isEnabled ? theme.colors.primary.dark : theme.colors.surface.raised)};
  }
`;

const DeviceIdLabel = styled.span`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ToggleIndicator = styled.span<{ isEnabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 10px;
  background: ${({ isEnabled }) => (isEnabled ? 'rgb(255 255 255 / 20%)' : 'transparent')};
  border: 1px solid ${({ theme, isEnabled }) => (isEnabled ? 'transparent' : theme.colors.border.default)};
  border-radius: 50%;
  transition: all 0.15s ease;
`;

const PanelContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 0;
  min-height: 0;

  @media (width <= 600px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 200px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};

  @media (width <= 600px) {
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const PanelHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const SessionCount = styled.span`
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.tertiary};
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 10px;
`;

const ListWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const DetailWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
`;

const Footer = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const Component: FC<SessionPickerModalProps> = ({
  className,
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onLoadMore,
  isFetchingMore = false,
  hasMore = false,
  filters,
  onFiltersChange,
  initialDeviceId,
}) => {
  // 選択中のプレビュー用セッション（確定前）
  const [previewSession, setPreviewSession] = useState<Session | null>(null);

  // モーダルが開いた時、現在のセッションをプレビューに設定
  useEffect(() => {
    if (isOpen) {
      const current = sessions.find((s) => s.sessionId === currentSessionId) ?? null;
      setPreviewSession(current);
    }
  }, [isOpen, sessions, currentSessionId]);

  const handleSelectSession = useCallback((session: Session) => {
    setPreviewSession(session);
  }, []);

  const handleConfirm = useCallback(() => {
    if (previewSession) {
      onSelectSession(previewSession.sessionId);
    }
    onClose();
  }, [previewSession, onSelectSession, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, searchQuery: e.target.value });
    },
    [filters, onFiltersChange],
  );

  const handleClearSearch = useCallback(() => {
    onFiltersChange({ ...filters, searchQuery: '' });
  }, [filters, onFiltersChange]);

  const handleToggleDeviceId = useCallback(() => {
    onFiltersChange({ ...filters, deviceIdEnabled: !filters.deviceIdEnabled });
  }, [filters, onFiltersChange]);

  const sessionCount = sessions.length;
  const countDisplay = hasMore ? `${sessionCount}+` : String(sessionCount);
  // initialDeviceIdがある場合はトグルボタンを表示
  const showDeviceIdToggle = initialDeviceId !== null && initialDeviceId !== undefined;

  return (
    <Modal
      className={className}
      isOpen={isOpen}
      onClose={onClose}
      title='Select Session'
      closeOutside
      style={{
        width: 'fit-content',
        minWidth: 'unset',
        maxWidth: '90vw',
        padding: 0,
      }}
    >
      <ModalContent>
        <FilterBar>
          <SearchInputContainer>
            <SearchIcon>
              <IoSearch />
            </SearchIcon>
            <SearchInput placeholder='Search sessions...' value={filters.searchQuery} onChange={handleSearchChange} />
            {filters.searchQuery && (
              <ClearButton onClick={handleClearSearch} aria-label='Clear search'>
                <IoClose />
              </ClearButton>
            )}
          </SearchInputContainer>
          {showDeviceIdToggle && (
            <DeviceIdBadge
              isEnabled={filters.deviceIdEnabled}
              onClick={handleToggleDeviceId}
              title={filters.deviceIdEnabled ? 'Click to show all sessions' : 'Click to filter by this device'}
            >
              <DeviceIdLabel title={initialDeviceId ?? undefined}>Device: {initialDeviceId}</DeviceIdLabel>
              <ToggleIndicator isEnabled={filters.deviceIdEnabled}>{filters.deviceIdEnabled ? '✓' : ''}</ToggleIndicator>
            </DeviceIdBadge>
          )}
        </FilterBar>
        <PanelContainer>
          <LeftPanel>
            <PanelHeader>
              Sessions
              <SessionCount>{countDisplay}</SessionCount>
            </PanelHeader>
            <ListWrapper>
              <SessionList
                sessions={sessions}
                selectedSessionId={previewSession?.sessionId ?? null}
                onSelectSession={handleSelectSession}
                onLoadMore={onLoadMore}
                isFetchingMore={isFetchingMore}
                hasMore={hasMore}
              />
            </ListWrapper>
          </LeftPanel>
          <RightPanel>
            <PanelHeader>Session Details</PanelHeader>
            <DetailWrapper>
              <SessionDetail session={previewSession} />
            </DetailWrapper>
          </RightPanel>
        </PanelContainer>
        <Divider orientation='horizontal' />
        <Footer>
          <Button scheme='secondary' fontSize='sm' onClick={handleCancel}>
            Cancel
          </Button>
          <Button scheme='primary' fontSize='sm' onClick={handleConfirm} disabled={!previewSession}>
            Select
          </Button>
        </Footer>
      </ModalContent>
    </Modal>
  );
};

export const SessionPickerModal = memo(Component);

SessionPickerModal.displayName = 'SessionPickerModal';
