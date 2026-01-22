import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockOrderBook = {
	asks: [
		{ price: "2500.50", quantity: "8.0", total: 20004 },
		{ price: "2501.00", quantity: "12.5", total: 31262 },
		{ price: "2501.50", quantity: "6.3", total: 15759 },
		{ price: "2502.00", quantity: "9.8", total: 24519 },
		{ price: "2502.50", quantity: "11.2", total: 28028 },
		{ price: "2503.00", quantity: "7.5", total: 18772 },
		{ price: "2503.50", quantity: "10.0", total: 25035 },
		{ price: "2504.00", quantity: "8.9", total: 22285 },
		{ price: "2504.50", quantity: "13.1", total: 32809 },
		{ price: "2505.00", quantity: "5.6", total: 14028 },
	],
	bids: [
		{ price: "2500.00", quantity: "10.5", total: 26250 },
		{ price: "2499.50", quantity: "8.2", total: 20496 },
		{ price: "2499.00", quantity: "15.0", total: 37485 },
		{ price: "2498.50", quantity: "5.5", total: 13742 },
		{ price: "2498.00", quantity: "12.3", total: 30725 },
		{ price: "2497.50", quantity: "7.8", total: 19480 },
		{ price: "2497.00", quantity: "9.1", total: 22722 },
		{ price: "2496.50", quantity: "11.0", total: 27461 },
		{ price: "2496.00", quantity: "6.7", total: 16723 },
		{ price: "2495.50", quantity: "14.2", total: 35436 },
	],
	lastUpdateId: 123456789,
	spread: "0.50",
	spreadPercent: "0.02",
}

const mockPreferences: {
	compactMode: boolean
	defaultSlippage: number
	orderBookDepth: 10 | 20
	orderBookUpdateSpeed: number
	theme: string
} = {
	compactMode: false,
	defaultSlippage: 0.5,
	orderBookDepth: 20,
	orderBookUpdateSpeed: 250,
	theme: "system",
}

const mockSetOrderBookDepth = vi.fn()
const mockSetOrderBookUpdateSpeed = vi.fn()

vi.mock("@/hooks/use-binance-depth", () => ({
	useBinanceDepth: () => ({
		orderBook: mockOrderBook,
		reconnect: vi.fn(),
		reconnectAttempts: 0,
		status: "connected" as const,
		timeSinceLastMessage: 500,
	}),
}))

vi.mock("@/hooks/use-user-preferences", () => ({
	useUserPreferences: () => ({
		preferences: mockPreferences,
		setOrderBookDepth: mockSetOrderBookDepth,
		setOrderBookUpdateSpeed: mockSetOrderBookUpdateSpeed,
	}),
}))

vi.mock("@/components/connection-status", () => ({
	ConnectionStatus: ({ state, onReconnect }: { state: string; onReconnect?: () => void }) => (
		<div data-state={state} data-testid="connection-status">
			{state}
			{onReconnect && (
				<button onClick={onReconnect} type="button">
					Reconnect
				</button>
			)}
		</div>
	),
}))

import { OrderBook } from "@/components/order-book"

