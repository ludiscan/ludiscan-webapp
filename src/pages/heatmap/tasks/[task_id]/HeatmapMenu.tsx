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
import { ClampText } from '@/component/molecules/ClampText.tsx';
import { useCanvasState } from '@/hooks/useCanvasState.ts';
import { canvasEventBus } from '@/utils/canvasEventBus.ts';

export type HeatmapMenuProps = {
  className?: string | undefined;
  isMenuOpen: boolean;
  toggleMenu: (value: boolean) => void;
};

const Component: FC<HeatmapMenuProps> = ({ className, isMenuOpen, toggleMenu }) => {
  const { upZ, setUpZ, setScale, scale, showHeatmap, setShowHeatmap, setBlockSize, blockSize } = useCanvasState();
  const handleReload = useCallback(() => {
    canvasEventBus.emit('invalidate');
  }, []);
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
            <Switch label={'z up'} onChange={setUpZ} checked={upZ} size={'small'} />
          </InlineFlexRow>
          <InlineFlexRow align={'space-between'} gap={4} className={`${className}__row`}>
            <Text text='scale' className={`${className}__label`} />
            <Tooltip tooltip={scale.toString()} className={`${className}__input`} placement={'left'}>
              <Slider value={scale} onChange={setScale} min={0.1} step={0.05} max={1.0} />
            </Tooltip>
          </InlineFlexRow>
          <InlineFlexRow align={'center'} gap={4} className={`${className}__row`}>
            <ClampText text='showHeatmap' className={`${className}__label`} width={'60px'} />
            <Switch label={'showHeatmap'} onChange={setShowHeatmap} checked={showHeatmap} size={'small'} />
          </InlineFlexRow>
          <InlineFlexRow align={'space-between'} gap={4} className={`${className}__row`}>
            <Text text='blockSize' className={`${className}__label`} />
            <Tooltip tooltip={String(blockSize)} className={`${className}__input`} placement={'left'}>
              <Slider value={blockSize} onChange={setBlockSize} min={50} step={50} max={500} />
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
    width: 100%;
    overflow: hidden auto;
  }

  &__row {
    width: 80%;
  }

  &__label {
    width: 60px;
  }

  &__input {
    flex: 1;
    width: fit-content;
  }
`;
