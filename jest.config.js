module.exports = {
  testEnvironment: 'node',
  roots: [
      '<rootDir>/lib',
      '<rootDir>/lambda',
      '<rootDir>/src',
      '<rootDir>/test'
  ],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.{ts,jx}',
    '!dist/*',
    '!node_modules/*',
  ],
  coverageReporters: ['text', 'lcov'],
};
