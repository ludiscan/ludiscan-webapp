import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useRef, useState } from 'react';
import { IoChevronDown, IoChevronUp, IoClose, IoCubeOutline, IoCloudUploadOutline } from 'react-icons/io5';

import type { HeatmapMenuProps, LocalModelData } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC, DragEvent } from 'react';

import { Button } from '@src/component/atoms/Button';
import { DraggableNumberInput } from '@src/component/atoms/DraggableNumberInput';
import { FileInput } from '@src/component/atoms/FileInput';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { getModelFileType } from '@src/features/heatmap/ModelLoader';
import { ObjectToggleList } from '@src/features/heatmap/ObjectToggleList';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useGeneralPatch, useGeneralPick, useGeneralSelect } from '@src/hooks/useGeneral';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useUploadMapData } from '@src/hooks/useUploadMapData';

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

// アニメーション定義
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(196, 30, 58, 0); }
  50% { box-shadow: 0 0 12px 2px rgba(196, 30, 58, 0.3); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ドラッグ＆ドロップゾーン
const DropZone = styled.div<{ isDragging: boolean; isLoading: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 16px;
  overflow: hidden;
  cursor: ${({ isLoading }) => (isLoading ? 'wait' : 'pointer')};
  background: ${({ theme, isDragging }) =>
    isDragging ? `linear-gradient(135deg, ${theme.colors.primary.dark}15, ${theme.colors.primary.main}10)` : theme.colors.surface.sunken};
  border: 2px dashed ${({ theme, isDragging }) => (isDragging ? theme.colors.primary.main : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary.dark}08, ${theme.colors.primary.main}05)`};
    border-color: ${({ theme }) => theme.colors.primary.light};
  }

  ${({ isDragging }) =>
    isDragging &&
    css`
      animation: ${pulseGlow} 1.5s ease-in-out infinite;
    `}

  ${({ isLoading, theme }) =>
    isLoading &&
    css`
      &::after {
        position: absolute;
        inset: 0;
        content: '';
        background: linear-gradient(90deg, transparent, ${theme.colors.primary.main}20, transparent);
        background-size: 200% 100%;
        animation: ${shimmer} 1.5s infinite;
      }
    `}
`;

const DropZoneIcon = styled.div<{ isDragging: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: ${({ theme, isDragging }) => (isDragging ? theme.colors.primary.main : theme.colors.text.tertiary)};
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  transition: all 0.3s ease;
  ${({ isDragging }) =>
    isDragging &&
    css`
      animation: ${floatAnimation} 1s ease-in-out infinite;
    `}
`;

const DropZoneText = styled.div`
  text-align: center;
`;

const DropZoneTitle = styled.p`
  margin: 0 0 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DropZoneSubtitle = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const FileTypeBadges = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const FileTypeBadge = styled.span`
  padding: 2px 8px;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
`;

// プレビュー表示セクション
const PreviewCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.surface.base}, ${theme.colors.surface.raised})`};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const PreviewHeader = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PreviewIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: ${({ theme }) => theme.colors.primary.main};
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary.main}15, ${theme.colors.primary.light}10)`};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  animation: ${floatAnimation} 3s ease-in-out infinite;
`;

const PreviewInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const PreviewFileName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
`;

const PreviewMeta = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PreviewBadge = styled.span`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.semantic.info.contrast};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${({ theme }) => theme.colors.semantic.info.main};
  border-radius: ${({ theme }) => theme.borders.radius.full};
`;

const PreviewFileType = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface.hover};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.semantic.error.main};
    background: ${({ theme }) => theme.colors.semantic.error.light};
  }
