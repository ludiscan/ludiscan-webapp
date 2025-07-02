import { useCallback } from 'react';

import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexColumn } from '@src/component/atoms/Flex';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { SegmentedSwitch } from '@src/component/molecules/SegmentedSwitch';
import { useGeneralState } from '@src/hooks/useHeatmapState';
import { InputColumn, InputRow } from '@src/pages/heatmap/tasks/[task_id]/menu/InputRow';
import { fontSizes } from '@src/styles/style';

export const GeneralMenuContent: FC<HeatmapMenuProps> = () => {
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
