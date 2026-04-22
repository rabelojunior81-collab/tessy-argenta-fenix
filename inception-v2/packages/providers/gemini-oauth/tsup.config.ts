import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'node20',
  external: [
    '@google/generative-ai',
    '@rabeluslab/inception-types',
    '@rabeluslab/inception-core',
    '@rabeluslab/inception-provider-gemini-oauth',
  ],
});
