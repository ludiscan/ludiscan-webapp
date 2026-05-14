import styled from '@emotion/styled';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ThemeType } from '@src/modeles/theme';
import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { PanelCard } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Seo } from '@src/component/atoms/Seo';
import { Text } from '@src/component/atoms/Text';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { Selector } from '@src/component/molecules/Selector';
import { DashboardBackgroundCanvas } from '@src/component/templates/DashboardBackgroundCanvas';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useToast } from '@src/component/templates/ToastContext';
import { useAuth } from '@src/hooks/useAuth';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useSidebar } from '@src/hooks/useSidebar';
import { createClient } from '@src/modeles/qeury';
import themes from '@src/modeles/theme';
import { InnerContent } from '@src/pages/_app.page';

const MIN_PASSWORD_LENGTH = 8;

export type ProfilePageProps = {
  className?: string;
};

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: string;
}

const getInitials = (name: string, email: string): string => {
  const source = name?.trim() || email?.trim() || '';
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

type SectionProps = {
  className?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

const SectionBase: FC<SectionProps> = ({ className, title, description, children }) => {
  const { theme } = useSharedTheme();
  return (
    <PanelCard color={theme.colors.surface.base} className={className}>
      <FlexColumn gap={20}>
        <FlexColumn gap={4}>
          <Text text={title} fontSize={theme.typography.fontSize.lg} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
          {description && <Text text={description} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} fontWeight={'lighter'} />}
        </FlexColumn>
        {children}
      </FlexColumn>
    </PanelCard>
  );
};

const Section = styled(SectionBase)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Component: FC<ProfilePageProps> = ({ className }) => {
  const { isAuthorized, isLoading, ready, user } = useAuth();
  const router = useRouter();
  const { theme, themeType, setThemeType } = useSharedTheme();
  const { t } = useLocale();
  const { showToast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const themeTypeOptions = useMemo(() => Object.keys(themes) as ThemeType[], []);

  const handleThemeTypeChange = useCallback(
    (value: string) => {
      setThemeType(value as ThemeType);
    },
    [setThemeType],
  );

  const resetPasswordFields = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: async () => {
      const { error, response } = await createClient().PATCH('/api/v0/users/me/password', {
        body: {
          currentPassword,
          newPassword,
        },
      });
      if (error) {
        if (response?.status === 401) {
          throw new Error(t('profile.passwordUpdate.errorUnauthorized'));
        }
        throw new Error(t('profile.passwordUpdate.errorGeneric'));
      }
    },
    onSuccess: () => {
      showToast(t('profile.passwordUpdate.success'), 2, 'success');
      resetPasswordFields();
    },
    onError: (error: Error) => {
      showToast(error.message, 3, 'error');
    },
  });

  const handlePasswordSubmit = useCallback(() => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(t('profile.passwordUpdate.errorRequired'), 2, 'error');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      showToast(t('profile.passwordUpdate.errorTooShort'), 2, 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('profile.passwordUpdate.errorMismatch'), 2, 'error');
      return;
    }
    updatePassword();
  }, [currentPassword, newPassword, confirmPassword, showToast, t, updatePassword]);

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

  const initials = userProfile ? getInitials(userProfile.name || '', userProfile.email || '') : '?';

  return (
    <div className={className}>
      <Seo title='Profile' path='/profile' noIndex={true} />
      <DashboardBackgroundCanvas className='visible' />
      <SidebarLayout />
      <InnerContent>
        <Header title={t('profile.title')} onToggleSidebar={toggleSidebar} />

        <div className={`${className}__container`}>
          {/* Identity header */}
          <PanelCard color={theme.colors.surface.base} className={`${className}__identityCard`}>
            {isLoadingProfile ? (
              <Text text={t('profile.loadingUser')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            ) : userProfile ? (
              <FlexRow gap={20} align={'center'} className={`${className}__identityRow`}>
                <div className={`${className}__avatar`} aria-hidden='true'>
                  {initials}
                </div>
                <FlexColumn gap={4} className={`${className}__identityText`}>
                  <Text
                    text={userProfile.name || userProfile.email || '-'}
                    fontSize={theme.typography.fontSize.xl}
                    color={theme.colors.text.primary}
                    fontWeight={theme.typography.fontWeight.bold}
                  />
                  <Text text={userProfile.email || '-'} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} fontWeight={'lighter'} />
                  {userProfile.role && (
                    <div className={`${className}__roleBadge`}>
                      <Text
                        text={userProfile.role}
                        fontSize={theme.typography.fontSize.xs}
                        color={theme.colors.primary.contrast}
                        fontWeight={theme.typography.fontWeight.bold}
                      />
                    </div>
                  )}
                </FlexColumn>
              </FlexRow>
            ) : (
              <Text text={t('profile.userNotAvailable')} fontSize={theme.typography.fontSize.base} color={theme.colors.semantic.error.main} />
            )}
          </PanelCard>

          {/* Basic Information */}
          <Section title={t('profile.basicInfo')}>
            {isLoadingProfile ? (
              <Text text={t('profile.loadingUser')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            ) : userProfile ? (
              <dl className={`${className}__infoList`}>
                <div className={`${className}__infoRow`}>
                  <dt className={`${className}__infoLabel`}>{t('common.name')}</dt>
                  <dd className={`${className}__infoValue`}>{userProfile.name || '-'}</dd>
                </div>
                <div className={`${className}__infoRow`}>
                  <dt className={`${className}__infoLabel`}>{t('common.email')}</dt>
                  <dd className={`${className}__infoValue`}>{userProfile.email || '-'}</dd>
                </div>
                <div className={`${className}__infoRow`}>
                  <dt className={`${className}__infoLabel`}>{t('profile.userId')}</dt>
                  <dd className={`${className}__infoValue ${className}__infoValue--mono`}>{userProfile.id || '-'}</dd>
                </div>
              </dl>
            ) : (
              <Text text={t('profile.userNotAvailable')} fontSize={theme.typography.fontSize.base} color={theme.colors.semantic.error.main} />
            )}
          </Section>

          {/* Appearance */}
          <Section title='Appearance'>
            <div className={`${className}__settingRow`}>
              <Text text='Theme' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
              <div className={`${className}__selectorWrapper`}>
                <Selector
                  options={themeTypeOptions}
                  value={themeType}
                  onChange={handleThemeTypeChange}
                  fontSize={'base'}
                  scheme={'surface'}
                  border={true}
                  placement={'bottom'}
                  align={'left'}
                />
              </div>
            </div>
          </Section>

          {/* Password Change */}
          <Section title={t('profile.passwordUpdate.title')} description={t('profile.passwordUpdate.hint')}>
            <FlexColumn gap={12}>
              <OutlinedTextField
                label={t('profile.passwordUpdate.currentPassword')}
                value={currentPassword}
                onChange={setCurrentPassword}
                type='password'
                fontSize={theme.typography.fontSize.base}
                disabled={isUpdatingPassword}
              />
              <OutlinedTextField
                label={t('profile.passwordUpdate.newPassword')}
                value={newPassword}
                onChange={setNewPassword}
                type='password'
                fontSize={theme.typography.fontSize.base}
                disabled={isUpdatingPassword}
              />
              <OutlinedTextField
                label={t('profile.passwordUpdate.confirmPassword')}
                value={confirmPassword}
                onChange={setConfirmPassword}
                type='password'
                fontSize={theme.typography.fontSize.base}
                disabled={isUpdatingPassword}
              />
            </FlexColumn>

            <FlexRow gap={12} align={'center'} className={`${className}__submitRow`}>
              <Button onClick={handlePasswordSubmit} scheme={'primary'} fontSize={'base'} disabled={isUpdatingPassword}>
                {isUpdatingPassword ? t('common.processing') : t('profile.passwordUpdate.submit')}
              </Button>
            </FlexRow>
          </Section>
        </div>
      </InnerContent>
    </div>
  );
};

