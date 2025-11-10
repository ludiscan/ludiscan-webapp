import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useToast } from '@src/component/templates/ToastContext';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import type { Project } from '@src/modeles/project';
import { fontSizes } from '@src/styles/style';

export type ProjectFormModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  project?: Project; // If provided, edit mode; otherwise create mode
};

const Component: FC<ProjectFormModalProps> = ({ className, isOpen, onClose, project }) => {
  const { theme } = useSharedTheme();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!project;

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [is2D, setIs2D] = useState(project?.is2D || false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await createClient().POST('/api/v0/projects', {
        body: {
          name,
          description,
          is2D,
        },
      });
      if (error) {
        throw new Error('プロジェクトの作成に失敗しました');
      }
      return data;
    },
    onSuccess: () => {
      showToast('プロジェクトを作成しました', 2, 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleClose();
    },
    onError: (error: Error) => {
      showToast(error.message || 'プロジェクトの作成に失敗しました', 3, 'error');
    },
  });

  const updateMutation = useMutation({
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
        throw new Error('プロジェクトの更新に失敗しました');
      }
      return data;
    },
    onSuccess: () => {
      showToast('プロジェクトを更新しました', 2, 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project?.id] });
      handleClose();
    },
    onError: (error: Error) => {
      showToast(error.message || 'プロジェクトの更新に失敗しました', 3, 'error');
    },
  });

  const handleClose = useCallback(() => {
    setName(project?.name || '');
    setDescription(project?.description || '');
    setIs2D(project?.is2D || false);
    onClose();
  }, [onClose, project]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      showToast('プロジェクト名を入力してください', 2, 'error');
      return;
    }
    if (!description.trim()) {
      showToast('説明を入力してください', 2, 'error');
      return;
    }

    if (isEditMode) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }, [name, description, isEditMode, createMutation, updateMutation, showToast]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal className={className} isOpen={isOpen} onClose={handleClose} title={isEditMode ? 'プロジェクトを編集' : '新規プロジェクト作成'} closeOutside={!isLoading}>
      <FlexColumn gap={16} className={`${className}__form`}>
        <VerticalSpacer size={8} />
        <FlexColumn gap={8}>
          <Text text={'プロジェクト名'} fontSize={fontSizes.medium} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField value={name} onChange={setName} placeholder={'プロジェクト名を入力...'} fontSize={fontSizes.medium} disabled={isLoading} />
        </FlexColumn>

        <FlexColumn gap={8}>
          <Text text={'説明'} fontSize={fontSizes.medium} color={theme.colors.text.primary} fontWeight={'bold'} />
          <OutlinedTextField value={description} onChange={setDescription} placeholder={'プロジェクトの説明を入力...'} fontSize={fontSizes.medium} disabled={isLoading} />
        </FlexColumn>

        <FlexRow gap={8} align={'center'}>
          <input type={'checkbox'} id={'is2D-checkbox'} checked={is2D} onChange={(e) => setIs2D(e.target.checked)} disabled={isLoading} className={`${className}__checkbox`} />
          <label htmlFor={'is2D-checkbox'}>
            <Text text={'2Dモード'} fontSize={fontSizes.medium} color={theme.colors.text.primary} />
          </label>
        </FlexRow>

        <VerticalSpacer size={8} />

        <FlexRow gap={12} justify={'flex-end'}>
          <Button onClick={handleClose} scheme={'surface'} fontSize={'base'} disabled={isLoading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} scheme={'primary'} fontSize={'base'} disabled={isLoading}>
            {isLoading ? '処理中...' : isEditMode ? '更新' : '作成'}
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
