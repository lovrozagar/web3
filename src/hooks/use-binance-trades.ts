"use client"

import { useCallback, useState } from "react"
import { BINANCE_WS_BASE } from "@/lib/constants"
import { useWebSocket, type WebSocketState } from "@/lib/websocket-manager"

export interface TradeData {
	id: number
	price: string
	quantity: string
	time: number
	isBuyerMaker: boolean
}

interface BinanceTradeMessage {
	e: string /* event type */
	E: number /* event time */
	s: string /* symbol */
	t: number /* trade id */
	p: string /* price */
	q: string /* quantity */
	T: number /* trade time */
	m: boolean /* is the buyer the market maker? */
}

interface UseBinanceTradesOptions {
	symbol?: string
	maxTrades?: number
}

interface UseBinanceTradesReturn {
	trades: TradeData[]
	status: WebSocketState
	reconnect: () => void
	reconnectAttempts: number
	timeSinceLastMessage: number
}

export function useBinanceTrades(options: UseBinanceTradesOptions = {}): UseBinanceTradesReturn {
	const { symbol = "ethusdt", maxTrades = 20 } = options
	const [trades, setTrades] = useState<TradeData[]>([])

	const handleMessage = useCallback(
		(message: BinanceTradeMessage) => {
			const trade: TradeData = {
				id: message.t,
				isBuyerMaker: message.m,
				price: message.p,
				quantity: message.q,
				time: message.T,
			}

			setTrades((prev) => {
				const newTrades = [trade, ...prev]
				if (newTrades.length > maxTrades) {
					return newTrades.slice(0, maxTrades)
				}
				return newTrades
			})
		},
		[maxTrades],
	)

	const url = `${BINANCE_WS_BASE}/ws/${symbol.toLowerCase()}@trade`

	const { reconnect, reconnectAttempts, state, timeSinceLastMessage } =
		useWebSocket<BinanceTradeMessage>({
			onMessage: handleMessage,
			url,
		})

	return {
		reconnect,
		reconnectAttempts,
		status: state,
		timeSinceLastMessage,
		trades,
	}
}
