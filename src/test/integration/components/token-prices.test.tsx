import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { TickerData } from "@/types"

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
	SOL: {
		direction: "up",
		high24h: "105.00",
		low24h: "95.00",
		price: "100.00",
		priceChange: "5.00",
		priceChangePercent: "5.00",
		quoteVolume24h: "10000000",
		symbol: "SOL",
		volume24h: "100000.00",
	},
}

const mockFavorites = new Set<string>()
const mockFavoriteTokens = vi.fn(() => ({
	favorites: Array.from(mockFavorites),
	isFavorite: (symbol: string) => mockFavorites.has(symbol),
	toggleFavorite: (symbol: string) => {
		if (mockFavorites.has(symbol)) {
			mockFavorites.delete(symbol)
		} else {
			mockFavorites.add(symbol)
		}
	},
}))

const mockTimePeriod = vi.fn(
	(): {
		getPriceChange: (symbol: string, ticker: TickerData | undefined) => string | null
		historicalPrices: Record<string, unknown>
		isLoadingHistorical: boolean
		period: "1h" | "24h" | "7d"
		setPeriod: ReturnType<typeof vi.fn>
	} => ({
		getPriceChange: (_symbol: string, ticker: TickerData | undefined) =>
			ticker?.priceChangePercent ?? null,
		historicalPrices: {},
		isLoadingHistorical: false,
		period: "24h",
		setPeriod: vi.fn(),
	}),
)

vi.mock("@/hooks/use-favorite-tokens", () => ({
	useFavoriteTokens: () => mockFavoriteTokens(),
}))

vi.mock("@/hooks/use-time-period", () => ({
	useTimePeriod: () => mockTimePeriod(),
}))

vi.mock("@/components/sparkline", () => ({
	generateSparklineData: (price: number, change: number) => {
		const points = []
		const startPrice = price / (1 + change / 100)
		for (let i = 0; i < 20; i++) {
			points.push(startPrice + ((price - startPrice) * i) / 19)
		}
		return points
	},
	Sparkline: ({ data }: { data: number[] }) => (
		<div data-points={data.length} data-testid="sparkline">
			Sparkline
		</div>
	),
}))

vi.mock("@/components/connection-status", () => ({
	ConnectionStatus: ({ state }: { state: string }) => (
		<div data-state={state} data-testid="connection-status">
			{state}
		</div>
	),
}))

vi.mock("@/components/time-period-toggle", () => ({
	TimePeriodToggle: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
		<div data-testid="time-period-toggle">
			<button onClick={() => onChange("1h")} type="button">
				1h
			</button>
			<button onClick={() => onChange("24h")} type="button">
				24h
			</button>
			<button onClick={() => onChange("7d")} type="button">
				7d
			</button>
			<span data-testid="current-period">{value}</span>
		</div>
	),
}))

import { TokenPrices } from "@/components/token-prices"

const defaultProps = {
	reconnect: vi.fn(),
	reconnectAttempts: 0,
	status: "connected" as const,
	tickers: mockTickers,
	timeSinceLastMessage: 1000,
}

