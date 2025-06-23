import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo } from 'react';
import { BiSearch } from 'react-icons/bi';
import { BsGrid, BsPerson } from 'react-icons/bs';
import { CiMap, CiMapPin, CiStreamOn } from 'react-icons/ci';
import { FaFileExport } from 'react-icons/fa';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';

import type { Theme } from '@emotion/react';
import type { EventLogData } from '@src/modeles/heatmapView';
import type { HeatmapTask } from '@src/modeles/heatmaptask';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC, CSSProperties } from 'react';
import type { Group } from 'three';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow, InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { SegmentedSwitch } from '@src/component/molecules/SegmentedSwitch';
import { Selector } from '@src/component/molecules/Selector';
import { TextField } from '@src/component/molecules/TextField';
import { useEventLogsState, useGeneralState, useHotspotModeState, useVersion } from '@src/hooks/useHeatmapState';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { ObjectToggleList } from '@src/pages/heatmap/tasks/[task_id]/ObjectToggleList';
import { EventLogDetail } from '@src/pages/heatmap/tasks/[task_id]/menu/EventLogDetail';
import { InputColumn, InputRow } from '@src/pages/heatmap/tasks/[task_id]/menu/InputRow';
import { fontSizes, fontWeights } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { getRandomPrimitiveColor } from '@src/utils/color';

