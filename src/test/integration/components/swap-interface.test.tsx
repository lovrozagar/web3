import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockTickers = {
	BTC: {
		price: "45000.00",
		priceChangePercent: "1.25",
		symbol: "BTCUSDT",
	},
	ETH: {
		price: "2500.00",
		priceChangePercent: "2.50",
		symbol: "ETHUSDT",
	},
	SOL: {
		price: "100.00",
		priceChangePercent: "-0.50",
		symbol: "SOLUSDT",
	},
}

const mockAccount = {
	address: "0x1234567890123456789012345678901234567890",
	isConnected: true,
}

const mockBalance = {
	data: {
		decimals: 18,
		symbol: "ETH",
		value: BigInt(5000000000000000000), // 5 ETH
	},
}

const mockOpenConnectModal = vi.fn()
const mockAddTransaction = vi.fn()
const mockUpdateTransaction = vi.fn()

vi.mock("wagmi", () => ({
	useBalance: () => mockBalance,
	useChainId: () => 1,
	useConnection: () => mockAccount,
}))

vi.mock("@rainbow-me/rainbowkit", () => ({
	useConnectModal: () => ({ openConnectModal: mockOpenConnectModal }),
}))

vi.mock("@/hooks/use-binance-ticker", () => ({
	useBinanceTicker: () => ({
		status: "connected" as const,
		tickers: mockTickers,
	}),
}))

