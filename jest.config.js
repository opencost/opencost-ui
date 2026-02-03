/**
 * Jest Configuration for OpenCost UI
 *
 * Configures testing environment for:
 * - React components
 * - Utility functions
 * - CSS modules
 */

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg)$": "<rootDir>/src/__tests__/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx}",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/index.html",
    "!src/**/*.css",
    "!src/**/__tests__/**",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
};
