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
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { useToast } from '@src/component/templates/ToastContext';
import { MapModelPreview } from '@src/features/heatmap/MapModelPreview';
import { getModelFileType } from '@src/features/heatmap/ModelLoader';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useImportMap, useMapTransform, useUpdateMapTransform, useUploadMapData } from '@src/hooks/useUploadMapData';
import { createClient } from '@src/modeles/qeury';
import { alignmentToTransform, transformToAlignmentPatch } from '@src/utils/heatmap/modelTransform';

export type ProjectDetailsMapsTabProps = {
  className?: string;
  project: Project;
};

const UPLOADED_ONLY_SWITCH_LABEL = 'Show only maps with uploaded data';

type LocalModel = {
  mapName: string;
  file: File;
  fileType: ModelFileType;
  buffer: ArrayBuffer;
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
  const { theme } = useSharedTheme();

  const [pickedMap, setPickedMap] = useState('');
  const [align, setAlign] = useState<Alignment>(IDENTITY);
  const [localModel, setLocalModel] = useState<LocalModel | null>(null);
  const [importSourceLabel, setImportSourceLabel] = useState('');

  const uploadMapData = useUploadMapData();
  const updateMapTransform = useUpdateMapTransform();
  const importMap = useImportMap();

  // このタブは未アップロードのマップへモデルを上げる場でもあるため、既定は全件表示
  const [uploadedOnly, setUploadedOnly] = useState(false);

  // プロジェクトのマップ名一覧
  const { data: maps } = useQuery({
    queryKey: ['projectMaps', project.id, uploadedOnly],
    queryFn: async () => {
      const { data, error } = await createClient().GET('/api/v0.1/projects/{project_id}/maps', {
        params: { path: { project_id: project.id }, query: { activeOnly: uploadedOnly } },
      });
      if (error) return [];
      return data?.maps ?? [];
    },
  });

  // 未選択のままだと Selector の表示（先頭マップ）と中身がずれるので、先頭マップを既定の選択とする。
  // フィルタで選択中のマップが一覧から外れた場合も先頭に戻す
  const selectedMap = maps?.includes(pickedMap) ? pickedMap : (maps?.[0] ?? '');
  // 選択マップがフィルタや一覧の更新で切り替わっても、別マップ向けに選んだファイルを使わない
  const local = localModel?.mapName === selectedMap ? localModel : null;

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
    if (local) return;
    if (serverTransform === undefined) return;
    setAlign(serverTransform ? { ...IDENTITY, ...transformToAlignmentPatch(serverTransform) } : IDENTITY);
  }, [serverTransform, local]);

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
    setPickedMap(mapName);
    setLocalModel(null);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const fileType = getModelFileType(file.name);
      if (!fileType) {
        setLocalModel(null);
        return;
      }
      setLocalModel({ mapName: selectedMap, file, fileType, buffer: await file.arrayBuffer() });
    },
    [selectedMap],
  );

  const handleUpload = useCallback(async () => {
    if (!local) return;
    try {
      await uploadMapData.mutateAsync({ projectId: project.id, mapName: local.mapName, file: local.file, transform: alignmentToTransform(align) });
      showToast('Upload successful', 2, 'success');
      setLocalModel(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Upload failed', 3, 'error');
    }
  }, [local, uploadMapData, project.id, align, showToast]);

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

  const previewBuffer = local?.buffer ?? serverModel?.buffer ?? null;
  const previewFileType = local ? local.fileType : (serverModel?.fileType ?? null);
  const patch = (p: Partial<Alignment>) => setAlign((prev) => ({ ...prev, ...p }));

  return (
    <div className={className}>
      <FlexColumn gap={16} align='flex-start'>
        <FlexRow gap={24} align='flex-end' wrap='wrap'>
          <FlexColumn gap={4} align='flex-start'>
            <Text text='Map' />
            {/* Selector は表示値をマウント時にしか取り込まないため、実際の選択が変わるたびに作り直す */}
            <Selector
              key={selectedMap}
              onChange={handleSelectMap}
              options={maps ?? []}
              value={selectedMap}
              fontSize='sm'
              disabled={(maps ?? []).length === 0}
            />
          </FlexColumn>
          <FlexRow gap={8} align='center' className={`${className}__filter`}>
            <Switch label={UPLOADED_ONLY_SWITCH_LABEL} checked={uploadedOnly} onChange={setUploadedOnly} size='small' />
            {/* Switch は label をそのまま input の id に使うので、文言側からも切り替えられるよう htmlFor で結ぶ */}
            <label htmlFor={UPLOADED_ONLY_SWITCH_LABEL} className={`${className}__filterLabel`}>
              <Text text='Uploaded only' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
            </label>
          </FlexRow>
        </FlexRow>

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
                {local && <Text text={local.file.name} />}
              </FlexRow>
              <Button scheme='primary' fontSize='sm' onClick={handleUpload} disabled={!local || uploadMapData.isPending}>
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

  /* Switch(20px) を Selector の行の高さに合わせ、縦中央を揃える */
  &__filter {
    min-height: 32px;
  }

  /* Switch(40×20) と文言の label の見た目は変えず、タッチ範囲だけ 44px に広げる（Button と同じ方式） */
  &__filter > label {
    position: relative;
    cursor: pointer;
  }

  &__filter > label::before {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    inline-size: 100%;
    min-inline-size: var(--touch-target-min-size-mobile);
    block-size: 100%;
    min-block-size: var(--touch-target-min-size-mobile);
    content: '';
    transform: translate(-50%, -50%);
  }

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
