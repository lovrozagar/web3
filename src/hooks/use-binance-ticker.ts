"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
	BINANCE_WS_BASE,
	MAX_RECONNECT_ATTEMPTS,
	RECONNECT_DELAY,
	TICKER_STREAMS,
} from "@/lib/constants"
import { getPriceDirection } from "@/lib/utils"
import type { ConnectionStatus, TickerData } from "@/types"

interface BinanceTickerMessage {
	stream: string
	data: {
		s: string // Symbol
		c: string // Current price
		p: string // Price change
		P: string // Price change percent
	}
}

export function useBinanceTicker() {
	const [tickers, setTickers] = useState<Record<string, TickerData>>({})
	const [status, setStatus] = useState<ConnectionStatus>("disconnected")
	const wsRef = useRef<WebSocket | null>(null)
	const reconnectAttempts = useRef(0)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const previousPrices = useRef<Record<string, string>>({})

	const connect = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) return

		const streamParam = TICKER_STREAMS.join("/")
		const url = `${BINANCE_WS_BASE}/stream?streams=${streamParam}`

		setStatus("connecting")
		wsRef.current = new WebSocket(url)

		wsRef.current.onopen = () => {
			setStatus("connected")
			reconnectAttempts.current = 0
		}

		wsRef.current.onmessage = (event) => {
			const message: BinanceTickerMessage = JSON.parse(event.data)
			const { data } = message
			const symbol = data.s.replace("USDT", "")

			const direction = getPriceDirection(data.c, previousPrices.current[symbol] ?? data.c)
			previousPrices.current[symbol] = data.c

			setTickers((prev) => ({
				...prev,
				[symbol]: {
					direction,
					price: data.c,
					priceChange: data.p,
					priceChangePercent: data.P,
					symbol,
				},
			}))
		}

		wsRef.current.onclose = () => {
			setStatus("disconnected")
			if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
				reconnectAttempts.current++
				reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY)
			}
		}

		wsRef.current.onerror = () => {
			wsRef.current?.close()
		}
	}, [])

	useEffect(() => {
		connect()

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
			wsRef.current?.close()
		}
	}, [connect])

	return { status, tickers }
}
