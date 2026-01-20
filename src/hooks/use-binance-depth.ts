"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
	BINANCE_WS_BASE,
	DEFAULT_DEPTH_PAIR,
	DEPTH_LEVELS,
	DEPTH_UPDATE_SPEED,
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

function processOrders(orders: [string, string][], isBid: boolean): OrderBookEntry[] {
	let runningTotal = 0
	const processed = orders.map(([price, quantity]) => {
		const qty = Number.parseFloat(quantity)
		runningTotal += qty
		return {
			price,
			quantity,
			total: runningTotal,
		}
	})
	return isBid ? processed : processed
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

	const connect = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.close()
		}

		const url = `${BINANCE_WS_BASE}/ws/${pair.toLowerCase()}@depth${DEPTH_LEVELS}@${DEPTH_UPDATE_SPEED}`

		setStatus("connecting")
		wsRef.current = new WebSocket(url)

		wsRef.current.onopen = () => {
			setStatus("connected")
			reconnectAttempts.current = 0
		}

		wsRef.current.onmessage = (event) => {
			const data: BinanceDepthMessage = JSON.parse(event.data)

			const bids = processOrders(data.bids, true)
			const asks = processOrders(data.asks, false)

			const bestBid = data.bids[0]?.[0] ?? "0"
			const bestAsk = data.asks[0]?.[0] ?? "0"
			const { spread, percent } = calculateSpread(bestBid, bestAsk)

			setOrderBook({
				asks,
				bids,
				spread,
				spreadPercent: percent,
			})
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
	}, [pair])

	useEffect(() => {
		connect()

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
			wsRef.current?.close()
		}
	}, [connect])

	return { orderBook, status }
}
