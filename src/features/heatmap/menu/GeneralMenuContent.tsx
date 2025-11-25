import styled from '@emotion/styled';
import { useCallback, useState, useMemo } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useDispatch } from 'react-redux';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { GeneralSettings } from '@src/modeles/heatmapView';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexRow } from '@src/component/atoms/Flex';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { SegmentedSwitch } from '@src/component/molecules/SegmentedSwitch';
import { Selector } from '@src/component/molecules/Selector';
import { HeatmapSelectorModal } from '@src/features/heatmap/menu/HeatmapSelectorModal';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { SessionFilterModal } from '@src/features/heatmap/menu/SessionFilterModal';
import { useGeneralPatch, useGeneralPick } from '@src/hooks/useGeneral';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { focusByCoord } from '@src/slices/selectionSlice';

const CollapsibleSection = styled.div`
  width: 100%;
`;

const CollapsibleHeader = styled.button`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px;
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface.hover};
  border: none;
  border-radius: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.raised};
  }
`;

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  padding-top: 8px;
`;

export const GeneralMenuContent: FC<HeatmapMenuProps> = ({ service }) => {
  const dispatch = useDispatch();
  const { theme } = useSharedTheme();
  const [isSessionFilterModalOpen, setIsSessionFilterModalOpen] = useState(false);
  const [isHeatmapSelectorModalOpen, setIsHeatmapSelectorModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);

  const { upZ, scale, heatmapOpacity, heatmapType, colorScale, blockSize, showHeatmap, minThreshold } = useGeneralPick(
    'upZ',
    'scale',
    'showHeatmap',
    'heatmapOpacity',
    'heatmapType',
    'blockSize',
    'minThreshold',
    'colorScale',
  );
  const setData = useGeneralPatch();

  // Calculate the center position of all heatmap cells
  const centerPosition = useMemo(() => {
    const task = service.task;
    if (!task || !task.result || task.result.length === 0) {
      return null;
    }

    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    const count = task.result.length;

    for (const point of task.result) {
      sumX += point.x;
      sumY += point.y;
      sumZ += point.z ?? 0;
    }

    return {
      x: sumX / count,
      y: sumY / count,
      z: sumZ / count,
    };
  }, [service.task]);

  const handleReload = useCallback(() => {}, []);

  const currentTaskId = service.task?.taskId;

  const handleResetView = useCallback(() => {
    if (centerPosition) {
      dispatch(focusByCoord({ point: centerPosition }));
    }
  }, [centerPosition, dispatch]);

  return (
    <>
      {/* Heatmap選択セクション */}
      <InputRow label={'Heatmap'}>
        <FlexRow gap={8} align='center' style={{ flex: 1 }}>
          <Text text={currentTaskId ? `Task #${currentTaskId}` : '未選択'} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
          <Button onClick={() => setIsHeatmapSelectorModalOpen(true)} scheme={'primary'} fontSize={'sm'}>
            <Text text={'選択'} fontSize={theme.typography.fontSize.sm} />
          </Button>
        </FlexRow>
      </InputRow>

      {/* Reset View ボタン */}
      <InputRow label={'ビュー'}>
        <Button onClick={handleResetView} scheme={'secondary'} fontSize={'sm'} disabled={!centerPosition}>
          <Text text={'初期位置にリセット'} fontSize={theme.typography.fontSize.sm} />
        </Button>
      </InputRow>

      {/* Session Filter ボタン */}
      <InputRow label={'Session Filter'}>
        <Button onClick={() => setIsSessionFilterModalOpen(true)} scheme={'surface'} fontSize={'sm'}>
          <Text text={'セッションフィルター'} fontSize={theme.typography.fontSize.sm} />
        </Button>
      </InputRow>

      {/* 折りたたみ可能なオプションセクション */}
      <CollapsibleSection>
        <CollapsibleHeader onClick={() => setIsOptionsOpen(!isOptionsOpen)}>
          <span>表示オプション</span>
          {isOptionsOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
        </CollapsibleHeader>
        <CollapsibleContent isOpen={isOptionsOpen}>
          <InputRow label={'上向ベクトル'}>
            <SegmentedSwitch
              fontSize={'xs'}
              value={upZ ? 'Z' : 'Y'}
              options={['Y', 'Z']}
              onChange={(v) => {
                setData({ upZ: v === 'Z' });
              }}
            />
          </InputRow>
          <InputRow label={'scale'}>
            <Slider value={scale} onChange={(scale) => setData({ scale })} min={0.1} step={0.05} max={1.0} textField />
          </InputRow>
          <InputRow label={'showHeatmap'}>
            <div>
              <Switch label={'showHeatmap'} onChange={(showHeatmap) => setData({ showHeatmap })} checked={showHeatmap} size={'small'} />
            </div>
          </InputRow>
          <InputRow label={'opacity'}>
            <Slider
              value={heatmapOpacity}
              min={0.0}
              max={1.0}
              step={0.1}
              onChange={(value) => setData({ heatmapOpacity: value })}
              disabled={!showHeatmap}
              textField
            />
          </InputRow>
          <InputRow label={'type'}>
            <Selector
              options={['object', 'fill']}
              value={heatmapType}
              onChange={(v) => {
                setData({ heatmapType: v as GeneralSettings['heatmapType'] });
              }}
              fontSize={'base'}
            />
          </InputRow>
          <InputRow label={'blockSize'}>
            <Slider value={blockSize} onChange={(blockSize) => setData({ blockSize })} min={50} step={50} max={500} textField />
          </InputRow>
          <InputRow label={'minThreshold'}>
            <Slider value={minThreshold} onChange={(minThreshold) => setData({ minThreshold })} min={0} step={0.001} max={0.5} textField />
          </InputRow>
          <InputRow label={'color scale'}>
            <Slider value={colorScale} onChange={(colorScale) => setData({ colorScale })} min={0.1} step={0.1} max={5} textField />
          </InputRow>
          <InputRow label={''}>
            <div style={{ flex: 1 }} />
            <Button onClick={handleReload} scheme={'surface'} fontSize={'sm'}>
              <Text text={'Reload'} fontSize={theme.typography.fontSize.sm} />
            </Button>
          </InputRow>
        </CollapsibleContent>
      </CollapsibleSection>

      <SessionFilterModal isOpen={isSessionFilterModalOpen} onClose={() => setIsSessionFilterModalOpen(false)} service={service} />
      <HeatmapSelectorModal isOpen={isHeatmapSelectorModalOpen} onClose={() => setIsHeatmapSelectorModalOpen(false)} service={service} />
    </>
  );
};
