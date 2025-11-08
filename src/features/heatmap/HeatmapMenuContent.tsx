import styled from '@emotion/styled';
import { memo, useEffect, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';

import type { Menus } from '@src/hooks/menuConfig';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Group } from 'three';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { useGeneralPatch, useGeneralSelect } from '@src/hooks/useGeneral';
import { MenuContents } from '@src/hooks/menuConfig';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes, fontWeights, zIndexes } from '@src/styles/style';

export type HeatmapMenuProps = {
  model: Group | null;
  className?: string | undefined;
  name: Menus | undefined;
  toggleMenu: (value: boolean) => void;
  eventLogKeys?: string[] | undefined;
  handleExportView: () => Promise<void>;
  mapOptions: string[];
  service: HeatmapDataService;
  extra?: object;
};

const HeatmapMenuContentComponent: FC<HeatmapMenuProps> = (props) => {
  const { className, name, mapOptions, toggleMenu } = props;
  const mapName = useGeneralSelect((s) => s.mapName);
  const setGeneral = useGeneralPatch();
  const { theme } = useSharedTheme();

  useEffect(() => {
    if ((!mapName || mapName === '') && mapOptions.length > 0) {
      setGeneral({ mapName: mapOptions[0] });
    } else if (mapOptions.length === 0 && mapName) {
      setGeneral({ mapName: '' });
    }
  }, [mapName, mapOptions, setGeneral]);
  const content = useMemo(() => MenuContents.find((content) => content.name === name), [name]);

  if (!content) {
    return null;
  }
  return (
    <Card className={className} padding={'0px'} color={theme.colors.surface.base} blur>
      <InlineFlexRow align={'center'} gap={16} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: zIndexes.header }}>
        <Button onClick={() => toggleMenu(false)} scheme={'none'} fontSize={'sm'}>
          <IoClose />
        </Button>
      </InlineFlexRow>
      <FlexColumn gap={8} align={'flex-start'} className={`${className}__content`}>
        {content && <content.Component {...props} />}
      </FlexColumn>
    </Card>
  );
};

export const HeatmapMenuContent = memo(
  styled(HeatmapMenuContentComponent)`
    position: relative;
    width: 500px;
    height: 100%;
    color: ${({ theme }) => theme.colors.text.primary};

    &__content {
      height: calc(100% - 32px);
      padding: 16px;
      overflow: hidden auto;
    }

    &__toggle {
      width: 100%;
      background: none;
      border: none;
    }

    &__searchBox {
      display: flex;
      gap: 8px;
      align-items: center;
      width: 100%;
      padding: 2px 8px;
      font-size: ${fontSizes.small};
      font-weight: ${fontWeights.bold};
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.raised};
      border-radius: 12px;

      & input {
        flex: 1;
        color: ${({ theme }) => theme.colors.text.primary};
        outline: none;
        background: transparent;
        border: none;
      }
    }

    &__meshesRow {
      max-height: 200px;
      padding: 0 8px;
      overflow: hidden auto;
    }

    &__label {
      width: 120px;
    }

    &__input {
      flex: 1;
      width: fit-content;
      padding: 0 8px;
    }
  `,
  (prev, next) => {
    return (
      prev.className == next.className &&
      prev.name == next.name &&
      prev.mapOptions == next.mapOptions &&
      prev.toggleMenu == next.toggleMenu &&
      prev.service.task == next.service.task &&
      prev.service.projectId == next.service.projectId &&
      prev.service.sessionId == next.service.sessionId
    );
  },
);
