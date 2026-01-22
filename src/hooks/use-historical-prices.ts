"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { TRADING_PAIRS } from "@/types"

const BINANCE_API_BASE = "https://api.binance.com/api/v3"

interface PriceChange {
	price1hAgo: string | null
	price7dAgo: string | null
	change1h: string | null
	change7d: string | null
}

export type HistoricalPrices = Record<string, PriceChange>

interface UseHistoricalPricesReturn {
	historicalPrices: HistoricalPrices
	isLoading: boolean
	refetch: () => void
}

async function fetchKlinePrice(
	symbol: string,
	interval: "1h" | "1d",
	periodsAgo: number,
): Promise<string | null> {
	try {
		/* fetch enough candles to get the price from N periods ago */
		const limit = periodsAgo + 1
		const response = await fetch(
			`${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
		)

		if (!response.ok) return null

		const klines = await response.json()

		/* kline format: [openTime, open, high, low, close, volume, ...] */
		/* we want the opening price from periodsAgo */
		if (klines.length >= periodsAgo) {
			/* get the oldest candle's open price */
			return klines[0][1] as string
		}

		return null
	} catch {
		return null
	}
}

function calculateChange(currentPrice: string, historicalPrice: string | null): string | null {
	if (!historicalPrice) return null

	const current = Number.parseFloat(currentPrice)
	const historical = Number.parseFloat(historicalPrice)

	if (historical === 0) return null

	const changePercent = ((current - historical) / historical) * 100
	return changePercent.toFixed(2)
}

export function useHistoricalPrices(
	currentPrices: Record<string, string>,
): UseHistoricalPricesReturn {
	const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrices>({})
	const [isLoading, setIsLoading] = useState(true)
	const lastFetchRef = useRef<number>(0)
	const isFetchingRef = useRef(false)

	const fetchAllHistoricalPrices = useCallback(async () => {
		/* prevent concurrent fetches */
		if (isFetchingRef.current) return
		isFetchingRef.current = true
		setIsLoading(true)

		try {
			const results: HistoricalPrices = {}

			/* fetch historical prices for all trading pairs in parallel */
			await Promise.all(
				TRADING_PAIRS.map(async (pair) => {
					const symbol = pair.replace("USDT", "")

					/* fetch 1h ago (1 candle of 1h interval) and 7d ago (7 candles of 1d interval) */
					const [price1hAgo, price7dAgo] = await Promise.all([
						fetchKlinePrice(pair, "1h", 1),
						fetchKlinePrice(pair, "1d", 7),
					])

					results[symbol] = {
						change1h: null,
						change7d: null,
						price1hAgo,
						price7dAgo,
					}
				}),
			)

			setHistoricalPrices(results)
			lastFetchRef.current = Date.now()
		} finally {
			setIsLoading(false)
			isFetchingRef.current = false
		}
	}, [])

	/* initial fetch */
	useEffect(() => {
		fetchAllHistoricalPrices()
	}, [fetchAllHistoricalPrices])

	/* refetch every 5 minutes to keep historical data fresh */
	useEffect(() => {
		const interval = setInterval(
			() => {
				fetchAllHistoricalPrices()
			},
			5 * 60 * 1000,
		)

		return () => clearInterval(interval)
	}, [fetchAllHistoricalPrices])

	/* calculate changes whenever current prices update */
	const pricesWithChanges: HistoricalPrices = {}

	for (const symbol of Object.keys(historicalPrices)) {
		const historical = historicalPrices[symbol]
		const currentPrice = currentPrices[symbol]

		if (currentPrice && historical) {
			pricesWithChanges[symbol] = {
				...historical,
				change1h: calculateChange(currentPrice, historical.price1hAgo),
				change7d: calculateChange(currentPrice, historical.price7dAgo),
			}
		} else {
			pricesWithChanges[symbol] = historical
		}
	}

	return {
		historicalPrices: pricesWithChanges,
		isLoading,
		refetch: fetchAllHistoricalPrices,
	}
}
