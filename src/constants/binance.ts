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
] as const

export const DEFAULT_DEPTH_PAIR = "ethusdt"
export const DEPTH_LEVELS = 20
export const DEPTH_UPDATE_SPEED = "100ms"
