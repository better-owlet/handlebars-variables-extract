const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
// const sourceMaps = require('rollup-plugin-sourcemaps')
const typescript = require('rollup-plugin-typescript2')
const json = require('rollup-plugin-json')

const pkg = require('./package.json')

const libraryName = 'handlebars-variables-extract'

export default {
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  input: `src/index.ts`,
  external: ['handlebars'],
  output: [
    { file: pkg.main, name: libraryName, format: 'umd' },
    { file: pkg.module, format: 'esm' },
  ],
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    // sourceMaps(),
  ],
  watch: {
    include: 'src/**',
  },
}
