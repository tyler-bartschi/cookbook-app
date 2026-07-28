const { createProjectConfig } = require("../../jest.project.cjs");

const config = createProjectConfig({
  packageDir: "packages/server",
  displayName: "@cookbook/server",
  testEnvironment: "node",
  tsconfigPath: "tsconfig.test.json",
});

module.exports = {
  ...config,
  setupFiles: ["<rootDir>/tests/setupEnv.cjs"],
};
