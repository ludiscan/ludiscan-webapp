import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { InputRow } from './InputRow';

import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { InlineFlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { fontSizes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export const EventLogDetail: FC<HeatmapMenuProps> = ({ extra = {}, service }) => {
  const logName = 'logName' in extra ? extra.logName : undefined;
  const id = 'id' in extra ? extra.id : undefined;

  const {
    data: logDetail,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['eventLogDetail', logName, id],
    queryFn: async () => {
      if (typeof logName !== 'string' || !id) return null;
      // Replace with actual data fetching logic
      return service.createClient()?.GET('/api/v0/general_log/position/{event_type}/{id}', {
        params: {
          path: {
            event_type: logName,
            id: Number(id),
          },
        },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: !!logName && !!id,
  });
  const handleReload = useCallback(() => {}, []);
  const status = useMemo(() => {
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (isSuccess && logDetail) return 'success';
    return 'loading';
  }, [isLoading, isError, isSuccess, logDetail]);

  useEffect(() => {
    if (status === 'success' && logDetail && logDetail.data && typeof logName === 'string' && id) {
      heatMapEventBus.emit('event-log-detail-loaded', { logName: String(logName), id: Number(id) });
    }
  }, [id, logDetail, logName, status]);
  return (
    <StatusContent status={status}>
      <InlineFlexColumn gap={4} style={{ width: '100%' }}>
        {logDetail && logDetail.data && (
          <>
            <Text text={'Event Log'} fontSize={fontSizes.large1} style={{ marginBottom: '8px' }} />
            <InlineFlexColumn wrap={'nowrap'} gap={0} style={{ width: '100%' }}>
              <InputRow label={'Log Name'}>
                <Text text={logDetail.data.event_type} fontSize={fontSizes.medium} />
              </InputRow>
              <InputRow label={'PlayerId'}>
                <Text text={String(logDetail.data.player)} fontSize={fontSizes.medium} />
              </InputRow>
              <InlineFlexColumn wrap={'nowrap'} gap={2} align={'flex-start'} style={{ width: '100%' }}>
                <Divider orientation={'horizontal'} />
                <Text text={'Position'} fontSize={fontSizes.medium} />
                <InlineFlexColumn wrap={'nowrap'} gap={4} align={'flex-end'} style={{ width: '100%' }}>
                  <Text text={`X: ${logDetail.data.event_data.x.toFixed(3)},`} fontSize={fontSizes.small} style={{ width: '100px' }} />
                  <Text text={`Y: ${logDetail.data.event_data.y.toFixed(3)},`} fontSize={fontSizes.small} style={{ width: '100px' }} />
                  <Text text={`Z: ${logDetail.data.event_data.z.toFixed(3)}`} fontSize={fontSizes.small} style={{ width: '100px' }} />
                </InlineFlexColumn>
              </InlineFlexColumn>
            </InlineFlexColumn>
          </>
        )}
        {/*<InputRow label={'上向ベクトル'}>*/}
        {/*  <SegmentedSwitch*/}
        {/*    fontSize={'smallest'}*/}
        {/*    value={general.upZ ? 'Z' : 'Y'}*/}
        {/*    options={['Y', 'Z']}*/}
        {/*    onChange={(v) => {*/}
        {/*      setData({ ...general, upZ: v === 'Z' });*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</InputRow>*/}
        {/*<InputColumn label={'scale'}>*/}
        {/*  <Slider value={general.scale} onChange={(scale) => setData({ ...general, scale })} min={0.1} step={0.05} max={1.0} sideLabel textField />*/}
        {/*</InputColumn>*/}
        {/*<InputRow label={'showHeatmap'}>*/}
        {/*  <div>*/}
        {/*    <Switch label={'showHeatmap'} onChange={(showHeatmap) => setData({ ...general, showHeatmap })} checked={general.showHeatmap} size={'small'} />*/}
        {/*  </div>*/}
        {/*</InputRow>*/}
        {/*<InputColumn label={'blockSize'}>*/}
        {/*  <Slider value={general.blockSize} onChange={(blockSize) => setData({ ...general, blockSize })} min={50} step={50} max={500} sideLabel textField />*/}
        {/*</InputColumn>*/}
        {/*<InputColumn label={'minThreshold'}>*/}
        {/*  <Slider*/}
        {/*    value={general.minThreshold}*/}
        {/*    onChange={(minThreshold) => setData({ ...general, minThreshold })}*/}
        {/*    min={0}*/}
        {/*    step={0.001}*/}
        {/*    max={0.3}*/}
        {/*    sideLabel*/}
        {/*    textField*/}
        {/*  />*/}
        {/*</InputColumn>*/}
        <InputRow label={''}>
          <div style={{ flex: 1 }} />
          <Button onClick={handleReload} scheme={'surface'} fontSize={'small'}>
            <Text text={'Reload'} fontSize={fontSizes.small} />
          </Button>
        </InputRow>
      </InlineFlexColumn>
    </StatusContent>
  );
};
