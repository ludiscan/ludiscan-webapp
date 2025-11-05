// EllipsisMenu.stories.tsx
import { UserIcon } from '@storybook/icons';
import { BsPerson } from 'react-icons/bs';

import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { EllipsisMenu, Menu } from '@src/component/molecules/Menu';

export default {
  component: Menu,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Menu>;

const Template: Story = {
  args: {},
  render: (args) => {
    return (
      <Menu {...args}>
        <Menu.ContentRow>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
            <Text text={'Discord'} fontWeight={'bold'} />
          </Button>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
            <Text text={'Save'} fontWeight={'bold'} />
          </Button>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'primary'}>
            <Text text={'Export'} fontWeight={'bold'} />
          </Button>
        </Menu.ContentRow>
      </Menu>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    ...Template.args,
    fontSize: 'base',
  },
};

export const Ellipsis: Story = {
  ...Template,
  name: 'Ellipsis',
  args: {
    ...Template.args,
    fontSize: 'base',
    scheme: 'none',
  },
  render: (args) => {
    return (
      <EllipsisMenu {...args}>
        <Menu.ContentRow>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
            <Text text={'Discord'} fontWeight={'bold'} />
          </Button>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
            <Text text={'Save'} fontWeight={'bold'} />
          </Button>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'primary'}>
            <Text text={'Export'} fontWeight={'bold'} />
          </Button>
        </Menu.ContentRow>
      </EllipsisMenu>
    );
  },
};

export const type1: Story = {
  ...Template,
  name: 'fontSize: small scheme: surface',
  args: {
    ...Template.args,
    fontSize: 'base',
    scheme: 'none',
    icon: <BsPerson />,
  },
};

export const Column: Story = {
  ...Template,
  name: 'ContentColumn',
  args: {
    ...Template.args,
    fontSize: 'base',
    icon: <UserIcon />,
  },
  render: (args) => {
    return (
      <Menu {...args}>
        <Menu.ContentColumn>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
            <Text text={'Discord'} fontWeight={'bold'} />
          </Button>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
            <Text text={'Save'} fontWeight={'bold'} />
          </Button>
          <Button fontSize={'sm'} onClick={() => {}} scheme={'primary'}>
            <Text text={'Export'} fontWeight={'bold'} />
          </Button>
        </Menu.ContentColumn>
      </Menu>
    );
  },
};