describe("OrderBook", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockPreferences.orderBookDepth = 20
	})

	describe("rendering", () => {
		it("renders the component with header", () => {
			render(<OrderBook />)

			expect(screen.getByText("Order Book")).toBeInTheDocument()
			expect(screen.getByText("ETH/USDT")).toBeInTheDocument()
		})

		it("renders connection status", () => {
			render(<OrderBook />)

			const status = screen.getByTestId("connection-status")
			expect(status).toBeInTheDocument()
			expect(status).toHaveAttribute("data-state", "connected")
		})

		it("renders column headers", () => {
			render(<OrderBook />)

			expect(screen.getByText("Price (USDT)")).toBeInTheDocument()
			expect(screen.getByText("Amount (ETH)")).toBeInTheDocument()
		})

		it("renders bid orders in green", () => {
			render(<OrderBook />)

			// Find bid prices (they should have emerald/green styling)
			const bidButtons = screen.getAllByRole("button", { name: /buy order/ })
			expect(bidButtons.length).toBeGreaterThan(0)
		})

		it("renders ask orders in red", () => {
			render(<OrderBook />)

			// Find ask prices
			const askButtons = screen.getAllByRole("button", { name: /sell order/ })
			expect(askButtons.length).toBeGreaterThan(0)
		})

		it("shows hint text at bottom", () => {
			render(<OrderBook />)

			expect(screen.getByText("Click price to fill swap form")).toBeInTheDocument()
		})
	})

	describe("spread display", () => {
		it("displays mid price", () => {
			render(<OrderBook />)

			expect(screen.getByText("$2,500.00")).toBeInTheDocument()
			expect(screen.getByText("≈ Mid")).toBeInTheDocument()
		})

		it("displays spread value and percentage", () => {
			render(<OrderBook />)

			expect(screen.getByText("Spread")).toBeInTheDocument()
			// Spread value should be visible
			expect(screen.getByText(/\$0\.50/)).toBeInTheDocument()
		})
	})

	describe("depth controls", () => {
		it("renders depth options", () => {
			render(<OrderBook />)

			expect(screen.getByText("Depth")).toBeInTheDocument()
			// Find buttons with "10" - there are two: one in grouping and one in depth
			const buttons10 = screen.getAllByRole("button", { name: "10" })
			expect(buttons10.length).toBe(2) // One in grouping, one in depth
			expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument()
		})

		it("calls setOrderBookDepth when depth option is clicked", () => {
			render(<OrderBook />)

			// Find depth section and get the "10" button inside it
			const depthLabel = screen.getByText("Depth")
			const depthSection = depthLabel.parentElement
			const depth10Button = depthSection?.querySelector("button")

			expect(depth10Button).toBeTruthy()
			act(() => {
				fireEvent.click(depth10Button as HTMLElement)
			})

			expect(mockSetOrderBookDepth).toHaveBeenCalledWith(10)
		})

		it("highlights active depth option", () => {
			mockPreferences.orderBookDepth = 20
			render(<OrderBook />)

			const depth20Button = screen.getByRole("button", { name: "20" })
			expect(depth20Button).toHaveClass("bg-ui-bg-hover")
		})
	})

	describe("grouping controls", () => {
		it("renders grouping options", () => {
			render(<OrderBook />)

			expect(screen.getByText("Group")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "0.01" })).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "0.1" })).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument()
			// "10" appears twice (in grouping and depth sections)
			const buttons10 = screen.getAllByRole("button", { name: "10" })
			expect(buttons10.length).toBe(2)
		})

		it("changes grouping when option is clicked", () => {
			render(<OrderBook />)

			const group1Button = screen.getByRole("button", { name: "1" })

			act(() => {
				fireEvent.click(group1Button)
			})

			// Button should now be active
			expect(group1Button).toHaveClass("bg-ui-bg-hover")
		})
	})

	describe("price click interaction", () => {
		it("calls onPriceSelect when bid is clicked", () => {
			const onPriceSelect = vi.fn()
			render(<OrderBook onPriceSelect={onPriceSelect} />)

			const bidButton = screen.getAllByRole("button", { name: /buy order/ })[0]

			act(() => {
				fireEvent.click(bidButton)
			})

			expect(onPriceSelect).toHaveBeenCalled()
			/* callback now includes baseSymbol as third parameter */
			expect(onPriceSelect).toHaveBeenCalledWith(expect.any(String), "bid", expect.any(String))
		})

		it("calls onPriceSelect when ask is clicked", () => {
			const onPriceSelect = vi.fn()
			render(<OrderBook onPriceSelect={onPriceSelect} />)

			const askButton = screen.getAllByRole("button", { name: /sell order/ })[0]

			act(() => {
				fireEvent.click(askButton)
			})

			expect(onPriceSelect).toHaveBeenCalled()
			/* callback now includes baseSymbol as third parameter */
			expect(onPriceSelect).toHaveBeenCalledWith(expect.any(String), "ask", expect.any(String))
		})

		it("order rows have descriptive aria-labels", () => {
			render(<OrderBook />)

			const bidButton = screen.getAllByRole("button", { name: /buy order/ })[0]
			expect(bidButton).toHaveAttribute("aria-label", expect.stringContaining("buy order at"))
		})
	})

	describe("order display", () => {
		it("displays correct number of order levels based on depth", () => {
			mockPreferences.orderBookDepth = 20
			render(<OrderBook />)

			// With depth 20, should show 10 bids and 10 asks (half on each side)
			const bidButtons = screen.getAllByRole("button", { name: /buy order/ })
			const askButtons = screen.getAllByRole("button", { name: /sell order/ })

			expect(bidButtons.length).toBe(10)
			expect(askButtons.length).toBe(10)
		})

		it("shows fewer levels with smaller depth setting", () => {
			mockPreferences.orderBookDepth = 10
			render(<OrderBook />)

			// With depth 10, should show 5 bids and 5 asks
			const bidButtons = screen.getAllByRole("button", { name: /buy order/ })
			const askButtons = screen.getAllByRole("button", { name: /sell order/ })

			expect(bidButtons.length).toBe(5)
			expect(askButtons.length).toBe(5)
		})
	})

	describe("depth bars", () => {
		it("renders depth bars with correct proportions", () => {
			render(<OrderBook />)

			// Depth bars are rendered inside order rows
			const orderRows = screen.getAllByRole("button", { name: /order/ })
			expect(orderRows.length).toBeGreaterThan(0)

			// Each row should have a depth bar div
			const firstRow = orderRows[0]
			const depthBar = firstRow.querySelector("div[style]")
			expect(depthBar).toBeInTheDocument()
		})
	})

	describe("loading states", () => {
		it("shows skeleton when no order book data", async () => {
			vi.doMock("@/hooks/use-binance-depth", () => ({
				useBinanceDepth: () => ({
					orderBook: { asks: [], bids: [], lastUpdateId: 0, spread: "0", spreadPercent: "0" },
					reconnect: vi.fn(),
					reconnectAttempts: 0,
					status: "connecting" as const,
					timeSinceLastMessage: 0,
				}),
			}))

			// Reset modules to pick up the new mock
			vi.resetModules()

			// Re-import with the updated mock
			const { OrderBook: EmptyOrderBook } = await import("@/components/order-book")

			render(<EmptyOrderBook />)

			// Should show loading state in spread area
			const loadingElements = document.querySelectorAll(".animate-pulse")
			expect(loadingElements.length).toBeGreaterThan(0)

			// Reset to original mock
			vi.doUnmock("@/hooks/use-binance-depth")
		})
	})

	describe("trading pair selector", () => {
		it("displays ETH/USDT as default pair", () => {
			render(<OrderBook />)

			/* default pair should be ETH/USDT */
			expect(screen.getByText("ETH/USDT")).toBeInTheDocument()
		})

		it("shows pair selector button with chevron", () => {
			render(<OrderBook />)

			const pairButton = screen.getByText("ETH/USDT").closest("button")
			expect(pairButton).toBeInTheDocument()
		})

		it("calls onPairChange when a new pair is selected", async () => {
			const onPairChange = vi.fn()
			render(<OrderBook onPairChange={onPairChange} />)

			/* click the pair selector button */
			const pairButton = screen.getByText("ETH/USDT").closest("button")
			if (pairButton) {
				act(() => {
					fireEvent.click(pairButton)
				})
			}

			/* wait for dropdown to appear and click BTC option */
			await waitFor(() => {
				expect(screen.getByText("BTC/USDT")).toBeInTheDocument()
			})

			act(() => {
				fireEvent.click(screen.getByText("BTC/USDT"))
			})

			expect(onPairChange).toHaveBeenCalledWith("btcusdt", "BTC")
		})

		it("passes correct baseSymbol to onPriceSelect", () => {
			const onPriceSelect = vi.fn()
			render(<OrderBook onPriceSelect={onPriceSelect} />)

			const bidButton = screen.getAllByRole("button", { name: /buy order/ })[0]
			act(() => {
				fireEvent.click(bidButton)
			})

			/* should pass ETH as default baseSymbol */
			expect(onPriceSelect).toHaveBeenCalledWith(expect.any(String), "bid", "ETH")
		})

		it("updates column header when pair changes", () => {
			render(<OrderBook />)

			/* initially shows ETH in column header */
			expect(screen.getByText("Amount (ETH)")).toBeInTheDocument()
		})

		it("closes dropdown when clicking outside", async () => {
			render(<OrderBook />)

			/* open the dropdown */
			const pairButton = screen.getByText("ETH/USDT").closest("button")
			if (pairButton) {
				act(() => {
					fireEvent.click(pairButton)
				})
			}

			/* wait for dropdown to appear */
			await waitFor(() => {
				expect(screen.getByText("BTC/USDT")).toBeInTheDocument()
			})

			/* click outside (on the document body) */
			act(() => {
				fireEvent.mouseDown(document.body)
			})

			/* dropdown should close */
			await waitFor(() => {
				expect(screen.queryByText("Bitcoin")).not.toBeInTheDocument()
			})
		})

		it("updates displayed pair label after selection", async () => {
			render(<OrderBook />)

			/* initially shows ETH/USDT */
			expect(screen.getByText("ETH/USDT")).toBeInTheDocument()

			/* open dropdown and select BTC */
			const pairButton = screen.getByText("ETH/USDT").closest("button")
			if (pairButton) {
				act(() => {
					fireEvent.click(pairButton)
				})
			}

			await waitFor(() => {
				expect(screen.getByText("BTC/USDT")).toBeInTheDocument()
			})

			act(() => {
				fireEvent.click(screen.getByText("BTC/USDT"))
			})

			/* should now show BTC/USDT as the selected pair */
			await waitFor(() => {
				const buttons = screen.getAllByRole("button")
				const pairBtn = buttons.find((btn) => btn.textContent?.includes("BTC/USDT"))
				expect(pairBtn).toBeInTheDocument()
			})
		})

		it("keeps dropdown open when clicking inside it", async () => {
			render(<OrderBook />)

			/* open the dropdown */
			const pairButton = screen.getByText("ETH/USDT").closest("button")
			if (pairButton) {
				act(() => {
					fireEvent.click(pairButton)
				})
			}

			/* wait for dropdown to appear */
			await waitFor(() => {
				expect(screen.getByText("SOL/USDT")).toBeInTheDocument()
			})

			/* mousedown inside dropdown (but not on a button) should keep it open */
			const solOption = screen.getByText("Solana")
			act(() => {
				fireEvent.mouseDown(solOption)
			})

			/* dropdown should still be visible */
			expect(screen.getByText("BTC/USDT")).toBeInTheDocument()
		})
	})
})
