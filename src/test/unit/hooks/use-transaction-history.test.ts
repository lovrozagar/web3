import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { formatRelativeTime, useTransactionHistory } from "@/hooks/use-transaction-history"

describe("useTransactionHistory", () => {
	beforeEach(() => {
		localStorage.clear()
		vi.clearAllMocks()
	})

	afterEach(() => {
		localStorage.clear()
	})

	describe("initial state", () => {
		it("returns empty transactions when localStorage is empty", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			// Wait for effect to run
			await waitFor(() => {
				expect(result.current.transactions).toEqual([])
			})
		})

		it("returns object with expected shape", () => {
			const { result } = renderHook(() => useTransactionHistory())

			expect(typeof result.current.addTransaction).toBe("function")
			expect(typeof result.current.updateTransaction).toBe("function")
			expect(typeof result.current.removeTransaction).toBe("function")
			expect(typeof result.current.clearHistory).toBe("function")
			expect(typeof result.current.getByStatus).toBe("function")
		})
	})

	describe("addTransaction", () => {
		it("adds a pending transaction", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x123",
					toAmount: "3000",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(1)
			})

			expect(result.current.transactions[0].hash).toBe("0x123")
			expect(result.current.transactions[0].status).toBe("pending")
			expect(result.current.transactions[0].timestamp).toBeDefined()
		})

		it("persists to localStorage", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x123",
					toAmount: "3000",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(1)
			})

			const stored = JSON.parse(localStorage.getItem("web3-tx-history") || "[]")
			expect(stored.length).toBe(1)
			expect(stored[0].hash).toBe("0x123")
		})

		it("adds new transactions to the beginning", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x111",
					toAmount: "3000",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(1)
			})

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "0.1",
					fromToken: "BTC",
					hash: "0x222",
					toAmount: "4500",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(2)
			})

			// Newest should be first
			expect(result.current.transactions[0].hash).toBe("0x222")
			expect(result.current.transactions[1].hash).toBe("0x111")
		})
	})

	describe("updateTransaction", () => {
		it("updates transaction status to confirmed", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x123",
					toAmount: "3000",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(1)
			})

			act(() => {
				result.current.updateTransaction("0x123", { status: "confirmed" })
			})

			await waitFor(() => {
				expect(result.current.transactions[0].status).toBe("confirmed")
			})
		})

		it("updates transaction status to failed with error", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x123",
					toAmount: "3000",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(1)
			})

			act(() => {
				result.current.updateTransaction("0x123", {
					error: "Transaction reverted",
					status: "failed",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions[0].status).toBe("failed")
				expect(result.current.transactions[0].error).toBe("Transaction reverted")
			})
		})
	})

	describe("removeTransaction", () => {
		it("removes a transaction by hash", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x123",
					toAmount: "3000",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(1)
			})

			act(() => {
				result.current.removeTransaction("0x123")
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(0)
			})
		})
	})

	describe("clearHistory", () => {
		it("removes all transactions", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x111",
					toAmount: "3000",
					toToken: "USDT",
				})
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "0.1",
					fromToken: "BTC",
					hash: "0x222",
					toAmount: "4500",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(2)
			})

			act(() => {
				result.current.clearHistory()
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(0)
			})

			// localStorage should also be cleared
			expect(localStorage.getItem("web3-tx-history")).toBeNull()
		})
	})

	describe("getByStatus", () => {
		it("filters transactions by status", async () => {
			const { result } = renderHook(() => useTransactionHistory())

			act(() => {
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "1.0",
					fromToken: "ETH",
					hash: "0x111",
					toAmount: "3000",
					toToken: "USDT",
				})
				result.current.addTransaction({
					chainId: 1,
					fromAmount: "0.1",
					fromToken: "BTC",
					hash: "0x222",
					toAmount: "4500",
					toToken: "USDT",
				})
			})

			await waitFor(() => {
				expect(result.current.transactions.length).toBe(2)
			})

			act(() => {
				result.current.updateTransaction("0x111", { status: "confirmed" })
			})

			await waitFor(() => {
				expect(result.current.transactions.find((t) => t.hash === "0x111")?.status).toBe(
					"confirmed",
				)
			})

			const pending = result.current.getByStatus("pending")
			const confirmed = result.current.getByStatus("confirmed")

			expect(pending.length).toBe(1)
			expect(pending[0].hash).toBe("0x222")
			expect(confirmed.length).toBe(1)
			expect(confirmed[0].hash).toBe("0x111")
		})
	})
})

describe("formatRelativeTime", () => {
	it("returns 'just now' for recent timestamps", () => {
		const now = Date.now()
		expect(formatRelativeTime(now)).toBe("just now")
		expect(formatRelativeTime(now - 30000)).toBe("just now")
	})

	it("returns minutes for timestamps < 1 hour", () => {
		const now = Date.now()
		expect(formatRelativeTime(now - 60000)).toBe("1m ago")
		expect(formatRelativeTime(now - 300000)).toBe("5m ago")
		expect(formatRelativeTime(now - 3500000)).toBe("58m ago")
	})

	it("returns hours for timestamps < 1 day", () => {
		const now = Date.now()
		expect(formatRelativeTime(now - 3600000)).toBe("1h ago")
		expect(formatRelativeTime(now - 7200000)).toBe("2h ago")
		expect(formatRelativeTime(now - 82800000)).toBe("23h ago")
	})

	it("returns days for older timestamps", () => {
		const now = Date.now()
		expect(formatRelativeTime(now - 86400000)).toBe("1d ago")
		expect(formatRelativeTime(now - 172800000)).toBe("2d ago")
		expect(formatRelativeTime(now - 604800000)).toBe("7d ago")
	})
})
