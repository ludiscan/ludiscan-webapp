import { commonTypography, commonSpacing, commonBorders } from './commonTheme';

import type { Theme } from '@emotion/react';

// ============================================
// NORDIC NIGHT - LIGHT THEME
// ============================================

export const nordicNightLight: Theme = {
  name: 'Nordic Night Light',
  mode: 'light',
  colors: {
    primary: {
      main: '#5E81AC', // Nordic Blue
      dark: '#4C566A', // Dark Blue Gray
      light: '#81A1C1', // Light Nordic Blue
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#88C0D0', // Aurora Green-Blue
      dark: '#6FA8B8', // Deep Aurora
      light: '#8FBCBB', // Ice Blue
      contrast: '#2E3440', // Dark Gray
    },
    tertiary: {
      main: '#B48EAD', // Nordic Purple
      dark: '#9A7490', // Deep Purple
      light: '#C8A8C4', // Pale Purple
      contrast: '#2E3440', // Dark Gray
    },
    background: {
      default: '#ECEFF4', // Snow White
      paper: '#FFFFFF', // Pure White
      elevated: '#F5F7FA', // Slight Blue Tint
      overlay: 'rgba(94, 129, 172, 0.04)', // Nordic Tint
    },
    surface: {
      base: '#FFFFFF',
      raised: '#F5F7FA',
      sunken: '#E5E9F0',
      interactive: '#DDE3EB',
      hover: '#D4DCE6',
      pressed: '#C8D1DE',
    },
    text: {
      primary: '#2E3440', // Dark Gray
      secondary: '#4C566A', // Medium Gray
      tertiary: '#6A7589', // Light Gray
      disabled: '#A0A8B8', // Muted Gray
      inverse: '#ECEFF4', // Snow White
      link: '#5E81AC', // Nordic Blue
      linkHover: '#4C566A', // Dark Blue Gray
    },
    border: {
      subtle: '#E5E9F0',
      default: '#D8DEE9',
      strong: '#C0CADE',
      interactive: '#5E81AC',
      focus: '#88C0D0',
    },
    semantic: {
      success: {
        main: '#A3BE8C',
        light: '#C1D7A8',
        dark: '#88A070',
        contrast: '#2E3440',
      },
      warning: {
        main: '#EBCB8B',
        light: '#F4E0AA',
        dark: '#D4B574',
        contrast: '#2E3440',
      },
      error: {
        main: '#BF616A',
        light: '#D68A92',
        dark: '#A84C55',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#81A1C1',
        light: '#A0BBD8',
        dark: '#6A8AAA',
        contrast: '#2E3440',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(136, 192, 208, 0.2), transparent)',
      glow: 'rgba(94, 129, 172, 0.3)',
      shadow: 'rgba(46, 52, 64, 0.08)',
      highlight: 'rgba(136, 192, 208, 0.15)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Lora", Georgia, serif',
      monospace: '"JetBrains Mono", "Fira Code", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(46, 52, 64, 0.05)',
    md: '0 4px 6px -1px rgba(46, 52, 64, 0.1), 0 2px 4px -1px rgba(46, 52, 64, 0.06)',
    lg: '0 10px 15px -3px rgba(46, 52, 64, 0.1), 0 4px 6px -2px rgba(46, 52, 64, 0.05)',
    xl: '0 20px 25px -5px rgba(46, 52, 64, 0.1), 0 10px 10px -5px rgba(46, 52, 64, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(46, 52, 64, 0.06)',
    glow: '0 0 20px rgba(136, 192, 208, 0.4)',
    primary: '0 4px 20px rgba(94, 129, 172, 0.15)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #4C566A 0%, #5E81AC 100%)',
    secondary: 'linear-gradient(135deg, #88C0D0 0%, #8FBCBB 100%)',
    sunset: 'linear-gradient(135deg, #5E81AC 0%, #88C0D0 50%, #B48EAD 100%)',
    dusk: 'linear-gradient(180deg, #B48EAD 0%, #5E81AC 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #81A1C1, #5E81AC)',
    shimmer: 'linear-gradient(90deg, #5E81AC 0%, #88C0D0 50%, #5E81AC 100%)',
  },
};

// ============================================
// NORDIC NIGHT - DARK THEME
// ============================================

export const nordicNightDark: Theme = {
  name: 'Nordic Night Dark',
  mode: 'dark',
  colors: {
    primary: {
      main: '#81A1C1', // Light Nordic Blue
      dark: '#5E81AC', // Nordic Blue
      light: '#A0BBD8', // Pale Nordic Blue
      contrast: '#ECEFF4', // Snow White
    },
    secondary: {
      main: '#8FBCBB', // Ice Blue
      dark: '#88C0D0', // Aurora Green-Blue
      light: '#B3D4D0', // Pale Ice
      contrast: '#2E3440', // Dark Gray
    },
    tertiary: {
      main: '#C8A8C4', // Pale Purple
      dark: '#B48EAD', // Nordic Purple
      light: '#DCC8D8', // Light Purple
      contrast: '#2E3440', // Dark Gray
    },
    background: {
      default: '#2E3440', // Dark Blue Gray (Nord0)
      paper: '#3B4252', // Elevated Dark (Nord1)
      elevated: '#434C5E', // Higher Elevation (Nord2)
      overlay: 'rgba(129, 161, 193, 0.08)', // Nordic Overlay
    },
    surface: {
      base: '#3B4252',
      raised: '#434C5E',
      sunken: '#2E3440',
      interactive: '#4C566A',
      hover: '#5A657C',
      pressed: '#67748E',
    },
    text: {
      primary: '#ECEFF4', // Snow White
      secondary: '#D8DEE9', // Light Gray
      tertiary: '#C0CADE', // Medium Light Gray
      disabled: '#6A7589', // Dark Gray
      inverse: '#2E3440', // Dark Blue Gray
      link: '#88C0D0', // Aurora Green-Blue
      linkHover: '#8FBCBB', // Ice Blue
    },
    border: {
      subtle: '#434C5E',
      default: '#4C566A',
      strong: '#5A657C',
      interactive: '#81A1C1',
      focus: '#88C0D0',
    },
    semantic: {
      success: {
        main: '#A3BE8C',
        light: '#C1D7A8',
        dark: '#88A070',
        contrast: '#2E3440',
      },
      warning: {
        main: '#EBCB8B',
        light: '#F4E0AA',
        dark: '#D4B574',
        contrast: '#2E3440',
      },
      error: {
        main: '#BF616A',
        light: '#D68A92',
        dark: '#A84C55',
        contrast: '#ECEFF4',
      },
      info: {
        main: '#81A1C1',
        light: '#A0BBD8',
        dark: '#6A8AAA',
        contrast: '#2E3440',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(143, 188, 187, 0.15), transparent)',
      glow: 'rgba(129, 161, 193, 0.4)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      highlight: 'rgba(136, 192, 208, 0.2)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Lora", Georgia, serif',
      monospace: '"JetBrains Mono", "Fira Code", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    glow: '0 0 30px rgba(129, 161, 193, 0.3), 0 0 60px rgba(129, 161, 193, 0.1)',
    primary: '0 8px 32px rgba(136, 192, 208, 0.2)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #5E81AC 0%, #81A1C1 100%)',
    secondary: 'linear-gradient(135deg, #8FBCBB 0%, #B3D4D0 100%)',
    sunset: 'linear-gradient(135deg, #B48EAD 0%, #81A1C1 50%, #8FBCBB 100%)',
    dusk: 'linear-gradient(180deg, #2E3440 0%, #5E81AC 50%, #88C0D0 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #A0BBD8, #5E81AC)',
    shimmer: 'linear-gradient(90deg, #81A1C1 0%, #8FBCBB 50%, #81A1C1 100%)',
  },
};
