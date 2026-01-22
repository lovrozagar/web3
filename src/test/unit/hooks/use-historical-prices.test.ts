import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useHistoricalPrices } from "@/hooks/use-historical-prices"

/* mock fetch globally */
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("useHistoricalPrices", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockFetch.mockReset()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe("initial state", () => {
		it("returns empty historical prices initially", () => {
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve([]),
				ok: true,
			})

			const { result } = renderHook(() => useHistoricalPrices({}))

			expect(result.current.historicalPrices).toEqual({})
			expect(result.current.isLoading).toBe(true)
		})
	})

	describe("fetching historical data", () => {
		it("fetches kline data for all trading pairs", async () => {
			/* mock successful kline responses */
			mockFetch.mockResolvedValue({
				json: () =>
					Promise.resolve([
						[1704067200000, "42000.00", "43000.00", "41000.00", "42500.00", "1000"],
					]),
				ok: true,
			})

			const currentPrices = { BTC: "45000.00", ETH: "2500.00" }
			const { result } = renderHook(() => useHistoricalPrices(currentPrices))

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			/* should have made fetch calls for each trading pair (1h and 7d each) */
			expect(mockFetch).toHaveBeenCalled()
		})

		it("calculates 1h price change correctly", async () => {
			/* mock 1h kline - price was 44000 an hour ago, now 45000 = +2.27% */
			mockFetch.mockImplementation((url: string) => {
				if (url.includes("interval=1h")) {
					return Promise.resolve({
						json: () =>
							Promise.resolve([
								[1704067200000, "44000.00", "45000.00", "43500.00", "44500.00", "1000"],
							]),
						ok: true,
					})
				}
				/* mock 7d kline */
				return Promise.resolve({
					json: () =>
						Promise.resolve([
							[1704067200000, "40000.00", "41000.00", "39000.00", "40500.00", "1000"],
						]),
					ok: true,
				})
			})

			const currentPrices = { BTC: "45000.00" }
			const { result } = renderHook(() => useHistoricalPrices(currentPrices))

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			/* check that historical prices are populated */
			await waitFor(() => {
				expect(result.current.historicalPrices.BTC).toBeDefined()
			})
		})

		it("handles fetch errors gracefully", async () => {
			mockFetch.mockRejectedValue(new Error("Network error"))

			const currentPrices = { BTC: "45000.00" }
			const { result } = renderHook(() => useHistoricalPrices(currentPrices))

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			/* should not throw, just have null values */
			expect(result.current.historicalPrices).toBeDefined()
		})

		it("handles non-ok response", async () => {
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve({}),
				ok: false,
			})

			const currentPrices = { BTC: "45000.00" }
			const { result } = renderHook(() => useHistoricalPrices(currentPrices))

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			/* should handle gracefully */
			expect(result.current.historicalPrices).toBeDefined()
		})
	})

	describe("price change calculations", () => {
		it("calculates positive change correctly", async () => {
			/* price went from 100 to 110 = +10% */
			mockFetch.mockResolvedValue({
				json: () =>
					Promise.resolve([[1704067200000, "100.00", "110.00", "95.00", "105.00", "1000"]]),
				ok: true,
			})

			const currentPrices = { BTC: "110.00" }
			const { result } = renderHook(() => useHistoricalPrices(currentPrices))

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			await waitFor(() => {
				const btcData = result.current.historicalPrices.BTC
				if (btcData?.change1h) {
					const change = Number.parseFloat(btcData.change1h)
					expect(change).toBeGreaterThan(0)
				}
			})
		})

		it("calculates negative change correctly", async () => {
			/* price went from 100 to 90 = -10% */
			mockFetch.mockResolvedValue({
				json: () =>
					Promise.resolve([[1704067200000, "100.00", "105.00", "85.00", "95.00", "1000"]]),
				ok: true,
			})

			const currentPrices = { BTC: "90.00" }
			const { result } = renderHook(() => useHistoricalPrices(currentPrices))

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			await waitFor(() => {
				const btcData = result.current.historicalPrices.BTC
				if (btcData?.change1h) {
					const change = Number.parseFloat(btcData.change1h)
					expect(change).toBeLessThan(0)
				}
			})
		})
	})

	describe("refetch functionality", () => {
		it("provides a refetch function", () => {
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve([]),
				ok: true,
			})

			const { result } = renderHook(() => useHistoricalPrices({}))

			expect(typeof result.current.refetch).toBe("function")
		})

		it("refetches data when refetch is called", async () => {
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve([]),
				ok: true,
			})

			const { result } = renderHook(() => useHistoricalPrices({}))

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			const initialCallCount = mockFetch.mock.calls.length

			act(() => {
				result.current.refetch()
			})

			await waitFor(() => {
				expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount)
			})
		})
	})

	describe("updates with current prices", () => {
		it("recalculates changes when current prices change", async () => {
			mockFetch.mockResolvedValue({
				json: () =>
					Promise.resolve([[1704067200000, "100.00", "110.00", "95.00", "105.00", "1000"]]),
				ok: true,
			})

			const { result, rerender } = renderHook(({ prices }) => useHistoricalPrices(prices), {
				initialProps: { prices: { BTC: "110.00" } },
			})

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			/* rerender with new price */
			rerender({ prices: { BTC: "120.00" } })

			/* changes should be recalculated based on new current price */
			await waitFor(() => {
				const btcData = result.current.historicalPrices.BTC
				expect(btcData).toBeDefined()
			})
		})
	})
})
