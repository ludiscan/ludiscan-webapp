import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as path from 'node:path';

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, './src'),
      },
    },
    base: '/ludiscan/view/',
  };
});
