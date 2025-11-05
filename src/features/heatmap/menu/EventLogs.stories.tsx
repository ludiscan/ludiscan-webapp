import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps } from '@src/features/heatmap/__storybook__/mockData';
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
  args: createMockMenuProps({
    name: 'eventlog',
    eventLogKeys: ['PlayerDeath', 'ItemPickup', 'EnemyKill'],
  }),
};

export const WithHandChangeItem: Story = {
  ...Template,
  name: 'With HandChangeItem Event',
  args: createMockMenuProps({
    name: 'eventlog',
    eventLogKeys: ['GetHandChangeItem', 'PlayerDeath', 'ItemPickup'],
  }),
};

export const ManyEvents: Story = {
  ...Template,
  name: 'Many Events',
  args: createMockMenuProps({
    name: 'eventlog',
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
  }),
};
