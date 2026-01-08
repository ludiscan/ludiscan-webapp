import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import type { Session } from '@src/modeles/session';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useToast } from '@src/component/templates/ToastContext';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';

export type SessionFormModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  projectId: number;
};

const Component: FC<SessionFormModalProps> = ({ className, isOpen, onClose, session, projectId }) => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState(session?.name || '');
  const [deviceId, setDeviceId] = useState(session?.deviceId || '');
  const [platform, setPlatform] = useState(session?.platform || '');
  const [appVersion, setAppVersion] = useState(session?.appVersion || '');

  // Reset form when session changes
  useEffect(() => {
    if (session) {
      setName(session.name);
      setDeviceId(session.deviceId || '');
      setPlatform(session.platform || '');
      setAppVersion(session.appVersion || '');
    }
  }, [session]);

  const handleClose = useCallback(() => {
    if (session) {
      setName(session.name);
      setDeviceId(session.deviceId || '');
      setPlatform(session.platform || '');
      setAppVersion(session.appVersion || '');
    }
    onClose();
  }, [onClose, session]);

  const { mutate: updateMutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!session) return;
      const { data, error } = await createClient().PUT('/api/v0/projects/{project_id}/play_session/{session_id}', {
        params: {
          path: {
            project_id: projectId,
            session_id: session.sessionId,
          },
        },
        body: {
          name,
          deviceId: deviceId || null,
          platform: platform || null,
          appVersion: appVersion || null,
        },
      });
      if (error) {
        throw new Error(t('sessionForm.updateFailed'));
      }
      return data;
    },
    onSuccess: () => {
      showToast(t('sessionForm.sessionUpdated'), 2, 'success');
      queryClient.invalidateQueries({ queryKey: ['sessions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      handleClose();
    },
    onError: (error: Error) => {
      showToast(error.message, 3, 'error');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      showToast(t('common.name'), 2, 'error');
      return;
    }
    updateMutate();
  }, [name, showToast, t, updateMutate]);

  return (
    <Modal className={className} isOpen={isOpen} onClose={handleClose} title={t('sessionForm.editTitle')} closeOutside={!isPending}>
      <FlexColumn gap={16} className={`${className}__form`}>
        <VerticalSpacer size={8} />
        <FlexColumn gap={8}>
          <Text text={t('sessionForm.sessionName')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField
            value={name}
            onChange={setName}
            placeholder={t('sessionForm.sessionName')}
            fontSize={theme.typography.fontSize.base}
            disabled={isPending}
          />
        </FlexColumn>

        <FlexColumn gap={8}>
          <Text text={t('sessionForm.deviceId')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField
            value={deviceId}
            onChange={setDeviceId}
            placeholder={t('sessionForm.deviceId')}
            fontSize={theme.typography.fontSize.base}
            disabled={isPending}
          />
        </FlexColumn>

        <FlexColumn gap={8}>
          <Text text={t('sessionForm.platform')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField
            value={platform}
            onChange={setPlatform}
            placeholder={t('sessionForm.platform')}
            fontSize={theme.typography.fontSize.base}
            disabled={isPending}
          />
        </FlexColumn>

        <FlexColumn gap={8}>
          <Text text={t('sessionForm.appVersion')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField
            value={appVersion}
            onChange={setAppVersion}
            placeholder={t('sessionForm.appVersion')}
            fontSize={theme.typography.fontSize.base}
            disabled={isPending}
          />
        </FlexColumn>

        <VerticalSpacer size={8} />

        <FlexRow gap={12} align={'flex-end'}>
          <Button onClick={handleClose} scheme={'surface'} fontSize={'base'} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} scheme={'primary'} fontSize={'base'} disabled={isPending}>
            {isPending ? t('common.processing') : t('common.update')}
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  );
};

export const SessionFormModal = styled(Component)`
  &__form {
    width: 500px;
    max-width: 90vw;
  }
`;
