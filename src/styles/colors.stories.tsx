import { Card } from '../component/atoms/Card';
import { FlexColumn } from '../component/atoms/Flex';
import { Text } from '../component/atoms/Text';
import { SharedThemeProvider, useSharedTheme } from '../hooks/useSharedTheme';
import { flattenObject } from '../utils/flattenObject';

import darkTheme from './dark.ts';
import lightTheme from './light.ts';
import { colors } from './style';

import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';


export default {
  component: undefined,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj;

const Item: FC = () => {
  const { theme } = useSharedTheme();
  return (
    <FlexColumn>
      {flattenObject(theme.colors).map(({ name, value }) => (
        <Text key={name} text={name} color={value} />
      ))}
    </FlexColumn>
  );
};

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Card color={colors.honey02}>
          <Item />
        </Card>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'colors',
  args: {},
};
