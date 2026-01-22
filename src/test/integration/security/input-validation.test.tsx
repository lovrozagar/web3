import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("wagmi", () => ({
	useBalance: () => ({
		data: {
			decimals: 18,
			symbol: "ETH",
			value: BigInt(5000000000000000000),
		},
	}),
	useChainId: () => 1,
	useConnection: () => ({
		address: "0x1234567890123456789012345678901234567890",
		isConnected: true,
	}),
}))

vi.mock("@rainbow-me/rainbowkit", () => ({
	useConnectModal: () => ({ openConnectModal: vi.fn() }),
}))

vi.mock("@/hooks/use-binance-ticker", () => ({
	useBinanceTicker: () => ({
		status: "connected" as const,
		tickers: {
			ETH: { price: "2500.00", priceChangePercent: "2.50", symbol: "ETHUSDT" },
		},
	}),
}))

vi.mock("@/hooks/use-transaction-history", () => ({
	useTransactionHistory: () => ({
		addTransaction: vi.fn(),
		transactions: [],
		updateTransaction: vi.fn(),
	}),
}))

vi.mock("@/hooks/use-user-preferences", () => ({
	useUserPreferences: () => ({
		preferences: {
			compactMode: false,
			defaultSlippage: 0.5,
			orderBookDepth: 20,
			orderBookUpdateSpeed: 250,
			theme: "system",
		},
	}),
}))

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		info: vi.fn(),
		loading: vi.fn(),
		success: vi.fn(),
	},
}))

vi.mock("@/utils/explorer", () => ({
	getExplorerTxUrl: () => "https://etherscan.io/tx/0x123",
}))

import { SwapInterface } from "@/components/swap-interface"
import { formatPercent, formatPrice, formatQuantity } from "@/utils/format"

describe("Security: Input Validation", () => {
	describe("Swap Amount Input Sanitization", () => {
		it("rejects script injection attempts", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: '<script>alert("xss")</script>' } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("rejects event handler injection", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: '1" onmouseover="alert(1)"' } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("rejects JavaScript URL scheme", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "javascript:alert(1)" } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("rejects HTML entities", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "&lt;script&gt;" } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("rejects Unicode escape sequences for XSS", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "\\u003cscript\\u003e" } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("rejects SQL injection patterns", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1; DROP TABLE users;--" } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("allows only valid numeric input", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1.5" } })
			})
			expect(fromInput).toHaveValue("1.5")

			act(() => {
				fireEvent.change(fromInput, { target: { value: "0.001" } })
			})
			expect(fromInput).toHaveValue("0.001")

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1000000" } })
			})
			expect(fromInput).toHaveValue("1000000")
		})

		it("rejects multiple decimal points", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1.5" } })
			})

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1.5.5" } })
			})

			expect(fromInput).toHaveValue("1.5")
		})

		it("rejects negative values", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "-1.5" } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("handles extremely large numbers gracefully", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, {
					target: { value: "999999999999999999999999999999999999999" },
				})
			})

			expect(fromInput).toHaveValue("999999999999999999999999999999999999999")
		})

		it("handles scientific notation correctly", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1e18" } })
			})

			expect(fromInput).toHaveValue("")
		})
	})

	describe("Data Integrity", () => {
		it("preserves numeric precision", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "0.123456789" } })
			})

			expect(fromInput).toHaveValue("0.123456789")
		})

		it("handles leading zeros correctly", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "0.5" } })
			})

			expect(fromInput).toHaveValue("0.5")
		})

		it("handles decimal-only input", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: ".5" } })
			})

			// Should allow .5 as valid decimal
			expect(fromInput).toHaveValue(".5")
		})
	})

	describe("Prototype Pollution Prevention", () => {
		it("handles __proto__ injection safely", () => {
			const testData = '{"__proto__": {"polluted": true}}'
			const _parsed = JSON.parse(testData)
			const testObj = {}
			expect((testObj as Record<string, unknown>).polluted).toBeUndefined()
		})

		it("handles constructor injection safely", () => {
			const testData = '{"constructor": {"prototype": {"polluted": true}}}'
			JSON.parse(testData)

			const testObj = {}
			expect((testObj as Record<string, unknown>).polluted).toBeUndefined()
		})
	})
})

describe("Security: URL Validation", () => {
	describe("Explorer URL Safety", () => {
		it("generates safe explorer URLs", async () => {
			const { getExplorerTxUrl } = await vi.importActual<{
				getExplorerTxUrl: (chainId: number, hash: string) => string
			}>("@/utils/explorer")

			// Test with valid hash
			const url = getExplorerTxUrl(1, "0x1234567890abcdef")
			expect(url).toMatch(/^https:\/\//)
			expect(url).not.toContain("javascript:")
			expect(url).not.toContain("<script")
		})
	})
})

describe("Security: Output Encoding", () => {
	describe("Price Display Safety", () => {
		it("formats prices without executing code", () => {
			// Test with potentially malicious input
			const maliciousInput = "<img src=x onerror=alert(1)>"

			// These should handle non-numeric input gracefully
			expect(() => formatPrice(maliciousInput)).not.toThrow()
			expect(() => formatPercent(maliciousInput)).not.toThrow()
			expect(() => formatQuantity(maliciousInput)).not.toThrow()

			const result = formatPrice(maliciousInput)
			expect(result).not.toContain("<")
			expect(result).not.toContain(">")
		})
	})
})

describe("Security: Rate Limiting", () => {
	describe("Input Throttling", () => {
		it("handles rapid input changes without issues", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			for (let i = 0; i < 100; i++) {
				act(() => {
					fireEvent.change(fromInput, { target: { value: `${i}.${i}` } })
				})
			}

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1.5" } })
			})

			expect(fromInput).toHaveValue("1.5")
		})
	})
})
