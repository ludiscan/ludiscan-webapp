import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useMemo, useState } from 'react';
import { IoChevronDown, IoChevronForward, IoChevronUp, IoPlay } from 'react-icons/io5';

import type { PositionEventLog } from '@src/modeles/heatmaptask';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { useEventLogSelect } from '@src/hooks/useEventLog';
import { usePlayerTimelinePatch } from '@src/hooks/usePlayerTimeline';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { DefaultStaleTime } from '@src/modeles/qeury';

// Format milliseconds to mm:ss.SSS
const formatTimestamp = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

type EventLogPanelProps = {
  service: HeatmapDataService;
  eventLogKeys: string[] | null;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

type EventLogTypeSectionProps = {
  logName: string;
  service: HeatmapDataService;
  color: string;
  onEventClick: (event: PositionEventLog) => void;
};

// Styled Components
const PanelContainer = styled('div')<{ $theme: ReturnType<typeof useSharedTheme>['theme']; $collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $collapsed }) => ($collapsed ? 'auto' : '280px')};
  max-height: ${({ $collapsed }) => ($collapsed ? 'auto' : '300px')};
  overflow: hidden;
  background: ${({ $theme }) => $theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
`;

const PanelHeader = styled('div')<{ $theme: ReturnType<typeof useSharedTheme>['theme'] }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${({ $theme }) => $theme.colors.background.elevated};
  border-bottom: 1px solid ${({ $theme }) => $theme.colors.border.default};
`;

const PanelTitle = styled('span')`
  font-size: 14px;
  font-weight: 600;
`;

const ToggleButton = styled('button')<{ $theme: ReturnType<typeof useSharedTheme>['theme'] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: ${({ $theme }) => $theme.colors.text.secondary};
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 4px;

  &:hover {
    color: ${({ $theme }) => $theme.colors.text.primary};
    background: ${({ $theme }) => $theme.colors.surface.hover};
  }
`;

const PanelContent = styled('div')`
  flex: 1;
  padding: 8px;
  overflow-y: auto;
`;

const SectionContainer = styled('div')`
  margin-bottom: 4px;
`;

const SectionHeader = styled('div')<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  cursor: pointer;
  border-left: 3px solid ${({ $color }) => $color};
  border-radius: 4px;

  &:hover {
    background: rgb(0 0 0 / 5%);
  }
`;

const HeaderLeft = styled('div')`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const SectionTitle = styled('span')`
  font-size: 13px;
  font-weight: 500;
`;

const EventCount = styled('span')<{ $theme: ReturnType<typeof useSharedTheme>['theme'] }>`
  font-size: 12px;
  color: ${({ $theme }) => $theme.colors.text.secondary};
`;

const EventList = styled('div')`
  max-height: 150px;
  padding-left: 20px;
  overflow-y: auto;
`;

const EventItem = styled('div')<{ $theme: ReturnType<typeof useSharedTheme>['theme'] }>`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: ${({ $theme }) => $theme.colors.surface.hover};
  }
`;

const EventTimestamp = styled('span')`
  font-family: monospace;
  font-size: 11px;
`;

const EventPlayer = styled('span')<{ $theme: ReturnType<typeof useSharedTheme>['theme'] }>`
  flex: 1;
  color: ${({ $theme }) => $theme.colors.text.secondary};
`;

const JumpIcon = styled('span')`
  opacity: 0.5;
`;

// Components
const EventLogTypeSection: FC<EventLogTypeSectionProps> = memo(({ logName, service, color, onEventClick }) => {
  const { theme } = useSharedTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: events } = useQuery({
    queryKey: ['eventLogPanel', logName, service.sessionId],
    queryFn: () => service.getEventLog(logName),
    staleTime: DefaultStaleTime,
    enabled: !!service.sessionId,
  });

  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) => a.offset_timestamp - b.offset_timestamp);
  }, [events]);

  const eventCount = sortedEvents.length;

  if (eventCount === 0) return null;

  return (
    <SectionContainer>
      <SectionHeader onClick={() => setIsExpanded(!isExpanded)} $color={color}>
        <HeaderLeft>
          {isExpanded ? <IoChevronDown size={14} /> : <IoChevronForward size={14} />}
          <SectionTitle>{logName}</SectionTitle>
        </HeaderLeft>
        <EventCount $theme={theme}>({eventCount})</EventCount>
      </SectionHeader>
      {isExpanded && (
        <EventList>
          {sortedEvents.map((event) => (
            <EventItem key={event.id} onClick={() => onEventClick(event)} $theme={theme}>
              <EventTimestamp>{formatTimestamp(event.offset_timestamp)}</EventTimestamp>
              <EventPlayer $theme={theme}>Player {event.player}</EventPlayer>
              <JumpIcon>
                <IoPlay size={12} />
              </JumpIcon>
            </EventItem>
          ))}
        </EventList>
      )}
    </SectionContainer>
  );
});

EventLogTypeSection.displayName = 'EventLogTypeSection';

const EventLogPanelComponent: FC<EventLogPanelProps> = ({
  service,
  eventLogKeys,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const { theme } = useSharedTheme();
  const logs = useEventLogSelect((s) => s.logs);
  const setTimelineState = usePlayerTimelinePatch();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // controlled/uncontrolled両対応
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleEventClick = useCallback(
    (event: PositionEventLog) => {
      setTimelineState({
        visible: true,
        currentTimelineSeek: event.offset_timestamp,
      });
    },
    [setTimelineState],
  );

  const getColorForLog = useCallback(
    (logName: string): string => {
      const logData = logs.find((l) => l.key === logName);
      return logData?.color || '#666666';
    },
    [logs],
  );

  const handleToggle = useCallback(() => {
    const newValue = !collapsed;
    if (isControlled) {
      onCollapsedChange?.(newValue);
    } else {
      setInternalCollapsed(newValue);
    }
  }, [collapsed, isControlled, onCollapsedChange]);

  if (!eventLogKeys || eventLogKeys.length === 0) {
    return null;
  }

  return (
    <PanelContainer $theme={theme} $collapsed={collapsed}>
      <PanelHeader $theme={theme}>
        <PanelTitle>Event Logs</PanelTitle>
        <ToggleButton onClick={handleToggle} $theme={theme}>
          {collapsed ? <IoChevronDown size={16} /> : <IoChevronUp size={16} />}
        </ToggleButton>
      </PanelHeader>
      {!collapsed && (
        <PanelContent>
          {eventLogKeys.map((logName) => (
            <EventLogTypeSection key={logName} logName={logName} service={service} color={getColorForLog(logName)} onEventClick={handleEventClick} />
          ))}
        </PanelContent>
      )}
    </PanelContainer>
  );
};

export const EventLogPanel = memo(EventLogPanelComponent);

EventLogPanel.displayName = 'EventLogPanel';
