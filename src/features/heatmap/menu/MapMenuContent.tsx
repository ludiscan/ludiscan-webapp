import { useCallback } from 'react';

import type { Theme } from '@emotion/react';
import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { CSSProperties, FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { Selector } from '@src/component/molecules/Selector';
import { ObjectToggleList } from '@src/features/heatmap/ObjectToggleList';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useGeneralState } from '@src/hooks/useHeatmapState';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

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

export const MapMenuContent: FC<HeatmapMenuProps> = ({ className, mapOptions, model }) => {
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
