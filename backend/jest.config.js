module.exports = {
  testEnvironment: 'node', // Use Node.js environment for backend tests
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'], // Pattern to find test files
  setupFilesAfterEnv: ['./tests/setup.js'], // Script to run after Jest environment is set up (for DB connection etc.)
  modulePathIgnorePatterns: ["<rootDir>/src/"], // Ignore python files from previous task
  coveragePathIgnorePatterns: [ // Also ignore python files from coverage
    "<rootDir>/src/"
  ],
};
