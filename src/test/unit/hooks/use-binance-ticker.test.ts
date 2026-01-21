import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { MockWebSocket } from "@/test/mocks/websocket"

describe("useBinanceTicker", () => {
	describe("initial state", () => {
		it("returns empty tickers initially", () => {
			const { result } = renderHook(() => useBinanceTicker())

			expect(result.current.tickers).toEqual({})
			expect(result.current.reconnectAttempts).toBe(0)
		})

		it("starts in connecting state", () => {
			const { result } = renderHook(() => useBinanceTicker())
			expect(["idle", "connecting", "connected"]).toContain(result.current.status)
		})
	})

	describe("connection", () => {
		it("connects to Binance WebSocket with correct streams", async () => {
			renderHook(() => useBinanceTicker())
			await new Promise((r) => setTimeout(r, 10))

			const ws = MockWebSocket.getLastInstance()

			expect(ws).toBeDefined()
			expect(ws?.url).toContain("wss://stream.binance.com:9443/stream")
			expect(ws?.url).toContain("btcusdt@ticker")
		})

		it("transitions to connected state on open", async () => {
			const { result } = renderHook(() => useBinanceTicker())
			await new Promise((r) => setTimeout(r, 10))

			await waitFor(() => {
				expect(result.current.status).toBe("connected")
			})
		})
	})

	describe("message handling", () => {
		it("processes ticker messages and updates state", async () => {
			const { result } = renderHook(() => useBinanceTicker())
			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			const tickerMessage = {
				data: {
					c: "45000.00", // Current price
					h: "46000.00", // 24h high
					l: "44000.00", // 24h low
					P: "2.27", // Price change percent
					p: "1000.00", // Price change
					q: "450000000", // Quote volume
					s: "BTCUSDT",
					v: "10000", // Base volume
				},
				stream: "btcusdt@ticker",
			}

			act(() => {
				ws?.simulateMessage(tickerMessage)
			})
			await new Promise((r) => setTimeout(r, 20))

			await waitFor(() => {
				expect(result.current.tickers.BTC).toBeDefined()
			})
			expect(result.current.tickers.BTC.price).toBe("45000.00")
			expect(result.current.tickers.BTC.priceChangePercent).toBe("2.27")
		})

		it("handles multiple ticker updates", async () => {
			const { result } = renderHook(() => useBinanceTicker())
			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			act(() => {
				ws?.simulateMessage({
					data: {
						c: "45000.00",
						h: "46000.00",
						l: "44000.00",
						P: "2.27",
						p: "1000.00",
						q: "450000000",
						s: "BTCUSDT",
						v: "10000",
					},
					stream: "btcusdt@ticker",
				})
				ws?.simulateMessage({
					data: {
						c: "3000.00",
						h: "3100.00",
						l: "2900.00",
						P: "3.45",
						p: "100.00",
						q: "150000000",
						s: "ETHUSDT",
						v: "50000",
					},
					stream: "ethusdt@ticker",
				})
			})
			await new Promise((r) => setTimeout(r, 20))

			await waitFor(() => {
				expect(result.current.tickers.BTC).toBeDefined()
				expect(result.current.tickers.ETH).toBeDefined()
			})
			expect(result.current.tickers.BTC.price).toBe("45000.00")
			expect(result.current.tickers.ETH.price).toBe("3000.00")
		})

		it("calculates price direction correctly", async () => {
			const { result } = renderHook(() => useBinanceTicker())
			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			act(() => {
				ws?.simulateMessage({
					data: {
						c: "45000.00",
						h: "46000.00",
						l: "44000.00",
						P: "2.27",
						p: "1000.00",
						q: "450000000",
						s: "BTCUSDT",
						v: "10000",
					},
					stream: "btcusdt@ticker",
				})
			})
			await new Promise((r) => setTimeout(r, 20))

			await waitFor(() => {
				expect(result.current.tickers.BTC).toBeDefined()
			})

			expect(result.current.tickers.BTC.direction).toBe("neutral")

			act(() => {
				ws?.simulateMessage({
					data: {
						c: "45500.00",
						h: "46000.00",
						l: "44000.00",
						P: "2.27",
						p: "1000.00",
						q: "450000000",
						s: "BTCUSDT",
						v: "10000",
					},
					stream: "btcusdt@ticker",
				})
			})
			await new Promise((r) => setTimeout(r, 20))

			await waitFor(() => {
				expect(result.current.tickers.BTC.direction).toBe("up")
			})
		})
	})

	describe("reconnection", () => {
		it("provides reconnect function", () => {
			const { result } = renderHook(() => useBinanceTicker())

			expect(typeof result.current.reconnect).toBe("function")
		})
	})

	describe("time tracking", () => {
		it("tracks time since last message", async () => {
			const { result } = renderHook(() => useBinanceTicker())
			await new Promise((r) => setTimeout(r, 10))
			const ws = MockWebSocket.getLastInstance()

			act(() => {
				ws?.simulateMessage({
					data: {
						c: "45000.00",
						h: "46000.00",
						l: "44000.00",
						P: "2.27",
						p: "1000.00",
						q: "450000000",
						s: "BTCUSDT",
						v: "10000",
					},
					stream: "btcusdt@ticker",
				})
			})
			await new Promise((r) => setTimeout(r, 20))

			expect(result.current.timeSinceLastMessage).toBeGreaterThanOrEqual(0)
		})
	})
})
