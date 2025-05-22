import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import { HeatmapIdPageLayout } from '@src/pages/heatmap/tasks/[task_id]/index.page';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

export default {
  component: HeatmapIdPageLayout,
  controls: {},
} as Meta;

type Story = StoryObj<typeof HeatmapIdPageLayout>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <HeatmapIdPageLayout {...args} />
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  args: {
    version: 'story',
    service: {
      isInitialized: true,
      getMapList: async () => [''],
      getMapContent: async () => null,
      getGeneralLogKeys: async () => null,
      getTask: () => null,
      getEventLog: async () => [],
      eventLogs: {},
    },
  },
};
