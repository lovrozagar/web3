"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { GasPriceIndicator } from "@/components/gas-price-indicator"
import { LimitOrders } from "@/components/limit-orders"
import { MarketStats } from "@/components/market-stats"
import { OrderBook } from "@/components/order-book"
import { PriceAlerts } from "@/components/price-alerts"
import { RecentTrades } from "@/components/recent-trades"
import { SwapInterface } from "@/components/swap-interface"
import { TokenPrices } from "@/components/token-prices"
import { TopMovers } from "@/components/top-movers"
import { TransactionHistory } from "@/components/transaction-history"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { TimePeriodProvider } from "@/hooks/use-time-period"

interface PriceSelection {
	amount: string
	baseSymbol: string
	timestamp: number
}

export function DashboardGrid() {
	const [priceSelection, setPriceSelection] = useState<PriceSelection | null>(null)
	const { reconnect, reconnectAttempts, status, tickers, timeSinceLastMessage } = useBinanceTicker()

	const handlePriceSelect = useCallback(
		(price: string, type: "bid" | "ask", baseSymbol: string) => {
			const priceNum = Number.parseFloat(price)
			if (Number.isNaN(priceNum) || priceNum === 0) return

			/* calculate amount: $100 worth of the selected token */
			const amount = (100 / priceNum).toFixed(6)

			setPriceSelection({
				amount,
				baseSymbol,
				timestamp: Date.now(),
			})

			toast.success(`Filled swap with ${amount} ${baseSymbol}`, {
				description: `${type === "bid" ? "Buy" : "Sell"} at $${price}`,
				duration: 2000,
			})
		},
		[],
	)

	return (
		<TimePeriodProvider tickers={tickers}>
			<div className="relative grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
				<div className="flex flex-col gap-3 sm:gap-5 md:col-span-1">
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<TokenPrices
							reconnect={reconnect}
							reconnectAttempts={reconnectAttempts}
							status={status}
							tickers={tickers}
							timeSinceLastMessage={timeSinceLastMessage}
						/>
					</div>
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<MarketStats />
					</div>
				</div>
				<div className="flex flex-col gap-3 sm:gap-5 md:col-span-1">
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<OrderBook onPriceSelect={handlePriceSelect} />
					</div>
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<TopMovers tickers={tickers} />
					</div>
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<RecentTrades />
					</div>
				</div>
				<div className="flex flex-col gap-3 sm:gap-5 md:col-span-2 lg:col-span-1">
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<SwapInterface
							initialFromToken={priceSelection?.baseSymbol}
							initialPrice={priceSelection?.amount}
							priceTimestamp={priceSelection?.timestamp}
						/>
					</div>
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<PriceAlerts />
					</div>
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<TransactionHistory />
					</div>
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<GasPriceIndicator />
					</div>
					<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
						<LimitOrders />
					</div>
				</div>
			</div>
		</TimePeriodProvider>
	)
}
