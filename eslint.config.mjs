import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

// `next lint` was removed in Next 16 — lint runs through the ESLint CLI (`npm run lint`).
// core-web-vitals = Next + React + React Hooks recommended rules, with the
// Core-Web-Vitals-affecting rules promoted to errors.
const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // eslint-plugin-react-hooks v6 flags any setState in an effect body. Our
      // remaining uses are deliberate render-synchronisation / animation
      // orchestration (reset nav on route change; drive the homily bar's
      // enter/exit phases), not "you might not need an effect" cases. Keep it
      // visible as a warning rather than a build-blocking error.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**', // hosted Sanity Studio build output
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
