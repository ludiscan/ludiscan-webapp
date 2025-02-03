/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^/src/(.*)$': '<rootDir>/src/$1',
    '^/mock/(.*)$': '<rootDir>/mock/$1',
    '^/generated/(.*)$': '<rootDir>/generated/$1'
  },
  clearMocks: true,
};

export default config;
