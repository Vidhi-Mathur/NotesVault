import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './', // path to your Next.js app
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageProvider: "v8",
};

export default createJestConfig(customJestConfig);
