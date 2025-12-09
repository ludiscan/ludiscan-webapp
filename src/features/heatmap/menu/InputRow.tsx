import styled from '@emotion/styled';

import type { FlexProps } from '@src/component/atoms/Flex';
import type { ReactNode } from 'react';

import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export const InputColumn = styled(({ className, label, children }: { className?: string; label: string; children: ReactNode }) => {
  const { theme } = useSharedTheme();
  return (
    <InlineFlexColumn className={className} align={'flex-start'} wrap={'nowrap'} gap={2}>
      <Text text={label} fontSize={theme.typography.fontSize.sm} style={{ width: '110px' }} color={theme.colors.tertiary.main} />
      <div style={{ width: '100%' }}>{children}</div>
    </InlineFlexColumn>
  );
})`
  position: relative;
  width: 100%;
  padding: 4px 8px;
`;

export const InputRow = styled(
  ({ className, label, children, align = 'center' }: { className?: string; label: string; children: ReactNode; align?: FlexProps['align'] }) => {
    const { theme } = useSharedTheme();
    return (
      <InlineFlexRow className={className} align={align} wrap={'nowrap'} gap={4}>
        <Text
          text={label}
          fontSize={theme.typography.fontSize.sm}
          fontWeight={theme.typography.fontWeight.medium}
          style={{ width: '90px' }}
          color={theme.colors.tertiary.main}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: align, gap: '4px' }}>{children}</div>
      </InlineFlexRow>
    );
  },
)`
  position: relative;
  width: 100%;
  padding: 4px 8px;
  word-break: break-all;
`;
