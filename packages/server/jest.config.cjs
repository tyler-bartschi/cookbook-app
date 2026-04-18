const { createProjectConfig } = require("../../jest.project.cjs");

module.exports = createProjectConfig({
  packageDir: "packages/server",
  displayName: "@cookbook/server",
  testEnvironment: "node",
  tsconfigPath: "tsconfig.test.json",
});
