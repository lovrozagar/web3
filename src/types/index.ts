export type ConnectionStatus = "connecting" | "connected" | "disconnected"

export type PriceDirection = "up" | "down" | "neutral"

export interface TickerData {
	symbol: string
	price: string
	priceChange: string
	priceChangePercent: string
	direction: PriceDirection
}

export interface OrderBookEntry {
	price: string
	quantity: string
	total: number
}

export interface OrderBookData {
	bids: OrderBookEntry[]
	asks: OrderBookEntry[]
	spread: string
	spreadPercent: string
}

export interface TokenInfo {
	symbol: string
	name: string
	icon: string
	decimals: number
}

export const SUPPORTED_TOKENS: TokenInfo[] = [
	{ decimals: 8, icon: "₿", name: "Bitcoin", symbol: "BTC" },
	{ decimals: 18, icon: "Ξ", name: "Ethereum", symbol: "ETH" },
	{ decimals: 9, icon: "◎", name: "Solana", symbol: "SOL" },
	{ decimals: 18, icon: "🔷", name: "Arbitrum", symbol: "ARB" },
]

export const TRADING_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "ARBUSDT"] as const
export type TradingPair = (typeof TRADING_PAIRS)[number]
