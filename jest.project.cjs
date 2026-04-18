const path = require("node:path");

function createProjectConfig({
  packageDir,
  displayName,
  testEnvironment,
  tsconfigPath,
  supportsTsx = false,
}) {
  const packageRoot = path.resolve(__dirname, packageDir);

  return {
    displayName,
    rootDir: packageRoot,
    testEnvironment,
    testMatch: [
      "<rootDir>/tests/**/*.test.ts",
      "<rootDir>/tests/**/*.spec.ts",
      "<rootDir>/tests/**/*.test.tsx",
      "<rootDir>/tests/**/*.spec.tsx",
    ],
    extensionsToTreatAsEsm: supportsTsx ? [".ts", ".tsx"] : [".ts"],
    moduleFileExtensions: supportsTsx ? ["ts", "tsx", "js", "jsx", "json"] : ["ts", "js", "json"],
    transform: {
      "^.+\\.tsx?$": [
        "ts-jest",
        {
          useESM: true,
          tsconfig: `<rootDir>/${tsconfigPath}`,
        },
      ],
    },
    moduleNameMapper: {
      "\\.(css|less|sass|scss)$": "<rootDir>/../../test/__mocks__/styleMock.cjs",
      "\\.(gif|ttf|eot|svg|png|jpe?g|webp|avif)$": "<rootDir>/../../test/__mocks__/fileMock.cjs",
      "^(\\.{1,2}/.*)\\.js$": "$1",
    },
  };
}

module.exports = { createProjectConfig };