export type HeatmapMenuProps = {
  model: Group | null;
  className?: string | undefined;
  name: Menus | undefined;
  toggleMenu: (value: boolean) => void;
  eventLogKeys?: string[] | undefined;
  task: HeatmapTask;
  handleExportView: () => Promise<void>;
  mapOptions: string[];
  service: HeatmapDataService;
  extra?: object;
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

const InfoContent: FC<HeatmapMenuProps> = ({ task, handleExportView }) => {
  const { data: version } = useVersion();

  const handleExportHeatmap = useCallback(async () => {
    await handleExportView();
  }, [handleExportView]);

  return (
    <InlineFlexColumn gap={4}>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`version: ${version}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`taskId: ${task.taskId}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`project: ${task.project.name}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      {task.session && (
        <InlineFlexRow align={'center'} gap={4}>
          <Text text={`session: ${task.session.name}`} fontSize={fontSizes.small} />
        </InlineFlexRow>
      )}
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`step size: ${task.stepSize}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={`mode: ${task.zVisible ? '3D' : '2D'}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={8} style={{ marginTop: 8, justifyContent: 'center' }}>
        <Button onClick={handleExportHeatmap} scheme={'primary'} fontSize={'small'}>
          <FaFileExport style={{ marginRight: 4 }} />
          <Text text={'エクスポート'} fontSize={fontSizes.small} fontWeight={fontWeights.bold} />
        </Button>
      </InlineFlexRow>
    </InlineFlexColumn>
  );
};

const HotspotContent: FC<HeatmapMenuProps> = ({ className }) => {
  const { data: hotspotMode, setData } = useHotspotModeState();
  return (
    <InlineFlexColumn gap={8}>
      <Switch label={'visible'} onChange={(visible) => setData({ ...hotspotMode, visible })} checked={hotspotMode.visible} size={'small'} />
      <InputRow label={'cellRadius'}>
        <Tooltip tooltip={String(hotspotMode.cellRadius)} className={`${className}__input`} placement={'left'}>
          <Slider value={hotspotMode.cellRadius} onChange={(cellRadius) => setData({ ...hotspotMode, cellRadius })} min={50} step={50} max={1000} />
        </Tooltip>
      </InputRow>
      <InputRow label={'表示数'}>
        <Tooltip tooltip={String(hotspotMode.thresholdCount)} className={`${className}__input`} placement={'left'}>
          <Slider value={hotspotMode.thresholdCount} onChange={(thresholdCount) => setData({ ...hotspotMode, thresholdCount })} min={1} step={1} max={20} />
        </Tooltip>
      </InputRow>
      <InputRow label={'重複'}>
        <Switch
          label={'skipDuplication'}
          onChange={(skipNearDuplication) => setData({ ...hotspotMode, skipNearDuplication })}
          checked={hotspotMode.skipNearDuplication}
          size={'small'}
        />
      </InputRow>
    </InlineFlexColumn>
  );
};

const MapContent: FC<HeatmapMenuProps> = ({ className, mapOptions, model }) => {
  const { theme } = useSharedTheme();
  const { data: general, setData } = useGeneralState();
  const handleAddWaypoint = useCallback(() => {
    heatMapEventBus.emit('add-waypoint');
  }, []);
  return (
    <InlineFlexColumn gap={8}>
      <InputRow label={'visualize map'}>
        <Selector
          className={`${className}__inputNewLine`}
          onChange={(mapName) => setData({ ...general, mapName })}
          options={mapOptions}
          value={general.mapName}
          fontSize={'small'}
          disabled={mapOptions.length === 0}
        />
      </InputRow>
      <Button scheme={'surface'} fontSize={'medium'} onClick={handleAddWaypoint}>
        <Text text={'add waypoint'} />
      </Button>
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

const GeneralContent: FC<HeatmapMenuProps> = () => {
  const { data: general, setData } = useGeneralState();
  const handleReload = useCallback(() => {}, []);
  return (
    <InlineFlexColumn gap={4}>
      <InputRow label={'上向ベクトル'}>
        <SegmentedSwitch
          fontSize={'smallest'}
          value={general.upZ ? 'Z' : 'Y'}
          options={['Y', 'Z']}
          onChange={(v) => {
            setData({ ...general, upZ: v === 'Z' });
          }}
        />
      </InputRow>
      <InputColumn label={'scale'}>
        <Slider value={general.scale} onChange={(scale) => setData({ ...general, scale })} min={0.1} step={0.05} max={1.0} sideLabel textField />
      </InputColumn>
      <InputRow label={'showHeatmap'}>
        <div>
          <Switch label={'showHeatmap'} onChange={(showHeatmap) => setData({ ...general, showHeatmap })} checked={general.showHeatmap} size={'small'} />
        </div>
      </InputRow>
      <InputColumn label={'blockSize'}>
        <Slider value={general.blockSize} onChange={(blockSize) => setData({ ...general, blockSize })} min={50} step={50} max={500} sideLabel textField />
      </InputColumn>
      <InputColumn label={'minThreshold'}>
        <Slider
          value={general.minThreshold}
          onChange={(minThreshold) => setData({ ...general, minThreshold })}
          min={0}
          step={0.001}
          max={0.3}
          sideLabel
          textField
        />
      </InputColumn>
      <InputRow label={''}>
        <div style={{ flex: 1 }} />
        <Button onClick={handleReload} scheme={'surface'} fontSize={'small'}>
          <Text text={'Reload'} fontSize={fontSizes.small} />
        </Button>
      </InputRow>
    </InlineFlexColumn>
  );
};

const EventLogContent: FC<HeatmapMenuProps> = ({ eventLogKeys }) => {
  const { data: eventLogs, setData: setEventLogs } = useEventLogsState();

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
        // console.log(eventLogs[index]?.color);
        return {
          key,
          visible: index !== -1 ? eventLogs[index].visible : false,
          color: eventLogs[index]?.color || getRandomPrimitiveColor(),
          iconName: eventLogs[index]?.iconName || 'CiStreamOn',
        };
      });
      setEventLogs(eventLogDats);
    }
  }, [eventLogKeys, eventLogs, setEventLogs]);

  return (
    <InlineFlexColumn gap={8}>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={'Event Log'} fontSize={fontSizes.large1} fontWeight={fontWeights.bold} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={'Event Log Keys'} fontSize={fontSizes.small} />
      </InlineFlexRow>
      <InlineFlexRow align={'center'} gap={4}>
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
                    newEventLogs.push({ key, visible: checked, color: '#000000', iconName: 'CiStreamOn' });
                  }
                  setEventLogs(newEventLogs);
                }}
                checked={index !== -1 ? eventLogs[index].visible : false}
                size={'small'}
              />
              {eventLogs[index] && eventLogs[index].color && (
                <input
                  type={'color'}
                  color={eventLogs[index].color}
                  onChange={(e) => {
                    const newEventLogs = eventLogs.map((e) => ({ ...e }));
                    if (index !== -1) {
                      newEventLogs[index].color = e.target.value;
                    } else {
                      newEventLogs.push({ key, visible: false, color: e.target.value, iconName: 'CiStreamOn' });
                    }
                    setEventLogs(newEventLogs);
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

export const MenuContents = [
  {
    name: 'info',
    icon: <IoIosInformationCircleOutline />,
    Component: InfoContent,
  },
  {
    name: 'general',
    icon: <BsPerson />,
    Component: GeneralContent,
  },
  {
    name: 'map',
    icon: <CiMap />,
    Component: MapContent,
  },
  {
    name: 'hotspot',
    icon: <CiMapPin />,
    Component: HotspotContent,
  },
  {
    name: 'eventlog',
    icon: <CiStreamOn />,
    Component: EventLogContent,
  },
  {
    name: 'more',
    icon: <BsGrid />,
    Component: () => <Text text={'More'} fontSize={fontSizes.large1} fontWeight={fontWeights.bold} />,
  },
  {
    name: 'eventLogDetail',
    Component: EventLogDetail,
  },
] as const;

export const SideBarMenus = MenuContents.filter((content) => 'icon' in content);
export type Menus = (typeof MenuContents)[number]['name'];

const Component: FC<HeatmapMenuProps> = (props) => {
  const { className, name, mapOptions, toggleMenu } = props;
  const { data: general, setData: setGeneral } = useGeneralState();

  useEffect(() => {
    if ((!general.mapName || general.mapName === '') && mapOptions.length > 0) {
      setGeneral({ ...general, mapName: mapOptions[0] });
    } else if (mapOptions.length === 0 && general.mapName) {
      setGeneral({ ...general, mapName: '' });
    }
  }, [general, general.mapName, mapOptions, setGeneral]);
  const content = useMemo(() => MenuContents.find((content) => content.name === name), [name]);

  if (!content) {
    return null;
  }
  return (
    <div className={className}>
      <FlexColumn gap={8} align={'flex-start'} className={`${className}__content`}>
        <InlineFlexRow align={'center'} gap={16} style={{ width: '100%' }}>
          <div style={{ flex: 1 }}>
            <FlexRow align={'space-between'} className={`${className}__searchBox`}>
              <TextField fontSize={fontSizes.medium} onChange={() => {}} placeholder={'search menu...'} />
              <BiSearch />
            </FlexRow>
          </div>
          <Button onClick={() => toggleMenu(false)} scheme={'none'} fontSize={'small'}>
            <IoClose />
          </Button>
        </InlineFlexRow>
        {content && <content.Component {...props} />}
      </FlexColumn>
    </div>
  );
};

export const HeatmapMenuContent = styled(Component)`
  width: 280px;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface.main};

  &__content {
    padding: 16px;
    overflow: hidden auto;
  }

  &__toggle {
    width: 100%;
    background: none;
    border: none;
  }

  &__searchBox {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 2px 8px;
    font-size: ${fontSizes.small};
    font-weight: ${fontWeights.bold};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface.dark};
    border-radius: 12px;

    & input {
      flex: 1;
      color: ${({ theme }) => theme.colors.text};
      outline: none;
      background: transparent;
      border: none;
    }
  }

  &__meshesRow {
    max-height: 200px;
    padding: 0 8px;
    overflow: hidden auto;
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
