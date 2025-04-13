import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@/hooks/useSharedTheme.tsx';
import { ObjectToggleList } from '@/pages/heatmap/tasks/[task_id]/ObjectToggleList.tsx';
import darkTheme from '@/styles/dark.ts';
import lightTheme from '@/styles/light.ts';

export default {
  component: ObjectToggleList,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof ObjectToggleList>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <ObjectToggleList {...args} />
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    model: {
      children: [
        { uuid: '1', name: 'Model1', type: 'obj', visible: true },
        { uuid: '2', name: 'Model2', type: 'gltf', visible: false },
        { uuid: '3', name: 'Model3', type: 'glb', visible: true },
      ],
    },
  },
};
