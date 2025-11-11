import { commonTypography, commonSpacing, commonBorders } from './commonTheme';

import type { Theme } from '@emotion/react';

export const crimsonDuskLight: Theme = {
  name: 'Crimson Dusk Light',
  mode: 'light',
  colors: {
    primary: {
      main: '#C41E3A', // Deep Crimson
      dark: '#8B0000', // Dark Red
      light: '#E63946', // Bright Crimson
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#D4AF37', // Gold
      dark: '#B8860B', // Dark Goldenrod
      light: '#FFD700', // Bright Gold
      contrast: '#1A0F0F', // Deep Brown
    },
    tertiary: {
      main: '#6B2D5C', // Deep Plum
      dark: '#4A1942', // Darker Plum
      light: '#8B4789', // Light Purple
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#FFF5F5', // Soft Rose White
      paper: '#FFFFFF', // Pure White
      elevated: '#FFF9F9', // Slight Warm White
      overlay: 'rgba(196, 30, 58, 0.05)', // Crimson Tint
    },
    surface: {
      base: '#FFFFFF',
      raised: '#FFF9F9',
      sunken: '#FFEAEA',
      interactive: '#FFE5E8',
      hover: '#FFD6DB',
      pressed: '#FFC7CD',
    },
    text: {
      primary: '#1A0F0F', // Deep Warm Black
      secondary: '#5A3A3A', // Warm Brown
      tertiary: '#8A6A6A', // Light Warm Brown
      disabled: '#BFAFAF', // Muted Brown
      inverse: '#FFFFFF', // White
      link: '#C41E3A', // Crimson
      linkHover: '#8B0000', // Dark Red
    },
    border: {
      subtle: '#F5E5E5',
      default: '#E5D5D5',
      strong: '#C5B5B5',
      interactive: '#C41E3A',
      focus: '#D4AF37',
    },
    semantic: {
      success: {
        main: '#2D7D2D',
        light: '#90EE90',
        dark: '#1B4D1B',
        contrast: '#FFFFFF',
      },
      warning: {
        main: '#FF8C00',
        light: '#FFB347',
        dark: '#CC7000',
        contrast: '#FFFFFF',
      },
      error: {
        main: '#DC143C',
        light: '#FF6B8B',
        dark: '#A00020',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#6B2D5C',
        light: '#A876A0',
        dark: '#4A1942',
        contrast: '#FFFFFF',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
      glow: 'rgba(196, 30, 58, 0.4)',
      shadow: 'rgba(26, 15, 15, 0.15)',
      highlight: 'rgba(255, 215, 0, 0.2)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Playfair Display", Georgia, serif',
      monospace: '"Fira Code", "Courier New", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(26, 15, 15, 0.05)',
    md: '0 4px 6px -1px rgba(26, 15, 15, 0.1), 0 2px 4px -1px rgba(26, 15, 15, 0.06)',
    lg: '0 10px 15px -3px rgba(26, 15, 15, 0.1), 0 4px 6px -2px rgba(26, 15, 15, 0.05)',
    xl: '0 20px 25px -5px rgba(26, 15, 15, 0.1), 0 10px 10px -5px rgba(26, 15, 15, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(26, 15, 15, 0.06)',
    glow: '0 0 20px rgba(196, 30, 58, 0.3)',
    primary: '0 4px 20px rgba(196, 30, 58, 0.25)',
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    width: {
      thin: '1px',
      default: '2px',
      thick: '4px',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #C41E3A 0%, #E63946 100%)',
    secondary: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
    sunset: 'linear-gradient(135deg, #C41E3A 0%, #D4AF37 50%, #E63946 100%)',
    dusk: 'linear-gradient(180deg, #6B2D5C 0%, #C41E3A 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #E63946, #C41E3A)',
    shimmer: 'linear-gradient(90deg, #C41E3A 0%, #D4AF37 50%, #C41E3A 100%)',
  },
};

// ============================================
// CRIMSON DUSK - DARK THEME
// ============================================

export const crimsonDuskDark: Theme = {
  name: 'Crimson Dusk Dark',
  mode: 'dark',
  colors: {
    primary: {
      main: '#E63946', // Bright Crimson
      dark: '#C41E3A', // Deep Crimson
      light: '#FF6B7A', // Light Crimson
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#FFD700', // Bright Gold
      dark: '#D4AF37', // Gold
      light: '#FFEB99', // Pale Gold
      contrast: '#1A0F0F', // Deep Brown
    },
    tertiary: {
      main: '#A876A0', // Light Purple
      dark: '#6B2D5C', // Deep Plum
      light: '#C8A8C8', // Pale Purple
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#0F0808', // Deep Black with Red Tint
      paper: '#1A0F0F', // Dark Brown Black
      elevated: '#251818', // Elevated Dark
      overlay: 'rgba(230, 57, 70, 0.1)', // Crimson Overlay
    },
    surface: {
      base: '#1A0F0F',
      raised: '#251818',
      sunken: '#0F0808',
      interactive: '#2D1A1A',
      hover: '#3A2222',
      pressed: '#472A2A',
    },
    text: {
      primary: '#FFF5F5', // Soft White
      secondary: '#D5BABA', // Warm Gray
      tertiary: '#A88888', // Muted Rose Gray
      disabled: '#6A5555', // Dark Gray
      inverse: '#1A0F0F', // Dark
      link: '#FF6B7A', // Light Crimson
      linkHover: '#FFD700', // Gold
    },
    border: {
      subtle: '#2D1A1A',
      default: '#3A2222',
      strong: '#5A3A3A',
      interactive: '#E63946',
      focus: '#FFD700',
    },
    semantic: {
      success: {
        main: '#4ADE80',
        light: '#86EFAC',
        dark: '#22C55E',
        contrast: '#0F0808',
      },
      warning: {
        main: '#FFA500',
        light: '#FFC966',
        dark: '#FF8C00',
        contrast: '#0F0808',
      },
      error: {
        main: '#FF4D6D',
        light: '#FF8FA3',
        dark: '#DC143C',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#A876A0',
        light: '#C8A8C8',
        dark: '#8B4789',
        contrast: '#FFFFFF',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent)',
      glow: 'rgba(230, 57, 70, 0.6)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      highlight: 'rgba(255, 215, 0, 0.3)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Playfair Display", Georgia, serif',
      monospace: '"Fira Code", "Courier New", monospace',
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
    glow: '0 0 30px rgba(230, 57, 70, 0.5), 0 0 60px rgba(230, 57, 70, 0.2)',
    primary: '0 8px 32px rgba(230, 57, 70, 0.4)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #E63946 0%, #FF6B7A 100%)',
    secondary: 'linear-gradient(135deg, #FFD700 0%, #FFEB99 100%)',
    sunset: 'linear-gradient(135deg, #6B2D5C 0%, #E63946 50%, #FFD700 100%)',
    dusk: 'linear-gradient(180deg, #0F0808 0%, #6B2D5C 50%, #E63946 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #FF6B7A, #C41E3A)',
    shimmer: 'linear-gradient(90deg, #E63946 0%, #FFD700 50%, #E63946 100%)',
  },
};
