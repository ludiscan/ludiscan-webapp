import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { FC } from 'react';

import { Button } from '@/component/atoms/Button.tsx';
import { InlineFlexColumn } from '@/component/atoms/Flex.tsx';
import { VerticalSpacer } from '@/component/atoms/Spacer.tsx';
import { Text } from '@/component/atoms/Text.tsx';
import { Modal } from '@/component/molecules/Modal.tsx';
import { OutlinedTextField } from '@/component/molecules/OutlinedTextField.tsx';
import { useToast } from '@/component/templates/ToastContext.tsx';
import { useAuth } from '@/hooks/useAuth.ts';
import { fontSizes } from '@/styles/style.ts';

export type LoginPageProps = {
  className?: string | undefined;
};

const Content: FC<LoginPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();
  const onClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  const handleInputEmail = useCallback((e: string) => {
    setEmail(e);
  }, []);
  const handleInputPassword = useCallback((e: string) => {
    setPassword(e);
  }, []);

  const { isLoading, login } = useAuth({
    onSuccessLogin: () => {
      showToast('Login success', 1, 'success');
      onClose();
    },
  });
  const handleLogin = useCallback(async () => {
    if (email === '' || password === '') {
      showToast('Please enter email and password', 1, 'error');
      return;
    }
    if (!isLoading) {
      await login(email, password);
    }
  }, [email, isLoading, login, password, showToast]);

  const loginDisabled = useMemo(() => email === '' || password === '' || isLoading, [email, password, isLoading]);
  return (
    <Modal isOpen={true} onClose={onClose} title={'Login'} closeOutside={false} style={{ minWidth: '300px' }}>
      <InlineFlexColumn gap={24} className={`${className}__content`} align={'center'}>
        <VerticalSpacer size={12} />
        <OutlinedTextField
          className={`${className}__email`}
          onChange={handleInputEmail}
          value={email}
          label={'Email'}
          placeholder={'example@email.com'}
          type={'email'}
          fontSize={fontSizes.medium}
          maxLength={50}
        />
        <OutlinedTextField
          className={`${className}__password`}
          onChange={handleInputPassword}
          value={password}
          label={'Password'}
          type={'password'}
          placeholder={'password'}
          fontSize={fontSizes.medium}
          maxLength={20}
        />
        <VerticalSpacer size={12} />
        <Button onClick={handleLogin} scheme={'primary'} fontSize={'medium'} width={'full'} disabled={loginDisabled}>
          <Text text={'Login'} />
        </Button>
      </InlineFlexColumn>
    </Modal>
  );
};

const Component: FC<LoginPageProps> = (props) => {
  return (
    <div className={props.className}>
      <Content {...props} />
    </div>
  );
};

export const LoginPage = styled(Component)`
  &__content {
    width: 100%;
  }

  &__email,
  &__password {
    margin: 0 auto;
  }
`;
