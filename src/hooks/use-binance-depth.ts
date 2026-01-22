"use client"

import { useCallback, useRef, useState } from "react"
import type { WebSocketState } from "@/classes/websocket-manager"
import { BINANCE_WS_BASE, DEFAULT_DEPTH_PAIR, DEPTH_LEVELS } from "@/constants/binance"
import { useWebSocket } from "@/hooks/use-websocket"
import type { OrderBookData, OrderBookEntry } from "@/types"
import { calculateSpread } from "@/utils/price"

interface BinanceDepthMessage {
	asks: [string, string][]
	bids: [string, string][]
	lastUpdateId: number
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

export type UpdateSpeed = "100ms" | "1000ms"

interface UseBinanceDepthReturn {
	orderBook: OrderBookData
	reconnect: () => void
	reconnectAttempts: number
	status: WebSocketState
	timeSinceLastMessage: number
}

export function useBinanceDepth(
	pair: string = DEFAULT_DEPTH_PAIR,
	updateSpeed: UpdateSpeed = "100ms",
): UseBinanceDepthReturn {
	const [orderBook, setOrderBook] = useState<OrderBookData>({
		asks: [],
		bids: [],
		spread: "0",
		spreadPercent: "0",
	})

	const rafRef = useRef<number | null>(null)
	const pendingDataRef = useRef<BinanceDepthMessage | null>(null)

	const processUpdate = useCallback(() => {
		const data = pendingDataRef.current
		if (!data) return

		const bids = processOrders(data.bids)
		const asks = processOrders(data.asks)

		const bestBid = data.bids[0]?.[0] ?? "0"
		const bestAsk = data.asks[0]?.[0] ?? "0"
		const { percent, spread } = calculateSpread(bestBid, bestAsk)

		setOrderBook({
			asks,
			bids,
			spread,
			spreadPercent: percent,
		})

		pendingDataRef.current = null
	}, [])

	const handleMessage = useCallback(
		(data: BinanceDepthMessage) => {
			pendingDataRef.current = data

			/* Batch updates with frame rendering via RAF */
			if (rafRef.current === null) {
				rafRef.current = requestAnimationFrame(() => {
					processUpdate()
					rafRef.current = null
				})
			}
		},
		[processUpdate],
	)

	const url = `${BINANCE_WS_BASE}/ws/${pair.toLowerCase()}@depth${DEPTH_LEVELS}@${updateSpeed}`

	const { reconnect, reconnectAttempts, state, timeSinceLastMessage } =
		useWebSocket<BinanceDepthMessage>({
			onMessage: handleMessage,
			url,
		})

	return {
		orderBook,
		reconnect,
		reconnectAttempts,
		status: state,
		timeSinceLastMessage,
	}
}
