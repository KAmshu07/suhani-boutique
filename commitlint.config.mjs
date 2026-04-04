const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 72],
    "body-max-line-length": [0, "always", Infinity],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "refactor",
        "chore",
        "docs",
        "test",
        "init",
        "build",
        "ci",
        "perf",
        "style",
        "revert",
      ],
    ],
  },
};

export default commitlintConfig;
