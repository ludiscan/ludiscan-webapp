import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useHotspotModePatch, useHotspotModePick } from '@src/hooks/useHotspotMode';

export const HotspotMenuContent: FC<HeatmapMenuProps> = ({ className }) => {
  const { thresholdCount, cellRadius, visible, skipNearDuplication } = useHotspotModePick('thresholdCount', 'cellRadius', 'visible', 'skipNearDuplication');
  const setData = useHotspotModePatch();
  return (
    <>
      <Switch label={'visible'} onChange={(visible) => setData({ visible })} checked={visible} size={'small'} />
      <InputRow label={'cellRadius'}>
        <Tooltip tooltip={String(cellRadius)} className={`${className}__input`} placement={'left'}>
          <Slider value={cellRadius} onChange={(cellRadius) => setData({ cellRadius })} min={50} step={50} max={1000} />
        </Tooltip>
      </InputRow>
      <InputRow label={'表示数'}>
        <Tooltip tooltip={String(thresholdCount)} className={`${className}__input`} placement={'left'}>
          <Slider value={thresholdCount} onChange={(thresholdCount) => setData({ thresholdCount })} min={1} step={1} max={20} />
        </Tooltip>
      </InputRow>
      <InputRow label={'重複'}>
        <Switch label={'skipDuplication'} onChange={(skipNearDuplication) => setData({ skipNearDuplication })} checked={skipNearDuplication} size={'small'} />
      </InputRow>
    </>
  );
};
