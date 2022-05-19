import { defineConfig } from 'vite';
import markdownPlugin, { Mode } from 'vite-plugin-markdown';

export default defineConfig(({ mode }) => ({
  plugins: [
    markdownPlugin({
      mode: Mode.HTML,
    })
  ],
  base: mode === 'development' ? '/' : '/3d-wheel/',
  build: {
    minify: 'terser',
  },
}));