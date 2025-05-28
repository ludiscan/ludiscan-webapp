import { IoCut } from 'react-icons/io5';

import type { Meta, StoryObj } from '@storybook/react';

import { IconLabelRow } from '@src/component/molecules/IconLabelRow';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

export default {
  component: IconLabelRow,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof IconLabelRow>;
const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <div style={{ border: '1px solid #ccc', width: '300px' }}>
          <IconLabelRow {...args} />
        </div>
      </SharedThemeProvider>
    );
  },
};

export const DefaultButton: Story = {
  ...Template,
  name: 'default button style',
  args: {
    icon: <IoCut />,
    label: 'Cut',
    onClick: () => {
      /* eslint-disable-next-line no-console */
      console.log('IconLabelRow clicked');
    },
  },
};

export const DefaultLink: Story = {
  ...Template,
  name: 'default link style',
  args: {
    icon: <IoCut />,
    label: 'Cut',
    href: 'https://example.com',
    target: '_blank',
  },
};
