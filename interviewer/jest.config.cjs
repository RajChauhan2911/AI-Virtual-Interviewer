/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: './tsconfig.json', diagnostics: false }],
  },
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
};


