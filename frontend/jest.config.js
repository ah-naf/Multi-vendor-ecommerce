// jest.config.js
const nextJest = require('next/jest');

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: './' });

// Any custom config you want to pass to Jest
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_app.{js,jsx,ts,tsx}',
    '!src/**/_document.{js,jsx,ts,tsx}',
    '!src/pages/api/**/*',
    // Exclude services and context for now if they cause issues, focus on component tests
    // '!src/services/**/*',
    // '!src/context/**/*',
    '!src/components/ui/**/*',
    '!src/types/**/*',
    '!**/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/coverage/**',
    '!jest.config.js',
    '!next.config.js',
  ],
  moduleNameMapper: {
    // Handle CSS imports (including CSS modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // transformIgnorePatterns might be needed if some node_modules are ESM
  // Default from next/jest is usually good, but can be customized if specific modules fail
  // transformIgnorePatterns: [
  //   '/node_modules/(?!(some-esm-module|another-esm-module)/)',
  //   '^.+\\.module\\.(css|sass|scss)$',
  // ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
