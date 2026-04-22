import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'node22',
  external: [
    '@google/generative-ai',
    'ollama',
    '@rabeluslab/inception-types',
    '@rabeluslab/inception-core',
  ],
});
