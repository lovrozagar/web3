"use client"

import { useCallback, useState } from "react"
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

export function DashboardGrid() {
	const [selectedPrice, setSelectedPrice] = useState<string>()

	const handlePriceSelect = useCallback((price: string, _type: "bid" | "ask") => {
		const priceNum = Number.parseFloat(price)
		const ethAmount = (100 / priceNum).toFixed(4)
		setSelectedPrice(ethAmount)
	}, [])

	return (
		<div className="relative grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
			<div className="flex flex-col gap-3 sm:gap-5 md:col-span-1">
				<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
					<TokenPrices />
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
					<TopMovers />
				</div>
				<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
					<RecentTrades />
				</div>
			</div>
			<div className="flex flex-col gap-3 sm:gap-5 md:col-span-2 lg:col-span-1">
				<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
					<SwapInterface initialPrice={selectedPrice} />
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
	)
}
