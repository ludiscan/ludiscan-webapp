import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { CiUser, CiLight, CiDark } from 'react-icons/ci';
import { FiChevronLeft } from 'react-icons/fi';

import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { EllipsisMenu } from '@src/component/molecules/EllipsisMenu';
import { DesktopLayout, MobileLayout } from '@src/component/molecules/responsive';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { dimensions, fontSizes, fontWeights } from '@src/styles/style';

export type HeaderProps = {
  className?: string | undefined;
  iconTitleEnd?: ReactNode;
  title: string;
  iconEnd?: ReactNode;
  onClick?: () => void | Promise<void>;
};

const Component: FC<HeaderProps> = ({ className, title, onClick, iconTitleEnd, iconEnd }) => {
  const { theme, toggleTheme } = useSharedTheme();

  const router = useRouter();
  const backIconHandle = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  }, [onClick, router]);
  return (
    <header className={className}>
      <FlexRow align={'center'} gap={12} className={`${className}__innerHeader`} wrap={'nowrap'}>
        <Button fontSize={'large2'} onClick={backIconHandle} scheme={'none'}>
          <FiChevronLeft />
        </Button>
        <Text text={title} fontSize={fontSizes.large2} fontWeight={fontWeights.bold} />
        {iconTitleEnd && <>{iconTitleEnd}</>}
        <div style={{ flex: 1 }} />

        {iconEnd && (
          <DesktopLayout>
            <InlineFlexRow align={'center'} gap={8} style={{ height: '100%' }} wrap={'nowrap'}>
              {iconEnd}
            </InlineFlexRow>
          </DesktopLayout>
        )}
        {iconEnd && (
          <MobileLayout>
            <EllipsisMenu fontSize={'large2'} scheme={'none'}>
              <EllipsisMenu.ContentRow>{iconEnd}</EllipsisMenu.ContentRow>
            </EllipsisMenu>
          </MobileLayout>
        )}

        <Divider orientation={'vertical'} />
        <InlineFlexRow align={'center'} gap={4} style={{ height: '100%' }} wrap={'nowrap'}>
          <Button fontSize={'large2'} onClick={toggleTheme} scheme={'none'}>
            {theme.colors.isLight ? <CiDark size={24} color={theme.colors.text} /> : <CiLight size={24} color={theme.colors.text} />}
          </Button>
          <Divider orientation={'vertical'} />
          <Link href={'/login'} style={{ display: 'flex', alignItems: 'center' }}>
            <CiUser size={24} color={theme.colors.text} />
          </Link>
        </InlineFlexRow>
      </FlexRow>
    </header>
  );
};

export const Header = styled(Component)`
  display: flex;
  height: ${dimensions.headerHeight}px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface.main};
  transition: margin-left 0.3s ease-in-out;

  &__innerHeader {
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px;
    margin: 0 auto;

    /* stylelint-disable media-query-no-invalid */
    @media (max-width: ${dimensions.mobileWidth}px) {
      display: none;
    }
  }
`;
