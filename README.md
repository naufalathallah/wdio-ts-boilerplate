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
import { expect } from "chai";

describe("My first test", () => {
  it("should have the right title", async () => {
    await browser.url("https://example.com");
    const title = await browser.getTitle();
    expect(title).to.equal("Example Domain");
  });
});
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
