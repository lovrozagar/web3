"use client"

import { createContext, type ReactNode, useContext, useMemo, useState } from "react"
import type { TimePeriod } from "@/components/time-period-toggle"
import { type HistoricalPrices, useHistoricalPrices } from "@/hooks/use-historical-prices"
import type { TickerData } from "@/types"

interface TimePeriodContextValue {
	period: TimePeriod
	setPeriod: (period: TimePeriod) => void
	historicalPrices: HistoricalPrices
	isLoadingHistorical: boolean
	/** Get the price change percent for a symbol based on selected period */
	getPriceChange: (symbol: string, ticker: TickerData | undefined) => string | null
}

const TimePeriodContext = createContext<TimePeriodContextValue | null>(null)

interface TimePeriodProviderProps {
	children: ReactNode
	tickers: Record<string, TickerData>
}

export function TimePeriodProvider({ children, tickers }: TimePeriodProviderProps) {
	const [period, setPeriod] = useState<TimePeriod>("24h")

	/* extract current prices from tickers for historical price calculations */
	const currentPrices = useMemo(() => {
		const prices: Record<string, string> = {}
		for (const [symbol, ticker] of Object.entries(tickers)) {
			prices[symbol] = ticker.price
		}
		return prices
	}, [tickers])

	const { historicalPrices, isLoading: isLoadingHistorical } = useHistoricalPrices(currentPrices)

	const getPriceChange = (symbol: string, ticker: TickerData | undefined): string | null => {
		if (!ticker) return null

		switch (period) {
			case "1h": {
				const historical = historicalPrices[symbol]
				return historical?.change1h ?? null
			}
			case "7d": {
				const historical = historicalPrices[symbol]
				return historical?.change7d ?? null
			}
			default:
				return ticker.priceChangePercent
		}
	}

	return (
		<TimePeriodContext.Provider
			value={{
				getPriceChange,
				historicalPrices,
				isLoadingHistorical,
				period,
				setPeriod,
			}}
		>
			{children}
		</TimePeriodContext.Provider>
	)
}

export function useTimePeriod() {
	const context = useContext(TimePeriodContext)
	if (!context) {
		throw new Error("useTimePeriod must be used within a TimePeriodProvider")
	}
	return context
}
