import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import customMinifyCss from '@open-wc/building-utils/custom-minify-css';

import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import size from 'rollup-plugin-size';

export default {
  input: 'publish/index.js',
  output: {
    dir: 'publish/dist',
    format: 'esm',
  },

  plugins: [
    resolve(),
    babel({
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-syntax-import-meta',
        // rollup rewrites import.meta.url, but makes them point to the file
        // location after bundling we want the location before bundling
        'bundled-import-meta',
        [
          'template-html-minifier',
          {
            modules: {
              'lit-html': ['html'],
              'lit-element': ['html', { name: 'css', encapsulation: 'style' }],
            },
            htmlMinifier: {
              collapseWhitespace: true,
              removeComments: true,
              caseSensitive: true,
              minifyCSS: customMinifyCss,
            },
          },
        ],
      ],

      presets: [
        [
          '@babel/preset-modules',
          {
            loose: true,
          },
        ],
      ],
    }),
    terser({
      compress: {
        inline: 0,
        drop_console: true,
        ecma: 2019,
      },
      output: {
        comments: false,
      },
    }),
    size({ publish: true }),
  ],
};
