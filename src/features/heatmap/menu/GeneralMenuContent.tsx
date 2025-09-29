import { useCallback } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { GeneralSettings } from '@src/modeles/heatmapView';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { SegmentedSwitch } from '@src/component/molecules/SegmentedSwitch';
import { Selector } from '@src/component/molecules/Selector';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useGeneralState } from '@src/hooks/useHeatmapState';
import { fontSizes } from '@src/styles/style';

export const GeneralMenuContent: FC<HeatmapMenuProps> = () => {
  const { data: general, setData } = useGeneralState();
  const handleReload = useCallback(() => {}, []);
  return (
    <>
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
      <InputRow label={'scale'}>
        <Slider value={general.scale} onChange={(scale) => setData({ ...general, scale })} min={0.1} step={0.05} max={1.0} textField />
      </InputRow>
      <InputRow label={'showHeatmap'}>
        <div>
          <Switch label={'showHeatmap'} onChange={(showHeatmap) => setData({ ...general, showHeatmap })} checked={general.showHeatmap} size={'small'} />
        </div>
      </InputRow>
      <InputRow label={'opacity'}>
        <Slider
          value={general.heatmapOpacity}
          min={0.0}
          max={1.0}
          step={0.1}
          onChange={(value) => setData({ ...general, heatmapOpacity: value })}
          disabled={!general.showHeatmap}
          textField
        />
      </InputRow>
      <InputRow label={'type'}>
        <Selector
          options={['object', 'fill']}
          value={general.heatmapType}
          onChange={(v) => {
            setData({ ...general, heatmapType: v as GeneralSettings['heatmapType'] });
          }}
          fontSize={'medium'}
        />
      </InputRow>
      <InputRow label={'blockSize'}>
        <Slider value={general.blockSize} onChange={(blockSize) => setData({ ...general, blockSize })} min={50} step={50} max={500} textField />
      </InputRow>
      <InputRow label={'minThreshold'}>
        <Slider value={general.minThreshold} onChange={(minThreshold) => setData({ ...general, minThreshold })} min={0} step={0.001} max={0.5} textField />
      </InputRow>
      <InputRow label={'color scale'}>
        <Slider value={general.colorScale} onChange={(colorScale) => setData({ ...general, colorScale })} min={0.1} step={0.1} max={5} textField />
      </InputRow>
      <InputRow label={''}>
        <div style={{ flex: 1 }} />
        <Button onClick={handleReload} scheme={'surface'} fontSize={'small'}>
          <Text text={'Reload'} fontSize={fontSizes.small} />
        </Button>
      </InputRow>
    </>
  );
};
