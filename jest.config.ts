import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.ts and .env files in your test environment
  dir: './',
});

const config: Config = {
  // Use V8 for faster coverage collection
  coverageProvider: 'v8',

  // Use jsdom to simulate a browser environment
  testEnvironment: 'jsdom',

  // Run global setup after the test framework is installed in the environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Map @/* path alias to the project root (matches tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Ignore .next standalone output (prevents haste module naming collision)
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Collect coverage from source files only
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'models/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],

  // Output coverage reports to the /coverage directory
  coverageDirectory: 'coverage',

  // Coverage thresholds — adjust as the test suite grows
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

// createJestConfig wraps the config to make it compatible with Next.js's transpilation
export default createJestConfig(config);
