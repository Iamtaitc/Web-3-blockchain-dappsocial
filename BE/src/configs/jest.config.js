// BE\src\configs\jest.config.js
module.exports = {
  // Set the test environment
  testEnvironment: "node",

  // Files to run setup code before running tests
  setupFilesAfterEnv: ["./jest.setup.js"],

  // Specify the directories that Jest should search for tests
  roots: ["../../test"],

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/*.test.js"],

  // An array of regexp pattern strings that are matched against all test paths
  // Tests that match these patterns will be skipped
  testPathIgnorePatterns: ["/node_modules/"],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Collect coverage information
  collectCoverage: true,

  // Cấu hình teardown toàn cục sau khi tất cả các test chạy xong
  // globalTeardown: "./test/runTest.js",

  // Cấu hình setup toàn cục trước khi các test chạy
  // globalSetup: "./test/setup/globalSetup.js",

  // Cấu hình setup cho mỗi test file
  // setupFilesAfterEnv: ["./test/setup/setupTests.js"],

  // Test environment
  testEnvironment: "node",
  // Directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of glob patterns indicating a set of files for which coverage should be collected
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "!**/node_modules/**",
  ],

  // The minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // reporters: ["default", "../../src/utils/testReporter.js"],
};
