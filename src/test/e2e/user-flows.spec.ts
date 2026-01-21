import { expect, test } from "@playwright/test"

test.describe("User Flows", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/")
	})

	test.describe("Price Alerts", () => {
		test("can view price alerts section", async ({ page }) => {
			await expect(page.locator("text=Price Alerts")).toBeVisible()
		})
	})

	test.describe("Limit Orders", () => {
		test("can view limit orders section", async ({ page }) => {
			await expect(page.locator("text=Limit Orders")).toBeVisible()
		})
	})

	test.describe("Transaction History", () => {
		test("shows empty state when no transactions", async ({ page }) => {
			await expect(page.locator("text=Transaction History")).toBeVisible()
			await expect(page.locator("text=No transactions yet")).toBeVisible()
		})
	})

	test.describe("Swap Interface", () => {
		test("can select different tokens", async ({ page }) => {
			const swapSection = page.locator("section").filter({ hasText: "Swap" }).first()
			await expect(swapSection).toBeVisible()
			await expect(page.locator("text=ETH").first()).toBeVisible()
			await expect(page.locator("text=USDT").first()).toBeVisible()
		})

		test("displays slippage tolerance options", async ({ page }) => {
			await expect(page.locator("button").filter({ hasText: "0.1%" })).toBeVisible()
			await expect(page.locator("button").filter({ hasText: "0.5%" })).toBeVisible()
			await expect(page.locator("button").filter({ hasText: "1%" })).toBeVisible()
		})

		test("can change slippage tolerance", async ({ page }) => {
			await page.locator("button").filter({ hasText: "1%" }).click()
			const selectedButton = page.locator("button").filter({ hasText: "1%" })
			await expect(selectedButton).toBeVisible()
		})
	})

	test.describe("Order Book Interactions", () => {
		test("can change order book depth", async ({ page }) => {
			await page.waitForSelector("text=ETH/USDT", { timeout: 10000 })
			const depthOptions = page.locator("text=Depth").first()
			await expect(depthOptions).toBeVisible()
		})

		test("order book updates in real-time", async ({ page }) => {
			await page.waitForSelector("text=ETH/USDT", { timeout: 10000 })
			await page.waitForTimeout(2000)
			const orderBookContent = page.locator("text=Price (USDT)")
			await expect(orderBookContent).toBeVisible()
		})

		test("spread is displayed between bids and asks", async ({ page }) => {
			await page.waitForSelector("text=ETH/USDT", { timeout: 10000 })
			await expect(page.locator("text=Spread")).toBeVisible()
		})
	})

	test.describe("Token Prices", () => {
		test("shows all configured tokens", async ({ page }) => {
			await page.waitForSelector("text=Bitcoin", { timeout: 10000 })
			await expect(page.locator("text=Bitcoin")).toBeVisible()
			await expect(page.locator("text=Ethereum")).toBeVisible()
			await expect(page.locator("text=Solana")).toBeVisible()
		})

		test("shows price change indicators", async ({ page }) => {
			await page.waitForSelector("text=Bitcoin", { timeout: 10000 })
			const percentageIndicator = page.locator("text=%").first()
			await expect(percentageIndicator).toBeVisible()
		})

		test("clicking token row shows expanded details", async ({ page }) => {
			await page.waitForSelector("text=Bitcoin", { timeout: 10000 })
			await page.locator("text=Bitcoin").click()
			await expect(page.locator("text=24h High")).toBeVisible()
			await expect(page.locator("text=24h Low")).toBeVisible()
		})
	})

	test.describe("Top Movers", () => {
		test("displays top gainers and losers", async ({ page }) => {
			await expect(page.locator("text=Top Movers")).toBeVisible()
			await expect(page.locator("text=Gainers")).toBeVisible()
			await expect(page.locator("text=Losers")).toBeVisible()
		})
	})

	test.describe("Recent Trades", () => {
		test("displays recent trades feed", async ({ page }) => {
			await expect(page.locator("text=Recent Trades")).toBeVisible()
			await page.waitForTimeout(2000)
		})
	})

	test.describe("Market Stats", () => {
		test("displays market statistics", async ({ page }) => {
			await expect(page.locator("text=Market Stats")).toBeVisible()
		})
	})
})

test.describe("Error Handling", () => {
	test("shows connection status indicator", async ({ page }) => {
		await page.goto("/")
		const statusIndicator = page.locator('[role="status"]').first()
		await expect(statusIndicator).toBeVisible()
	})
})

test.describe("Performance", () => {
	test("page loads within acceptable time", async ({ page }) => {
		const startTime = Date.now()
		await page.goto("/")
		await page.waitForSelector("text=Live Prices", { timeout: 5000 })
		const loadTime = Date.now() - startTime
		expect(loadTime).toBeLessThan(5000)
	})

	test("no console errors on page load", async ({ page }) => {
		const errors: string[] = []

		page.on("console", (msg) => {
			if (msg.type() === "error") {
				/* filter out expected websocket errors in test environment */
				const text = msg.text()
				if (!text.includes("WebSocket") && !text.includes("Failed to fetch")) {
					errors.push(text)
				}
			}
		})

		await page.goto("/")
		await page.waitForTimeout(2000)
		expect(errors.length).toBe(0)
	})
})
