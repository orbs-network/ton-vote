// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testTimeout: 300_000,
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "react-markdown": "<rootDir>/__mocks__/react-markdown.ts",
    "@tonconnect/ui-react": "<rootDir>/__mocks__/react-markdown.ts",
  },
};
