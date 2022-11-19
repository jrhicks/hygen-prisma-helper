# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to hygen-prisma-helper.
These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to contribute to hygen-prisma-helper

If Husky is your thing:

* husky install && chmod 755 .husky/*

## How to write an Open Source Javascript Library

[Kent C. Dodds: How to Write an Open Source Javascript Library](https://app.egghead.io/playlists/how-to-write-an-open-source-javascript-library) - Eggehead.io Course

### Tests

Make sure the code you're adding has decent test coverage.

Running project tests and coverage:

```bash
npm run test
```

### Commit Guidelines

The project uses the commitizen tool for standardizing changelog style commit and a git pre-commit hook to enforce them.

* npm install -g commitizen

* npm add .

* git cz