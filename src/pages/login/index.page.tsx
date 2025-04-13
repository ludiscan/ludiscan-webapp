import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import type { Env } from '@src/modeles/env';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { InlineFlexColumn } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useToast } from '@src/component/templates/ToastContext';
import { useAuth } from '@src/hooks/useAuth';
import { fontSizes } from '@src/styles/style';

export type LoginPageProps = {
  className?: string | undefined;
  env?: Env | undefined;
};

export const getServerSideProps = async () => {
  const { env } = await import('@src/config/env');
  return {
    props: {
      env,
    },
  };
};

const Content: FC<LoginPageProps> = ({ className, env }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();
  const onClose = useCallback(() => {
    router.back();
  }, [router]);
  const handleInputEmail = useCallback((e: string) => {
    setEmail(e);
  }, []);
  const handleInputPassword = useCallback((e: string) => {
    setPassword(e);
  }, []);

  const { isLoading, login } = useAuth({
    env,
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
      await login({ email, password });
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

const IndexPage = styled(Component)`
  &__content {
    width: 100%;
  }

  &__email,
  &__password {
    margin: 0 auto;
  }
`;

export default function Index(props: LoginPageProps) {
  return <IndexPage {...props} />;
}
