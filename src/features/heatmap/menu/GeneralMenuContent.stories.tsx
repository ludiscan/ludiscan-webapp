import type { Meta, StoryObj } from '@storybook/nextjs';

import { GeneralMenuContent } from '@src/features/heatmap/menu/GeneralMenuContent';

export default {
  component: GeneralMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof GeneralMenuContent>;

const Template: Story = {
  render: (args) => {
    return <GeneralMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    model: null,
    name: 'general',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
  },
};