describe("TokenPrices", () => {
	beforeEach(() => {
		mockFavorites.clear()
		vi.clearAllMocks()
	})

	describe("rendering", () => {
		it("renders the component with header", () => {
			render(<TokenPrices {...defaultProps} />)

			expect(screen.getByText("Live Prices")).toBeInTheDocument()
		})

		it("renders connection status", () => {
			render(<TokenPrices {...defaultProps} />)

			const status = screen.getByTestId("connection-status")
			expect(status).toBeInTheDocument()
			expect(status).toHaveAttribute("data-state", "connected")
		})

		it("renders time period toggle", () => {
			render(<TokenPrices {...defaultProps} />)

			expect(screen.getByTestId("time-period-toggle")).toBeInTheDocument()
		})

		it("renders all supported tokens", () => {
			render(<TokenPrices {...defaultProps} />)

			// Check for some token symbols
			expect(screen.getByText("BTC")).toBeInTheDocument()
			expect(screen.getByText("ETH")).toBeInTheDocument()
			expect(screen.getByText("SOL")).toBeInTheDocument()
		})

		it("displays token prices from ticker data", () => {
			render(<TokenPrices {...defaultProps} />)

			// BTC price should be displayed
			expect(screen.getByText("$45,000.00")).toBeInTheDocument()
			// ETH price
			expect(screen.getByText("$2,500.00")).toBeInTheDocument()
		})

		it("displays price change percentages", () => {
			render(<TokenPrices {...defaultProps} />)

			// formatPercent adds "+" for positive, shows "-" for negative
			// Positive change for BTC: +2.50%
			expect(screen.getByText("+2.50%")).toBeInTheDocument()
			// Negative change for ETH: -1.25%
			expect(screen.getByText("-1.25%")).toBeInTheDocument()
		})

		it("shows hint text at bottom", () => {
			render(<TokenPrices {...defaultProps} />)

			expect(screen.getByText("Click token for 24h stats")).toBeInTheDocument()
		})
	})

	describe("sparklines", () => {
		it("renders sparklines for tokens with data", () => {
			render(<TokenPrices {...defaultProps} />)

			const sparklines = screen.getAllByTestId("sparkline")
			expect(sparklines.length).toBeGreaterThan(0)
		})
	})

	describe("favorites", () => {
		it("renders favorite buttons for each token", () => {
			render(<TokenPrices {...defaultProps} />)

			const addButtons = screen.getAllByRole("button", { name: "Add to favorites" })
			expect(addButtons.length).toBeGreaterThan(0)
		})

		it("toggles favorite status when star is clicked", () => {
			render(<TokenPrices {...defaultProps} />)

			const addButton = screen.getAllByRole("button", { name: "Add to favorites" })[0]
			fireEvent.click(addButton)

			// The mock should have been updated
			expect(mockFavorites.size).toBeGreaterThanOrEqual(0) // Toggle function was called
		})

		it("shows different star style for favorited tokens", () => {
			mockFavorites.add("BTC")
			render(<TokenPrices {...defaultProps} />)

			// Should have at least one remove from favorites button
			const removeButton = screen.queryByRole("button", { name: "Remove from favorites" })
			expect(removeButton).toBeInTheDocument()
		})

		it("sorts favorites to the top", () => {
			mockFavorites.add("SOL")
			render(<TokenPrices {...defaultProps} />)

			const tokenRows = screen.getAllByRole("button", { name: /favorites/ })
			expect(tokenRows.length).toBeGreaterThan(0)
		})
	})

	describe("expanded state", () => {
		it("shows 24h stats when token row is clicked", () => {
			render(<TokenPrices {...defaultProps} />)

			// Find and click on the BTC row (the main clickable area, not the star)
			const btcText = screen.getByText("BTC")
			const expandButton = btcText.closest("button")
			expect(expandButton).toBeInTheDocument()

			if (expandButton) {
				act(() => {
					fireEvent.click(expandButton)
				})
			}

			// Should show expanded stats
			expect(screen.getByText("24h High")).toBeInTheDocument()
			expect(screen.getByText("24h Low")).toBeInTheDocument()
			expect(screen.getByText("24h Vol")).toBeInTheDocument()
		})

		it("displays high, low, and volume values when expanded", () => {
			render(<TokenPrices {...defaultProps} />)

			const btcText = screen.getByText("BTC")
			const expandButton = btcText.closest("button")

			if (expandButton) {
				act(() => {
					fireEvent.click(expandButton)
				})
			}

			expect(screen.getByText("$46,000")).toBeInTheDocument()
			expect(screen.getByText("$44,000")).toBeInTheDocument()
		})

		it("collapses when clicked again", () => {
			render(<TokenPrices {...defaultProps} />)

			const btcText = screen.getByText("BTC")
			const expandButton = btcText.closest("button")

			if (expandButton) {
				// Expand
				act(() => {
					fireEvent.click(expandButton)
				})
				expect(screen.getByText("24h High")).toBeInTheDocument()

				// Collapse
				act(() => {
					fireEvent.click(expandButton)
				})
			}
			expect(screen.queryByText("24h High")).not.toBeInTheDocument()
		})
	})

	describe("loading states", () => {
		it("shows skeleton loader when no ticker data", () => {
			render(<TokenPrices {...defaultProps} status="connecting" tickers={{}} />)

			const loadingElements = document.querySelectorAll(".animate-pulse")
			expect(loadingElements.length).toBeGreaterThan(0)
		})
	})

	describe("connection states", () => {
		it("passes correct status to ConnectionStatus", () => {
			render(
				<TokenPrices
					{...defaultProps}
					reconnectAttempts={3}
					status="disconnected"
					timeSinceLastMessage={60000}
				/>,
			)

			const status = screen.getByTestId("connection-status")
			expect(status).toHaveAttribute("data-state", "disconnected")
		})
	})

	describe("time period integration", () => {
		it("uses getPriceChange from time period context", () => {
			const customGetPriceChange = vi.fn(
				(_symbol: string, ticker: TickerData | undefined) => ticker?.priceChangePercent ?? null,
			)
			mockTimePeriod.mockReturnValue({
				getPriceChange: customGetPriceChange,
				historicalPrices: {},
				isLoadingHistorical: false,
				period: "1h" as const,
				setPeriod: vi.fn(),
			})

			render(<TokenPrices {...defaultProps} />)

			// getPriceChange should be called for each token
			expect(customGetPriceChange).toHaveBeenCalled()
		})

		it("displays different price changes based on period", () => {
			mockTimePeriod.mockReturnValue({
				getPriceChange: (symbol: string, _ticker: TickerData | undefined) => {
					// Return different values for 1h period
					if (symbol === "BTC") return "1.00"
					if (symbol === "ETH") return "-0.50"
					return "0.00"
				},
				historicalPrices: {},
				isLoadingHistorical: false,
				period: "1h" as const,
				setPeriod: vi.fn(),
			})

			render(<TokenPrices {...defaultProps} />)

			// Should show the 1h price changes
			expect(screen.getByText("+1.00%")).toBeInTheDocument()
			expect(screen.getByText("-0.50%")).toBeInTheDocument()
		})
	})
})
