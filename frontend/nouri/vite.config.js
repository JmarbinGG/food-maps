import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../assets/nouri'),
    emptyOutDir: true,
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
      'react-router-dom': path.resolve(__dirname, 'src/utils/react-router-shim.js'),
    },
  },
});
