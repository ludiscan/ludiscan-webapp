import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { DraggableNumberInput } from '@src/component/atoms/DraggableNumberInput';
import { FileInput } from '@src/component/atoms/FileInput';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { useToast } from '@src/component/templates/ToastContext';
import { MapModelPreview } from '@src/features/heatmap/MapModelPreview';
import { getModelFileType } from '@src/features/heatmap/ModelLoader';
import { useImportMap, useMapTransform, useUpdateMapTransform, useUploadMapData } from '@src/hooks/useUploadMapData';
import { createClient } from '@src/modeles/qeury';
import { alignmentToTransform, transformToAlignmentPatch } from '@src/utils/heatmap/modelTransform';

export type ProjectDetailsMapsTabProps = {
  className?: string;
  project: Project;
};

type Alignment = {
  modelPositionX: number;
  modelPositionY: number;
  modelPositionZ: number;
  modelRotationX: number;
  modelRotationY: number;
  modelRotationZ: number;
  scale: number;
};

const IDENTITY: Alignment = {
  modelPositionX: 0,
  modelPositionY: 0,
  modelPositionZ: 0,
  modelRotationX: 0,
  modelRotationY: 0,
  modelRotationZ: 0,
  scale: 1,
};

const Component: FC<ProjectDetailsMapsTabProps> = ({ className, project }) => {
  const { showToast } = useToast();

  const [selectedMap, setSelectedMap] = useState('');
  const [align, setAlign] = useState<Alignment>(IDENTITY);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localBuffer, setLocalBuffer] = useState<ArrayBuffer | null>(null);
  const [localFileType, setLocalFileType] = useState<ModelFileType | null>(null);
  const [importSourceLabel, setImportSourceLabel] = useState('');

  const uploadMapData = useUploadMapData();
  const updateMapTransform = useUpdateMapTransform();
  const importMap = useImportMap();

  // プロジェクトのマップ名一覧
  const { data: maps } = useQuery({
    queryKey: ['projectMaps', project.id],
    queryFn: async () => {
      const { data, error } = await createClient().GET('/api/v0.1/projects/{project_id}/maps', {
        params: { path: { project_id: project.id }, query: { activeOnly: false } },
      });
      if (error) return [];
      return data?.maps ?? [];
    },
  });

  // 選択マップのサーバーモデル（バイナリ）
  const { data: serverModel } = useQuery({
    queryKey: ['mapModelBinary', project.id, selectedMap],
    queryFn: async (): Promise<{ buffer: ArrayBuffer; fileType: ModelFileType | null } | null> => {
      if (!selectedMap) return null;
      const { data, error, response } = await createClient().GET('/api/v0/heatmap/projects/{project_id}/map_data/{map_name}', {
        params: { path: { project_id: project.id, map_name: selectedMap } },
        parseAs: 'arrayBuffer',
      });
      if (error || !data) return null;
      const header = response.headers.get('X-Model-File-Type');
      const fileType = header ? (header.toLowerCase() as ModelFileType) : null;
      return { buffer: data as ArrayBuffer, fileType };
    },
    enabled: !!selectedMap,
  });

  // 選択マップの配置情報
  const { data: serverTransform } = useMapTransform(project.id, selectedMap || undefined, !!selectedMap);

  // サーバーの配置でエディタを初期化（ローカルファイル編集中は触らない）
  useEffect(() => {
    if (selectedFile) return;
    if (serverTransform === undefined) return;
    setAlign(serverTransform ? { ...IDENTITY, ...transformToAlignmentPatch(serverTransform) } : IDENTITY);
  }, [serverTransform, selectedFile]);

  // インポート元プロジェクト一覧（現在のプロジェクトを除く）
  const { data: allProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await createClient().GET('/api/v0/projects');
      if (error) return [];
      return data ?? [];
    },
  });
  const importSourceOptions = useMemo(() => {
    const map = new Map<string, number>();
    (allProjects ?? []).filter((p) => p.id !== project.id).forEach((p) => map.set(`${p.name} (#${p.id})`, p.id));
    return map;
  }, [allProjects, project.id]);

  const handleSelectMap = useCallback((mapName: string) => {
    setSelectedMap(mapName);
    setSelectedFile(null);
    setLocalBuffer(null);
    setLocalFileType(null);
  }, []);

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;
    const fileType = getModelFileType(file.name);
    if (!fileType) {
      setSelectedFile(null);
      setLocalBuffer(null);
      setLocalFileType(null);
      return;
    }
    setSelectedFile(file);
    setLocalFileType(fileType);
    setLocalBuffer(await file.arrayBuffer());
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !selectedMap) return;
    try {
      await uploadMapData.mutateAsync({ projectId: project.id, mapName: selectedMap, file: selectedFile, transform: alignmentToTransform(align) });
      showToast('Upload successful', 2, 'success');
      setSelectedFile(null);
      setLocalBuffer(null);
      setLocalFileType(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Upload failed', 3, 'error');
    }
  }, [selectedFile, selectedMap, uploadMapData, project.id, align, showToast]);

  const handleSave = useCallback(async () => {
    if (!selectedMap) return;
    try {
      await updateMapTransform.mutateAsync({ projectId: project.id, mapName: selectedMap, transform: alignmentToTransform(align) });
      showToast('Alignment saved', 2, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save alignment', 3, 'error');
    }
  }, [selectedMap, updateMapTransform, project.id, align, showToast]);

  const handleImport = useCallback(async () => {
    const sourceProjectId = importSourceOptions.get(importSourceLabel);
    if (!selectedMap || sourceProjectId === undefined) return;
    try {
      await importMap.mutateAsync({ projectId: project.id, mapName: selectedMap, sourceProjectId });
      showToast('Import successful', 2, 'success');
      setImportSourceLabel('');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Import failed', 3, 'error');
    }
  }, [importSourceOptions, importSourceLabel, selectedMap, importMap, project.id, showToast]);

  const previewBuffer = localBuffer ?? serverModel?.buffer ?? null;
  const previewFileType = localBuffer ? localFileType : (serverModel?.fileType ?? null);
  const patch = (p: Partial<Alignment>) => setAlign((prev) => ({ ...prev, ...p }));

  return (
    <div className={className}>
      <FlexColumn gap={16} align='flex-start'>
        <FlexColumn gap={4} align='flex-start'>
          <Text text='Map' />
          <Selector onChange={handleSelectMap} options={maps ?? []} value={selectedMap} fontSize='sm' disabled={(maps ?? []).length === 0} />
        </FlexColumn>

        {selectedMap && (
          <>
            <div className={`${className}__preview`}>
              {previewBuffer ? (
                <MapModelPreview
                  buffer={previewBuffer}
                  fileType={previewFileType}
                  position={[align.modelPositionX, align.modelPositionY, align.modelPositionZ]}
                  rotationDeg={[align.modelRotationX, align.modelRotationY, align.modelRotationZ]}
                  scale={align.scale}
                />
              ) : (
                <div className={`${className}__empty`}>
                  <Text text='No model uploaded for this map yet.' />
                </div>
              )}
            </div>

            <FlexColumn gap={8} align='flex-start'>
              <Text text='Position' />
              <FlexRow gap={4} align='center'>
                <DraggableNumberInput label='X' value={align.modelPositionX} onChange={(v) => patch({ modelPositionX: v })} step={1} precision={0} />
                <DraggableNumberInput label='Y' value={align.modelPositionY} onChange={(v) => patch({ modelPositionY: v })} step={1} precision={0} />
                <DraggableNumberInput label='Z' value={align.modelPositionZ} onChange={(v) => patch({ modelPositionZ: v })} step={1} precision={0} />
              </FlexRow>
              <Text text='Rotation' />
              <FlexRow gap={4} align='center'>
                <DraggableNumberInput
                  label='X'
                  value={align.modelRotationX}
                  onChange={(v) => patch({ modelRotationX: v })}
                  min={-180}
                  max={180}
                  step={1}
                  precision={0}
                />
                <DraggableNumberInput
                  label='Y'
                  value={align.modelRotationY}
                  onChange={(v) => patch({ modelRotationY: v })}
                  min={-180}
                  max={180}
                  step={1}
                  precision={0}
                />
                <DraggableNumberInput
                  label='Z'
                  value={align.modelRotationZ}
                  onChange={(v) => patch({ modelRotationZ: v })}
                  min={-180}
                  max={180}
                  step={1}
                  precision={0}
                />
              </FlexRow>
              <Text text='Scale' />
              <DraggableNumberInput label='S' value={align.scale} onChange={(v) => patch({ scale: v })} min={0.01} step={0.1} precision={2} />
              <FlexRow gap={8} align='center'>
                <Button scheme='tertiary' fontSize='sm' onClick={() => setAlign(IDENTITY)}>
                  <Text text='Reset' />
                </Button>
                <Button scheme='primary' fontSize='sm' onClick={handleSave} disabled={updateMapTransform.isPending}>
                  <Text text={updateMapTransform.isPending ? 'Saving...' : 'Save alignment'} />
                </Button>
              </FlexRow>
            </FlexColumn>

            <FlexColumn gap={8} align='flex-start'>
              <Text text={`Upload 3D model for "${selectedMap}"`} />
              <FlexRow gap={8} align='center'>
                <FileInput accept='.obj,.fbx' onChange={handleFileSelect} buttonText='Select OBJ/FBX File' fontSize='sm' />
                {selectedFile && <Text text={selectedFile.name} />}
              </FlexRow>
              <Button scheme='primary' fontSize='sm' onClick={handleUpload} disabled={!selectedFile || uploadMapData.isPending}>
                <Text text={uploadMapData.isPending ? 'Uploading...' : 'Upload'} />
              </Button>
            </FlexColumn>

            {importSourceOptions.size > 0 && (
              <FlexColumn gap={8} align='flex-start'>
                <Text text={`Import "${selectedMap}" from another project`} />
                <Selector
                  onChange={setImportSourceLabel}
                  options={Array.from(importSourceOptions.keys())}
                  value={importSourceLabel}
                  fontSize='sm'
                  disabled={importMap.isPending}
                />
                <Button scheme='secondary' fontSize='sm' onClick={handleImport} disabled={!importSourceLabel || importMap.isPending}>
                  <Text text={importMap.isPending ? 'Importing...' : 'Import'} />
                </Button>
              </FlexColumn>
            )}
          </>
        )}
      </FlexColumn>
    </div>
  );
};

export const ProjectDetailsMapsTab = styled(Component)`
  width: 100%;

  &__preview {
    width: 100%;
    height: 360px;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 8px;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
`;
