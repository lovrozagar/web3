import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useBinanceDepth } from "@/hooks/use-binance-depth"
import { MockWebSocket } from "@/test/mocks/websocket"

describe("useBinanceDepth", () => {
	describe("initial state", () => {
		it("returns empty order book initially", () => {
			const { result } = renderHook(() => useBinanceDepth())

			expect(result.current.orderBook.bids).toEqual([])
			expect(result.current.orderBook.asks).toEqual([])
			expect(result.current.orderBook.spread).toBe("0")
			expect(result.current.orderBook.spreadPercent).toBe("0")
		})

		it("starts in connecting state", () => {
			const { result } = renderHook(() => useBinanceDepth())

			expect(["idle", "connecting", "connected"]).toContain(result.current.status)
		})
	})

	describe("connection", () => {
		it("connects to Binance depth WebSocket with default pair", async () => {
			renderHook(() => useBinanceDepth())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			expect(ws).toBeDefined()
			expect(ws?.url).toContain("wss://stream.binance.com:9443/ws/")
			expect(ws?.url).toContain("@depth")
		})

		it("uses custom pair when provided", async () => {
			renderHook(() => useBinanceDepth("BTCUSDT"))

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			expect(ws?.url).toContain("btcusdt@depth")
		})

		it("uses custom update speed when provided", async () => {
			renderHook(() => useBinanceDepth("ETHUSDT", "1000ms"))

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			expect(ws?.url).toContain("@1000ms")
		})

		it("transitions to connected state on open", async () => {
			const { result } = renderHook(() => useBinanceDepth())

			await new Promise((r) => setTimeout(r, 10))

			await waitFor(() => {
				expect(result.current.status).toBe("connected")
			})
		})
	})

	describe("message handling", () => {
		it("processes depth messages and updates order book", async () => {
			const { result } = renderHook(() => useBinanceDepth())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			const depthMessage = {
				asks: [
					["45001.00", "1.0"],
					["45002.00", "2.5"],
					["45003.00", "1.5"],
				],
				bids: [
					["45000.00", "1.5"],
					["44999.00", "2.0"],
					["44998.00", "0.5"],
				],
				lastUpdateId: 123456,
			}

			act(() => {
				ws?.simulateMessage(depthMessage)
			})

			await new Promise((r) => setTimeout(r, 20))

			await waitFor(() => {
				expect(result.current.orderBook.bids.length).toBe(3)
			})
			expect(result.current.orderBook.asks.length).toBe(3)
			expect(result.current.orderBook.bids[0].price).toBe("45000.00")
			expect(result.current.orderBook.asks[0].price).toBe("45001.00")
		})

		it("calculates cumulative totals correctly", async () => {
			const { result } = renderHook(() => useBinanceDepth())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			const depthMessage = {
				asks: [
					["45001.00", "1.0"],
					["45002.00", "1.0"],
				],
				bids: [
					["45000.00", "1.0"],
					["44999.00", "2.0"],
					["44998.00", "3.0"],
				],
				lastUpdateId: 123456,
			}

			act(() => {
				ws?.simulateMessage(depthMessage)
			})

			await new Promise((r) => setTimeout(r, 20))

			await waitFor(() => {
				expect(result.current.orderBook.bids.length).toBe(3)
			})

			// Check cumulative totals
			expect(result.current.orderBook.bids[0].total).toBe(1.0)
			expect(result.current.orderBook.bids[1].total).toBe(3.0)
			expect(result.current.orderBook.bids[2].total).toBe(6.0)
		})

		it("calculates spread correctly", async () => {
			const { result } = renderHook(() => useBinanceDepth())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			const depthMessage = {
				asks: [["45010.00", "1.0"]],
				bids: [["45000.00", "1.0"]],
				lastUpdateId: 123456,
			}

			act(() => {
				ws?.simulateMessage(depthMessage)
			})

			await new Promise((r) => setTimeout(r, 20))

			await waitFor(() => {
				expect(result.current.orderBook.bids.length).toBe(1)
			})

			expect(result.current.orderBook.spread).toBe("10.00")
		})

		it("handles empty bids/asks", async () => {
			const { result } = renderHook(() => useBinanceDepth())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			const depthMessage = {
				asks: [],
				bids: [],
				lastUpdateId: 123456,
			}

			act(() => {
				ws?.simulateMessage(depthMessage)
			})

			await new Promise((r) => setTimeout(r, 20))

			expect(result.current.orderBook.bids).toEqual([])
			expect(result.current.orderBook.asks).toEqual([])
		})
	})

	describe("reconnection", () => {
		it("provides reconnect function", () => {
			const { result } = renderHook(() => useBinanceDepth())

			expect(typeof result.current.reconnect).toBe("function")
		})

		it("tracks reconnect attempts", () => {
			const { result } = renderHook(() => useBinanceDepth())

			expect(result.current.reconnectAttempts).toBe(0)
		})
	})

	describe("time tracking", () => {
		it("tracks time since last message", async () => {
			const { result } = renderHook(() => useBinanceDepth())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			act(() => {
				ws?.simulateMessage({
					asks: [["45001.00", "1.0"]],
					bids: [["45000.00", "1.0"]],
					lastUpdateId: 123456,
				})
			})

			await new Promise((r) => setTimeout(r, 20))

			expect(result.current.timeSinceLastMessage).toBeGreaterThanOrEqual(0)
		})
	})
})
