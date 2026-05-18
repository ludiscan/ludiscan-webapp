import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { Header } from '@src/component/templates/Header';

export default {
  component: Header,
  controls: { hideNoControlsWarning: true },
  argTypes: {
    onToggleSidebar: { action: 'onToggleSidebar' },
  },
} as Meta;

type Story = StoryObj<typeof Header>;

const Template: Story = {
  render: (args) => {
    return <Header {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    title: 'Page1',
  },
};

export const AddIconTitleEnd: Story = {
  ...Template,
  name: 'icon title end style',
  args: {
    title: 'Page1',
  },
  render: (args) => {
    return (
      <Header
        {...args}
        iconTitleEnd={
          <Button onClick={() => {}} fontSize={'base'} scheme={'primary'} width={'fit-content'}>
            <Text text={'Add'} />
          </Button>
        }
      />
    );
  },
};
