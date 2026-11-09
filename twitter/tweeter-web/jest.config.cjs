module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^tweeter-shared$': '<rootDir>/../tweeter-shared/dist/index.js',
    '\\.(css|less)$': '<rootDir>/test/__mocks__/styleMock.cjs',
  },
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }] },
  clearMocks: true,
};
