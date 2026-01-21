import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/* import the hook fresh for each test by resetting module */
let useLimitOrders: typeof import("@/hooks/use-limit-orders").useLimitOrders

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		info: vi.fn(),
		success: vi.fn(),
	},
}))

describe("useLimitOrders", () => {
	beforeEach(async () => {
		localStorage.clear()
		vi.clearAllMocks()
		vi.resetModules()
		const module = await import("@/hooks/use-limit-orders")
		useLimitOrders = module.useLimitOrders
	})

	afterEach(() => {
		localStorage.clear()
	})

	describe("initial state", () => {
		it("returns empty orders when localStorage is empty", () => {
			const { result } = renderHook(() => useLimitOrders())

			expect(result.current.orders).toEqual([])
		})

		it("returns orders object with expected shape", () => {
			const { result } = renderHook(() => useLimitOrders())

			expect(result.current.orders).toBeDefined()
			expect(typeof result.current.createOrder).toBe("function")
			expect(typeof result.current.cancelOrder).toBe("function")
			expect(typeof result.current.clearFilled).toBe("function")
			expect(typeof result.current.checkOrders).toBe("function")
		})
	})

	describe("createOrder", () => {
		it("creates a buy limit order", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			expect(result.current.orders.length).toBe(1)
			expect(result.current.orders[0].side).toBe("buy")
			expect(result.current.orders[0].tokenFrom).toBe("USDT")
			expect(result.current.orders[0].tokenTo).toBe("ETH")
			expect(result.current.orders[0].amount).toBe("1000")
			expect(result.current.orders[0].limitPrice).toBe(2800)
			expect(result.current.orders[0].status).toBe("open")
		})

		it("creates a sell limit order", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("sell", "ETH", "USDT", "0.5", 3200)
			})

			expect(result.current.orders.length).toBe(1)
			expect(result.current.orders[0].side).toBe("sell")
		})

		it("persists orders to localStorage", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			expect(localStorage.setItem).toHaveBeenCalledWith("dex-limit-orders", expect.any(String))

			const stored = JSON.parse(localStorage.getItem("dex-limit-orders") || "[]")
			expect(stored.length).toBe(1)
		})

		it("adds new orders to the beginning", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			act(() => {
				result.current.createOrder("sell", "ETH", "USDT", "0.5", 3200)
			})

			expect(result.current.orders[0].side).toBe("sell")
			expect(result.current.orders[1].side).toBe("buy")
		})
	})

	describe("cancelOrder", () => {
		it("cancels an order by id", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			const orderId = result.current.orders[0].id

			act(() => {
				result.current.cancelOrder(orderId)
			})

			expect(result.current.orders[0].status).toBe("cancelled")
		})

		it("only cancels the specified order", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
				result.current.createOrder("sell", "ETH", "USDT", "0.5", 3200)
			})

			const buyOrderId = result.current.orders.find((o) => o.side === "buy")?.id

			expect(buyOrderId).toBeDefined()
			if (buyOrderId) {
				act(() => {
					result.current.cancelOrder(buyOrderId)
				})
			}

			const buyOrder = result.current.orders.find((o) => o.side === "buy")
			const sellOrder = result.current.orders.find((o) => o.side === "sell")

			expect(buyOrder?.status).toBe("cancelled")
			expect(sellOrder?.status).toBe("open")
		})
	})

	describe("checkOrders", () => {
		it("fills buy order when price drops to limit", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			act(() => {
				result.current.checkOrders({ ETH: 2800 })
			})

			expect(result.current.orders[0].status).toBe("filled")
			expect(result.current.orders[0].filledAt).toBeDefined()
		})

		it("fills buy order when price drops below limit", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			act(() => {
				result.current.checkOrders({ ETH: 2700 })
			})

			expect(result.current.orders[0].status).toBe("filled")
		})

		it("fills sell order when price rises to limit", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("sell", "ETH", "USDT", "0.5", 3200)
			})

			act(() => {
				result.current.checkOrders({ ETH: 3200 })
			})

			expect(result.current.orders[0].status).toBe("filled")
		})

		it("does not fill order when price has not reached limit", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			act(() => {
				result.current.checkOrders({ ETH: 2900 })
			})

			expect(result.current.orders[0].status).toBe("open")
		})

		it("does not re-fill already filled orders", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			act(() => {
				result.current.checkOrders({ ETH: 2800 })
			})

			const filledAt = result.current.orders[0].filledAt

			act(() => {
				result.current.checkOrders({ ETH: 2700 })
			})

			expect(result.current.orders[0].filledAt).toBe(filledAt)
		})

		it("does not check cancelled orders", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
			})

			const orderId = result.current.orders[0].id

			act(() => {
				result.current.cancelOrder(orderId)
			})

			act(() => {
				result.current.checkOrders({ ETH: 2700 })
			})

			expect(result.current.orders[0].status).toBe("cancelled")
		})
	})

	describe("clearFilled", () => {
		it("removes all non-open orders", () => {
			const { result } = renderHook(() => useLimitOrders())

			act(() => {
				result.current.createOrder("buy", "USDT", "ETH", "1000", 2800)
				result.current.createOrder("sell", "ETH", "USDT", "0.5", 3200)
			})

			act(() => {
				result.current.checkOrders({ ETH: 2700 })
			})

			expect(result.current.orders.filter((o) => o.status === "filled").length).toBe(1)
			expect(result.current.orders.filter((o) => o.status === "open").length).toBe(1)

			act(() => {
				result.current.clearFilled()
			})

			expect(result.current.orders.length).toBe(1)
			expect(result.current.orders[0].status).toBe("open")
		})
	})
})
