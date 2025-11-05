import type { Meta, StoryObj } from '@storybook/nextjs';

import { EventLogContent } from '@src/features/heatmap/menu/EventLogs';

export default {
  component: EventLogContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof EventLogContent>;

const Template: Story = {
  render: (args) => {
    return <EventLogContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    model: null,
    name: 'eventlog',
    toggleMenu: () => {},
    eventLogKeys: ['PlayerDeath', 'ItemPickup', 'EnemyKill'],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
  },
};

export const WithHandChangeItem: Story = {
  ...Template,
  name: 'With HandChangeItem Event',
  args: {
    model: null,
    name: 'eventlog',
    toggleMenu: () => {},
    eventLogKeys: ['GetHandChangeItem', 'PlayerDeath', 'ItemPickup'],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
  },
};

export const ManyEvents: Story = {
  ...Template,
  name: 'Many Events',
  args: {
    model: null,
    name: 'eventlog',
    toggleMenu: () => {},
    eventLogKeys: [
      'PlayerSpawn',
      'PlayerDeath',
      'ItemPickup',
      'ItemDrop',
      'EnemyKill',
      'DamageTaken',
      'HealthRestore',
      'LevelUp',
    ],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
  },
};