const ProfilePage = styled(Component)`
  position: relative;
  height: 100vh;
  height: 100dvh;

  &__container {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    width: 100%;
    max-width: 800px;
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing['2xl']}`};
    margin: 0 auto;

    @media (width <= 768px) {
      padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.xl}`};
    }
  }

  &__identityCard {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  &__identityRow {
    flex-wrap: wrap;
  }

  &__identityText {
    flex: 1;
    min-width: 0;
  }

  &__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary.contrast};
    text-transform: uppercase;
    user-select: none;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.main}, ${({ theme }) => theme.colors.secondary.main});
    border-radius: ${({ theme }) => theme.borders.radius.full};
  }

  &__roleBadge {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    margin-top: ${({ theme }) => theme.spacing.xs};
    text-transform: capitalize;
    background-color: ${({ theme }) => theme.colors.primary.main};
    border-radius: ${({ theme }) => theme.borders.radius.full};
  }

  &__infoList {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0;
  }

  &__infoRow {
    display: flex;
    gap: ${({ theme }) => theme.spacing.md};
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => `${theme.spacing.sm} 0`};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

    &:first-of-type {
      padding-top: 0;
    }

    &:last-of-type {
      padding-bottom: 0;
      border-bottom: none;
    }

    @media (width <= 480px) {
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.xs};
      align-items: flex-start;
    }
  }

  &__infoLabel {
    flex-shrink: 0;
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__infoValue {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.primary};
    text-align: right;
    overflow-wrap: anywhere;

    @media (width <= 480px) {
      text-align: left;
    }
  }

  &__infoValue--mono {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__settingRow {
    display: flex;
    gap: ${({ theme }) => theme.spacing.md};
    align-items: center;
    justify-content: space-between;

    @media (width <= 480px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__selectorWrapper {
    min-width: 200px;
  }

  &__submitRow {
    justify-content: flex-end;
    margin-top: ${({ theme }) => theme.spacing.sm};
  }

  &__centerContent {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
`;

export default ProfilePage;
