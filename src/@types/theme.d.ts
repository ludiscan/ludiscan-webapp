import '@emotion/react';

declare module '@emotion/react' {
  interface Theme {
    colors: Colors;
  }
}

export interface Colors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  secondary: string;
  border: string;
  error: string;
}

export {};
