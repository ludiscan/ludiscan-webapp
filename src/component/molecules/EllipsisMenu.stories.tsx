// EllipsisMenu.stories.tsx
import darkTheme from '../../styles/dark';
import lightTheme from '../../styles/light';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { EllipsisMenu } from '@src/component/molecules/EllipsisMenu';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';

export default {
  component: EllipsisMenu,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof EllipsisMenu>;

const Template: Story = {
  args: {},
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <EllipsisMenu {...args}>
          <EllipsisMenu.ContentRow>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Discord'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'primary'}>
              <Text text={'Export'} fontWeight={'bold'} />
            </Button>
          </EllipsisMenu.ContentRow>
        </EllipsisMenu>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    ...Template.args,
    fontSize: 'medium',
  },
};

export const type1: Story = {
  ...Template,
  name: 'fontSize: small scheme: surface',
  args: {
    ...Template.args,
    fontSize: 'medium',
    scheme: 'none',
  },
};

export const Column: Story = {
  ...Template,
  name: 'ContentColumn',
  args: {
    ...Template.args,
    fontSize: 'medium',
  },
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <EllipsisMenu {...args}>
          <EllipsisMenu.ContentColumn>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Discord'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'primary'}>
              <Text text={'Export'} fontWeight={'bold'} />
            </Button>
          </EllipsisMenu.ContentColumn>
        </EllipsisMenu>
      </SharedThemeProvider>
    );
  },
};
