/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.ts',
    //'**/test/**/*.mock.ts',
    '**/test/*'
  ],
  //globalSetup: './test/setup.ts',
};