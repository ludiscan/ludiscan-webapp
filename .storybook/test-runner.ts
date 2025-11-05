import type { TestRunnerConfig } from '@storybook/test-runner';
import { argosScreenshot } from '@argos-ci/storybook/test-runner';

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // Take a screenshot of each story using Argos
    await argosScreenshot(page, context);
  },
};

export default config;
