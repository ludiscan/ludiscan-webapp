/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
    // cookie v2 は ESM のみ配布のため CJS に変換する
    '^.+/node_modules/cookie/.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!cookie/)'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@mock/(.*)$': '<rootDir>/mock/$1',
    '^@generated/(.*)$': '<rootDir>/generated/$1'
  },
};
