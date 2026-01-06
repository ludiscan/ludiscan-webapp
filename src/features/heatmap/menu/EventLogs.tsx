import { useCallback, useEffect } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { EventLogData } from '@src/modeles/heatmapView';
import type { FC } from 'react';

import { Divider } from '@src/component/atoms/Divider';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useEventLogPatch, useEventLogSelect } from '@src/hooks/useEventLog';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { getRandomPrimitiveColor } from '@src/utils/color';
import { availableIcons } from '@src/utils/heatmapIconMap';

// Default HVQL script for HandChangeItem events
const HAND_CHANGE_ITEM_HVQL = `
map status.hand {
  rock     -> player-current-point-icon: hand-rock;
  paper    -> player-current-point-icon: hand-paper;
  scissors  -> player-current-point-icon: hand-scissor;
  *        -> player-current-point-icon: target;
}
`;

const Component: FC<HeatmapMenuProps> = ({ eventLogKeys }) => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const logs = useEventLogSelect((s) => s.logs);
  const setEventLogs = useEventLogPatch();

  useEffect(() => {
    if (eventLogKeys) {
      // 現在のキー列を取り出す
      const currentKeys = logs.map((e) => e.key);

      const setA = new Set(eventLogKeys);
      const setB = new Set(currentKeys);
      const isSameSet = setA.size === setB.size && [...setA].every((k) => setB.has(k));
      if (isSameSet) {
        return;
      }
      const eventLogDats: EventLogData[] = eventLogKeys.map((key) => {
        const index = logs.findIndex((e) => e.key === key);
        // console.log(eventLogs[index]?.color);

        // Auto-assign HVQL script for HandChangeItem events
        let hvqlScript = logs[index]?.hvqlScript;
        if (key === 'GetHandChangeItem' && !hvqlScript) {
          hvqlScript = HAND_CHANGE_ITEM_HVQL;
        }

        return {
          key,
          visible: index !== -1 ? logs[index].visible : false,
          color: logs[index]?.color || getRandomPrimitiveColor(),
          iconName: logs[index]?.iconName || 'CiStreamOn',
          hvqlScript,
        };
      });
      setEventLogs({ logs: eventLogDats });
    }
  }, [eventLogKeys, logs, setEventLogs]);

  const handleFilterPlayer = useCallback(
    (player: string) => {
      setEventLogs((prev) => {
        return {
          ...prev,
          filters: {
            ...prev.filters,
            player: player === 'all' ? -1 : Number(player),
          },
        };
      });
    },
    [setEventLogs],
  );

  return (
    <InlineFlexColumn gap={8}>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={t('heatmap.eventLog.title')} fontSize={theme.typography.fontSize.lg} fontWeight={theme.typography.fontWeight.bold} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={t('heatmap.eventLog.filter')} fontSize={theme.typography.fontSize.sm} />
      </InlineFlexRow>
      <InputRow label={t('heatmap.eventLog.player')}>
        <Selector options={['all', '0', '1', '2', '3']} onChange={handleFilterPlayer} />
      </InputRow>
      <Divider orientation={'horizontal'} />
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={t('heatmap.eventLog.keys')} fontSize={theme.typography.fontSize.sm} />
      </InlineFlexRow>
      <InlineFlexColumn align={'center'} gap={4}>
        {eventLogKeys?.map((key) => {
          const index = logs.findIndex((e) => e.key === key);
          return (
            <InputRow key={key} label={key} align={'center'}>
              <Switch
                label={key}
                onChange={(checked) => {
                  const newEventLogs = logs.map((e) => ({ ...e }));
                  if (index !== -1) {
                    newEventLogs[index].visible = checked;
                  } else {
                    const hvqlScript = key === 'GetHandChangeItem' ? HAND_CHANGE_ITEM_HVQL : undefined;
                    newEventLogs.push({ key, visible: checked, color: '#000000', iconName: 'target', hvqlScript });
                  }
                  setEventLogs({ logs: newEventLogs });
                }}
                checked={index !== -1 ? logs[index].visible : false}
                size={'small'}
              />
              {logs[index] && logs[index].color && (
                <>
                  <input
                    type={'color'}
                    style={{ paddingInline: '0px', paddingBlock: '0px' }}
                    color={logs[index].color}
                    onChange={(e) => {
                      const newEventLogs = logs.map((e) => ({ ...e }));
                      if (index !== -1) {
                        newEventLogs[index].color = e.target.value;
                      } else {
                        newEventLogs.push({ key, visible: false, color: e.target.value, iconName: 'target' });
                      }
                      setEventLogs({ logs: newEventLogs });
                    }}
                  />
                  <Selector
                    options={availableIcons}
                    onChange={(iconName) => {
                      const newEventLogs = logs.map((e) => ({ ...e }));
                      if (index !== -1) {
                        newEventLogs[index].iconName = iconName;
                      } else {
                        newEventLogs.push({ key, visible: false, color: '#000000', iconName });
                      }
                      setEventLogs({ logs: newEventLogs });
                    }}
                    // defaultValue={logs[index]?.iconName || 'target'}
                  />
                </>
              )}
            </InputRow>
          );
        })}
      </InlineFlexColumn>
    </InlineFlexColumn>
  );
};

export const EventLogContent = Component;
