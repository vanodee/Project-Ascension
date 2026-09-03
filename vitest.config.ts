import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Mirror the tsconfig `@/*` path alias (moduleResolution: bundler) so tests can
// import project modules the same way app code does.
const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@/': root },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
});
