import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsPerson } from 'react-icons/bs';
import { CiMap, CiMapPin, CiStreamOn } from 'react-icons/ci';
import { FaFileExport } from 'react-icons/fa';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from 'react-icons/md';

import type { Theme } from '@emotion/react';
import type { HeatmapTask } from '@src/modeles/heatmaptask';
import type { EventLogData } from '@src/slices/canvasSlice';
import type { FC, CSSProperties } from 'react';
import type { Group } from 'three';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow, InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Selector } from '@src/component/atoms/Selector';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { useCanvasState } from '@src/hooks/useCanvasState';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { ObjectToggleList } from '@src/pages/heatmap/tasks/[task_id]/ObjectToggleList';
import { fontSizes, fontWeights } from '@src/styles/style';
import { canvasEventBus } from '@src/utils/canvasEventBus';

export type HeatmapMenuProps = {
  model: Group | null;
  className?: string | undefined;
  isMenuOpen: boolean;
  toggleMenu: (value: boolean) => void;
  eventLogKeys?: string[] | undefined;
  task: HeatmapTask;
  handleExportView: () => Promise<void>;
  mapOptions: string[];
};

function toggleButtonStyle(theme: Theme): CSSProperties {
  return {
    background: theme.colors.surface.main,
    border: `1px solid ${theme.colors.surface.dark}`,
    borderRadius: '8px',
    padding: '8px 4px',
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  };
}

const InputRow = ({ className, label, children }: { className?: string; label: string; children: React.ReactNode }) => {
  return (
    <InlineFlexRow align={'flex-end'} wrap={'wrap'} gap={4} className={`${className}__row`}>
      <Text text={label} fontSize={fontSizes.small} />
      <div style={{ flex: 1 }} />
      {children}
    </InlineFlexRow>
  );
};

