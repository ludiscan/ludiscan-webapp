import styled from '@emotion/styled';
import { useCallback } from 'react';

import type { FC } from 'react';

import { Button } from '@/component/atoms/Button.tsx';
import { Card } from '@/component/atoms/Card.tsx';
import { FlexColumn, InlineFlexRow } from '@/component/atoms/Flex.tsx';
import { Slider } from '@/component/atoms/Slider.tsx';
import { Switch } from '@/component/atoms/Switch.tsx';
import { Text } from '@/component/atoms/Text.tsx';
import { Tooltip } from '@/component/atoms/Tooltip.tsx';
import { useCanvasState } from '@/hooks/useCanvasState.ts';
import { canvasEventBus } from '@/utils/canvasEventBus.ts';

export type HeatmapMenuProps = {
  className?: string | undefined;
  isMenuOpen: boolean;
  toggleMenu: (value: boolean) => void;
};

const Component: FC<HeatmapMenuProps> = ({ className, isMenuOpen, toggleMenu }) => {
  const { upZ, setUpZ, setScale, scale } = useCanvasState();
  const handleReload = useCallback(() => {
    canvasEventBus.emit('invalidate');
  }, []);
  const handleScale = useCallback(
    (value: number) => {
      setScale(value);
    },
    [setScale],
  );
  const handleZUp = useCallback(
    (z: boolean) => {
      setUpZ(z);
    },
    [setUpZ],
  );
  return (
    <div>
      <Card className={`${className} ${!isMenuOpen && 'closed'}`}>
        <FlexColumn className={`${className}__content`} gap={8}>
          <InlineFlexRow align={'space-between'} style={{ width: '100%' }}>
            <div>Menu</div>
            <div style={{ flex: 1 }} />
            <button onClick={() => toggleMenu(false)}>Close</button>
          </InlineFlexRow>
          <Button onClick={handleReload} scheme={'surface'} fontSize={'small'}>
            <Text text={'Reload'} />
          </Button>
          <InlineFlexRow align={'center'} gap={4} className={`${className}__row`}>
            <Text text='Z up' className={`${className}__label`} />
            <Switch label={'z up'} onChange={handleZUp} checked={upZ} size={'small'} />
          </InlineFlexRow>
          <InlineFlexRow align={'space-between'} gap={4} className={`${className}__row`}>
            <Text text='scale' className={`${className}__label`} />
            <Tooltip tooltip={scale.toString()}>
              <Slider value={scale} onChange={handleScale} />
            </Tooltip>
          </InlineFlexRow>
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
  width: 200px;
  height: 60vh;

  &.closed {
    display: none;
    width: 0;
  }

  &__content {
    overflow-y: auto;
    width: 100%;
  }

  &__row {
    width: 200px;
  }

  &__label {
    width: 50px;
  }
`;
