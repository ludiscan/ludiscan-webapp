import styled from '@emotion/styled';
import { memo } from 'react';
import { IoCheckmarkCircle, IoCube, IoGrid, IoSearch, IoTime, IoLayers, IoList } from 'react-icons/io5';

import type { components } from '@generated/api';
import type { FC, ReactNode } from 'react';

export type HeatmapTaskListItem = components['schemas']['HeatmapTaskV01ListItemDto'];

export type HeatmapTaskDetailProps = {
  className?: string;
  task: HeatmapTaskListItem | null;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.border.strong};
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.3;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TaskName = styled.h3`
  margin: 0;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TaskIdBadge = styled.span`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  width: fit-content;
  padding: 4px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 6px;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  width: fit-content;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ status }) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'processing':
        return '#f59e0b';
      case 'pending':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
  border-radius: 12px;
`;

const DimensionBadge = styled.span<{ is3D: boolean }>`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  width: fit-content;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme, is3D }) => (is3D ? theme.colors.primary.main : theme.colors.surface.raised)};
  border-radius: 12px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const InfoIcon = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 6px;
`;

const InfoContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const InfoValue = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-all;
`;

const QueryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 8px;
`;

const EmptyQuery = styled.span`
  font-style: italic;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const SessionIdsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const SessionIdChip = styled.span`
  padding: 2px 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surface.raised};
  border-radius: 4px;
`;

type InfoItemProps = {
  icon: ReactNode;
  label: string;
  value: string | null | undefined;
};

const InfoItem: FC<InfoItemProps> = ({ icon, label, value }) => (
  <InfoRow>
    <InfoIcon>{icon}</InfoIcon>
    <InfoContent>
      <InfoLabel>{label}</InfoLabel>
      <InfoValue>{value || '-'}</InfoValue>
    </InfoContent>
  </InfoRow>
);

function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

const Component: FC<HeatmapTaskDetailProps> = ({ className, task }) => {
  if (!task) {
    return (
      <Container className={className}>
        <EmptyState>
          <EmptyIcon>
            <IoGrid />
          </EmptyIcon>
          <span>Select a heatmap to view details</span>
        </EmptyState>
      </Container>
    );
  }

  const sessionIds = task.sessionIds ?? [];
  const hasSessionIds = sessionIds.length > 0;
  const hasSearchQuery = task.searchQuery && Object.keys(task.searchQuery).length > 0;

  return (
    <Container className={className}>
      <Header>
        <TaskName>Task #{task.taskId}</TaskName>
        <TaskIdBadge>
          <IoGrid size={12} />
          ID: {task.taskId}
        </TaskIdBadge>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatusBadge status={task.status}>
            <IoCheckmarkCircle size={12} />
            {task.status}
          </StatusBadge>
          <DimensionBadge is3D={task.zVisible}>
            <IoCube size={12} />
            {task.zVisible ? '3D' : '2D'}
          </DimensionBadge>
        </div>
      </Header>

      <Section>
        <SectionTitle>Task Configuration</SectionTitle>
        <InfoGrid>
          <InfoItem icon={<IoGrid />} label='Step Size' value={`${task.stepSize} units`} />
          <InfoItem icon={<IoLayers />} label='Dimension' value={task.zVisible ? '3D (Z-axis visible)' : '2D (Z-axis hidden)'} />
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>Time Information</SectionTitle>
        <InfoGrid>
          <InfoItem icon={<IoTime />} label='Created At' value={formatDateTime(task.createdAt)} />
          <InfoItem icon={<IoTime />} label='Updated At' value={formatDateTime(task.updatedAt)} />
        </InfoGrid>
      </Section>

      {hasSessionIds && (
        <Section>
          <SectionTitle>Session Filter</SectionTitle>
          <InfoGrid>
            <InfoRow>
              <InfoIcon>
                <IoList />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Filtered Sessions ({sessionIds.length})</InfoLabel>
                <SessionIdsList>
                  {sessionIds.slice(0, 10).map((id) => (
                    <SessionIdChip key={id}>#{id}</SessionIdChip>
                  ))}
                  {sessionIds.length > 10 && <SessionIdChip>+{sessionIds.length - 10} more</SessionIdChip>}
                </SessionIdsList>
              </InfoContent>
            </InfoRow>
          </InfoGrid>
        </Section>
      )}

      <Section>
        <SectionTitle>Search Query</SectionTitle>
        <QueryContainer>
          {hasSearchQuery ? (
            <InfoRow>
              <InfoIcon>
                <IoSearch />
              </InfoIcon>
              <InfoContent>
                <InfoValue>{JSON.stringify(task.searchQuery)}</InfoValue>
              </InfoContent>
            </InfoRow>
          ) : (
            <EmptyQuery>No search query applied</EmptyQuery>
          )}
        </QueryContainer>
      </Section>
    </Container>
  );
};

export const HeatmapTaskDetail = memo(Component);

HeatmapTaskDetail.displayName = 'HeatmapTaskDetail';
