import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { DraggableNumberInput } from '@src/component/atoms/DraggableNumberInput';
import { FileInput } from '@src/component/atoms/FileInput';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { ObjectToggleList } from '@src/features/heatmap/ObjectToggleList';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useGeneralPatch, useGeneralPick, useGeneralSelect } from '@src/hooks/useGeneral';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useUploadMapData } from '@src/hooks/useUploadMapData';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

const DisabledMessage = styled.div`
  padding: 16px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: #666;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
`;

const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;
`;

const UploadRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const FileName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const StatusMessage = styled.div<{ status: 'success' | 'error' | 'info' }>`
  padding: 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border-radius: 4px;
  ${({ status, theme }) => {
    if (status === 'success') {
      return `
        color: ${theme.colors.semantic.success.contrast};
        background-color: ${theme.colors.semantic.success.main};
      `;
    }
    if (status === 'error') {
      return `
        color: ${theme.colors.semantic.error.contrast};
        background-color: ${theme.colors.semantic.error.main};
      `;
    }
    return `
      color: ${theme.colors.text.secondary};
      background-color: ${theme.colors.surface.base};
    `;
  }}
`;

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

export const MapMenuContent: FC<HeatmapMenuProps> = ({ mapOptions, model, dimensionality, service }) => {
  const { theme } = useSharedTheme();
  const mapName = useGeneralSelect((s) => s.mapName);
  const { modelPositionX, modelPositionY, modelPositionZ, modelRotationX, modelRotationY, modelRotationZ } = useGeneralPick(
    'modelPositionX',
    'modelPositionY',
    'modelPositionZ',
    'modelRotationX',
    'modelRotationY',
    'modelRotationZ',
  );
  const setData = useGeneralPatch();
  const uploadMapData = useUploadMapData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; status: 'success' | 'error' | 'info' } | null>(null);
  const [isAlignmentOpen, setIsAlignmentOpen] = useState(false);
  const [isObjectListOpen, setIsObjectListOpen] = useState(false);

  const handleAddWaypoint = useCallback(() => {
    heatMapEventBus.emit('add-waypoint');
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setStatusMessage(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !mapName) {
      setStatusMessage({ text: 'Please select a file and a map name', status: 'error' });
      return;
    }

    setStatusMessage({ text: 'Uploading...', status: 'info' });

    try {
      await uploadMapData.mutateAsync({
        mapName: mapName,
        file: selectedFile,
      });
      setStatusMessage({ text: 'Upload successful!', status: 'success' });
      setSelectedFile(null);
    } catch (error) {
      setStatusMessage({
        text: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
      });
    }
  }, [selectedFile, mapName, uploadMapData]);

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
      <VerticalSpacer size={12} />
      {model && mapName && (
        <CollapsibleSection>
          <CollapsibleHeader onClick={() => setIsObjectListOpen(!isObjectListOpen)}>
            <span>Model Objects</span>
            {isObjectListOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
          </CollapsibleHeader>
          <CollapsibleContent isOpen={isObjectListOpen}>
            <ObjectToggleList mapName={mapName} model={model} />
          </CollapsibleContent>
        </CollapsibleSection>
      )}

      {/* OBJモデル位置・回転調整セクション */}
      {model && mapName && (
        <CollapsibleSection>
          <CollapsibleHeader onClick={() => setIsAlignmentOpen(!isAlignmentOpen)}>
            <span>Model Alignment</span>
            {isAlignmentOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
          </CollapsibleHeader>
          <CollapsibleContent isOpen={isAlignmentOpen}>
            <InputRow label={'Position'}>
              <FlexRow gap={4} align='center'>
                <DraggableNumberInput label='X' value={modelPositionX} onChange={(v) => setData({ modelPositionX: v })} step={1} precision={0} />
                <DraggableNumberInput label='Y' value={modelPositionY} onChange={(v) => setData({ modelPositionY: v })} step={1} precision={0} />
                <DraggableNumberInput label='Z' value={modelPositionZ} onChange={(v) => setData({ modelPositionZ: v })} step={1} precision={0} />
              </FlexRow>
            </InputRow>
            <InputRow label={'Rotation'}>
              <FlexRow gap={4} align='center'>
                <DraggableNumberInput
                  label='X'
                  value={modelRotationX}
                  onChange={(v) => setData({ modelRotationX: v })}
                  min={-180}
                  max={180}
                  step={1}
                  precision={0}
                />
                <DraggableNumberInput
                  label='Y'
                  value={modelRotationY}
                  onChange={(v) => setData({ modelRotationY: v })}
                  min={-180}
                  max={180}
                  step={1}
                  precision={0}
                />
                <DraggableNumberInput
                  label='Z'
                  value={modelRotationZ}
                  onChange={(v) => setData({ modelRotationZ: v })}
                  min={-180}
                  max={180}
                  step={1}
                  precision={0}
                />
              </FlexRow>
            </InputRow>
            <InputRow label={''}>
              <Button
                scheme={'tertiary'}
                fontSize={'sm'}
                onClick={() =>
                  setData({
                    modelPositionX: 0,
                    modelPositionY: 0,
                    modelPositionZ: 0,
                    modelRotationX: 0,
                    modelRotationY: 0,
                    modelRotationZ: 0,
                  })
                }
              >
                <Text text={'Reset'} fontSize={theme.typography.fontSize.sm} />
              </Button>
            </InputRow>
          </CollapsibleContent>
        </CollapsibleSection>
      )}

      {!service.isEmbed && mapName && (
        <UploadSection>
          <Text text={`Upload OBJ for "${mapName}"`} fontSize={theme.typography.fontSize.base} />
          <UploadRow>
            <FileInput accept='.obj' onChange={handleFileSelect} buttonText='Select OBJ File' fontSize='sm' />
            {selectedFile && <FileName>{selectedFile.name}</FileName>}
          </UploadRow>
          <Button scheme={'primary'} fontSize={'base'} onClick={handleUpload} disabled={!selectedFile || uploadMapData.isPending}>
            <Text text={uploadMapData.isPending ? 'Uploading...' : 'Upload'} />
          </Button>
          {statusMessage && <StatusMessage status={statusMessage.status}>{statusMessage.text}</StatusMessage>}
        </UploadSection>
      )}
      <VerticalSpacer size={12} />
    </>
  );
};
