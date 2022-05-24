import { defineConfig } from 'vite';
import markdownPlugin, { Mode } from 'vite-plugin-markdown';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    markdownPlugin({
      mode: Mode.HTML,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: mode === 'development' ? '/' : '/3d-wheel/',
  build: {
    minify: 'terser',
  },
}));