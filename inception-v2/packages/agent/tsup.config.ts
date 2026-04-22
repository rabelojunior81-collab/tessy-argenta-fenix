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
    '@rabeluslab/inception-types',
    '@rabeluslab/inception-core',
    '@rabeluslab/inception-memory',
  ],
});
