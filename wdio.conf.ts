import type { Options } from "@wdio/types";
import { updateZephyrTestExecution } from "./test/api/zephyr.api";
import * as fs from "fs";
import * as path from "path";
import { regressionDiscordHooks } from "./test/api/discord.api";

const screenshotDir = path.join(__dirname, "screenshots");
const timeFilePath = path.join(__dirname, "timeStorage.txt");
const specResultPath = path.join(__dirname, "specResult.txt");

// Set ENABLE_ZEPHYR_UPDATE based on environment
if (process.env.NODE_ENV === "regression") {
  process.env.ENABLE_ZEPHYR_UPDATE = "true";
}

// Determine if headless mode should be enabled
const headless = process.env.HEADLESS === "true";

export const config: Options.Testrunner = {
  //
  // ====================
  // Runner Configuration
  // ====================
  // WebdriverIO supports running e2e tests as well as unit and component tests.
  runner: "local",
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: "./tsconfig.json",
      transpileOnly: true,
    },
  },

  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // of the configuration file being run.
  //
  // The specs are defined as an array of spec files (optionally using wildcards
  // that will be expanded). The test for each spec file will be run in a separate
  // worker process. In order to have a group of spec files run in the same worker
  // process simply enclose them in an array within the specs array.
  //
  // The path of the spec files will be resolved relative from the directory of
  // of the config file unless it's absolute.
  //
  specs: [["./test/examples/satu.spec.ts", "./test/examples/dua.spec.ts"], "./test/examples/tiga.spec.ts"],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  // Suites spec (module)
  suites: {
    regression: ["./test/specs/**/*.spec.ts"],
    example: [["./test/examples/satu.spec.ts", "./test/examples/dua.spec.ts"], "./test/examples/tiga.spec.ts"],
    otherFeature: [
      // ...
    ],
  },
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 10,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://saucelabs.com/platform/platform-configurator
  //
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: headless ? ["--headless", "--disable-gpu"] : [],
      },
    },
  ],

  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: "info",
  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  // logLevels: {
  //     webdriver: 'info',
  //     '@wdio/appium-service': 'info'
  // },
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  // baseUrl: 'http://localhost:8080',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  //
  // Test runner services
  // Services take over a specific job you don't want to take care of. They enhance
  // your test setup with almost no effort. Unlike plugins, they don't add new
  // commands. Instead, they hook themselves up into the test process.
  // services: [],
  //
  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: https://webdriver.io/docs/frameworks
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  framework: "mocha",

  //
  // The number of times to retry the entire specfile when it fails as a whole
  // specFileRetries: 1,
  //
  // Delay in seconds between the spec file retry attempts
  // specFileRetriesDelay: 0,
  //
  // Whether or not retried spec files should be retried immediately or deferred to the end of the queue
  // specFileRetriesDeferred: false,
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter
  reporters: ["spec"],

  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  /**
   * Gets executed once before all workers get launched.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: function (config, capabilities) {
    const enableZephyrUpdate = process.env.ENABLE_ZEPHYR_UPDATE === "true";

    if (enableZephyrUpdate) {
      if (fs.existsSync(timeFilePath)) {
        fs.unlinkSync(timeFilePath);
      }

      if (fs.existsSync(specResultPath)) {
        fs.unlinkSync(specResultPath);
      }
    }
  },
  /**
   * Gets executed before a worker process is spawned and can be used to initialize specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {string} cid      capability id (e.g 0-0)
   * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {object} specs    specs to be run in the worker process
   * @param  {object} args     object that will be merged with the main configuration once worker is initialized
   * @param  {object} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just after a worker process has exited.
   * @param  {string} cid      capability id (e.g 0-0)
   * @param  {number} exitCode 0 - success, 1 - fail
   * @param  {object} specs    specs to be run in the worker process
   * @param  {number} retries  number of retries used
   */
  // onWorkerEnd: function (cid, exitCode, specs, retries) {
  // },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   * @param {string} cid worker id (e.g. 0-0)
   */
  // beforeSession: function (config, capabilities, specs, cid) {
  // },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs        List of spec file paths that are to be run
   * @param {object}         browser      instance of created browser/device session
   */
  // before: function (capabilities, specs) {
  // },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {string} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },
  /**
   * Hook that gets executed before the suite starts
   * @param {object} suite suite details
   */
  // beforeSuite: function (suite) {
  // },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */
  // beforeTest: function (test, context) {
  // },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  // beforeHook: function (test, context, hookName) {
  // },
  /**
   * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
   * afterEach in Mocha)
   */
  // afterHook: function (test, context, { error, result, duration, passed, retries }, hookName) {
  // },
  /**
   * Function to be executed after a test (in Mocha/Jasmine only)
   * @param {object}  test             test object
   * @param {object}  context          scope object the test was executed with
   * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
   * @param {*}       result.result    return object of test function
   * @param {number}  result.duration  duration of test
   * @param {boolean} result.passed    true if test has passed, otherwise false
   * @param {object}  result.retries   information about spec related retries, e.g. `{ attempts: 0, limit: 0 }`
   */

  afterTest: async function (test, context, { error, result, duration, passed, retries }) {
    // Get total time running
    const enableZephyrUpdate = process.env.ENABLE_ZEPHYR_UPDATE === "true";

    if (enableZephyrUpdate) {
      let currentTotalTime = 0;
      if (fs.existsSync(timeFilePath)) {
        currentTotalTime = parseInt(fs.readFileSync(timeFilePath, "utf8"));
      }
      currentTotalTime += duration;
      fs.writeFileSync(timeFilePath, currentTotalTime.toString());
    }

    // Screenshots when failed
    if (!passed) {
      const currentDate = new Date().toISOString().split("T")[0];
      const dailyScreenshotDir = path.join(screenshotDir, currentDate);

      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      if (!fs.existsSync(dailyScreenshotDir)) {
        fs.mkdirSync(dailyScreenshotDir, { recursive: true });
      }

      const matches = test.title.match(/\[key: (.+?)\]/);
      let filenameKeys = "";

      if (matches && matches.length > 1) {
        filenameKeys = matches[1]
          .split(",")
          .map((key) => key.trim())
          .join("_");
      }

      const screenshotFilename = `${filenameKeys}.png`;
      const screenshotFilePath = path.join(dailyScreenshotDir, screenshotFilename);

      await browser.saveScreenshot(screenshotFilePath);
      console.log(`================================\nScreenshot saved: ${screenshotFilePath}`);
    }

    // Integration to Zephyr
    if (enableZephyrUpdate) {
      const statusName = passed ? "Pass" : "Fail";
      let comment = "";

      if (!passed && error) {
        comment = `Error: ${error.message}`;
      }

      const testCaseKeys: RegExpMatchArray | null = test.title.match(/\[key: (.+?)\]/);
      if (testCaseKeys && testCaseKeys.length > 1) {
        const keys = testCaseKeys[1].split(",").map((key) => key.trim());

        for (const testCaseKey of keys) {
          if (testCaseKey) {
            await updateZephyrTestExecution(testCaseKey, statusName, comment, duration);
          }
        }
      }
    }
  },

  /**
   * Hook that gets executed after the suite has ended
   * @param {object} suite suite details
   */
  // afterSuite: function (suite) {
  // },
  /**
   * Runs after a WebdriverIO command gets executed
   * @param {string} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {number} result 0 - command success, 1 - command error
   * @param {object} error error object if any
   */
  // afterCommand: function (commandName, args, result, error) {
  // },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: function (result, capabilities, specs) {
    const enableZephyrUpdate = process.env.ENABLE_ZEPHYR_UPDATE === "true";

    if (enableZephyrUpdate) {
      const logEntry = `${specs.join(", ")}, Result: ${result === 0 ? "Passed" : "Failed"}\n`;

      fs.appendFileSync(specResultPath, logEntry);
    }
  },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the test run failing.
   * @param {object} exitCode 0 - success, 1 - fail
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  onComplete: async function (exitCode, config, capabilities, results) {
    // Discord Hooks
    const enableZephyrUpdate = process.env.ENABLE_ZEPHYR_UPDATE === "true";

    if (enableZephyrUpdate) {
      // Get passed and failed spec
      let specsPassed: string[] = [];
      let specsFailed: string[] = [];

      if (fs.existsSync(specResultPath)) {
        const specResults = fs.readFileSync(specResultPath, "utf8").split("\n").filter(Boolean);

        specResults.forEach((spec) => {
          // Handle arrays of specs and single specs
          const specArray = spec.includes("[") ? JSON.parse(spec.replace(/'/g, '"')) : [spec];
          specArray.forEach((singleSpec: string) => {
            if (singleSpec.includes("Result: Passed")) {
              specsPassed.push(singleSpec);
            } else if (singleSpec.includes("Result: Failed")) {
              specsFailed.push(singleSpec);
            }
          });
        });
      }

      if (fs.existsSync(specResultPath)) {
        fs.unlinkSync(specResultPath);
      }

      (config as any).specsPassed = specsPassed;
      (config as any).specsFailed = specsFailed;

      // Get total time execution
      if (fs.existsSync(timeFilePath)) {
        const totalExecutionTime = fs.readFileSync(timeFilePath, "utf8");
        (config as any).totalExecutionTime = totalExecutionTime;
        console.log("Final total execution time:", totalExecutionTime);
      }
      if (fs.existsSync(timeFilePath)) {
        fs.unlinkSync(timeFilePath);
      }

      console.log("===========================");
      console.log(config);
      await regressionDiscordHooks(config as any);
    }
  },

  /**
   * Gets executed when a refresh happens.
   * @param {string} oldSessionId session ID of the old session
   * @param {string} newSessionId session ID of the new session
   */
  // onReload: function(oldSessionId, newSessionId) {
  // }
  /**
   * Hook that gets executed before a WebdriverIO assertion happens.
   * @param {object} params information about the assertion to be executed
   */
  // beforeAssertion: function(params) {
  // }
  /**
   * Hook that gets executed after a WebdriverIO assertion happened.
   * @param {object} params information about the assertion that was executed, including its results
   */
  // afterAssertion: function(params) {
  // }
};
