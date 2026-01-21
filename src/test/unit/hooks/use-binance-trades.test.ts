import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useBinanceTrades } from "@/hooks/use-binance-trades"
import { MockWebSocket } from "@/test/mocks/websocket"

describe("useBinanceTrades", () => {
	describe("initial state", () => {
		it("returns empty trades array initially", () => {
			const { result } = renderHook(() => useBinanceTrades())

			expect(result.current.trades).toEqual([])
			expect(result.current.reconnectAttempts).toBe(0)
		})

		it("starts in connecting state", () => {
			const { result } = renderHook(() => useBinanceTrades())

			expect(["idle", "connecting", "connected"]).toContain(result.current.status)
		})
	})

	describe("connection", () => {
		it("connects to Binance trade WebSocket with default symbol", async () => {
			renderHook(() => useBinanceTrades())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			expect(ws).toBeDefined()
			expect(ws?.url).toContain("wss://stream.binance.com:9443/ws/")
			expect(ws?.url).toContain("ethusdt@trade")
		})

		it("uses custom symbol when provided", async () => {
			renderHook(() => useBinanceTrades({ symbol: "btcusdt" }))

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			expect(ws?.url).toContain("btcusdt@trade")
		})

		it("transitions to connected state on open", async () => {
			const { result } = renderHook(() => useBinanceTrades())

			await new Promise((r) => setTimeout(r, 10))

			await waitFor(() => {
				expect(result.current.status).toBe("connected")
			})
		})
	})

	describe("message handling", () => {
		it("processes trade messages and updates state", async () => {
			const { result } = renderHook(() => useBinanceTrades())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			const tradeMessage = {
				E: 1234567890123,
				e: "trade",
				m: false, // buyer is maker (sell)
				p: "3000.50",
				q: "1.5",
				s: "ETHUSDT",
				T: 1234567890123,
				t: 12345,
			}

			act(() => {
				ws?.simulateMessage(tradeMessage)
			})

			await waitFor(() => {
				expect(result.current.trades.length).toBe(1)
			})

			expect(result.current.trades[0].id).toBe(12345)
			expect(result.current.trades[0].price).toBe("3000.50")
			expect(result.current.trades[0].quantity).toBe("1.5")
			expect(result.current.trades[0].isBuyerMaker).toBe(false)
		})

		it("adds new trades to the beginning of the array", async () => {
			const { result } = renderHook(() => useBinanceTrades())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			act(() => {
				ws?.simulateMessage({
					E: 1234567890123,
					e: "trade",
					m: false,
					p: "3000.00",
					q: "1.0",
					s: "ETHUSDT",
					T: 1234567890123,
					t: 1,
				})
			})

			await waitFor(() => {
				expect(result.current.trades.length).toBe(1)
			})

			act(() => {
				ws?.simulateMessage({
					E: 1234567890124,
					e: "trade",
					m: true,
					p: "3001.00",
					q: "2.0",
					s: "ETHUSDT",
					T: 1234567890124,
					t: 2,
				})
			})

			await waitFor(() => {
				expect(result.current.trades.length).toBe(2)
			})

			expect(result.current.trades[0].id).toBe(2)
			expect(result.current.trades[1].id).toBe(1)
		})

		it("respects maxTrades limit", async () => {
			const { result } = renderHook(() => useBinanceTrades({ maxTrades: 3 }))

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			for (let i = 1; i <= 5; i++) {
				act(() => {
					ws?.simulateMessage({
						E: 1234567890123 + i,
						e: "trade",
						m: i % 2 === 0,
						p: `${3000 + i}.00`,
						q: "1.0",
						s: "ETHUSDT",
						T: 1234567890123 + i,
						t: i,
					})
				})
			}

			await waitFor(() => {
				expect(result.current.trades.length).toBe(3)
			})

			expect(result.current.trades[0].id).toBe(5)
			expect(result.current.trades[1].id).toBe(4)
			expect(result.current.trades[2].id).toBe(3)
		})

		it("correctly identifies buy vs sell trades", async () => {
			const { result } = renderHook(() => useBinanceTrades())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			/* isbuyermaker: true means the buyer is the maker, so it's a sell trade */
			act(() => {
				ws?.simulateMessage({
					E: 1234567890123,
					e: "trade",
					m: true, // sell
					p: "3000.00",
					q: "1.0",
					s: "ETHUSDT",
					T: 1234567890123,
					t: 1,
				})
			})

			await waitFor(() => {
				expect(result.current.trades.length).toBe(1)
			})

			expect(result.current.trades[0].isBuyerMaker).toBe(true)

			/* isbuyermaker: false means the seller is the maker, so it's a buy trade */
			act(() => {
				ws?.simulateMessage({
					E: 1234567890124,
					e: "trade",
					m: false, // buy
					p: "3001.00",
					q: "1.0",
					s: "ETHUSDT",
					T: 1234567890124,
					t: 2,
				})
			})

			await waitFor(() => {
				expect(result.current.trades.length).toBe(2)
			})

			expect(result.current.trades[0].isBuyerMaker).toBe(false)
		})
	})

	describe("reconnection", () => {
		it("provides reconnect function", () => {
			const { result } = renderHook(() => useBinanceTrades())

			expect(typeof result.current.reconnect).toBe("function")
		})

		it("tracks reconnect attempts", () => {
			const { result } = renderHook(() => useBinanceTrades())

			expect(result.current.reconnectAttempts).toBe(0)
		})
	})

	describe("time tracking", () => {
		it("tracks time since last message", async () => {
			const { result } = renderHook(() => useBinanceTrades())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			act(() => {
				ws?.simulateMessage({
					E: 1234567890123,
					e: "trade",
					m: false,
					p: "3000.00",
					q: "1.0",
					s: "ETHUSDT",
					T: 1234567890123,
					t: 1,
				})
			})

			await new Promise((r) => setTimeout(r, 20))

			expect(result.current.timeSinceLastMessage).toBeGreaterThanOrEqual(0)
		})
	})

	describe("edge cases", () => {
		it("handles default maxTrades of 20", async () => {
			const { result } = renderHook(() => useBinanceTrades())

			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			for (let i = 1; i <= 25; i++) {
				act(() => {
					ws?.simulateMessage({
						E: 1234567890123 + i,
						e: "trade",
						m: false,
						p: `${3000 + i}.00`,
						q: "1.0",
						s: "ETHUSDT",
						T: 1234567890123 + i,
						t: i,
					})
				})
			}

			await waitFor(() => {
				expect(result.current.trades.length).toBe(20)
			})

			expect(result.current.trades[0].id).toBe(25)
			expect(result.current.trades[19].id).toBe(6)
		})
	})
})
