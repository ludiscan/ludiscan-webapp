import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { FC } from 'react';

import { Card } from '@src/component/atoms/Card';
import { FlexColumn } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { InnerContent } from '@src/pages/_app.page';
import { fontSizes, fontWeights } from '@src/styles/style';

export type SecurityPageProps = {
  className?: string;
};

const Component: FC<SecurityPageProps> = ({ className }) => {
  const { isAuthorized, isLoading, ready } = useAuth();
  const router = useRouter();
  const { theme } = useSharedTheme();

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      router.replace('/');
    }
  }, [isAuthorized, isLoading, ready, router]);

  const handleBack = () => {
    router.back();
  };

  if (!ready || isLoading) {
    return (
      <div className={className}>
        <SidebarLayout />
        <InnerContent>
          <div className={`${className}__centerContent`}>
            <Text text='Loading...' fontSize={fontSizes.medium} color={theme.colors.text} />
          </div>
        </InnerContent>
      </div>
    );
  }

  return (
    <div className={className}>
      <SidebarLayout />
      <InnerContent>
        <Header title='Security Settings' onClick={handleBack} />

        <div className={`${className}__container`}>
          <Card blur color={theme.colors.surface.main} className={`${className}__card`}>
            <FlexColumn gap={24}>
              {/* パスワード変更セクション */}
              <div>
                <Text text='Password Management' fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={12} />
                <Text
                  text='Password change functionality will be available in a future update.'
                  fontSize={fontSizes.small}
                  color={theme.colors.secondary.main}
                  fontWeight='lighter'
                />
              </div>

              <div className={`${className}__divider`} />

              {/* 2段階認証セクション */}
              <div>
                <Text text='Two-Factor Authentication' fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={12} />
                <Text
                  text='Two-factor authentication will be available in a future update.'
                  fontSize={fontSizes.small}
                  color={theme.colors.secondary.main}
                  fontWeight='lighter'
                />
              </div>

              <div className={`${className}__divider`} />

              {/* セッション管理セクション */}
              <div>
                <Text text='Session Management' fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={12} />
                <Text
                  text='Session management features will be available in a future update.'
                  fontSize={fontSizes.small}
                  color={theme.colors.secondary.main}
                  fontWeight='lighter'
                />
              </div>

              <div className={`${className}__divider`} />

              {/* ログイン履歴セクション */}
              <div>
                <Text text='Login History' fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={12} />
                <Text
                  text='Login history tracking will be available in a future update.'
                  fontSize={fontSizes.small}
                  color={theme.colors.secondary.main}
                  fontWeight='lighter'
                />
              </div>

              <div className={`${className}__divider`} />

              {/* セキュリティ情報セクション */}
              <div>
                <Text text='Security Information' fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={fontWeights.bold} />
                <VerticalSpacer size={12} />
                <FlexColumn gap={8}>
                  <Text
                    text='• All API keys are encrypted and securely stored'
                    fontSize={fontSizes.small}
                    color={theme.colors.secondary.main}
                    fontWeight='lighter'
                  />
                  <Text
                    text='• Never share your API keys with untrusted parties'
                    fontSize={fontSizes.small}
                    color={theme.colors.secondary.main}
                    fontWeight='lighter'
                  />
                  <Text
                    text='• Regularly review your API keys and delete unused ones'
                    fontSize={fontSizes.small}
                    color={theme.colors.secondary.main}
                    fontWeight='lighter'
                  />
                  <Text
                    text='• Report any suspicious activity to our support team'
                    fontSize={fontSizes.small}
                    color={theme.colors.secondary.main}
                    fontWeight='lighter'
                  />
                </FlexColumn>
              </div>
            </FlexColumn>
          </Card>
        </div>
      </InnerContent>
    </div>
  );
};

const SecurityPage = styled(Component)`
  height: 100vh;

  &__container {
    padding: 0 24px;
    margin-bottom: 24px;
  }

  &__card {
    padding: 24px;
  }

  &__divider {
    height: 1px;
    margin: 8px 0;
    background-color: ${({ theme }) => theme.colors.border.main};
  }

  &__centerContent {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
`;

export default SecurityPage;
