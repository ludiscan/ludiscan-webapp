import type { Theme } from '@emotion/react';

import { crimsonDuskDark, crimsonDuskLight } from '@src/styles/crimson-dusk';
import { midnightSapphireDark, midnightSapphireLight } from '@src/styles/midnight-sapphire';
import { nordicNightDark, nordicNightLight } from '@src/styles/nordic-night';
import { obsidianNightDark, obsidianNightLight } from '@src/styles/obsidian-night';
import { oceanAbyssDark, oceanAbyssLight } from '@src/styles/ocean-abyss';
import { slateEmberDark, slateEmberLight } from '@src/styles/slate-ember';

const theme = {
  crimsonDusk: {
    light: crimsonDuskLight,
    dark: crimsonDuskDark,
  },
  midnightSapphire: {
    light: midnightSapphireLight,
    dark: midnightSapphireDark,
  },
  nordicNight: {
    light: nordicNightLight,
    dark: nordicNightDark,
  },
  obsidianNight: {
    light: obsidianNightLight,
    dark: obsidianNightDark,
  },
  oceanAbyss: {
    light: oceanAbyssLight,
    dark: oceanAbyssDark,
  },
  slateEmber: {
    light: slateEmberLight,
    dark: slateEmberDark,
  },
};

export type ThemeType = keyof typeof theme;

export function toggleTheme(t: Theme): Theme {
  for (const key of Object.keys(theme)) {
    const themeType = theme[key as ThemeType];
    if (themeType.light.name === t.name) {
      return themeType.dark;
    }
    if (themeType.dark.name === t.name) {
      return themeType.light;
    }
  }
  return t;
}
export default theme;