const InfoContent: FC<HeatmapMenuProps> = ({ className, task, handleExportView }) => {
  const { version } = useCanvasState();

  const handleExportHeatmap = useCallback(async () => {
    await handleExportView();
  }, [handleExportView]);

  return (
    <InlineFlexColumn gap={4}>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={`version: ${version}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={`taskId: ${task.taskId}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={`project: ${task.project.name}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      {task.session && (
        <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
          <Text text={`session: ${task.session.name}`} fontSize={fontSizes.small} />
        </InlineFlexRow>
      )}
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={`step size: ${task.stepSize}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={`mode: ${task.zVisible ? '3D' : '2D'}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={8} style={{ marginTop: 8, justifyContent: 'center' }}>
        <Button onClick={handleExportHeatmap} scheme={'primary'} fontSize={'small'}>
          <FaFileExport style={{ marginRight: 4 }} />
          <Text text={'エクスポート'} fontSize={fontSizes.small} fontWeight={fontWeights.bold} />
        </Button>
      </InlineFlexRow>
    </InlineFlexColumn>
  );
};

const HotspotContent: FC<HeatmapMenuProps> = ({ className }) => {
  const { setHotspotMode, hotspotMode } = useCanvasState();
  return (
    <InlineFlexColumn gap={8}>
      <Switch label={'visible'} onChange={(visible) => setHotspotMode({ ...hotspotMode, visible })} checked={hotspotMode.visible} size={'small'} />
      <InputRow label={'cellRadius'}>
        <Tooltip tooltip={String(hotspotMode.cellRadius)} className={`${className}__input`} placement={'left'}>
          <Slider value={hotspotMode.cellRadius} onChange={(cellRadius) => setHotspotMode({ ...hotspotMode, cellRadius })} min={50} step={50} max={1000} />
        </Tooltip>
      </InputRow>
      <InputRow label={'表示数'}>
        <Tooltip tooltip={String(hotspotMode.thresholdCount)} className={`${className}__input`} placement={'left'}>
          <Slider
            value={hotspotMode.thresholdCount}
            onChange={(thresholdCount) => setHotspotMode({ ...hotspotMode, thresholdCount })}
            min={1}
            step={1}
            max={20}
          />
        </Tooltip>
      </InputRow>
      <InputRow label={'重複'}>
        <Switch
          label={'skipDuplication'}
          onChange={(skipNearDuplication) => setHotspotMode({ ...hotspotMode, skipNearDuplication })}
          checked={hotspotMode.skipNearDuplication}
          size={'small'}
        />
      </InputRow>
    </InlineFlexColumn>
  );
};

const MapContent: FC<HeatmapMenuProps> = ({ className, mapOptions, model }) => {
  const { theme } = useSharedTheme();
  const { setGeneral, general } = useCanvasState();
  return (
    <InlineFlexColumn gap={8}>
      <InputRow label={'visualize map'}>
        <Selector
          className={`${className}__inputNewLine`}
          onChange={(mapName) => setGeneral({ ...general, mapName })}
          options={mapOptions}
          value={general.mapName}
          disabled={mapOptions.length === 0}
        />
      </InputRow>
      {model && (
        <Toggle label={<Text text={'map'} />} className={`${className}__toggle`} buttonStyle={toggleButtonStyle(theme)}>
          <div className={`${className}__meshesRow`}>
            <ObjectToggleList model={model} />
          </div>
        </Toggle>
      )}
    </InlineFlexColumn>
  );
};

const GeneralContent: FC<HeatmapMenuProps> = ({ className }) => {
  const { theme } = useSharedTheme();
  const { general, setGeneral } = useCanvasState();
  const handleReload = useCallback(() => {
    canvasEventBus.emit('invalidate');
  }, []);
  return (
    <InlineFlexColumn gap={8}>
      <Toggle label={<Text text={'general'} />} className={`${className}__toggle`} buttonStyle={toggleButtonStyle(theme)}>
        <InputRow label={'上向ベクトル'}>
          <InlineFlexRow gap={8} align={'center'}>
            <Text text='y' fontSize={fontSizes.medium} />
            <Switch label={'z up'} onChange={(value) => setGeneral({ ...general, upZ: value })} checked={general.upZ} size={'small'} />
            <Text text='z' fontSize={fontSizes.medium} />
          </InlineFlexRow>
        </InputRow>
        <InputRow label={'scale'}>
          <Tooltip tooltip={String(general.scale)} className={`${className}__input`} placement={'left'}>
            <Slider value={general.scale} onChange={(scale) => setGeneral({ ...general, scale })} min={0.1} step={0.05} max={1.0} />
          </Tooltip>
        </InputRow>
        <InputRow label={'showHeatmap'}>
          <Switch label={'showHeatmap'} onChange={(showHeatmap) => setGeneral({ ...general, showHeatmap })} checked={general.showHeatmap} size={'small'} />
        </InputRow>
        <InputRow label={'blockSize'}>
          <Tooltip tooltip={String(general.blockSize)} className={`${className}__input`} placement={'left'}>
            <Slider value={general.blockSize} onChange={(blockSize) => setGeneral({ ...general, blockSize })} min={50} step={50} max={500} />
          </Tooltip>
        </InputRow>
        <InputRow label={'minThreshold'}>
          <Tooltip tooltip={String(general.minThreshold)} className={`${className}__input`} placement={'left'}>
            <Slider value={general.minThreshold} onChange={(minThreshold) => setGeneral({ ...general, minThreshold })} min={0} step={0.001} max={0.3} />
          </Tooltip>
        </InputRow>
      </Toggle>
      <InputRow label={''}>
        <div style={{ flex: 1 }} />
        <Button onClick={handleReload} scheme={'surface'} fontSize={'small'}>
          <Text text={'Reload'} fontSize={fontSizes.small} />
        </Button>
      </InputRow>
    </InlineFlexColumn>
  );
};

const EventLogContent: FC<HeatmapMenuProps> = ({ className, eventLogKeys }) => {
  const { eventLogs, setEventLogs } = useCanvasState();

  useEffect(() => {
    if (eventLogKeys) {
      // 現在のキー列を取り出す
      const currentKeys = eventLogs.map((e) => e.key);

      const setA = new Set(eventLogKeys);
      const setB = new Set(currentKeys);
      const isSameSet = setA.size === setB.size && [...setA].every((k) => setB.has(k));
      if (isSameSet) {
        return;
      }
      const eventLogDats: EventLogData[] = eventLogKeys.map((key) => {
        const index = eventLogs.findIndex((e) => e.key === key);
        return {
          key,
          visible: index !== -1 ? eventLogs[index].visible : false,
          color: eventLogs[index]?.color || '#000000',
        };
      });
      setEventLogs(eventLogDats);
    }
  }, [eventLogKeys, eventLogs, setEventLogs]);

  return (
    <InlineFlexColumn gap={8}>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={'Event Log'} fontSize={fontSizes.large1} fontWeight={fontWeights.bold} />
      </InlineFlexRow>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={'Event Log Keys'} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        {eventLogKeys?.map((key) => {
          const index = eventLogs.findIndex((e) => e.key === key);
          return (
            <InputRow key={key} label={key}>
              <Switch
                label={key}
                onChange={(checked) => {
                  const newEventLogs = eventLogs.map((e) => ({ ...e }));
                  if (index !== -1) {
                    newEventLogs[index].visible = checked;
                  } else {
                    newEventLogs.push({ key, visible: checked, color: '#000000' });
                  }
                  setEventLogs(newEventLogs);
                }}
                checked={index !== -1 ? eventLogs[index].visible : false}
                size={'small'}
              />
              <input
                type={'color'}
                color={eventLogs[index]?.color}
                onChange={(e) => {
                  const newEventLogs = eventLogs.map((e) => ({ ...e }));
                  if (index !== -1) {
                    newEventLogs[index].color = e.target.value;
                  } else {
                    newEventLogs.push({ key, visible: false, color: e.target.value });
                  }
                  setEventLogs(newEventLogs);
                }}
              />
            </InputRow>
          );
        })}
      </InlineFlexRow>
    </InlineFlexColumn>
  );
};

type Menus = 'info' | 'map' | 'general' | 'hotspot' | 'eventlog';

const Contents = [
  { name: 'info', Component: InfoContent },
  { name: 'general', Component: GeneralContent },
  { name: 'map', Component: MapContent },
  { name: 'hotspot', Component: HotspotContent },
  { name: 'eventlog', Component: EventLogContent },
];

const Component: FC<HeatmapMenuProps> = (props) => {
  const { theme } = useSharedTheme();
  const { className, isMenuOpen, toggleMenu, mapOptions } = props;
  const { general, setGeneral } = useCanvasState();

  const [menu, setMenu] = useState<Menus>('info');

  useEffect(() => {
    if ((!general.mapName || general.mapName === '') && mapOptions.length > 0) {
      setGeneral({ ...general, mapName: mapOptions[0] });
    } else if (mapOptions.length === 0 && general.mapName) {
      setGeneral({ ...general, mapName: '' });
    }
  }, [general, general.mapName, mapOptions, setGeneral]);
  const content = useMemo(() => Contents.find((content) => content.name === menu), [menu]);
  return (
    <div>
      <Card className={`${className}`} color={theme.colors.surface.light} shadow={'medium'} padding={'0'}>
        <FlexRow>
          {isMenuOpen && (
            <FlexColumn className={`${className}__content`} gap={8} align={'center'}>
              <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
                <Text text={'Edit'} fontSize={fontSizes.large1} fontWeight={fontWeights.bold} />
              </InlineFlexRow>
              {content && <content.Component {...props} />}
            </FlexColumn>
          )}
          <FlexColumn className={`${className}__menu`} gap={4} align={'center'}>
            <div className={`${className}__menuButton`}>
              <Button onClick={() => toggleMenu(!isMenuOpen)} scheme={'none'} fontSize={'large3'}>
                {isMenuOpen ? <MdKeyboardDoubleArrowRight /> : <MdKeyboardDoubleArrowLeft />}
              </Button>
            </div>
            <div className={`${className}__menuButton`}>
              <Button onClick={() => setMenu('info')} scheme={'none'} fontSize={'large3'}>
                <IoIosInformationCircleOutline />
              </Button>
            </div>
            <div className={`${className}__menuButton`}>
              <Button onClick={() => setMenu('general')} scheme={'none'} fontSize={'large3'}>
                <BsPerson />
              </Button>
            </div>
            <div className={`${className}__menuButton`}>
              <Tooltip tooltip={'map'}>
                <Button onClick={() => setMenu('map')} scheme={'none'} fontSize={'largest'}>
                  <CiMap />
                </Button>
              </Tooltip>
            </div>
            <div className={`${className}__menuButton`}>
              <Tooltip tooltip={'hotspot'}>
                <Button onClick={() => setMenu('hotspot')} scheme={'none'} fontSize={'largest'}>
                  <CiMapPin />
                </Button>
              </Tooltip>
            </div>
            <div className={`${className}__menuButton`}>
              <Tooltip tooltip={'custom event'}>
                <Button onClick={() => setMenu('eventlog')} scheme={'none'} fontSize={'largest'}>
                  <CiStreamOn />
                </Button>
              </Tooltip>
            </div>
          </FlexColumn>
        </FlexRow>
      </Card>
    </div>
  );
};

export const HeatmapMenu = styled(Component)`
  max-width: 380px;
  max-height: 60vh;

  &__menu {
    width: 20px;
    height: 100%;
    padding: 8px;
    overflow: hidden auto;
  }

  &__menuButton {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  &__content {
    flex: 1;
    align-items: start;
    width: 100%;
    padding: 16px;
    overflow: hidden auto;
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  &__toggle {
    width: 100%;
    background: none;
    border: none;
  }

  &__meshesRow {
    max-height: 200px;
    padding: 0 8px;
    overflow: hidden auto;
  }

  &__row {
    width: 100%;
  }

  &__label {
    width: 120px;
  }

  &__input {
    flex: 1;
    width: fit-content;
    padding: 0 8px;
  }

  &__inputNewLine {
    width: 100%;
    padding: 0 8px;
  }
`;
