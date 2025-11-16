import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type { Project } from '@src/modeles/project';
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

export type ProjectFormModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  project?: Project; // If provided, edit mode; otherwise create mode
};

const Component: FC<ProjectFormModalProps> = ({ className, isOpen, onClose, project }) => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!project;

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [is2D, setIs2D] = useState(project?.is2D || false);

  const handleClose = useCallback(() => {
    setName(project?.name || '');
    setDescription(project?.description || '');
    setIs2D(project?.is2D || false);
    onClose();
  }, [onClose, project]);

  const { mutate: createMutate, isPending: createMutateIsPending } = useMutation({
    mutationFn: async () => {
      const { data, error } = await createClient().POST('/api/v0/projects', {
        body: {
          name,
          description,
          is2D,
        },
      });
      if (error) {
        throw new Error(t('projectForm.projectCreated'));
      }
      return data;
    },
    onSuccess: () => {
      showToast(t('projectForm.projectCreated'), 2, 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleClose();
    },
    onError: (error: Error) => {
      showToast(error.message, 3, 'error');
    },
  });

  const { mutate: updateMutate, isPending: updateMutateIsPending } = useMutation({
    mutationFn: async () => {
      if (!project) return;
      const { data, error } = await createClient().PUT('/api/v0/projects/{id}', {
        params: {
          path: {
            id: project.id,
          },
        },
        body: {
          name,
          description,
          is2D,
        },
      });
      if (error) {
        throw new Error(t('projectForm.projectUpdated'));
      }
      return data;
    },
    onSuccess: () => {
      showToast(t('projectForm.projectUpdated'), 2, 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project?.id] });
      handleClose();
    },
    onError: (error: Error) => {
      showToast(error.message, 3, 'error');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      showToast(t('projectForm.enterName'), 2, 'error');
      return;
    }
    if (!description.trim()) {
      showToast(t('projectForm.enterDescription'), 2, 'error');
      return;
    }

    if (isEditMode) {
      updateMutate();
    } else {
      createMutate();
    }
  }, [name, description, isEditMode, showToast, t, updateMutate, createMutate]);

  const isLoading = createMutateIsPending || updateMutateIsPending;

  return (
    <Modal
      className={className}
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? t('projectForm.editTitle') : t('projectForm.createTitle')}
      closeOutside={!isLoading}
    >
      <FlexColumn gap={16} className={`${className}__form`}>
        <VerticalSpacer size={8} />
        <FlexColumn gap={8}>
          <Text text={t('projectForm.projectName')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField
            value={name}
            onChange={setName}
            placeholder={t('projectForm.namePlaceholder')}
            fontSize={theme.typography.fontSize.base}
            disabled={isLoading}
          />
        </FlexColumn>

        <FlexColumn gap={8}>
          <Text text={t('common.description')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField
            value={description}
            onChange={setDescription}
            placeholder={t('projectForm.descriptionPlaceholder')}
            fontSize={theme.typography.fontSize.base}
            disabled={isLoading}
          />
        </FlexColumn>

        <FlexRow gap={8} align={'center'}>
          <input
            type={'checkbox'}
            id={'is2D-checkbox'}
            checked={is2D}
            onChange={(e) => setIs2D(e.target.checked)}
            disabled={isLoading}
            className={`${className}__checkbox`}
          />
          <label htmlFor={'is2D-checkbox'}>
            <Text text={t('projectForm.mode2D')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
          </label>
        </FlexRow>

        <VerticalSpacer size={8} />

        <FlexRow gap={12} align={'flex-end'}>
          <Button onClick={handleClose} scheme={'surface'} fontSize={'base'} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} scheme={'primary'} fontSize={'base'} disabled={isLoading}>
            {isLoading ? t('common.processing') : isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  );
};

export const ProjectFormModal = styled(Component)`
  &__form {
    width: 500px;
    max-width: 90vw;
  }

  &__checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`;
