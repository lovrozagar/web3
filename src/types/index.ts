export type ConnectionStatus = "connecting" | "connected" | "disconnected"

export type PriceDirection = "up" | "down" | "neutral"

export interface TickerData {
	symbol: string
	price: string
	priceChange: string
	priceChangePercent: string
	direction: PriceDirection
	/** 24h high price */
	high24h: string
	/** 24h low price */
	low24h: string
	/** 24h volume in base asset */
	volume24h: string
	/** 24h quote volume (in USDT) */
	quoteVolume24h: string
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
	{ decimals: 8, icon: "🐕", name: "Dogecoin", symbol: "DOGE" },
	{ decimals: 18, icon: "⛓", name: "Chainlink", symbol: "LINK" },
	{ decimals: 18, icon: "🔺", name: "Avalanche", symbol: "AVAX" },
	{ decimals: 6, icon: "✕", name: "XRP", symbol: "XRP" },
	{ decimals: 10, icon: "●", name: "Polkadot", symbol: "DOT" },
	{ decimals: 6, icon: "🔵", name: "Cardano", symbol: "ADA" },
]

export const TRADING_PAIRS = [
	"BTCUSDT",
	"ETHUSDT",
	"SOLUSDT",
	"ARBUSDT",
	"DOGEUSDT",
	"LINKUSDT",
	"AVAXUSDT",
	"XRPUSDT",
	"DOTUSDT",
	"ADAUSDT",
] as const
export type TradingPair = (typeof TRADING_PAIRS)[number]
