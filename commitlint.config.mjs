export default {
  extends: ["@commitlint/config-conventional"],

  rules: {
    "header-max-length": [0, "always", Infinity],
    "body-max-line-length": [0, "always", Infinity],
  },
};
