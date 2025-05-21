import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { CiUser, CiLight, CiDark } from 'react-icons/ci';
import { FiChevronLeft } from 'react-icons/fi';

import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { dimensions, fontSizes, fontWeights } from '@src/styles/style';

export type HeaderProps = {
  className?: string | undefined;
  iconTitleEnd?: ReactNode;
  title: string;
  onClick?: () => void | Promise<void>;
};

const Component: FC<HeaderProps> = ({ className, title, onClick, iconTitleEnd }) => {
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
      <FlexRow align={'center'} gap={12} className={`${className}__innerHeader`}>
        <Button fontSize={'large2'} onClick={backIconHandle} scheme={'none'}>
          <FiChevronLeft />
        </Button>
        <Text text={title} fontSize={fontSizes.large2} fontWeight={fontWeights.bold} />
        {iconTitleEnd && <>{iconTitleEnd}</>}
        <div style={{ flex: 1 }} />
        <Button fontSize={'large2'} onClick={toggleTheme} scheme={'none'}>
          {theme.colors.isLight ? <CiDark size={24} color={theme.colors.text} /> : <CiLight size={24} color={theme.colors.text} />}
        </Button>
        <Link href={'/login'} style={{ display: 'flex', alignItems: 'center' }}>
          <CiUser size={24} color={theme.colors.text} />
        </Link>
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
    padding: 8px 16px;
    margin: 0 auto;
  }
`;
