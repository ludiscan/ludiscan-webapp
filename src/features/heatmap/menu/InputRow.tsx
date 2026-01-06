import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import type { FlexProps } from '@src/component/atoms/Flex';
import type { ReactNode } from 'react';

import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Tooltip } from '@src/component/atoms/Tooltip';
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

/** maxLines指定時に省略されているかを検出し、ツールチップを表示するラベル */
const TruncatableLabel = ({
  label,
  fontSize,
  fontWeight,
  color,
  width,
  maxLines,
}: {
  label: string;
  fontSize: string;
  fontWeight: number;
  color: string;
  width: string;
  maxLines: number;
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const { theme } = useSharedTheme();

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [label]);

  const textElement = <Text ref={textRef} text={label} fontSize={fontSize} fontWeight={fontWeight} style={{ width }} color={color} maxLines={maxLines} />;

  if (isTruncated) {
    return (
      <Tooltip placement='top' tooltip={label} fontSize={theme.typography.fontSize.sm}>
        {textElement}
      </Tooltip>
    );
  }

  return textElement;
};

export const InputRow = styled(
  ({ className, label, children, align = 'center' }: { className?: string; label: string; children: ReactNode; align?: FlexProps['align'] }) => {
    const { theme } = useSharedTheme();
    return (
      <InlineFlexRow className={className} align={align} wrap={'nowrap'} gap={4}>
        <TruncatableLabel
          label={label}
          fontSize={theme.typography.fontSize.sm}
          fontWeight={theme.typography.fontWeight.medium}
          color={theme.colors.tertiary.main}
          width='90px'
          maxLines={1}
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
