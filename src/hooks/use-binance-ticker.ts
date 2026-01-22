"use client"

import { useCallback, useRef, useState } from "react"
import type { WebSocketState } from "@/classes/websocket-manager"
import { BINANCE_WS_BASE, TICKER_STREAMS } from "@/constants/binance"
import { useWebSocket } from "@/hooks/use-websocket"
import type { PriceDirection, TickerData } from "@/types"
import { getPriceDirection } from "@/utils/price"

interface BinanceTickerMessage {
	data: {
		P: string /* price change percent */
		c: string /* current price */
		h: string /* 24h high */
		l: string /* 24h low */
		p: string /* price change */
		q: string /* quote volume (usdt) */
		s: string /* symbol */
		v: string /* base volume */
	}
	stream: string
}

interface UseBinanceTickerReturn {
	reconnect: () => void
	reconnectAttempts: number
	status: WebSocketState
	tickers: Record<string, TickerData>
	timeSinceLastMessage: number
}

export function useBinanceTicker(): UseBinanceTickerReturn {
	const [tickers, setTickers] = useState<Record<string, TickerData>>({})
	const previousPricesRef = useRef<Record<string, string>>({})
	const pendingUpdatesRef = useRef<Record<string, TickerData>>({})
	const rafRef = useRef<number | null>(null)

	const flushUpdates = useCallback(() => {
		const updates = pendingUpdatesRef.current
		if (Object.keys(updates).length === 0) return

		setTickers((prev) => ({
			...prev,
			...updates,
		}))

		pendingUpdatesRef.current = {}
	}, [])

	const handleMessage = useCallback(
		(message: BinanceTickerMessage) => {
			const { data } = message
			const symbol = data.s.replace("USDT", "")

			const previousPrice = previousPricesRef.current[symbol] ?? data.c
			const direction: PriceDirection = getPriceDirection(data.c, previousPrice)

			previousPricesRef.current[symbol] = data.c

			pendingUpdatesRef.current[symbol] = {
				direction,
				high24h: data.h,
				low24h: data.l,
				price: data.c,
				priceChange: data.p,
				priceChangePercent: data.P,
				quoteVolume24h: data.q,
				symbol,
				volume24h: data.v,
			}

			/* batch updates with raf for smooth rendering */
			if (rafRef.current === null) {
				rafRef.current = requestAnimationFrame(() => {
					flushUpdates()
					rafRef.current = null
				})
			}
		},
		[flushUpdates],
	)

	const streamParam = TICKER_STREAMS.join("/")
	const url = `${BINANCE_WS_BASE}/stream?streams=${streamParam}`

	const { reconnect, reconnectAttempts, state, timeSinceLastMessage } =
		useWebSocket<BinanceTickerMessage>({
			onMessage: handleMessage,
			url,
		})

	return {
		reconnect,
		reconnectAttempts,
		status: state,
		tickers,
		timeSinceLastMessage,
	}
}
