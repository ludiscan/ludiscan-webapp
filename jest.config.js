/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest',{}],
  },
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@mock/(.*)$': '<rootDir>/mock/$1',
    '^@generated/(.*)$': '<rootDir>/generated/$1'
  },
};
