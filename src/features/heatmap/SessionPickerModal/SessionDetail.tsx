import styled from '@emotion/styled';
import { memo, useMemo, useState } from 'react';
import { IoPlay, IoStop, IoPhonePortrait, IoCodeSlash, IoTime, IoFingerPrint, IoChevronDown, IoChevronForward } from 'react-icons/io5';

import type { Session } from '@src/modeles/session';
import type { FC, ReactNode } from 'react';

export type SessionDetailProps = {
  className?: string;
  session: Session | null;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  padding: 24px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  align-items: center;
`;

const SessionName = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Badge = styled.span<{ variant?: 'default' | 'success' }>`
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme, variant }) => (variant === 'success' ? theme.colors.semantic.success.contrast : theme.colors.text.secondary)};
  background: ${({ theme, variant }) => (variant === 'success' ? theme.colors.semantic.success.main : theme.colors.surface.base)};
  border-radius: 4px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 12px;
  font-size: 12px;
`;

const InfoItemWrapper = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const InfoIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const InfoLabel = styled.span`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.tertiary};

  &::after {
    content: ':';
  }
`;

const InfoValue = styled.span`
  font-family: 'JetBrains Mono', monospace;
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-all;
`;

const InfoItem: FC<{ icon: ReactNode; label: string; value: string; style?: React.CSSProperties }> = ({ icon, label, value, style }) => (
  <InfoItemWrapper style={style}>
    <InfoIcon>{icon}</InfoIcon>
    <InfoLabel>{label}</InfoLabel>
    <InfoValue>{value}</InfoValue>
  </InfoItemWrapper>
);

const MetadataSection = styled.div`
  padding: 8px;
  font-size: 11px;
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 6px;
`;

const MetadataTitle = styled.div`
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetadataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetadataItemRow = styled.div<{ hasNestedContent: boolean }>`
  display: flex;
  flex-direction: ${({ hasNestedContent }) => (hasNestedContent ? 'column' : 'row')};
  gap: ${({ hasNestedContent }) => (hasNestedContent ? '4px' : '6px')};
  padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
  }
`;

const MetadataKeyLabel = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetadataSimpleValue = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-all;
`;

const NestedJsonWrapper = styled.div`
  padding: 6px 8px;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.surface.sunken};
  border-radius: 4px;
`;

// Nested JSON display components
const JsonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const JsonObjectWrapper = styled.div<{ depth: number }>`
  display: flex;
  flex-direction: column;
  padding-left: ${({ depth }) => (depth > 0 ? '12px' : '0')};
  border-left: ${({ depth, theme }) => (depth > 0 ? `1px solid ${theme.colors.border.subtle}` : 'none')};
`;

const JsonRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: flex-start;
  line-height: 1.4;
`;

const JsonToggle = styled.button`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.hover};
  }
`;

const JsonKeyName = styled.span`
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const JsonPrimitive = styled.span<{ type: 'string' | 'number' | 'boolean' | 'null' }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'string':
        return theme.colors.semantic.success.main;
      case 'number':
        return theme.colors.semantic.warning.main;
      case 'boolean':
        return theme.colors.semantic.info.main;
      case 'null':
        return theme.colors.text.tertiary;
      default:
        return theme.colors.text.primary;
    }
  }};
  word-break: break-all;
`;

const JsonBracket = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const JsonArrayBadge = styled.span`
  padding: 0 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  background: ${({ theme }) => theme.colors.surface.hover};
  border-radius: 3px;
`;

