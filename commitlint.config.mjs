export default {
  extends: ["@commitlint/config-conventional"],

  rules: {
    "body-max-line-length": [0, "always", Infinity],
    "header-max-length": [0, "always", Infinity],
  },
};