`;

const PreviewNote = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surface.sunken};
  border-radius: ${({ theme }) => theme.borders.radius.md};

  &::before {
    flex-shrink: 0;
    width: 4px;
    height: 4px;
    content: '';
    background: ${({ theme }) => theme.colors.semantic.info.main};
    border-radius: 50%;
  }
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

export const MapMenuContent: FC<HeatmapMenuProps> = ({
  mapOptions,
  model,
  dimensionality,
  service,
  localModel,
  onLocalModelChange,
  mapActiveOnly,
  onMapActiveOnlyChange,
}) => {
  const { theme } = useSharedTheme();
  const mapName = useGeneralSelect((s) => s.mapName);
  const { modelPositionX, modelPositionY, modelPositionZ, modelRotationX, modelRotationY, modelRotationZ, showMapIn2D } = useGeneralPick(
    'modelPositionX',
    'modelPositionY',
    'modelPositionZ',
    'modelRotationX',
    'modelRotationY',
    'modelRotationZ',
    'showMapIn2D',
  );
  const setData = useGeneralPatch();
  const uploadMapData = useUploadMapData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; status: 'success' | 'error' | 'info' } | null>(null);
  const [isAlignmentOpen, setIsAlignmentOpen] = useState(false);
  const [isObjectListOpen, setIsObjectListOpen] = useState(false);

  // ドラッグ＆ドロップ用の状態
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleAddWaypoint = useCallback(() => {
  //   heatMapEventBus.emit('add-waypoint');
  // }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setStatusMessage(null);
  }, []);

  // ローカルファイルプレビュー用のファイル選択ハンドラ
  const handleLocalPreviewFileSelect = useCallback(
    async (file: File | null) => {
      if (!file || !onLocalModelChange) {
        return;
      }

      const fileType = getModelFileType(file.name);
      if (!fileType) {
        setStatusMessage({ text: 'Unsupported file format. Please use .obj or .fbx', status: 'error' });
        return;
      }

      setIsLoadingPreview(true);
      try {
        const buffer = await file.arrayBuffer();
        const data: LocalModelData = {
          buffer,
          fileType,
          fileName: file.name,
        };
        onLocalModelChange(data);
      } catch (error) {
        setStatusMessage({
          text: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: 'error',
        });
      } finally {
        setIsLoadingPreview(false);
      }
    },
    [onLocalModelChange],
  );

  // ローカルプレビューをクリアするハンドラ
  const handleClearLocalPreview = useCallback(() => {
    if (onLocalModelChange) {
      onLocalModelChange(null);
    }
  }, [onLocalModelChange]);

  // ドラッグ＆ドロップハンドラ
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleLocalPreviewFileSelect(files[0]);
      }
    },
    [handleLocalPreviewFileSelect],
  );

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleLocalPreviewFileSelect(files[0]);
      }
      // リセットして同じファイルを再選択できるようにする
      e.target.value = '';
    },
    [handleLocalPreviewFileSelect],
  );

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

  const is2DMode = dimensionality === '2d';

  // 2Dモードでマップ表示がOFFかつマップが選択されていない場合のメッセージ
  // ローカルモデルがある場合は常に表示を有効にする
  const showMapEnabled = !is2DMode || showMapIn2D || !!localModel;

  return (
    <>
      {/* 2Dモードの場合、マップ表示のON/OFFトグルを表示 */}
      {is2DMode && (
        <>
          <InputRow label={'Show map in 2D'}>
            <Switch label='Show map in 2D mode' checked={showMapIn2D} onChange={(checked) => setData({ showMapIn2D: checked })} size='small' />
          </InputRow>
          <VerticalSpacer size={8} />
        </>
      )}

      <InputRow label={'visualize map'}>
        <Selector
          onChange={(mapName) => {
            setData({ mapName });
          }}
          options={mapOptions}
          value={mapName}
          fontSize={'sm'}
          disabled={mapOptions.length === 0 || (is2DMode && !showMapIn2D) || !!localModel}
        />
      </InputRow>
      {onMapActiveOnlyChange && (
        <InputRow label={'active maps only'}>
          <Switch label='Show only maps with uploaded data' checked={mapActiveOnly ?? true} onChange={onMapActiveOnlyChange} size='small' />
        </InputRow>
      )}

      {/* ローカルファイル一時表示セクション */}
      {onLocalModelChange && (
        <>
          <VerticalSpacer size={12} />
          <FlexColumn gap={4}>
            <Text text='Local Preview' fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
            {localModel ? (
              <PreviewCard>
                <PreviewHeader>
                  <PreviewIconWrapper>
                    <IoCubeOutline size={22} />
                  </PreviewIconWrapper>
                  <PreviewInfo>
                    <PreviewFileName>{localModel.fileName}</PreviewFileName>
                    <PreviewMeta>
                      <PreviewBadge>Preview</PreviewBadge>
                      <PreviewFileType>.{localModel.fileType}</PreviewFileType>
                    </PreviewMeta>
                  </PreviewInfo>
                  <CloseButton onClick={handleClearLocalPreview} title='Clear preview'>
                    <IoClose size={16} />
                  </CloseButton>
                </PreviewHeader>
                <PreviewNote>Temporary preview only — not uploaded to server</PreviewNote>
              </PreviewCard>
            ) : (
              <>
                {/* 隠れたファイルinput */}
                <input type='file' ref={fileInputRef} accept='.obj,.fbx' onChange={handleFileInputChange} style={{ display: 'none' }} />
                {/* ドラッグ＆ドロップゾーン */}
                <DropZone
                  isDragging={isDragging}
                  isLoading={isLoadingPreview}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleDropZoneClick}
                >
                  <DropZoneIcon isDragging={isDragging}>{isDragging ? <IoCubeOutline size={24} /> : <IoCloudUploadOutline size={24} />}</DropZoneIcon>
                  <DropZoneText>
                    <DropZoneTitle>{isDragging ? 'Drop to preview' : isLoadingPreview ? 'Loading...' : 'Drop 3D model here'}</DropZoneTitle>
                    <DropZoneSubtitle>{isLoadingPreview ? 'Processing file...' : 'or click to browse'}</DropZoneSubtitle>
                  </DropZoneText>
                  <FileTypeBadges>
                    <FileTypeBadge>.obj</FileTypeBadge>
                    <FileTypeBadge>.fbx</FileTypeBadge>
                  </FileTypeBadges>
                </DropZone>
              </>
            )}
          </FlexColumn>
        </>
      )}

      {/* マップ表示がONの場合のみ、以下の機能を表示 */}
      {showMapEnabled && (
        <>
          {/*<Button scheme={'surface'} fontSize={'base'} onClick={handleAddWaypoint}>*/}
          {/*  <Text text={'add waypoint'} />*/}
          {/*</Button>*/}
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
          {model && (mapName || localModel) && (
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
              <Text text={`Upload 3D Model for "${mapName}"`} fontSize={theme.typography.fontSize.base} />
              <UploadRow>
                <FileInput accept='.obj,.fbx' onChange={handleFileSelect} buttonText='Select OBJ/FBX File' fontSize='sm' />
                {selectedFile && <FileName>{selectedFile.name}</FileName>}
              </UploadRow>
              <Button scheme={'primary'} fontSize={'base'} onClick={handleUpload} disabled={!selectedFile || uploadMapData.isPending}>
                <Text text={uploadMapData.isPending ? 'Uploading...' : 'Upload'} />
              </Button>
              {statusMessage && <StatusMessage status={statusMessage.status}>{statusMessage.text}</StatusMessage>}
            </UploadSection>
          )}
        </>
      )}
      <VerticalSpacer size={12} />
    </>
  );
};
