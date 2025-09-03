import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { InlineFlexColumn } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useToast } from '@src/component/templates/ToastContext';
import { env } from '@src/config/env';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes } from '@src/styles/style';

export type LoginPageProps = {
  className?: string | undefined;
};

const Content: FC<LoginPageProps> = ({ className }) => {
  const router = useRouter();
  const { theme } = useSharedTheme();
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
    <Modal className={className} isOpen={true} onClose={onClose} title={'SignIn or SignUp'} closeOutside={false} style={{ minWidth: '300px' }}>
      <InlineFlexColumn gap={24} className={`${className}__content`} align={'center'}>
        <a className={`${className}__button google_login`} href={`${env.API_BASE_URL}/api/v0/auth/google`} target={'_self'}>
          <svg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' className='LgbsSe-Bz112c'>
            <g>
              <path
                fill='#EA4335'
                d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
              />
              <path
                fill='#4285F4'
                d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
              />
              <path
                fill='#FBBC05'
                d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
              />
              <path
                fill='#34A853'
                d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
              />
              <path fill='none' d='M0 0h48v48H0z' />
            </g>
          </svg>
          <Text text={'Google で サインアップ'} color={theme.colors.text} fontSize={fontSizes.medium} />
        </a>
        <Divider orientation={'horizontal'} />
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
          <Text text={'Sign in'} />
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
  color: ${({ theme }) => theme.colors.text};

  &__content {
    width: 100%;
  }

  &__email,
  &__password {
    margin: 0 auto;
    color: ${({ theme }) => theme.colors.text};
  }

  &__button {
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-content: center;
    height: 20px;
    padding: 12px;
    text-decoration: none;
    background: ${({ theme }) => theme.colors.surface.light};
    border-radius: 22px;
  }
`;

export default function Index(props: LoginPageProps) {
  return <IndexPage {...props} />;
}
