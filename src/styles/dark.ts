import { Colors } from './index.ts';

import type { Theme } from '@emotion/react';

const darkTheme: Theme = {
  colors: {
    primary: Colors.primary,
    background: Colors.stone11,
    surface: Colors.stone10,
    text: Colors.white,
    secondary: Colors.stone06,
    border: Colors.stone09,
    error: Colors.error,
  },
} as const;

export default darkTheme;
