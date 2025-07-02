import styled from '@emotion/styled';

import type { FlexProps } from '@src/component/atoms/Flex';

import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes } from '@src/styles/style';

export const InputColumn = styled(({ className, label, children }: { className?: string; label: string; children: React.ReactNode }) => {
  const { theme } = useSharedTheme();
  return (
    <InlineFlexColumn className={className} align={'flex-start'} wrap={'nowrap'} gap={2}>
      <Text text={label} fontSize={fontSizes.small} style={{ width: '110px' }} color={theme.colors.secondary.light} />
      <div style={{ width: '100%' }}>{children}</div>
    </InlineFlexColumn>
  );
})`
  position: relative;
  width: 100%;
  padding: 4px 8px;
`;

export const InputRow = styled(
  ({ className, label, children, align = 'center' }: { className?: string; label: string; children: React.ReactNode; align?: FlexProps['align'] }) => {
    const { theme } = useSharedTheme();
    return (
      <div className={className}>
        <InlineFlexRow align={align} wrap={'nowrap'} gap={4}>
          <Text text={label} fontSize={fontSizes.small} style={{ width: '90px' }} color={theme.colors.secondary.light} />
          <div style={{ flex: 1 }}>{children}</div>
        </InlineFlexRow>
      </div>
    );
  },
)`
  position: relative;
  width: 100%;
  padding: 4px 8px;
`;
