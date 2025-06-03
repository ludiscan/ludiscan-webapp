// lightTheme.ts
import { colors } from './style';

import type { Theme } from '@emotion/react';

const lightTheme: Theme = {
  colors: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primaryLight,
    },
    primaryVariant: colors.primaryVariant,
    background: colors.neutral02,
    surface: {
      main: colors.neutral01,
      dark: colors.neutral03, // やや暗いバリエーション
      light: colors.white, // 明るいバリエーション
    },
    text: colors.stone11,
    secondary: {
      main: colors.stone06,
      dark: colors.stone07,
      light: colors.stone04,
    },
    border: {
      main: colors.neutral05,
      dark: colors.neutral07,
      light: colors.neutral03,
    },
    error: colors.error,
    disabled: colors.stone01,
    isLight: true,
  },
} as const;

export default lightTheme;
