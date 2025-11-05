import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    name: string;
    mode: 'light' | 'dark';
    colors: Colors;
    typography: Typography;
    spacing: Spacing;
    shadows: Shadows;
    borders: Borders;
    gradients: Gradients;
  }
}

export interface Colors {
  // Primary Colors - Crimson Theme
  primary: {
    main: string;
    dark: string;
    light: string;
    contrast: string;
  };
  // Secondary Colors - Amber/Gold Accents
  secondary: {
    main: string;
    dark: string;
    light: string;
    contrast: string;
  };
  // Tertiary Colors - Deep Purple Undertones
  tertiary: {
    main: string;
    dark: string;
    light: string;
    contrast: string;
  };
  // Background Layers
  background: {
    default: string;
    paper: string;
    elevated: string;
    overlay: string;
  };
  // Surface Variations
  surface: {
    base: string;
    raised: string;
    sunken: string;
    interactive: string;
    hover: string;
    pressed: string;
  };
  // Text Hierarchy
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
  };
  // Border System
  border: {
    subtle: string;
    default: string;
    strong: string;
    interactive: string;
    focus: string;
  };
  // Semantic Colors
  semantic: {
    success: {
      main: string;
      light: string;
      dark: string;
      contrast: string;
    };
    warning: {
      main: string;
      light: string;
      dark: string;
      contrast: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
      contrast: string;
    };
    info: {
      main: string;
      light: string;
      dark: string;
      contrast: string;
    };
  };
  // Special Effects
  effects: {
    shimmer: string;
    glow: string;
    shadow: string;
    highlight: string;
  };
}

export interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
  glow: string;
  primary: string;
}

export interface Borders {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  width: {
    thin: string;
    default: string;
    thick: string;
  };
}

export interface Gradients {
  primary: string;
  secondary: string;
  sunset: string;
  dusk: string;
  radial: string;
  shimmer: string;
}
