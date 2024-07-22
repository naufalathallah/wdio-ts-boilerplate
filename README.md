# WDIO TypeScript Boilerplate

This is a boilerplate project for setting up WebdriverIO with TypeScript. It includes a basic configuration to get you started with writing automated tests.

## Prerequisites

1. Node JS (^16)
2. Setup .env

```bash
   npm install
```

## Commands

1. regression

```bash
   npm run test:regression
```

2. one by one spec

```bash
   npm run wdio
```

3. suite

- add suiteName to wdio.conf.ts

```typescript
suites: {
 suiteName: [
// spec path
 ],
 },
```

- add suiteName to package.json

```typescript
"scripts": {
// ...
"test:suite:suiteName": "wdio run ./wdio.conf.ts --suite suiteName"
},
```

- run

```bash
npm run test:suite:suiteName
```

## Project Structure

- `test/specs/`: Contains test specification files.
- `test/pageobjects/`: Contains page object files for managing web elements and actions.
- `test/data/`: Contains test data files, such as JSON or CSV files used in tests.
- `test/api/`: Contains API interaction modules or functions.
- `test/utils/`: Contains utility or helper functions used in tests.
- `test/examples/`: Contains example test specification files.
- `wdio.conf.ts`: The main configuration file for WebdriverIO.
- `screenshots/`: Contains screenshots of failed test case runs.

## Writing Tests

Create your test files in the `test/` directory. Here's an example test:

```typescript
describe("Home Page Test", () => {
  it("should display the correct header text", async () => {
    await HomePage.open();
    const headerText = await HomePage.getHeaderText();
    expect(headerText).to.equal("Example Domain");
  });
});
```

Create your page objects in the test/pageobjects/ directory:

```typescript
class HomePage {
  // Define selectors using getter methods
  get header() {
    return $("h1");
  }

  // Define actions as methods
  async open() {
    await browser.url("https://example.com");
  }

  async getHeaderText() {
    return this.header.getText();
  }
}

export default new HomePage();
```

## Worker

1. Sequential running (1 browser)

```typescript
specs: [
  './test/specs/test1.spec.ts',
  './test/specs/test2.spec.ts',
  './test/specs/test3.spec.ts'
],
```

2. Parallel running (2 browser)

```typescript
specs: [
  ['./test/specs/test1.spec.ts', './test/specs/test2.spec.ts'], // browser 1
  './test/specs/test3.spec.ts' // browser 2
],

```

## Branching Workflow

Main Branches:

- `main`: Stable and production-ready code.
- `develop`: Integration branch for ongoing development.

Naming Convention:

- New Feature: feature/<feature-name>
- Bugfix: bugfix/<bug-name>
- Hotfix: hotfix/<fixing-name>
- Release: release/<version-name>

Merging Branch, Create a pull request:

- From feature/<feature-name> to develop
- From bugfix/<bug-name> to develop
- From release/<version-name> to main
- From hotfix/<fixing-name> to main
