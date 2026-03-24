import type { Config } from 'jest';

const config: Config = {
  preset:           'ts-jest',
  testEnvironment:  'node',
  testMatch:        ['**/tests/whitebox/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // setupFilesAfterFramework was a typo in the original spec — correct key is setupFilesAfterEnv
  setupFilesAfterEnv: ['<rootDir>/tests/whitebox/setup.ts'],
  // Prevent ts-jest from trying to compile Next.js server-only imports
  transformIgnorePatterns: ['node_modules/(?!next)'],
};

export default config;
