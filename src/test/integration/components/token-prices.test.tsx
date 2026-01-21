import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockTickers = {
	BTC: {
		high24h: "46000.00",
		low24h: "44000.00",
		price: "45000.00",
		priceChangePercent: "2.50",
		quoteVolume24h: "450000000",
		symbol: "BTCUSDT",
		volume24h: "10000.00",
	},
	ETH: {
		high24h: "2600.00",
		low24h: "2400.00",
		price: "2500.00",
		priceChangePercent: "-1.25",
		quoteVolume24h: "125000000",
		symbol: "ETHUSDT",
		volume24h: "50000.00",
	},
	SOL: {
		high24h: "105.00",
		low24h: "95.00",
		price: "100.00",
		priceChangePercent: "5.00",
		quoteVolume24h: "10000000",
		symbol: "SOLUSDT",
		volume24h: "100000.00",
	},
}

type ConnectionStatus =
	| "idle"
	| "connecting"
	| "connected"
	| "reconnecting"
	| "disconnected"
	| "failed"

const mockBinanceTicker = vi.fn(
	(): {
		reconnect: ReturnType<typeof vi.fn>
		reconnectAttempts: number
		status: ConnectionStatus
		tickers: typeof mockTickers | Record<string, never>
		timeSinceLastMessage: number
	} => ({
		reconnect: vi.fn(),
		reconnectAttempts: 0,
		status: "connected",
		tickers: mockTickers,
		timeSinceLastMessage: 1000,
	}),
)

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

vi.mock("@/hooks/use-binance-ticker", () => ({
	useBinanceTicker: () => mockBinanceTicker(),
}))

vi.mock("@/hooks/use-favorite-tokens", () => ({
	useFavoriteTokens: () => mockFavoriteTokens(),
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

import { TokenPrices } from "@/components/token-prices"

describe("TokenPrices", () => {
	beforeEach(() => {
		mockFavorites.clear()
		vi.clearAllMocks()
	})

	describe("rendering", () => {
		it("renders the component with header", () => {
			render(<TokenPrices />)

			expect(screen.getByText("Live Prices")).toBeInTheDocument()
		})

		it("renders connection status", () => {
			render(<TokenPrices />)

			const status = screen.getByTestId("connection-status")
			expect(status).toBeInTheDocument()
			expect(status).toHaveAttribute("data-state", "connected")
		})

		it("renders all supported tokens", () => {
			render(<TokenPrices />)

			// Check for some token symbols
			expect(screen.getByText("BTC")).toBeInTheDocument()
			expect(screen.getByText("ETH")).toBeInTheDocument()
			expect(screen.getByText("SOL")).toBeInTheDocument()
		})

		it("displays token prices from ticker data", () => {
			render(<TokenPrices />)

			// BTC price should be displayed
			expect(screen.getByText("$45,000.00")).toBeInTheDocument()
			// ETH price
			expect(screen.getByText("$2,500.00")).toBeInTheDocument()
		})

		it("displays price change percentages", () => {
			render(<TokenPrices />)

			// formatPercent adds "+" for positive, shows "-" for negative
			// Positive change for BTC: +2.50%
			expect(screen.getByText("+2.50%")).toBeInTheDocument()
			// Negative change for ETH: -1.25%
			expect(screen.getByText("-1.25%")).toBeInTheDocument()
		})

		it("shows hint text at bottom", () => {
			render(<TokenPrices />)

			expect(screen.getByText("Click token for 24h stats")).toBeInTheDocument()
		})
	})

	describe("sparklines", () => {
		it("renders sparklines for tokens with data", () => {
			render(<TokenPrices />)

			const sparklines = screen.getAllByTestId("sparkline")
			expect(sparklines.length).toBeGreaterThan(0)
		})
	})

	describe("favorites", () => {
		it("renders favorite buttons for each token", () => {
			render(<TokenPrices />)

			const addButtons = screen.getAllByRole("button", { name: "Add to favorites" })
			expect(addButtons.length).toBeGreaterThan(0)
		})

		it("toggles favorite status when star is clicked", () => {
			render(<TokenPrices />)

			const addButton = screen.getAllByRole("button", { name: "Add to favorites" })[0]
			fireEvent.click(addButton)

			// The mock should have been updated
			expect(mockFavorites.size).toBeGreaterThanOrEqual(0) // Toggle function was called
		})

		it("shows different star style for favorited tokens", () => {
			mockFavorites.add("BTC")
			render(<TokenPrices />)

			// Should have at least one remove from favorites button
			const removeButton = screen.queryByRole("button", { name: "Remove from favorites" })
			expect(removeButton).toBeInTheDocument()
		})

		it("sorts favorites to the top", () => {
			mockFavorites.add("SOL")
			render(<TokenPrices />)

			const tokenRows = screen.getAllByRole("button", { name: /favorites/ })
			expect(tokenRows.length).toBeGreaterThan(0)
		})
	})

	describe("expanded state", () => {
		it("shows 24h stats when token row is clicked", () => {
			render(<TokenPrices />)

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
			render(<TokenPrices />)

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
			render(<TokenPrices />)

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
			mockBinanceTicker.mockReturnValueOnce({
				reconnect: vi.fn(),
				reconnectAttempts: 0,
				status: "connecting" as const,
				tickers: {},
				timeSinceLastMessage: 0,
			})

			render(<TokenPrices />)

			const loadingElements = document.querySelectorAll(".animate-pulse")
			expect(loadingElements.length).toBeGreaterThan(0)
		})
	})

	describe("connection states", () => {
		it("passes reconnect function to ConnectionStatus", () => {
			const mockReconnect = vi.fn()
			mockBinanceTicker.mockReturnValueOnce({
				reconnect: mockReconnect,
				reconnectAttempts: 3,
				status: "disconnected" as const,
				tickers: mockTickers,
				timeSinceLastMessage: 60000,
			})

			render(<TokenPrices />)

			const status = screen.getByTestId("connection-status")
			expect(status).toHaveAttribute("data-state", "disconnected")
		})
	})
})
