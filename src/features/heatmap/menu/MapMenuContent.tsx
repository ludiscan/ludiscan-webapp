import { useCallback } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { ObjectToggleList } from '@src/features/heatmap/ObjectToggleList';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useGeneralState } from '@src/hooks/useHeatmapState';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export const MapMenuContent: FC<HeatmapMenuProps> = ({ className, mapOptions, model }) => {
  const { data: general, setData } = useGeneralState();
  const handleAddWaypoint = useCallback(() => {
    heatMapEventBus.emit('add-waypoint');
  }, []);
  return (
    <>
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
      {model && general.mapName && <ObjectToggleList mapName={general.mapName} model={model} />}
    </>
  );
};
