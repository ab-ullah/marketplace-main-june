const {
  defineConfig
} = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
  trashAssetsBeforeRuns: true,
  defaultCommandTimeout: 40000,
  viewportWidth: 1920,
  viewportHeight: 1080,
  numTestsKeptInMemory: 1,
  video: true,
  screenshotOnRunFailure: false,
  videoCompression: 0,
  pageLoadTimeout: 25000,
  reporter: "cypress-testrail-reporter",
  reporterOptions: {
    host: "https://navable.testrail.io",
    projectId: 2,
    username: "",
    password: "",
    suiteId: 9,
    includeAllInTestRun: false,
    allowFailedScreenshotUpload: true,
    useKnownIssueFeature: true,
  },
  retries: {
    "runMode": 1,
    "openMode": 0
  },
  e2e: {

    setupNodeEvents(on, config) {
      // implement node event listeners here

      return require('./cypress/plugins/index.js')(on, config)

    },
    testIsolation: "legacy"
  },
  projectId: 'c6hcxy',
});