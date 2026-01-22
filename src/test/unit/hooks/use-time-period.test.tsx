import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import type { TickerData } from "@/types"

/* mock the historical prices hook */
const mockHistoricalPrices = {
	BTC: {
		change1h: "1.50",
		change7d: "5.25",
		price1hAgo: "44000.00",
		price7dAgo: "42000.00",
	},
	ETH: {
		change1h: "-0.75",
		change7d: "3.00",
		price1hAgo: "2520.00",
		price7dAgo: "2400.00",
	},
}

vi.mock("@/hooks/use-historical-prices", () => ({
	useHistoricalPrices: () => ({
		historicalPrices: mockHistoricalPrices,
		isLoading: false,
		refetch: vi.fn(),
	}),
}))

import { TimePeriodProvider, useTimePeriod } from "@/hooks/use-time-period"

/* create wrapper with provider */
function createWrapper(tickers: Record<string, TickerData>) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <TimePeriodProvider tickers={tickers}>{children}</TimePeriodProvider>
	}
}

const mockTickers: Record<string, TickerData> = {
	BTC: {
		direction: "up",
		high24h: "46000.00",
		low24h: "44000.00",
		price: "45000.00",
		priceChange: "1000.00",
		priceChangePercent: "2.50",
		quoteVolume24h: "450000000",
		symbol: "BTC",
		volume24h: "10000.00",
	},
	ETH: {
		direction: "down",
		high24h: "2600.00",
		low24h: "2400.00",
		price: "2500.00",
		priceChange: "-31.25",
		priceChangePercent: "-1.25",
		quoteVolume24h: "125000000",
		symbol: "ETH",
		volume24h: "50000.00",
	},
}

describe("useTimePeriod", () => {
	describe("initial state", () => {
		it("defaults to 24h period", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			expect(result.current.period).toBe("24h")
		})

		it("provides setPeriod function", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			expect(typeof result.current.setPeriod).toBe("function")
		})

		it("provides getPriceChange function", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			expect(typeof result.current.getPriceChange).toBe("function")
		})

		it("provides historical prices", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			expect(result.current.historicalPrices).toBeDefined()
		})
	})

	describe("period switching", () => {
		it("changes period when setPeriod is called", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			act(() => {
				result.current.setPeriod("1h")
			})

			expect(result.current.period).toBe("1h")
		})

		it("can switch to 7d period", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			act(() => {
				result.current.setPeriod("7d")
			})

			expect(result.current.period).toBe("7d")
		})

		it("can switch back to 24h period", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			act(() => {
				result.current.setPeriod("1h")
			})
			act(() => {
				result.current.setPeriod("24h")
			})

			expect(result.current.period).toBe("24h")
		})
	})

	describe("getPriceChange", () => {
		it("returns 24h change for 24h period", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			const change = result.current.getPriceChange("BTC", mockTickers.BTC)

			/* should return the ticker's priceChangePercent for 24h */
			expect(change).toBe("2.50")
		})

		it("returns 1h change for 1h period", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			act(() => {
				result.current.setPeriod("1h")
			})

			const change = result.current.getPriceChange("BTC", mockTickers.BTC)

			/* should return the 1h change from historical prices */
			expect(change).toBe("1.50")
		})

		it("returns 7d change for 7d period", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			act(() => {
				result.current.setPeriod("7d")
			})

			const change = result.current.getPriceChange("BTC", mockTickers.BTC)

			/* should return the 7d change from historical prices */
			expect(change).toBe("5.25")
		})

		it("returns null for undefined ticker", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			const change = result.current.getPriceChange("BTC", undefined)

			expect(change).toBeNull()
		})

		it("returns null for unknown symbol in 1h period", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			act(() => {
				result.current.setPeriod("1h")
			})

			/* unknown symbol not in historical prices */
			const unknownTicker: TickerData = {
				direction: "neutral",
				high24h: "100.00",
				low24h: "90.00",
				price: "95.00",
				priceChange: "0.00",
				priceChangePercent: "0.00",
				quoteVolume24h: "1000000",
				symbol: "UNKNOWN",
				volume24h: "1000.00",
			}

			const change = result.current.getPriceChange("UNKNOWN", unknownTicker)

			expect(change).toBeNull()
		})
	})

	describe("context error handling", () => {
		it("throws error when used outside provider", () => {
			/* suppress console.error for this test */
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

			expect(() => {
				renderHook(() => useTimePeriod())
			}).toThrow("useTimePeriod must be used within a TimePeriodProvider")

			consoleSpy.mockRestore()
		})
	})

	describe("loading state", () => {
		it("exposes isLoadingHistorical from historical prices hook", () => {
			const { result } = renderHook(() => useTimePeriod(), {
				wrapper: createWrapper(mockTickers),
			})

			expect(typeof result.current.isLoadingHistorical).toBe("boolean")
		})
	})
})
