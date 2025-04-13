import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsPerson } from 'react-icons/bs';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from 'react-icons/md';

import type { Theme } from '@emotion/react';
import type { FC, CSSProperties } from 'react';
import type { Group } from 'three';

import { Button } from '@/component/atoms/Button.tsx';
import { Card } from '@/component/atoms/Card.tsx';
import { FlexColumn, FlexRow, InlineFlexColumn, InlineFlexRow } from '@/component/atoms/Flex.tsx';
import { Selector } from '@/component/atoms/Selector.tsx';
import { Slider } from '@/component/atoms/Slider.tsx';
import { Switch } from '@/component/atoms/Switch.tsx';
import { Text } from '@/component/atoms/Text.tsx';
import { Toggle } from '@/component/atoms/Toggle.tsx';
import { Tooltip } from '@/component/atoms/Tooltip.tsx';
import { useCanvasState } from '@/hooks/useCanvasState.ts';
import { useSharedTheme } from '@/hooks/useSharedTheme.tsx';
import { ObjectToggleList } from '@/pages/heatmap/tasks/[task_id]/ObjectToggleList.tsx';
import { fontSizes, fontWeights } from '@/styles/style.ts';
import { canvasEventBus } from '@/utils/canvasEventBus.ts';

export type HeatmapMenuProps = {
  model: Group | null;
  className?: string | undefined;
  isMenuOpen: boolean;
  toggleMenu: (value: boolean) => void;
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
    <InlineFlexRow align={'flex-end'} gap={4} className={`${className}__row`}>
      <Text text={label} fontSize={fontSizes.small} />
      <div style={{ flex: 1 }} />
      {children}
    </InlineFlexRow>
  );
};

const InfoContent: FC<HeatmapMenuProps> = ({ className }) => {
  const { version } = useCanvasState();

  return (
    <InlineFlexColumn gap={8}>
      <InlineFlexRow className={`${className}__row`} align={'center'} gap={4}>
        <Text text={`version: ${version}`} fontSize={fontSizes.small} />
      </InlineFlexRow>
    </InlineFlexColumn>
  );
};

const GeneralContent: FC<HeatmapMenuProps> = ({ model, className, mapOptions }) => {
  const { theme } = useSharedTheme();
  const { general, setGeneral, setHotspotMode, hotspotMode } = useCanvasState();
  const handleReload = useCallback(() => {
    canvasEventBus.emit('invalidate');
  }, []);
  return (
    <InlineFlexColumn gap={8}>
      <Toggle label={<Text text={'map'} />} className={`${className}__toggle`} buttonStyle={toggleButtonStyle(theme)}>
        <InputRow label={'visualize map'}>
          <Selector
            className={`${className}__input`}
            onChange={(mapName) => setGeneral({ ...general, mapName })}
            options={mapOptions}
            value={general.mapName}
          />
        </InputRow>
        {model && (
          <div className={`${className}__meshesRow`}>
            <ObjectToggleList model={model} />
          </div>
        )}
      </Toggle>

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
      </Toggle>
      <Toggle label={<Text text={'hotspot'} />} className={`${className}__toggle`} buttonStyle={toggleButtonStyle(theme)}>
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

type Menus = 'info' | 'map' | 'general' | 'hotspot';

const Contents = [
  { name: 'info', Component: InfoContent },
  { name: 'general', Component: GeneralContent },
];

const Component: FC<HeatmapMenuProps> = (props) => {
  const { theme } = useSharedTheme();
  const { className, isMenuOpen, toggleMenu, mapOptions } = props;
  const { general, setGeneral } = useCanvasState();

  const [menu, setMenu] = useState<Menus>('info');

  useEffect(() => {
    if ((!general.mapName || general.mapName === '') && mapOptions.length > 0) {
      setGeneral({ ...general, mapName: mapOptions[0] });
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
              <Button onClick={() => setMenu('info')} scheme={'none'} fontSize={'large1'}>
                <IoIosInformationCircleOutline />
              </Button>
            </div>
            <div className={`${className}__menuButton`}>
              <Button onClick={() => setMenu('general')} scheme={'none'} fontSize={'large1'}>
                <BsPerson />
              </Button>
            </div>
          </FlexColumn>
        </FlexRow>
      </Card>
    </div>
  );
};

export const HeatmapMenu = styled(Component)`
  max-width: 280px;
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
`;
