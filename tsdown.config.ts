import { defineConfig } from 'tsdown'

const PACKAGE_NAME = '@geecraft23/dsh-turn-colors'

export default defineConfig([
  {
    name: PACKAGE_NAME,
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    sourcemap: true,
    clean: false,
    outputOptions: {
      entryFileNames: 'index.js',
      sourcemapExcludeSources: false,
    },
  },
  {
    name: `${PACKAGE_NAME}/client`,
    entry: { client: 'src/client.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    dts: false,
    sourcemap: true,
    clean: false,
    deps: {
      neverBundle: ['@deepseek-ai/cordis'],
    },
    outputOptions: {
      entryFileNames: 'client.js',
      sourcemapExcludeSources: false,
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PACKAGE_NAME)}, factory: (require) => {`,
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      footer: 'return module.exports; } });',
    },
  },
])
