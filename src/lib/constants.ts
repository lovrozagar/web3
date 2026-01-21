export const BINANCE_WS_BASE = "wss://stream.binance.com:9443"

export const TICKER_STREAMS = [
	"btcusdt@ticker",
	"ethusdt@ticker",
	"solusdt@ticker",
	"arbusdt@ticker",
	"dogeusdt@ticker",
	"linkusdt@ticker",
	"avaxusdt@ticker",
	"xrpusdt@ticker",
	"dotusdt@ticker",
	"adausdt@ticker",
]

export const DEFAULT_DEPTH_PAIR = "ethusdt"
export const DEPTH_LEVELS = 20
export const DEPTH_UPDATE_SPEED = "100ms"

/* block explorer urls for different chains */
export const BLOCK_EXPLORERS: Record<number, string> = {
	1: "https://etherscan.io",
	10: "https://optimistic.etherscan.io",
	42161: "https://arbiscan.io",
}

/* get transaction url on block explorer */
export function getExplorerTxUrl(chainId: number, txHash: string): string {
	const explorer = BLOCK_EXPLORERS[chainId] ?? BLOCK_EXPLORERS[1]
	return `${explorer}/tx/${txHash}`
}
