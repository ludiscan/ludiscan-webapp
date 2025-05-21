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
      dark: colors.stone11, // surfaceの暗いバリエーション
      light: colors.stone07, // surfaceの明るいバリエーション
    },
    text: colors.white,
    secondary: {
      main: colors.stone01,
      dark: colors.stone03,
      light: colors.neutral09,
    },
    border: {
      main: colors.stone09,
      dark: colors.stone10,
      light: colors.stone08,
    },
    error: colors.error,
    disabled: colors.stone01,
    isLight: false,
  },
} as const;

export default darkTheme;
