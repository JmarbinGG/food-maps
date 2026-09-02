import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../assets/nouri');
mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.resolve(__dirname, 'src/main.jsx')],
  bundle: true,
  outfile: path.join(outDir, 'nouri-ai.js'),
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  loader: { '.jsx': 'jsx', '.css': 'css', '.js': 'jsx' },
  alias: {
    'react-router-dom': path.resolve(__dirname, 'utils/react-router-shim.js'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  logLevel: 'info',
});

// Copy css separately
const css = readFileSync(path.resolve(__dirname, 'src/nouri.css'), 'utf8');
writeFileSync(path.join(outDir, 'nouri-ai.css'), css);
console.log('Built', path.join(outDir, 'nouri-ai.js'));
