import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : '/3d-wheel/',
  build: {
    minify: 'terser',
  },
}));