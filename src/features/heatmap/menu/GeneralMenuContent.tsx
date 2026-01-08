import styled from '@emotion/styled';
import { useCallback, useState, useMemo, useRef } from 'react';
import { FiFilter } from 'react-icons/fi';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useDispatch } from 'react-redux';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { GeneralSettings } from '@src/modeles/heatmapView';
import type { ChangeEvent, FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { HeatmapSelectorModal } from '@src/features/heatmap/menu/HeatmapSelectorModal';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { SessionFilterModal } from '@src/features/heatmap/menu/SessionFilterModal';
import { useGeneralPatch, useGeneralPick } from '@src/hooks/useGeneral';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { focusByCoord } from '@src/slices/selectionSlice';

// Section wrapper with visual separation
const Section = styled.section`
  width: 100%;
  padding-block-end: ${({ theme }) => theme.spacing.sm};
  margin-block-end: ${({ theme }) => theme.spacing.sm};
  border-block-end: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-of-type {
    padding-block-end: 0;
    margin-block-end: 0;
    border-block-end: none;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  margin-block-end: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  min-block-size: 44px;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface.hover};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.surface.raised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  padding-block-start: ${({ theme }) => theme.spacing.xs};
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const BackgroundPreview = styled.div<{ backgroundUrl: string }>`
  width: 40px;
  height: 40px;
  background-image: url(${({ backgroundUrl }) => backgroundUrl});
  background-position: center;
  background-size: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
`;

export const GeneralMenuContent: FC<HeatmapMenuProps> = ({ service }) => {
  const dispatch = useDispatch();
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const [isSessionFilterModalOpen, setIsSessionFilterModalOpen] = useState(false);
  const [isHeatmapSelectorModalOpen, setIsHeatmapSelectorModalOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSessionFilterOpen, setIsSessionFilterOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upZ, scale, heatmapOpacity, heatmapType, showHeatmap, minThreshold, backgroundImage, backgroundScale, backgroundOffsetX, backgroundOffsetY } =
    useGeneralPick(
      'upZ',
      'scale',
      'showHeatmap',
      'heatmapOpacity',
      'heatmapType',
      'minThreshold',
      'backgroundImage',
      'backgroundScale',
      'backgroundOffsetX',
      'backgroundOffsetY',
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

  // 背景画像選択ハンドラー
  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 画像ファイルのみ許可
      if (!file.type.startsWith('image/')) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setData({ backgroundImage: dataUrl });
      };
      reader.readAsDataURL(file);

      // 同じファイルを再選択できるようにリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [setData],
  );

  const handleClearBackground = useCallback(() => {
    setData({ backgroundImage: null });
  }, [setData]);

  const currentTaskId = service.task?.taskId;

  // セッションフィルター用（embed時はembedSessionId、通常時はsessionIdを使用）
  const targetSessionId = service.embedSessionId ?? service.sessionId;
  const isFilteredBySession = useMemo(() => {
    if (!targetSessionId) return false;
    return service.sessionHeatmapIds?.includes(targetSessionId) && service.sessionHeatmapIds.length === 1;
  }, [targetSessionId, service.sessionHeatmapIds]);

  const handleFilterBySession = useCallback(() => {
    if (targetSessionId) {
      service.setSessionHeatmapIds([targetSessionId]);
    }
  }, [service, targetSessionId]);

  const handleClearSessionFilter = useCallback(() => {
    service.setSessionHeatmapIds(undefined);
  }, [service]);

  const handleResetView = useCallback(() => {
    if (centerPosition) {
      dispatch(focusByCoord({ point: centerPosition }));
    }
  }, [centerPosition, dispatch]);

  return (
    <>
      {/* ===== Heatmap Settings - Primary Controls (常時表示) ===== */}
      <Section role='group' aria-label={t('heatmap.general.heatmap')}>
        <SectionTitle>{t('heatmap.general.heatmap')}</SectionTitle>

        {/* Heatmap選択 */}
        <InputRow label={t('heatmap.general.select')}>
          <FlexRow gap={8} align='center' style={{ flex: 1 }}>
            <Text
              text={currentTaskId ? `Task #${currentTaskId}` : t('heatmap.general.notSelected')}
              fontSize={theme.typography.fontSize.sm}
              color={theme.colors.text.secondary}
            />
            <Button onClick={() => setIsHeatmapSelectorModalOpen(true)} scheme={'primary'} fontSize={'sm'}>
              <Text text={t('heatmap.general.select')} fontSize={theme.typography.fontSize.sm} />
            </Button>
          </FlexRow>
        </InputRow>

        {/* Show Heatmap */}
        <InputRow label={t('heatmap.general.showHeatmap')}>
          <Switch
            label={t('heatmap.general.showHeatmap')}
            onChange={(showHeatmap) => setData({ showHeatmap })}
            checked={showHeatmap}
            size={'small'}
            aria-label={t('heatmap.general.showHeatmap')}
          />
        </InputRow>

        {/* Type - よく使う */}
        <InputRow label={t('heatmap.general.type')}>
          <Selector
            options={['object', 'fill']}
            value={heatmapType}
            onChange={(v) => {
              setData({ heatmapType: v as GeneralSettings['heatmapType'] });
            }}
            fontSize={'base'}
            aria-label={t('heatmap.general.type')}
          />
        </InputRow>

        {/* Min Density - よく使う */}
        <Card>
          <InputRow label={t('heatmap.general.minThreshold')}>
            <Slider
              value={minThreshold}
              onChange={(minThreshold) => setData({ minThreshold })}
              min={0}
              step={0.01}
              max={1.0}
              textField
              aria-label={t('heatmap.general.minThreshold')}
            />
          </InputRow>
        </Card>

        {/* Opacity */}
        <InputRow label={t('heatmap.general.opacity')}>
          <Slider
            value={heatmapOpacity}
            min={0.0}
            max={1.0}
            step={0.1}
            onChange={(value) => setData({ heatmapOpacity: value })}
            disabled={!showHeatmap}
            textField
            aria-label={t('heatmap.general.opacity')}
          />
        </InputRow>
      </Section>

      {/* ===== View Controls ===== */}
      <Section role='group' aria-label={t('heatmap.general.view')}>
        <SectionTitle>{t('heatmap.general.view')}</SectionTitle>

        <InputRow label={t('heatmap.general.resetToInitial')}>
          <Button onClick={handleResetView} scheme={'secondary'} fontSize={'sm'} disabled={!centerPosition}>
            <Text text={t('heatmap.general.resetToInitial')} fontSize={theme.typography.fontSize.sm} />
          </Button>
        </InputRow>
      </Section>

      {/* ===== Advanced Display Settings (折りたたみ) ===== */}
      <CollapsibleSection>
        <CollapsibleHeader onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} aria-expanded={isAdvancedOpen} aria-controls='advanced-display-content'>
          <span>{t('heatmap.general.displayOptions')}</span>
          {isAdvancedOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
        </CollapsibleHeader>
        <CollapsibleContent isOpen={isAdvancedOpen} id='advanced-display-content'>
          <InputRow label={t('heatmap.general.scale')}>
            <Slider value={scale} onChange={(scale) => setData({ scale })} min={0.1} step={0.05} max={1.0} textField aria-label={t('heatmap.general.scale')} />
          </InputRow>
          <InputRow label={t('heatmap.general.upVector')}>
            <Selector
              options={['Y', 'Z']}
              value={upZ ? 'Z' : 'Y'}
              onChange={(v) => setData({ upZ: v === 'Z' })}
              fontSize={'base'}
              aria-label={t('heatmap.general.upVector')}
            />
          </InputRow>
        </CollapsibleContent>
      </CollapsibleSection>

      {/* ===== Session Filter (折りたたみ) ===== */}
      <CollapsibleSection>
        <CollapsibleHeader
          onClick={() => setIsSessionFilterOpen(!isSessionFilterOpen)}
          aria-expanded={isSessionFilterOpen}
          aria-controls='session-filter-content'
        >
          <span>{t('heatmap.general.sessionFilter')}</span>
          {isSessionFilterOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
        </CollapsibleHeader>
        <CollapsibleContent isOpen={isSessionFilterOpen} id='session-filter-content'>
          <InputRow label={t('heatmap.general.sessionFilter')}>
            <FlexColumn gap={8} style={{ flex: 1 }}>
              <Button onClick={() => setIsSessionFilterModalOpen(true)} scheme={'surface'} fontSize={'sm'}>
                <Text text={t('heatmap.general.sessionFilter')} fontSize={theme.typography.fontSize.sm} />
              </Button>
              {/* セッション選択時のクイックフィルターボタン */}
              {targetSessionId && (
                <>
                  {isFilteredBySession ? (
                    <Button onClick={handleClearSessionFilter} scheme={'tertiary'} fontSize={'sm'}>
                      <FiFilter size={14} />
                      <Text text={t('heatmap.general.clearFilter')} fontSize={theme.typography.fontSize.sm} />
                    </Button>
                  ) : (
                    <Button onClick={handleFilterBySession} scheme={'primary'} fontSize={'sm'}>
                      <FlexRow align={'center'} gap={4}>
                        <FiFilter size={18} />
                        <Text text={t('heatmap.general.filterBySession').replace('{id}', String(targetSessionId))} fontSize={theme.typography.fontSize.sm} />
                      </FlexRow>
                    </Button>
                  )}
                </>
              )}
              {isFilteredBySession && (
                <Text
                  text={t('heatmap.general.filteringBySession').replace('{id}', String(targetSessionId))}
                  fontSize={theme.typography.fontSize.xs}
                  color={theme.colors.text.secondary}
                />
              )}
            </FlexColumn>
          </InputRow>
        </CollapsibleContent>
      </CollapsibleSection>

      {/* ===== Background Image (折りたたみ) ===== */}
      <CollapsibleSection>
        <CollapsibleHeader onClick={() => setIsBackgroundOpen(!isBackgroundOpen)} aria-expanded={isBackgroundOpen} aria-controls='background-content'>
          <span>{t('heatmap.general.backgroundImage')}</span>
          {isBackgroundOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
        </CollapsibleHeader>
        <CollapsibleContent isOpen={isBackgroundOpen} id='background-content'>
          <InputRow label={t('heatmap.general.select')}>
            <FlexRow gap={8} align='center' style={{ flex: 1 }}>
              {backgroundImage && <BackgroundPreview backgroundUrl={backgroundImage} />}
              <Button onClick={() => fileInputRef.current?.click()} scheme={'surface'} fontSize={'sm'}>
                <Text text={backgroundImage ? t('heatmap.general.change') : t('heatmap.general.select')} fontSize={theme.typography.fontSize.sm} />
              </Button>
              {backgroundImage && (
                <Button onClick={handleClearBackground} scheme={'tertiary'} fontSize={'sm'}>
                  <Text text={t('heatmap.general.remove')} fontSize={theme.typography.fontSize.sm} />
                </Button>
              )}
            </FlexRow>
            <HiddenFileInput ref={fileInputRef} type='file' accept='image/*' onChange={handleFileSelect} />
          </InputRow>

          {/* 背景画像の調整（画像が選択されている場合のみ表示） */}
          {backgroundImage && (
            <>
              <InputRow label={t('heatmap.general.backgroundScale')}>
                <Slider
                  value={backgroundScale}
                  onChange={(v) => setData({ backgroundScale: v })}
                  min={0.5}
                  step={0.1}
                  max={3.0}
                  textField
                  aria-label={t('heatmap.general.backgroundScale')}
                />
              </InputRow>
              <InputRow label={t('heatmap.general.backgroundXPosition')}>
                <Slider
                  value={backgroundOffsetX}
                  onChange={(v) => setData({ backgroundOffsetX: v })}
                  min={-50}
                  step={1}
                  max={50}
                  textField
                  aria-label={t('heatmap.general.backgroundXPosition')}
                />
              </InputRow>
              <InputRow label={t('heatmap.general.backgroundYPosition')}>
                <Slider
                  value={backgroundOffsetY}
                  onChange={(v) => setData({ backgroundOffsetY: v })}
                  min={-50}
                  step={1}
                  max={50}
                  textField
                  aria-label={t('heatmap.general.backgroundYPosition')}
                />
              </InputRow>
            </>
          )}
        </CollapsibleContent>
      </CollapsibleSection>

      <SessionFilterModal isOpen={isSessionFilterModalOpen} onClose={() => setIsSessionFilterModalOpen(false)} service={service} />
      <HeatmapSelectorModal isOpen={isHeatmapSelectorModalOpen} onClose={() => setIsHeatmapSelectorModalOpen(false)} service={service} />
    </>
  );
};
