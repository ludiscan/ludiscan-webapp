import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ThemeType } from '@src/modeles/theme';
import type { FC } from 'react';

import { PanelCard } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Seo } from '@src/component/atoms/Seo';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { DashboardBackgroundCanvas } from '@src/component/templates/DashboardBackgroundCanvas';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useSidebar } from '@src/hooks/useSidebar';
import themes from '@src/modeles/theme';
import { InnerContent } from '@src/pages/_app.page';

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
  const { theme, themeType, setThemeType } = useSharedTheme();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const themeTypeOptions = useMemo(() => Object.keys(themes) as ThemeType[], []);

  const handleThemeTypeChange = useCallback(
    (value: string) => {
      setThemeType(value as ThemeType);
    },
    [setThemeType],
  );

  // ユーザー情報をセット
  useEffect(() => {
    if (user) {
      setUserProfile(user as UserProfile);
    }
    setIsLoadingProfile(false);
  }, [user]);

  const { toggle: toggleSidebar } = useSidebar();

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      router.replace('/');
    }
  }, [isAuthorized, isLoading, ready, router]);

  if (!ready || isLoading) {
    return (
      <div className={className}>
        <DashboardBackgroundCanvas className='visible' />
        <SidebarLayout />
        <InnerContent>
          <div className={`${className}__centerContent`}>
            <Text text='Loading...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
          </div>
        </InnerContent>
      </div>
    );
  }

  return (
    <div className={className}>
      <Seo title='Profile' path='/profile' noIndex={true} />
      <DashboardBackgroundCanvas className='visible' />
      <SidebarLayout />
      <InnerContent>
        <Header title='Profile' onToggleSidebar={toggleSidebar} />

        <div className={`${className}__container`}>
          <PanelCard color={theme.colors.surface.base} className={`${className}__card`}>
            <FlexColumn gap={16}>
              <div>
                <Text
                  text='Basic Information'
                  fontSize={theme.typography.fontSize.lg}
                  color={theme.colors.text.primary}
                  fontWeight={theme.typography.fontWeight.bold}
                />
              </div>

              {isLoadingProfile ? (
                <Text text='Loading user information...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
              ) : userProfile ? (
                <FlexColumn gap={16}>
                  <div className={`${className}__infoField`}>
                    <Text
                      text='Name'
                      fontSize={theme.typography.fontSize.sm}
                      color={theme.colors.text.secondary}
                      fontWeight={theme.typography.fontWeight.bold}
                    />
                    <Text text={userProfile.name || '-'} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
                  </div>

                  <div className={`${className}__infoField`}>
                    <Text
                      text='Email'
                      fontSize={theme.typography.fontSize.sm}
                      color={theme.colors.text.secondary}
                      fontWeight={theme.typography.fontWeight.bold}
                    />
                    <Text text={userProfile.email || '-'} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
                  </div>

                  <div className={`${className}__infoField`}>
                    <Text
                      text='User ID'
                      fontSize={theme.typography.fontSize.sm}
                      color={theme.colors.text.secondary}
                      fontWeight={theme.typography.fontWeight.bold}
                    />
                    <Text text={userProfile.id || '-'} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} fontWeight='lighter' />
                  </div>
                </FlexColumn>
              ) : (
                <Text text='User information not available' fontSize={theme.typography.fontSize.base} color={theme.colors.semantic.error.main} />
              )}
            </FlexColumn>
          </PanelCard>

          <PanelCard color={theme.colors.surface.base} className={`${className}__card`}>
            <FlexColumn gap={16}>
              <div>
                <Text
                  text='Appearance'
                  fontSize={theme.typography.fontSize.lg}
                  color={theme.colors.text.primary}
                  fontWeight={theme.typography.fontWeight.bold}
                />
              </div>

              <div className={`${className}__infoField`}>
                <Text text='Theme' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} fontWeight={theme.typography.fontWeight.bold} />
                <FlexRow align={'center'} gap={8}>
                  <Selector
                    options={themeTypeOptions}
                    value={themeType}
                    onChange={handleThemeTypeChange}
                    fontSize={'base'}
                    scheme={'none'}
                    border={false}
                    placement={'bottom'}
                    align={'left'}
                  />
                </FlexRow>
              </div>
            </FlexColumn>
          </PanelCard>
        </div>
      </InnerContent>
    </div>
  );
};

const ProfilePage = styled(Component)`
  position: relative;
  height: 100vh;

  &__container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 12px 6px;
    margin-bottom: 24px;
  }

  &__card {
    padding: 24px;
  }

  &__infoField {
    padding-bottom: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

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
