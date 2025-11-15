import styled from '@emotion/styled';
import { IconContext } from 'react-icons';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC, ReactNode } from 'react';

import { ButtonIconSize, Button } from '@src/component/atoms/Button';
import { FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

type IconLabelRowProps = {
  className?: string;
  icon: ReactNode;
  gap?: number;
  label: string;
};

export type IconLabelRowButtonProps = IconLabelRowProps & {
  onClick: ButtonProps['onClick'];
};

export type IconLabelRowLinkProps = IconLabelRowProps & {
  href: string;
  target?: '_blank' | '_self';
};

const Component: FC<IconLabelRowButtonProps | IconLabelRowLinkProps> = (props) => {
  const { theme } = useSharedTheme();
  if ('onClick' in props) {
    const { className, icon, label, onClick, gap } = props as IconLabelRowButtonProps;
    return (
      <Button className={className} onClick={onClick} scheme={'none'} fontSize={'base'}>
        <FlexRow gap={gap} align={'center'} wrap={'nowrap'} className={`${className}__buttonRow`}>
          {icon}
          <Text text={label} />
        </FlexRow>
      </Button>
    );
  }
  const { className, icon, label, href, target = '_self', gap } = props as IconLabelRowLinkProps;
  return (
    <a className={`${className} a`} href={href} target={target} rel='noopener noreferrer'>
      <IconContext.Provider value={{ size: ButtonIconSize({ fontSize: 'base' }) }}>
        <FlexRow gap={gap} align={'center'} wrap={'nowrap'} className={`${className}__linkedRow`}>
          {icon}
          <Text className={`${className}__linkedText`} text={label} fontSize={theme.typography.fontSize.base} />
        </FlexRow>
      </IconContext.Provider>
    </a>
  );
};

export const IconLabelRow = styled(Component)`
  color: inherit;
  text-decoration: none;

  &.a {
    display: flex;
    flex-flow: row;
  }

  &__buttonRow,
  &__linkedRow {
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    text-decoration: none;
  }
`;
