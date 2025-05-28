// EllipsisMenu.stories.tsx
import { UserIcon } from '@storybook/icons';
import { BsPerson } from 'react-icons/bs';

import darkTheme from '../../styles/dark';
import lightTheme from '../../styles/light';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { EllipsisMenu, Menu } from '@src/component/molecules/Menu';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';

export default {
  component: Menu,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Menu>;

const Template: Story = {
  args: {},
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Menu {...args}>
          <Menu.ContentRow>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Discord'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'primary'}>
              <Text text={'Export'} fontWeight={'bold'} />
            </Button>
          </Menu.ContentRow>
        </Menu>
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

export const Ellipsis: Story = {
  ...Template,
  name: 'Ellipsis',
  args: {
    ...Template.args,
    fontSize: 'medium',
    scheme: 'none',
  },
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <EllipsisMenu {...args}>
          <Menu.ContentRow>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Discord'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'primary'}>
              <Text text={'Export'} fontWeight={'bold'} />
            </Button>
          </Menu.ContentRow>
        </EllipsisMenu>
      </SharedThemeProvider>
    );
  },
};

export const type1: Story = {
  ...Template,
  name: 'fontSize: small scheme: surface',
  args: {
    ...Template.args,
    fontSize: 'medium',
    scheme: 'none',
    icon: <BsPerson />,
  },
};

export const Column: Story = {
  ...Template,
  name: 'ContentColumn',
  args: {
    ...Template.args,
    fontSize: 'medium',
    icon: <UserIcon />,
  },
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Menu {...args}>
          <Menu.ContentColumn>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Discord'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'primary'}>
              <Text text={'Export'} fontWeight={'bold'} />
            </Button>
          </Menu.ContentColumn>
        </Menu>
      </SharedThemeProvider>
    );
  },
};
