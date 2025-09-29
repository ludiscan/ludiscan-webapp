import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useHotspotModeState } from '@src/hooks/useHeatmapState';

export const HotspotMenuContent: FC<HeatmapMenuProps> = ({ className }) => {
  const { data: hotspotMode, setData } = useHotspotModeState();
  return (
    <>
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
    </>
  );
};
