import { defineConfig } from 'oxfmt';

export default defineConfig({
  arrowParens: 'avoid',
  printWidth: 120,
  proseWrap: 'always',
  singleQuote: true,
  trailingComma: 'all',
  experimentalSortPackageJson: false,
  overrides: [
    {
      files: ['*.md', '*.mdc'],
      options: {
        proseWrap: 'preserve',
      },
    },
  ],
});
