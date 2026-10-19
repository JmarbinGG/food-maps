import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../assets/nouri'),
    // Never wipe assets/nouri: the committed bundle is what production serves.
    // `npm run build` (esbuild + sync) is the supported build; this config is
    // for `npm run dev` only.
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.jsx'),
      output: {
        entryFileNames: 'nouri-ai.js',
        assetFileNames: 'nouri-ai.[ext]',
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      'react-router-dom': path.resolve(__dirname, 'utils/react-router-shim.js'),
    },
  },
});
