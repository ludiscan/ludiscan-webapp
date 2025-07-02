// darkTheme.ts
import { colors } from './style';

import type { Theme } from '@emotion/react';

const darkTheme: Theme = {
  colors: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primaryLight,
    },
    primaryVariant: colors.primaryVariant,
    background: colors.stone08,
    surface: {
      main: colors.stone09,
      dark: colors.stone11,
      light: colors.stone07,
    },
    text: colors.white,
    secondary: {
      main: colors.stone01,
      dark: colors.stone03,
      light: colors.stone04,
    },
    border: {
      main: colors.stone06,
      dark: colors.stone05,
      light: colors.stone04,
    },
    error: colors.error,
    disabled: colors.stone01,
    isLight: false,
  },
} as const;

export default darkTheme;
