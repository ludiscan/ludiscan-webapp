import styled from '@emotion/styled';
import { useCallback } from 'react';

import type { FC } from 'react';

import { Button } from '@/component/atoms/Button.tsx';
import { Card } from '@/component/atoms/Card.tsx';
import { FlexColumn, InlineFlexRow } from '@/component/atoms/Flex.tsx';
import { Slider } from '@/component/atoms/Slider.tsx';
import { Switch } from '@/component/atoms/Switch.tsx';
import { Text } from '@/component/atoms/Text.tsx';
import { Toggle } from '@/component/atoms/Toggle.tsx';
import { Tooltip } from '@/component/atoms/Tooltip.tsx';
import { useCanvasState } from '@/hooks/useCanvasState.ts';
import { useSharedTheme } from '@/hooks/useSharedTheme.tsx';
import { fontSizes } from '@/styles/style.ts';
import { canvasEventBus } from '@/utils/canvasEventBus.ts';

export type HeatmapMenuProps = {
  className?: string | undefined;
  isMenuOpen: boolean;
  toggleMenu: (value: boolean) => void;
};

const Component: FC<HeatmapMenuProps> = ({ className, isMenuOpen, toggleMenu }) => {
  const { theme } = useSharedTheme();
  const { general, setGeneral, version, setHotspotMode, hotspotMode } = useCanvasState();
  const handleReload = useCallback(() => {
    canvasEventBus.emit('invalidate');
  }, []);
  return (
    <div>
      <Card className={`${className} ${!isMenuOpen && 'closed'}`} color={theme.colors.surface.light}>
        <FlexColumn className={`${className}__content`} gap={2}>
          <InlineFlexRow align={'space-between'} style={{ width: '100%', padding: '8px' }}>
            <div>Menu</div>
            <div style={{ flex: 1 }} />
            <Button onClick={() => toggleMenu(false)} scheme={'surface'} fontSize={'small'}>
              <Text text={'Close'} />
            </Button>
          </InlineFlexRow>
          <InlineFlexRow align={'center'} gap={4} className={`${className}__row`}>
            <Text text={`version: ${version}`} />
            <div style={{ flex: 1 }} />
            <Button onClick={handleReload} scheme={'surface'} fontSize={'small'}>
              <Text text={'Reload'} />
            </Button>
          </InlineFlexRow>
          <Toggle label={<Text text={'general'} />} className={`${className}__toggle`}>
            <InlineFlexRow align={'center'} gap={4} className={`${className}__row`}>
              <Text text='上向ベクトル' className={`${className}__label`} fontSize={fontSizes.medium} />
              <InlineFlexRow gap={8} align={'center'}>
                <Text text='y' fontSize={fontSizes.medium} />
                <Switch label={'z up'} onChange={(value) => setGeneral({ ...general, upZ: value })} checked={general.upZ} size={'small'} />
                <Text text='z' fontSize={fontSizes.medium} />
              </InlineFlexRow>
            </InlineFlexRow>
            <InlineFlexRow align={'space-between'} gap={4} className={`${className}__row`}>
              <Text text='scale' className={`${className}__label`} fontSize={fontSizes.medium} />
              <Tooltip tooltip={String(general.scale)} className={`${className}__input`} placement={'left'}>
                <Slider value={general.scale} onChange={(scale) => setGeneral({ ...general, scale })} min={0.1} step={0.05} max={1.0} />
              </Tooltip>
            </InlineFlexRow>
            <InlineFlexRow align={'center'} gap={4} className={`${className}__row`}>
              <Text text='showHeatmap' className={`${className}__label`} fontSize={fontSizes.medium} />
              <Switch label={'showHeatmap'} onChange={(showHeatmap) => setGeneral({ ...general, showHeatmap })} checked={general.showHeatmap} size={'small'} />
            </InlineFlexRow>
            <InlineFlexRow align={'space-between'} gap={4} className={`${className}__row`}>
              <Text text='blockSize' className={`${className}__label`} fontSize={fontSizes.medium} />
              <Tooltip tooltip={String(general.blockSize)} className={`${className}__input`} placement={'left'}>
                <Slider value={general.blockSize} onChange={(blockSize) => setGeneral({ ...general, blockSize })} min={50} step={50} max={500} />
              </Tooltip>
            </InlineFlexRow>
          </Toggle>
          <Toggle
            label={
              <InlineFlexRow align={'center'} style={{ width: '100%' }}>
                <Text text={'hotspot'} />
                <div style={{ flex: 1 }} />
                <Switch label={'visible'} onChange={(visible) => setHotspotMode({ ...hotspotMode, visible })} checked={hotspotMode.visible} size={'small'} />
              </InlineFlexRow>
            }
            className={`${className}__toggle`}
          >
            <InlineFlexRow align={'space-between'} gap={4} className={`${className}__row`}>
              <Text text='cellRadius' className={`${className}__label`} fontSize={fontSizes.medium} />
              <Tooltip tooltip={String(hotspotMode.cellRadius)} className={`${className}__input`} placement={'left'}>
                <Slider
                  value={hotspotMode.cellRadius}
                  onChange={(cellRadius) => setHotspotMode({ ...hotspotMode, cellRadius })}
                  min={50}
                  step={50}
                  max={1000}
                />
              </Tooltip>
            </InlineFlexRow>
            <InlineFlexRow align={'space-between'} gap={4} className={`${className}__row`}>
              <Tooltip tooltip={'上位から何個を表示するか'} placement={'bottom'} className={`${className}__label`}>
                <Text text='表示数' fontSize={fontSizes.medium} />
              </Tooltip>
              <Tooltip tooltip={String(hotspotMode.thresholdCount)} className={`${className}__input`} placement={'left'}>
                <Slider
                  value={hotspotMode.thresholdCount}
                  onChange={(thresholdCount) => setHotspotMode({ ...hotspotMode, thresholdCount })}
                  min={1}
                  step={1}
                  max={20}
                />
              </Tooltip>
            </InlineFlexRow>
            <InlineFlexRow align={'center'} gap={4} className={`${className}__row`}>
              <Tooltip tooltip={'近接するスポットをスキップします'} className={`${className}__label`}>
                <Text text='重複をスキップ' fontSize={fontSizes.medium} />
              </Tooltip>
              <Switch
                label={'skipDuplication'}
                onChange={(skipNearDuplication) => setHotspotMode({ ...hotspotMode, skipNearDuplication })}
                checked={hotspotMode.skipNearDuplication}
                size={'small'}
              />
            </InlineFlexRow>
          </Toggle>
        </FlexColumn>
      </Card>
      {!isMenuOpen && (
        <div>
          <Button onClick={() => toggleMenu(true)} scheme={'none'} fontSize={'small'}>
            <Text text={'Open'} />
          </Button>
        </div>
      )}
    </div>
  );
};

export const HeatmapMenu = styled(Component)`
  width: 300px;
  height: 60vh;

  &.closed {
    display: none;
    width: 0;
  }

  &__content {
    width: 100%;
    overflow: hidden auto;
  }

  &__row {
    width: 100%;
    background: ${({ theme }) => theme.colors.surface.main};
    border-block: 1px solid ${({ theme }) => theme.colors.border.main};
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
