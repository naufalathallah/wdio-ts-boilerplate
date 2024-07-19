# WDIO TypeScript Boilerplate

This is a boilerplate project for setting up WebdriverIO with TypeScript. It includes a basic configuration to get you started with writing automated tests.

## Prerequisites

Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).

## Setup

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd wdio-ts-boilerplate
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Run tests:

    ```bash
    npm test
    ```

## Project Structure

-   `src/`: Contains TypeScript source files for your tests and page objects.
-   `test/`: Contains test specification files.
-   `wdio.conf.ts`: The main configuration file for WebdriverIO.

## Writing Tests

Create your test files in the `test/` directory. Here's an example test:

```typescript
import { expect } from "chai";

describe("My first test", async () => {
    it("should have the right title", async () => {
        await browser.url("https://example.com");
        const title = await browser.getTitle();
        expect(title).to.equal("Example Domain");
    });
});
```
