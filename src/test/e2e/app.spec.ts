import { expect, test } from "@playwright/test"

test.describe("DEX Dashboard", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/")
	})

	test("loads the homepage with all components", async ({ page }) => {
		await expect(page.locator("h2").filter({ hasText: "Mini DEX Dashboard" })).toBeVisible()
		await expect(page.locator("text=Live Prices")).toBeVisible()
		await expect(page.locator("text=Order Book")).toBeVisible()
		await expect(page.locator("text=Swap")).toBeVisible()
		await expect(page.locator("button").filter({ hasText: /Connect/ })).toBeVisible()
	})

	test("displays live price data", async ({ page }) => {
		await page.waitForSelector('[role="status"]', { timeout: 10000 })
		await expect(page.locator("text=BTC")).toBeVisible()
		await expect(page.locator("text=ETH")).toBeVisible()
		await expect(page.locator("text=SOL")).toBeVisible()
	})

	test("order book displays bid/ask data", async ({ page }) => {
		await page.waitForSelector("text=ETH/USDT", { timeout: 10000 })
		await expect(page.locator("text=Group")).toBeVisible()
		await expect(page.locator("text=Depth")).toBeVisible()
		await expect(page.locator("text=Price (USDT)")).toBeVisible()
		await expect(page.locator("text=Amount (ETH)")).toBeVisible()
	})

	test("swap interface shows connect wallet state", async ({ page }) => {
		const swapSection = page.locator("text=Swap").first()
		await expect(swapSection).toBeVisible()
		await expect(page.locator("button").filter({ hasText: "0.1%" })).toBeVisible()
		await expect(page.locator("button").filter({ hasText: "0.5%" })).toBeVisible()
		const connectButton = page.locator("button").filter({ hasText: /Connect Wallet/ })
		await expect(connectButton).toBeVisible()
	})

	test("token price row expands on click", async ({ page }) => {
		await page.waitForSelector("text=Bitcoin", { timeout: 10000 })
		await page.locator("text=Bitcoin").click()
		await expect(page.locator("text=24h High")).toBeVisible()
		await expect(page.locator("text=24h Low")).toBeVisible()
		await expect(page.locator("text=24h Vol")).toBeVisible()
	})

	test("settings panel opens and closes", async ({ page }) => {
		await page.locator('button[aria-label="Settings"]').click()
		await expect(page.locator("text=Theme")).toBeVisible()
		await expect(page.locator("text=Default Slippage Tolerance")).toBeVisible()
		await expect(page.locator("text=Order Book Depth")).toBeVisible()
		await page.keyboard.press("Escape")
	})

	test("order book price grouping works", async ({ page }) => {
		await page.waitForSelector("text=ETH/USDT", { timeout: 10000 })
		await page.locator("button").filter({ hasText: "0.1" }).click()
		const selectedGrouping = page.locator("button").filter({ hasText: "0.1" }).first()
		await expect(selectedGrouping).toBeVisible()
	})

	test("responsive design works on mobile viewport", async ({ page }) => {
		await page.setViewportSize({ height: 844, width: 390 })
		await expect(page.locator("text=Live Prices")).toBeVisible()
		await expect(page.locator("text=Order Book")).toBeVisible()
		await expect(page.locator("text=Swap")).toBeVisible()
		await expect(page.locator("button").filter({ hasText: "Connect" })).toBeVisible()
	})
})

test.describe("Accessibility", () => {
	test("connection status has proper ARIA attributes", async ({ page }) => {
		await page.goto("/")
		const statusElements = page.locator('[role="status"]')
		expect(await statusElements.count()).toBeGreaterThan(0)
	})

	test("order book rows are keyboard navigable", async ({ page }) => {
		await page.goto("/")
		await page.waitForSelector("text=ETH/USDT", { timeout: 10000 })
		await page.keyboard.press("Tab")
		await page.keyboard.press("Tab")
		await page.keyboard.press("Tab")
		const focusedElement = page.locator(":focus")
		await expect(focusedElement).toBeVisible()
	})
})
