import '@emotion/react';

declare module '@emotion/react' {
  interface Theme {
    colors: Colors;
  }
}

export interface Colors {
  primary: {
    main: string;
    dark: string;
    light: string;
  };
  primaryVariant: string;
  background: string;
  surface: {
    main: string;
    dark: string;
    light: string;
  };
  text: string;
  secondary: {
    main: string;
    dark: string;
    light: string;
  };
  border: {
    main: string;
    dark: string;
    light: string;
  };
  error: string;
  disabled: string;
}

export {};

export type colorType = keyof Colors;
