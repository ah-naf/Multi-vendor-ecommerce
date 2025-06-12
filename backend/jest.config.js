module.exports = {
  testEnvironment: 'node',
  verbose: true,
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['controllers/**/*.js', 'middleware/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'utils/**/*.js'],
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json'],
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  // moduleNameMapper: {},
  // The root directory that Jest should scan for tests and modules within
  // rootDir: '.', // default
  // A list of paths to directories that Jest should use to search for files in
  // roots: ['<rootDir>/tests'], // Can specify if tests are not in default __tests__ or *.test.js pattern
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/tests/**/*.test.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  // testPathIgnorePatterns: ['/node_modules/'],
};
