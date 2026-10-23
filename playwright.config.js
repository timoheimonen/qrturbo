const { defineConfig, devices } = require('@playwright/test');

// PORT lets parallel runs use their own static server; 4173 stays the default.
const port = Number(process.env.PORT || 4173);
const baseURL = `http://127.0.0.1:${port}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'node tests/helpers/static-server.js',
    url: baseURL,
    env: { PORT: String(port) },
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'chromium',
      grepInvert: /@mobile-smoke/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile-chrome',
      grep: /@mobile-smoke/,
      use: { ...devices['Pixel 7'] }
    },
    {
      name: 'webkit',
      grep: /@webkit-core/,
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
