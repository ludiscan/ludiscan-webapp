import styled from '@emotion/styled';
import { IconContext } from 'react-icons';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC, ReactNode } from 'react';

import { ButtonIconSize, Button } from '@src/component/atoms/Button';
import { FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { fontSizes } from '@src/styles/style';

type IconLabelRowProps = {
  className?: string;
  icon: ReactNode;
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
  if ('onClick' in props) {
    const { className, icon, label, onClick } = props as IconLabelRowButtonProps;
    return (
      <Button className={className} onClick={onClick} scheme={'none'} fontSize={'medium'}>
        <FlexRow gap={16} align={'center'} wrap={'nowrap'} className={`${className}__buttonRow`}>
          {icon}
          <Text text={label} />
        </FlexRow>
      </Button>
    );
  }
  const { className, icon, label, href, target = '_self' } = props as IconLabelRowLinkProps;
  return (
    <a className={`${className} a`} href={href} target={target} rel='noopener noreferrer'>
      <IconContext.Provider value={{ size: ButtonIconSize({ fontSize: 'medium' }) }}>
        <FlexRow gap={16} align={'center'} wrap={'nowrap'} className={`${className}__linkedRow`}>
          {icon}
          <Text className={`${className}__linkedText`} text={label} fontSize={fontSizes.medium} />
        </FlexRow>
      </IconContext.Provider>
    </a>
  );
};

export const IconLabelRow = styled(Component)`
  padding: 6px 16px;
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
