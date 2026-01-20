"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
	BINANCE_WS_BASE,
	DEFAULT_DEPTH_PAIR,
	DEPTH_LEVELS,
	MAX_RECONNECT_ATTEMPTS,
	RECONNECT_DELAY,
} from "@/lib/constants"
import { calculateSpread } from "@/lib/utils"
import type { ConnectionStatus, OrderBookData, OrderBookEntry } from "@/types"

interface BinanceDepthMessage {
	lastUpdateId: number
	bids: [string, string][]
	asks: [string, string][]
}

function processOrders(orders: [string, string][]): OrderBookEntry[] {
	let runningTotal = 0
	return orders.map(([price, quantity]) => {
		const qty = Number.parseFloat(quantity)
		runningTotal += qty
		return {
			price,
			quantity,
			total: runningTotal,
		}
	})
}

export function useBinanceDepth(pair: string = DEFAULT_DEPTH_PAIR) {
	const [orderBook, setOrderBook] = useState<OrderBookData>({
		asks: [],
		bids: [],
		spread: "0",
		spreadPercent: "0",
	})
	const [status, setStatus] = useState<ConnectionStatus>("disconnected")

	const wsRef = useRef<WebSocket | null>(null)
	const reconnectAttempts = useRef(0)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const rafRef = useRef<number | null>(null)
	const pendingDataRef = useRef<BinanceDepthMessage | null>(null)

	const processUpdate = useCallback(() => {
		const data = pendingDataRef.current
		if (!data) return

		const bids = processOrders(data.bids)
		const asks = processOrders(data.asks)

		const bestBid = data.bids[0]?.[0] ?? "0"
		const bestAsk = data.asks[0]?.[0] ?? "0"
		const { spread, percent } = calculateSpread(bestBid, bestAsk)

		setOrderBook({
			asks,
			bids,
			spread,
			spreadPercent: percent,
		})

		pendingDataRef.current = null
	}, [])

	const connect = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.close()
		}

		/* Binance only supports 100ms or 1000ms update speeds */
		const url = `${BINANCE_WS_BASE}/ws/${pair.toLowerCase()}@depth${DEPTH_LEVELS}@100ms`

		setStatus("connecting")
		wsRef.current = new WebSocket(url)

		wsRef.current.onopen = () => {
			setStatus("connected")
			reconnectAttempts.current = 0
		}

		wsRef.current.onmessage = (event) => {
			const data: BinanceDepthMessage = JSON.parse(event.data)
			pendingDataRef.current = data

			/* Batch updates with frame rendering via RAF */
			if (rafRef.current === null) {
				rafRef.current = requestAnimationFrame(() => {
					processUpdate()
					rafRef.current = null
				})
			}
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
	}, [pair, processUpdate])

	useEffect(() => {
		connect()

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current)
			}
			wsRef.current?.close()
		}
	}, [connect])

	return { orderBook, status }
}
