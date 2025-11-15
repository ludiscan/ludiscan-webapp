import styled from '@emotion/styled';
import { useCallback } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { ObjectToggleList } from '@src/features/heatmap/ObjectToggleList';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useGeneralPatch, useGeneralSelect } from '@src/hooks/useGeneral';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

const DisabledMessage = styled.div`
  padding: 16px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: #666;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
`;

export const MapMenuContent: FC<HeatmapMenuProps> = ({ mapOptions, model, dimensionality }) => {
  const { theme } = useSharedTheme();
  const mapName = useGeneralSelect((s) => s.mapName);
  const setData = useGeneralPatch();
  const handleAddWaypoint = useCallback(() => {
    heatMapEventBus.emit('add-waypoint');
  }, []);

  // 2Dモードではマップ機能を無効化
  if (dimensionality === '2d') {
    return (
      <FlexColumn gap={12}>
        <DisabledMessage>
          <Text text={'Map visualization is only available in 3D mode.'} fontSize={theme.typography.fontSize.base} />
          <Text text={'Switch to 3D mode using the toggle button in the toolbar.'} fontSize={theme.typography.fontSize.sm} />
        </DisabledMessage>
      </FlexColumn>
    );
  }

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
