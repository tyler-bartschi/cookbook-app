const { createProjectConfig } = require("../../jest.project.cjs");

module.exports = createProjectConfig({
  packageDir: "packages/web",
  displayName: "@cookbook/web",
  testEnvironment: "jsdom",
  tsconfigPath: "tsconfig.test.json",
  supportsTsx: true,
});