// Recursive JSON value renderer
const JsonValueRenderer: FC<{ value: unknown; depth?: number; keyName?: string }> = ({ value, depth = 0, keyName }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  if (value === null) {
    return (
      <JsonRow>
        {keyName && (
          <>
            <JsonKeyName>{keyName}</JsonKeyName>
            <JsonBracket>:</JsonBracket>
          </>
        )}
        <JsonPrimitive type='null'>null</JsonPrimitive>
      </JsonRow>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <JsonRow>
        {keyName && (
          <>
            <JsonKeyName>{keyName}</JsonKeyName>
            <JsonBracket>:</JsonBracket>
          </>
        )}
        <JsonPrimitive type='boolean'>{value ? 'true' : 'false'}</JsonPrimitive>
      </JsonRow>
    );
  }

  if (typeof value === 'number') {
    return (
      <JsonRow>
        {keyName && (
          <>
            <JsonKeyName>{keyName}</JsonKeyName>
            <JsonBracket>:</JsonBracket>
          </>
        )}
        <JsonPrimitive type='number'>{value}</JsonPrimitive>
      </JsonRow>
    );
  }

  if (typeof value === 'string') {
    return (
      <JsonRow>
        {keyName && (
          <>
            <JsonKeyName>{keyName}</JsonKeyName>
            <JsonBracket>:</JsonBracket>
          </>
        )}
        <JsonPrimitive type='string'>&quot;{value}&quot;</JsonPrimitive>
      </JsonRow>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <JsonRow>
          {keyName && (
            <>
              <JsonKeyName>{keyName}</JsonKeyName>
              <JsonBracket>:</JsonBracket>
            </>
          )}
          <JsonBracket>[]</JsonBracket>
        </JsonRow>
      );
    }

    return (
      <JsonContainer>
        <JsonRow>
          <JsonToggle onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? <IoChevronDown size={10} /> : <IoChevronForward size={10} />}</JsonToggle>
          {keyName && (
            <>
              <JsonKeyName>{keyName}</JsonKeyName>
              <JsonBracket>:</JsonBracket>
            </>
          )}
          <JsonBracket>[</JsonBracket>
          {!isExpanded && <JsonArrayBadge>{value.length} items</JsonArrayBadge>}
          {!isExpanded && <JsonBracket>]</JsonBracket>}
        </JsonRow>
        {isExpanded && (
          <JsonObjectWrapper depth={depth + 1}>
            {value.map((item, index) => (
              <JsonValueRenderer key={index} value={item} depth={depth + 1} keyName={String(index)} />
            ))}
          </JsonObjectWrapper>
        )}
        {isExpanded && <JsonBracket>]</JsonBracket>}
      </JsonContainer>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return (
        <JsonRow>
          {keyName && (
            <>
              <JsonKeyName>{keyName}</JsonKeyName>
              <JsonBracket>:</JsonBracket>
            </>
          )}
          <JsonBracket>{'{}'}</JsonBracket>
        </JsonRow>
      );
    }

    return (
      <JsonContainer>
        <JsonRow>
          <JsonToggle onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? <IoChevronDown size={10} /> : <IoChevronForward size={10} />}</JsonToggle>
          {keyName && (
            <>
              <JsonKeyName>{keyName}</JsonKeyName>
              <JsonBracket>:</JsonBracket>
            </>
          )}
          <JsonBracket>{'{'}</JsonBracket>
          {!isExpanded && <JsonArrayBadge>{entries.length} keys</JsonArrayBadge>}
          {!isExpanded && <JsonBracket>{'}'}</JsonBracket>}
        </JsonRow>
        {isExpanded && (
          <JsonObjectWrapper depth={depth + 1}>
            {entries.map(([k, v]) => (
              <JsonValueRenderer key={k} value={v} depth={depth + 1} keyName={k} />
            ))}
          </JsonObjectWrapper>
        )}
        {isExpanded && <JsonBracket>{'}'}</JsonBracket>}
      </JsonContainer>
    );
  }

  return (
    <JsonRow>
      {keyName && (
        <>
          <JsonKeyName>{keyName}</JsonKeyName>
          <JsonBracket>:</JsonBracket>
        </>
      )}
      <JsonPrimitive type='string'>{String(value)}</JsonPrimitive>
    </JsonRow>
  );
};

function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

function calculateDuration(startTime: string | null | undefined, endTime: string | null | undefined): string {
  if (!startTime) return '-';
  const diffMs = (endTime ? new Date(endTime) : new Date()).getTime() - new Date(startTime).getTime();
  if (diffMs < 0) return '-';
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);
  return h > 0 ? `${h}h${m}m` : m > 0 ? `${m}m${s}s` : `${s}s`;
}

const Component: FC<SessionDetailProps> = ({ className, session }) => {
  const metadata = useMemo(() => {
    if (!session?.metaData) return null;
    const entries = Object.entries(session.metaData);
    return entries.length > 0 ? entries : null;
  }, [session?.metaData]);

  if (!session) {
    return <EmptyState className={className}>No session selected</EmptyState>;
  }

  return (
    <Container className={className}>
      <Header>
        <SessionName>{session.name || `Session #${session.sessionId}`}</SessionName>
        <Badge>ID: {session.sessionId}</Badge>
        <Badge variant={session.isPlaying ? 'success' : 'default'}>
          {session.isPlaying ? <IoPlay size={10} /> : <IoStop size={10} />}
          {session.isPlaying ? 'Playing' : 'Finished'}
        </Badge>
      </Header>

      <InfoGrid>
        <InfoItem icon={<IoPhonePortrait size={12} />} label='Platform' value={session.platform || '-'} />
        <InfoItem icon={<IoCodeSlash size={12} />} label='Version' value={session.appVersion || '-'} />
        <InfoItem icon={<IoPlay size={12} />} label='Start' value={formatDateTime(session.startTime)} />
        <InfoItem icon={<IoTime size={12} />} label='Duration' value={calculateDuration(session.startTime, session.endTime)} />
        {session.deviceId && <InfoItem icon={<IoFingerPrint size={12} />} label='Device' value={session.deviceId} style={{ gridColumn: 'span 2' }} />}
      </InfoGrid>

      {metadata && (
        <MetadataSection>
          <MetadataTitle>Metadata</MetadataTitle>
          <MetadataList>
            {metadata.map(([key, value]) => {
              const isNestedObject = typeof value === 'object' && value !== null;
              return (
                <MetadataItemRow key={key} hasNestedContent={isNestedObject}>
                  <MetadataKeyLabel>{key}:</MetadataKeyLabel>
                  {isNestedObject ? (
                    <NestedJsonWrapper>
                      <JsonValueRenderer value={value} depth={0} />
                    </NestedJsonWrapper>
                  ) : (
                    <MetadataSimpleValue>{String(value)}</MetadataSimpleValue>
                  )}
                </MetadataItemRow>
              );
            })}
          </MetadataList>
        </MetadataSection>
      )}
    </Container>
  );
};

export const SessionDetail = memo(Component);

SessionDetail.displayName = 'SessionDetail';
