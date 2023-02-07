module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
      '<rootDir>/lib',
      '<rootDir>/lambda',
      '<rootDir>/src',
      '<rootDir>/test'
  ],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
      '^@mediaExtractor/(.*)$': '<rootDir>/src/mediaExtractor/$1',
      '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: [
      '**/*.{ts,js}',
      '!dist/*',
      '!node_modules/*',
  ],
  coverageReporters: ['text', 'lcov'],
};
