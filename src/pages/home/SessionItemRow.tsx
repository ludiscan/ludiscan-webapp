import styled from '@emotion/styled';

import { FlexRow, InlineFlexColumn } from '../../component/atoms/Flex';
import { Tooltip } from '../../component/atoms/Tooltip';
import { ClampText } from '../../component/molecules/ClampText';
import { fontSizes } from '../../styles/style';

import type { Session } from '../../modeles/session';
import type { FC } from 'react';


export type SessionItemRowProps = {
  className?: string | undefined;
  session: Session;
};

const Component: FC<SessionItemRowProps> = ({ className, session }) => {
  return (
    <FlexRow className={className} gap={4} align={'center'}>
      <InlineFlexColumn gap={3} align={'flex-start'}>
        <ClampText text={session.name} fontSize={fontSizes.medium} fontWeight={'bold'} lines={1} width={'120px'} />
        <Tooltip tooltip={String(session.deviceId ?? '---')}>
          <ClampText text={String(session.deviceId ?? '---')} fontSize={fontSizes.smallest} fontWeight={'lighter'} lines={1} width={'100px'} />
        </Tooltip>
      </InlineFlexColumn>
    </FlexRow>
  );
};

export const SessionItemRow = styled(Component)`
  height: fit-content;
  min-height: 32px;
  width: 100%;
`;
