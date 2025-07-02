import { useState } from 'react';

import type { PlaySpeedType } from '@src/component/templates/TimelineControllerBlock';
import type { Meta, StoryObj } from '@storybook/react';

import { TimelineControllerBlock } from '@src/component/templates/TimelineControllerBlock';

export default {
  component: TimelineControllerBlock,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof TimelineControllerBlock>;

const Template: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [seekRatio, setSeekRatio] = useState(0);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [minTime, setMinTime] = useState(0);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [maxTime, setMaxTime] = useState(60 * 3 * 1000); // 3 minutes in milliseconds
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [playSpeed, setPlaySpeed] = useState<PlaySpeedType>(1);
    return (
      <TimelineControllerBlock
        {...args}
        currentMaxTime={maxTime}
        currentMinTime={minTime}
        maxTime={60 * 3 * 1000}
        currentTime={seekRatio}
        playSpeed={playSpeed}
        onSeek={setSeekRatio}
        onChangeMaxTime={setMaxTime}
        onChangeMinTime={setMinTime}
        onChangePlaySpeed={setPlaySpeed}
      />
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    isPlaying: false,

    onClickMenu: () => {
      /* eslint-disable-next-line no-console */
      console.log('Menu clicked');
    },
    onClickPlay: () => {
      /* eslint-disable-next-line no-console */
      console.log('Play/Pause clicked');
    },
  },
};
