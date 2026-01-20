export const BINANCE_WS_BASE = "wss://stream.binance.com:9443"

export const TICKER_STREAMS = [
	"btcusdt@ticker",
	"ethusdt@ticker",
	"solusdt@ticker",
	"arbusdt@ticker",
]

export const DEFAULT_DEPTH_PAIR = "ethusdt"
export const DEPTH_LEVELS = 20
export const DEPTH_UPDATE_SPEED = "100ms"

export const RECONNECT_DELAY = 3000
export const MAX_RECONNECT_ATTEMPTS = 5
