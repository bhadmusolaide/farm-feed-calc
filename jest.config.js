/**
 * Jest configuration for root-level tests (Node environment).
 * Enable ESM in tests by running Jest in Node's experimental VM Modules mode.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  // Allow using import/export in tests by telling Jest to use node's vm modules
  // We'll pass --experimental-vm-modules via the npm script, but keeping transform for JS syntax features.
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverageFrom: [
    'shared/utils/**/*.js',
    '!shared/utils/**/index.js',
  ],
  transformIgnorePatterns: ['/node_modules/'],
};