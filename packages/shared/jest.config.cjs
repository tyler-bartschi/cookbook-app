const { createProjectConfig } = require("../../jest.project.cjs");

module.exports = createProjectConfig({
  packageDir: "packages/shared",
  displayName: "@cookbook/shared",
  testEnvironment: "node",
  tsconfigPath: "tsconfig.test.json",
});
