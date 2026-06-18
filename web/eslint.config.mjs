import next from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['node_modules/', '.next/', 'out/', 'build/', 'dist/', 'coverage/', 'next-env.d.ts'],
  },
  ...next,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default config;
