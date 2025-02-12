import styled from '@emotion/styled';

import type { FC } from 'react';

import { Button } from '@/component/atoms/Button.tsx';
import { Card } from '@/component/atoms/Card.tsx';
import { FlexColumn } from '@/component/atoms/Flex.tsx';
import { Text } from '@/component/atoms/Text.tsx';

export type HeatmapMenuProps = {
  className?: string | undefined;
  isMenuOpen: boolean;
  toggleMenu: (value: boolean) => void;
};

const Component: FC<HeatmapMenuProps> = ({ className, isMenuOpen, toggleMenu }) => {
  return (
    <div>
      <Card className={`${className} ${!isMenuOpen && 'closed'}`}>
        <FlexColumn className={`${className}__content`}>
          <div>Menu</div>
          <button onClick={() => toggleMenu(false)}>Close</button>
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
  }
`;
