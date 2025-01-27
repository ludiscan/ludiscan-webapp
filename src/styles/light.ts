import { Colors } from './index.ts';

import type { Theme } from '@emotion/react';

const lightTheme: Theme = {
  colors: {
    primary: Colors.primary,
    background: Colors.neutral02,
    surface: Colors.neutral01,
    text: Colors.stone11,
    secondary: Colors.neutral06,
    border: Colors.neutral09,
    error: Colors.error,
  },
} as const;

export default lightTheme;
