import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	/* Fail the build on CI if you accidentally left test.only in the source code */
	forbidOnly: !!process.env.CI,

	/* Run tests in files in parallel */
	fullyParallel: true,

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		/* Test against mobile viewports */
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
	],

	/* Reporter to use */
	reporter: "html",

	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,

	testDir: "./src/test/e2e",

	/* Shared settings for all the projects below */
	use: {
		/* Base URL to use in actions like `await page.goto('/')` */
		baseURL: "http://localhost:3000",

		/* Collect trace when retrying the failed test */
		trace: "on-first-retry",
	},

	/* Run local dev server before starting the tests */
	webServer: {
		command: "npm run dev",
		reuseExistingServer: !process.env.CI,
		url: "http://localhost:3000",
	},

	/* Maximum time one test can run for */
	timeout: 30 * 1000,

	/* Opt out of parallel tests on CI */
	workers: process.env.CI ? 1 : undefined,
})
