import { useCallback, useEffect } from 'react';

import type { EventLogData } from '@src/modeles/heatmapView';
import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { FC } from 'react';

import { Divider } from '@src/component/atoms/Divider';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { useEventLogState } from '@src/hooks/useHeatmapState';
import { InputRow } from '@src/pages/heatmap/tasks/[task_id]/menu/InputRow';
import { fontSizes, fontWeights } from '@src/styles/style';
import { getRandomPrimitiveColor } from '@src/utils/color';

const Component: FC<HeatmapMenuProps> = ({ eventLogKeys }) => {
  const { data: eventLog, setData: setEventLogs } = useEventLogState();

  useEffect(() => {
    if (eventLogKeys) {
      // 現在のキー列を取り出す
      const currentKeys = eventLog.logs.map((e) => e.key);

      const setA = new Set(eventLogKeys);
      const setB = new Set(currentKeys);
      const isSameSet = setA.size === setB.size && [...setA].every((k) => setB.has(k));
      if (isSameSet) {
        return;
      }
      const eventLogDats: EventLogData[] = eventLogKeys.map((key) => {
        const index = eventLog.logs.findIndex((e) => e.key === key);
        // console.log(eventLogs[index]?.color);
        return {
          key,
          visible: index !== -1 ? eventLog.logs[index].visible : false,
          color: eventLog.logs[index]?.color || getRandomPrimitiveColor(),
          iconName: eventLog.logs[index]?.iconName || 'CiStreamOn',
        };
      });
      setEventLogs((prev) => {
        return {
          ...prev,
          logs: eventLogDats,
        };
      });
    }
  }, [eventLogKeys, eventLog.logs, setEventLogs]);

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
        <Text text={'Event Log'} fontSize={fontSizes.large1} fontWeight={fontWeights.bold} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={'filter'} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InputRow label={'player'}>
        <Selector options={['all', '0', '1', '2', '3']} onChange={handleFilterPlayer} />
      </InputRow>
      <Divider orientation={'horizontal'} />
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={'Event Log Keys'} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        {eventLogKeys?.map((key) => {
          const index = eventLog.logs.findIndex((e) => e.key === key);
          return (
            <InputRow key={key} label={key}>
              <Switch
                label={key}
                onChange={(checked) => {
                  const newEventLogs = eventLog.logs.map((e) => ({ ...e }));
                  if (index !== -1) {
                    newEventLogs[index].visible = checked;
                  } else {
                    newEventLogs.push({ key, visible: checked, color: '#000000', iconName: 'CiStreamOn' });
                  }
                  setEventLogs((prev) => ({
                    ...prev,
                    logs: newEventLogs,
                  }));
                }}
                checked={index !== -1 ? eventLog.logs[index].visible : false}
                size={'small'}
              />
              {eventLog.logs[index] && eventLog.logs[index].color && (
                <input
                  type={'color'}
                  color={eventLog.logs[index].color}
                  onChange={(e) => {
                    const newEventLogs = eventLog.logs.map((e) => ({ ...e }));
                    if (index !== -1) {
                      newEventLogs[index].color = e.target.value;
                    } else {
                      newEventLogs.push({ key, visible: false, color: e.target.value, iconName: 'CiStreamOn' });
                    }
                    setEventLogs((prev) => ({
                      ...prev,
                      logs: newEventLogs,
                    }));
                  }}
                />
              )}
            </InputRow>
          );
        })}
      </InlineFlexRow>
    </InlineFlexColumn>
  );
};

export const EventLogContent = Component;
