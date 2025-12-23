import styled from '@emotion/styled';
import { memo, useMemo } from 'react';
import { IoGameController, IoPlay, IoStop, IoTime, IoPhonePortrait, IoCodeSlash, IoFingerPrint } from 'react-icons/io5';

import type { Session } from '@src/modeles/session';
import type { FC, ReactNode } from 'react';

export type SessionDetailProps = {
  className?: string;
  session: Session | null;
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

const SessionName = styled.h3`
  margin: 0;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SessionIdBadge = styled.span`
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

const StatusBadge = styled.span<{ isPlaying: boolean }>`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  width: fit-content;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme, isPlaying }) => (isPlaying ? theme.colors.semantic.success.contrast : theme.colors.text.secondary)};
  background: ${({ theme, isPlaying }) => (isPlaying ? theme.colors.semantic.success.main : theme.colors.surface.base)};
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

const MetadataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 8px;
`;

const MetadataRow = styled.div`
  display: flex;
  gap: 8px;
`;

const MetadataKey = styled.span`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.secondary};

  &::after {
    content: ':';
  }
`;

const MetadataValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-all;
`;

const EmptyMetadata = styled.span`
  font-style: italic;
  color: ${({ theme }) => theme.colors.text.tertiary};
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

function calculateDuration(startTime: string | null | undefined, endTime: string | null | undefined): string {
  if (!startTime) return '-';
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return '-';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

const Component: FC<SessionDetailProps> = ({ className, session }) => {
  const metadata = useMemo(() => {
    if (!session?.metaData) return null;
    const entries = Object.entries(session.metaData);
    return entries.length > 0 ? entries : null;
  }, [session?.metaData]);

  if (!session) {
    return (
      <Container className={className}>
        <EmptyState>
          <EmptyIcon>
            <IoGameController />
          </EmptyIcon>
          <span>Select a session to view details</span>
        </EmptyState>
      </Container>
    );
  }

  const displayName = session.name || `Session #${session.sessionId}`;
  const duration = calculateDuration(session.startTime, session.endTime);

  return (
    <Container className={className}>
      <Header>
        <SessionName>{displayName}</SessionName>
        <SessionIdBadge>
          <IoGameController size={12} />
          ID: {session.sessionId}
        </SessionIdBadge>
        <StatusBadge isPlaying={session.isPlaying}>
          {session.isPlaying ? <IoPlay size={12} /> : <IoStop size={12} />}
          {session.isPlaying ? 'Playing' : 'Finished'}
        </StatusBadge>
      </Header>

      <Section>
        <SectionTitle>Device Information</SectionTitle>
        <InfoGrid>
          <InfoItem icon={<IoPhonePortrait />} label='Platform' value={session.platform} />
          <InfoItem icon={<IoCodeSlash />} label='App Version' value={session.appVersion} />
          <InfoItem icon={<IoFingerPrint />} label='Device ID' value={session.deviceId} />
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>Time Information</SectionTitle>
        <InfoGrid>
          <InfoItem icon={<IoPlay />} label='Start Time' value={formatDateTime(session.startTime)} />
          <InfoItem icon={<IoStop />} label='End Time' value={formatDateTime(session.endTime)} />
          <InfoItem icon={<IoTime />} label='Duration' value={duration} />
        </InfoGrid>
      </Section>

      {metadata && (
        <Section>
          <SectionTitle>Metadata</SectionTitle>
          <MetadataContainer>
            {metadata.map(([key, value]) => (
              <MetadataRow key={key}>
                <MetadataKey>{key}</MetadataKey>
                <MetadataValue>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</MetadataValue>
              </MetadataRow>
            ))}
          </MetadataContainer>
        </Section>
      )}

      {!metadata && (
        <Section>
          <SectionTitle>Metadata</SectionTitle>
          <MetadataContainer>
            <EmptyMetadata>No metadata available</EmptyMetadata>
          </MetadataContainer>
        </Section>
      )}
    </Container>
  );
};

export const SessionDetail = memo(Component);

SessionDetail.displayName = 'SessionDetail';
