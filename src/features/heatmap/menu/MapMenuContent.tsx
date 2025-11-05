import { useCallback } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { ObjectToggleList } from '@src/features/heatmap/ObjectToggleList';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useGeneralPatch, useGeneralSelect } from '@src/hooks/useGeneral';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export const MapMenuContent: FC<HeatmapMenuProps> = ({ mapOptions, model }) => {
  const mapName = useGeneralSelect((s) => s.mapName);
  const setData = useGeneralPatch();
  const handleAddWaypoint = useCallback(() => {
    heatMapEventBus.emit('add-waypoint');
  }, []);
  return (
    <>
      <InputRow label={'visualize map'}>
        <Selector
          onChange={(mapName) => {
            setData({ mapName });
          }}
          options={mapOptions}
          value={mapName}
          fontSize={'sm'}
          disabled={mapOptions.length === 0}
        />
      </InputRow>
      <Button scheme={'surface'} fontSize={'base'} onClick={handleAddWaypoint}>
        <Text text={'add waypoint'} />
      </Button>
      {model && mapName && <ObjectToggleList mapName={mapName} model={model} />}
    </>
  );
};
