import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { FC } from 'react';

import { Card } from '@src/component/atoms/Card';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { InnerContent } from '@src/pages/_app.page';
import { fontSizes, fontWeights } from '@src/styles/style';

export type ProfilePageProps = {
  className?: string;
};

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

const Component: FC<ProfilePageProps> = ({ className }) => {
  const { isAuthorized, isLoading, ready, user } = useAuth();
  const router = useRouter();
  const { theme } = useSharedTheme();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // ユーザー情報をセット
  useEffect(() => {
    if (user) {
      setUserProfile(user as UserProfile);
    }
    setIsLoadingProfile(false);
  }, [user]);

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
        <Header title='Profile' onClick={handleBack} />

        <div className={`${className}__container`}>
          <Card blur color={theme.colors.surface.main} className={`${className}__card`}>
            <FlexColumn gap={16}>
              <div>
                <Text text='Basic Information' fontSize={fontSizes.large1} color={theme.colors.text} fontWeight={fontWeights.bold} />
              </div>

              {isLoadingProfile ? (
                <Text text='Loading user information...' fontSize={fontSizes.medium} color={theme.colors.text} />
              ) : userProfile ? (
                <FlexColumn gap={16}>
                  <div className={`${className}__infoField`}>
                    <Text text='Name' fontSize={fontSizes.small} color={theme.colors.secondary.main} fontWeight={fontWeights.bold} />
                    <Text text={userProfile.name || '-'} fontSize={fontSizes.medium} color={theme.colors.text} />
                  </div>

                  <div className={`${className}__infoField`}>
                    <Text text='Email' fontSize={fontSizes.small} color={theme.colors.secondary.main} fontWeight={fontWeights.bold} />
                    <Text text={userProfile.email || '-'} fontSize={fontSizes.medium} color={theme.colors.text} />
                  </div>

                  <div className={`${className}__infoField`}>
                    <Text text='User ID' fontSize={fontSizes.small} color={theme.colors.secondary.main} fontWeight={fontWeights.bold} />
                    <Text text={userProfile.id || '-'} fontSize={fontSizes.smallest} color={theme.colors.secondary.main} fontWeight='lighter' />
                  </div>
                </FlexColumn>
              ) : (
                <Text text='User information not available' fontSize={fontSizes.medium} color={theme.colors.error} />
              )}
            </FlexColumn>
          </Card>
        </div>
      </InnerContent>
    </div>
  );
};

const ProfilePage = styled(Component)`
  height: 100vh;

  &__container {
    padding: 0 24px;
    margin-bottom: 24px;
  }

  &__card {
    padding: 24px;
  }

  &__infoField {
    padding-bottom: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};

    &:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  &__centerContent {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
`;

export default ProfilePage;
