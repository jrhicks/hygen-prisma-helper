
<p align="center"><h1 align="center">
  hygen-prisma-helper
</h1>

<p align="center">
  extend hygen code generation with prisma schema
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/hygen-prisma-helper"><img src="https://badgen.net/npm/v/hygen-prisma-helper" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/hygen-prisma-helper"><img src="https://badgen.net/npm/license/hygen-prisma-helper" alt="license"/></a>
  <a href="https://www.npmjs.org/package/hygen-prisma-helper"><img src="https://badgen.net/npm/dt/hygen-prisma-helper" alt="downloads"/></a>
  <a href="https://github.com/jrhicks/hygen-prisma-helper/actions?workflow=CI"><img src="https://github.com/jrhicks/hygen-prisma-helper/workflows/CI/badge.svg" alt="build"/></a>
  <a href="https://codecov.io/gh/jrhicks/hygen-prisma-helper"><img src="https://badgen.net/codecov/c/github/jrhicks/hygen-prisma-helper" alt="codecov"/></a>
  <a href="https://snyk.io/test/github/jrhicks/hygen-prisma-helper"><img src="https://snyk.io/test/github/jrhicks/hygen-prisma-helper/badge.svg" alt="Known Vulnerabilities"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" /></a>
</p>

# About

easily extend hygen code generation with prisma schema

# Install

```bash
npm install --save hygen-prisma-helper
```

# Usage

You can extend Hygen via `.hygen.js`

```js
const { createHelper } = require("hygen-prisma-helper")

const prisma = createHelpers('model User { }`)

module.exports = {
    helpers: {
       prisma: prisma,
    },
  };
```

# Example

<!-- TODO -->

# Contributing

Please consult [CONTRIBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

# Author

**hygen-prisma-helper** © [Jeffrey Hicks](https://github.com/jrhicks), Released under the [MIT](./LICENSE) License.
