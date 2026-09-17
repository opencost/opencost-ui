import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest is used purely as a test runner here. Parcel remains the dev and build
// tool: vite and @vitejs/plugin-react are present only to give Vitest a JSX
// transform, and nothing in this file participates in `npm run build`.
//
// @vitejs/plugin-react does not read .babelrc unless told to, which matters
// because Parcel does read it. Leaving it untouched is what keeps the test
// setup from being able to break the production bundle.
export default defineConfig({
  // This repo writes JSX inside .js files throughout — every component under
  // src/ does. Parcel accepts that; Vite does not by default and fails with
  // "content contains invalid JS syntax", pointing at the first tag it meets.
  // Widening the plugin's include to .js is what lets the existing source be
  // tested without renaming ~30 files.
  plugins: [react({ include: /\.(js|jsx)$/ })],

  // The plugin's include alone is not sufficient. Vite runs its own esbuild
  // transform for import analysis before the React plugin sees the file, and
  // that pass treats .js as plain JavaScript, so it fails on the first tag. This
  // tells it to use the JSX loader for source files.
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.js',

    // Co-located __tests__ directories with .spec files, matching the
    // kubecost-frontend convention. `.test.js` is deliberately not matched, so
    // the two naming styles cannot drift apart in one repo.
    include: ['src/**/__tests__/**/*.spec.{js,jsx}'],

    coverage: {
      // The house standard uses the istanbul provider. It cannot be used here,
      // and the reason is worth recording rather than rediscovering.
      //
      // The istanbul provider instruments source with Babel, and Babel loads
      // this repo's .babelrc, which carries only the runtime and
      // class-properties plugins and no JSX preset. Parcel does not need one
      // because it applies its own JSX transform, so the gap is invisible in
      // the build but fatal to Babel-based instrumentation: every .jsx file
      // fails to parse with "Support for the experimental syntax 'jsx' isn't
      // currently enabled".
      //
      // Adding @babel/preset-react to .babelrc would fix instrumentation and
      // also change what Parcel does to the production bundle. That trade is
      // not worth making for a coverage report, so the provider changes
      // instead. V8 coverage needs no Babel pass: it reads coverage straight
      // from the runtime, after Vite's React transform has already handled the
      // JSX.
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/__tests__/**'],
      reporter: ['json-summary', 'text-summary'],
      // No thresholds, matching the house standard. Coverage is reported
      // locally and gated in CI on changed lines only, so a low-coverage
      // legacy file never blocks work on a new one.
    },
  },
});
