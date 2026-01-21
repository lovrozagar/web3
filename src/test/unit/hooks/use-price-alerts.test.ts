import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/* import the hook fresh for each test by resetting module */
let usePriceAlerts: typeof import("@/hooks/use-price-alerts").usePriceAlerts

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		info: vi.fn(),
		success: vi.fn(),
	},
}))

describe("usePriceAlerts", () => {
	beforeEach(async () => {
		localStorage.clear()
		vi.clearAllMocks()
		vi.resetModules()
		const module = await import("@/hooks/use-price-alerts")
		usePriceAlerts = module.usePriceAlerts
	})

	afterEach(() => {
		localStorage.clear()
	})

	describe("initial state", () => {
		it("returns empty alerts when localStorage is empty", () => {
			const { result } = renderHook(() => usePriceAlerts())

			expect(result.current.alerts).toEqual([])
		})

		it("returns alerts object with expected shape", () => {
			const { result } = renderHook(() => usePriceAlerts())

			expect(result.current.alerts).toBeDefined()
			expect(typeof result.current.addAlert).toBe("function")
			expect(typeof result.current.removeAlert).toBe("function")
			expect(typeof result.current.clearTriggered).toBe("function")
			expect(typeof result.current.checkAlerts).toBe("function")
		})
	})

	describe("addAlert", () => {
		it("adds a price alert above target", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
			})

			expect(result.current.alerts.length).toBe(1)
			expect(result.current.alerts[0].symbol).toBe("BTC")
			expect(result.current.alerts[0].targetPrice).toBe(50000)
			expect(result.current.alerts[0].direction).toBe("above")
			expect(result.current.alerts[0].triggered).toBe(false)
		})

		it("adds a price alert below target", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("ETH", 3000, "below")
			})

			expect(result.current.alerts.length).toBe(1)
			expect(result.current.alerts[0].direction).toBe("below")
		})

		it("persists alerts to localStorage", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
			})

			expect(localStorage.setItem).toHaveBeenCalledWith("dex-price-alerts", expect.any(String))

			const stored = JSON.parse(localStorage.getItem("dex-price-alerts") || "[]")
			expect(stored.length).toBe(1)
			expect(stored[0].symbol).toBe("BTC")
		})

		it("can add multiple alerts", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
				result.current.addAlert("ETH", 3000, "below")
				result.current.addAlert("SOL", 100, "above")
			})

			expect(result.current.alerts.length).toBe(3)
		})
	})

	describe("removeAlert", () => {
		it("removes an alert by id", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
			})

			const alertId = result.current.alerts[0].id

			act(() => {
				result.current.removeAlert(alertId)
			})

			expect(result.current.alerts.length).toBe(0)
		})

		it("only removes the specified alert", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
				result.current.addAlert("ETH", 3000, "below")
			})

			const btcAlertId = result.current.alerts.find((a) => a.symbol === "BTC")?.id

			expect(btcAlertId).toBeDefined()
			if (btcAlertId) {
				act(() => {
					result.current.removeAlert(btcAlertId)
				})
			}

			expect(result.current.alerts.length).toBe(1)
			expect(result.current.alerts[0].symbol).toBe("ETH")
		})
	})

	describe("checkAlerts", () => {
		it("triggers alert when price goes above target", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
			})

			act(() => {
				result.current.checkAlerts({ BTC: 51000 })
			})

			expect(result.current.alerts[0].triggered).toBe(true)
		})

		it("triggers alert when price goes below target", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("ETH", 3000, "below")
			})

			act(() => {
				result.current.checkAlerts({ ETH: 2900 })
			})

			expect(result.current.alerts[0].triggered).toBe(true)
		})

		it("does not trigger when price has not reached target", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
			})

			act(() => {
				result.current.checkAlerts({ BTC: 49000 })
			})

			expect(result.current.alerts[0].triggered).toBe(false)
		})

		it("does not re-trigger already triggered alerts", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
			})

			act(() => {
				result.current.checkAlerts({ BTC: 51000 })
			})

			act(() => {
				result.current.checkAlerts({ BTC: 52000 })
			})

			expect(result.current.alerts[0].triggered).toBe(true)
		})
	})

	describe("clearTriggered", () => {
		it("removes all triggered alerts", () => {
			const { result } = renderHook(() => usePriceAlerts())

			act(() => {
				result.current.addAlert("BTC", 50000, "above")
				result.current.addAlert("ETH", 3000, "below")
			})

			act(() => {
				result.current.checkAlerts({ BTC: 51000 })
			})

			expect(result.current.alerts[0].triggered).toBe(true)
			expect(result.current.alerts[1].triggered).toBe(false)

			act(() => {
				result.current.clearTriggered()
			})

			expect(result.current.alerts.length).toBe(1)
			expect(result.current.alerts[0].symbol).toBe("ETH")
		})
	})
})
