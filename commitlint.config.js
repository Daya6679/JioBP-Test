// Commitlint config — enforces Conventional Commits format:
// feat: add login page
// fix: resolve auth bug
// chore: update dependencies
// docs: update README
// See https://www.conventionalcommits.org/

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow up to 100 characters in the commit subject
    'header-max-length': [2, 'always', 100],
  },
};