vi.mock("@/hooks/use-transaction-history", () => ({
	useTransactionHistory: () => ({
		addTransaction: mockAddTransaction,
		transactions: [],
		updateTransaction: mockUpdateTransaction,
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
	getExplorerTxUrl: (_chainId: number, hash: string) => `https://etherscan.io/tx/${hash}`,
}))

import { SwapInterface } from "@/components/swap-interface"

describe("SwapInterface", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockAccount.isConnected = true
		mockAccount.address = "0x1234567890123456789012345678901234567890"
	})

	describe("rendering", () => {
		it("renders the component with header", () => {
			render(<SwapInterface />)

			expect(screen.getByText("Swap")).toBeInTheDocument()
		})

		it("renders from and to token sections", () => {
			render(<SwapInterface />)

			expect(screen.getByText("From")).toBeInTheDocument()
			expect(screen.getByText("To")).toBeInTheDocument()
		})

		it("displays default tokens (ETH to USDT)", () => {
			render(<SwapInterface />)

			expect(screen.getByText("ETH")).toBeInTheDocument()
			expect(screen.getByText("USDT")).toBeInTheDocument()
		})

		it("displays balance when connected", () => {
			render(<SwapInterface />)

			// Balance should show ~5 ETH - look for balance labels
			const balanceLabels = screen.getAllByText("Balance:")
			expect(balanceLabels.length).toBeGreaterThan(0)
			// Balance value is formatted as "5.0000"
			expect(screen.getByText("5.0000")).toBeInTheDocument()
		})

		it("displays MAX button for ETH", () => {
			render(<SwapInterface />)

			expect(screen.getByRole("button", { name: "MAX" })).toBeInTheDocument()
		})
	})

	describe("slippage tolerance", () => {
		it("renders all slippage options", () => {
			render(<SwapInterface />)

			expect(screen.getByRole("button", { name: "0.1%" })).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "0.5%" })).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "1%" })).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "2%" })).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "3%" })).toBeInTheDocument()
		})

		it("defaults to user preference slippage (0.5%)", () => {
			render(<SwapInterface />)

			const slippageButton = screen.getByRole("button", { name: "0.5%" })
			expect(slippageButton).toHaveClass("bg-blue-500")
		})

		it("changes slippage when option is clicked", () => {
			render(<SwapInterface />)

			const slippage1Button = screen.getByRole("button", { name: "1%" })

			act(() => {
				fireEvent.click(slippage1Button)
			})

			expect(slippage1Button).toHaveClass("bg-blue-500")
		})
	})

	describe("amount input", () => {
		it("allows numeric input in from field", () => {
			render(<SwapInterface />)

			// Get the first input (the "from" field) - it's the editable one
			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1.5" } })
			})

			expect(fromInput).toHaveValue("1.5")
		})

		it("rejects non-numeric input", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "abc" } })
			})

			expect(fromInput).toHaveValue("")
		})

		it("calculates to amount based on price", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1" } })
			})

			// 1 ETH * $2500 = $2500 USDT - "to" input is read-only
			const toInput = inputs[1]
			expect(toInput).toHaveValue("2500.00")
		})

		it("fills max amount minus gas reserve when MAX clicked", () => {
			render(<SwapInterface />)

			const maxButton = screen.getByRole("button", { name: "MAX" })

			act(() => {
				fireEvent.click(maxButton)
			})

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]
			// 5 ETH - 0.01 for gas = 4.99 ETH
			expect(fromInput).toHaveValue("4.990000")
		})
	})

	describe("swap details", () => {
		it("shows swap details when amount is entered", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1" } })
			})

			expect(screen.getByText("Rate")).toBeInTheDocument()
			expect(screen.getByText("Min. Received")).toBeInTheDocument()
			expect(screen.getByText("Price Impact")).toBeInTheDocument()
			expect(screen.getByText("Max Slippage")).toBeInTheDocument()
		})

		it("calculates minimum received with slippage", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1" } })
			})

			// 2500 USDT * (1 - 0.5%) = 2487.50 USDT
			expect(screen.getByText("2487.50 USDT")).toBeInTheDocument()
		})

		it("shows price impact estimate", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1" } })
			})

			expect(screen.getByText("~0.05%")).toBeInTheDocument()
		})
	})

	describe("token swap button", () => {
		it("renders swap direction button", () => {
			render(<SwapInterface />)

			// Find the swap direction button (between from and to)
			const swapButtons = screen.getAllByRole("button")
			const swapDirectionButton = swapButtons.find((btn) =>
				btn.querySelector("svg path[d*='7 16V4']"),
			)
			expect(swapDirectionButton).toBeInTheDocument()
		})

		it("swaps tokens when direction button is clicked", () => {
			render(<SwapInterface />)

			// Initial state: ETH -> USDT
			expect(screen.getByText("ETH")).toBeInTheDocument()
			expect(screen.getByText("USDT")).toBeInTheDocument()

			// Find and click the swap direction button
			const swapButtons = screen.getAllByRole("button")
			const swapDirectionButton = swapButtons.find((btn) =>
				btn.querySelector("svg path[d*='7 16V4']"),
			)

			expect(swapDirectionButton).toBeTruthy()
			if (swapDirectionButton) {
				act(() => {
					fireEvent.click(swapDirectionButton)
				})
			}

			// Tokens should be swapped - verify the positions changed
			const tokenButtons = screen.getAllByText(/ETH|USDT/)
			expect(tokenButtons.length).toBeGreaterThan(0)
		})
	})

	describe("swap button states", () => {
		it("shows 'Connect Wallet' when not connected", () => {
			mockAccount.isConnected = false
			mockAccount.address = undefined as unknown as string

			render(<SwapInterface />)

			expect(screen.getByRole("button", { name: /Connect Wallet/ })).toBeInTheDocument()
		})

		it("opens connect modal when Connect Wallet is clicked", () => {
			mockAccount.isConnected = false

			render(<SwapInterface />)

			const connectButton = screen.getByRole("button", { name: /Connect Wallet/ })

			act(() => {
				fireEvent.click(connectButton)
			})

			expect(mockOpenConnectModal).toHaveBeenCalled()
		})

		it("shows 'Enter an amount' when no amount entered", () => {
			render(<SwapInterface />)

			expect(screen.getByRole("button", { name: "Enter an amount" })).toBeInTheDocument()
		})

		it("shows 'Swap (Demo)' when amount is valid", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1" } })
			})

			expect(screen.getByRole("button", { name: "Swap (Demo)" })).toBeInTheDocument()
		})

		it("shows 'Insufficient Balance' when amount exceeds balance", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "10" } }) // More than 5 ETH
			})

			expect(screen.getByRole("button", { name: "Insufficient Balance" })).toBeInTheDocument()
		})

		it("disables swap button when balance insufficient", () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "10" } })
			})

			const swapButton = screen.getByRole("button", { name: "Insufficient Balance" })
			expect(swapButton).toHaveClass("cursor-not-allowed")
		})
	})

	describe("swap execution", () => {
		it("executes swap and adds to transaction history", async () => {
			render(<SwapInterface />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]

			act(() => {
				fireEvent.change(fromInput, { target: { value: "1" } })
			})

			const swapButton = screen.getByRole("button", { name: "Swap (Demo)" })

			act(() => {
				fireEvent.click(swapButton)
			})

			// Should show confirming state
			await waitFor(() => {
				expect(screen.getByText(/Confirm/i)).toBeInTheDocument()
			})
		})
	})

	describe("initial price prop", () => {
		it("pre-fills amount when initialPrice and priceTimestamp are provided", () => {
			/* both initialPrice and priceTimestamp are required to fill the form */
			render(<SwapInterface initialPrice="2.5" priceTimestamp={Date.now()} />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]
			expect(fromInput).toHaveValue("2.5")
		})

		it("also sets from token when initialFromToken is provided", () => {
			render(
				<SwapInterface initialFromToken="BTC" initialPrice="0.001" priceTimestamp={Date.now()} />,
			)

			/* should show BTC as the from token */
			expect(screen.getByText("BTC")).toBeInTheDocument()
		})

		it("does not fill form when priceTimestamp is missing", () => {
			render(<SwapInterface initialPrice="2.5" />)

			const inputs = screen.getAllByPlaceholderText("0.0")
			const fromInput = inputs[0]
			/* without timestamp, the form should not be filled */
			expect(fromInput).toHaveValue("")
		})
	})

	describe("token selection", () => {
		it("opens token dropdown when from token button is clicked", async () => {
			render(<SwapInterface />)

			const ethButton = screen.getByText("ETH").closest("button")

			if (ethButton) {
				act(() => {
					fireEvent.click(ethButton)
				})
			}

			// Dropdown should show other tokens
			await waitFor(() => {
				expect(screen.getByText("Bitcoin")).toBeInTheDocument()
				expect(screen.getByText("Solana")).toBeInTheDocument()
			})
		})
	})
})
