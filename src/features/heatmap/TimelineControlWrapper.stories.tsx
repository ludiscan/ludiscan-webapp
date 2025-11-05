import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs';

import { TimelineControlWrapper } from '@src/features/heatmap/TimelineControlWrapper';

export default {
  component: TimelineControlWrapper,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof TimelineControlWrapper>;

const TimelineControlWrapperExample = () => {
  const [visibleTimelineRange, setVisibleTimelineRange] = useState({
    start: 0,
    end: 10000,
  });
  const [openMenu, setOpenMenu] = useState<string | undefined>(undefined);

  return (
    <div>
      <TimelineControlWrapper
        visibleTimelineRange={visibleTimelineRange}
        setVisibleTimelineRange={setVisibleTimelineRange}
        setOpenMenu={setOpenMenu}
      />
      {openMenu && <div style={{ marginTop: 20 }}>Open Menu: {openMenu}</div>}
    </div>
  );
};

export const Default: Story = {
  render: () => <TimelineControlWrapperExample />,
  name: 'Default',
};
