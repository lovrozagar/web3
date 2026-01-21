"use client"

import { useEffect, useState } from "react"

interface MarketData {
	totalMarketCap: number
	totalVolume24h: number
	btcDominance: number
	ethDominance: number
	activeCryptocurrencies: number
	marketCapChange24h: number
}

const DEMO_DATA: MarketData = {
	activeCryptocurrencies: 14892,
	btcDominance: 52.4,
	ethDominance: 16.8,
	marketCapChange24h: 2.34,
	totalMarketCap: 3.45e12,
	totalVolume24h: 98.7e9,
}

function formatLargeNumber(num: number): string {
	if (num >= 1e12) {
		return `$${(num / 1e12).toFixed(2)}T`
	}
	if (num >= 1e9) {
		return `$${(num / 1e9).toFixed(1)}B`
	}
	if (num >= 1e6) {
		return `$${(num / 1e6).toFixed(1)}M`
	}
	return `$${num.toFixed(0)}`
}

export function MarketStats() {
	const [data, setData] = useState<MarketData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchMarketData() {
			try {
				const response = await fetch("https://api.coingecko.com/api/v3/global", {
					cache: "no-store",
				})
				if (!response.ok) {
					throw new Error("Failed to fetch market data")
				}
				const json = await response.json()
				const globalData = json.data
				setData({
					activeCryptocurrencies: globalData.active_cryptocurrencies,
					btcDominance: globalData.market_cap_percentage.btc,
					ethDominance: globalData.market_cap_percentage.eth,
					marketCapChange24h: globalData.market_cap_change_percentage_24h_usd,
					totalMarketCap: globalData.total_market_cap.usd,
					totalVolume24h: globalData.total_volume.usd,
				})
				setError(null)
			} catch {
				/* use demo data on error */
				setData(DEMO_DATA)
				setError("Using demo data")
			} finally {
				setLoading(false)
			}
		}

		fetchMarketData()
		/* refresh every 5 minutes */
		const interval = setInterval(fetchMarketData, 5 * 60 * 1000)
		return () => clearInterval(interval)
	}, [])

	const isPositiveChange = data && data.marketCapChange24h >= 0

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-2 py-2 sm:px-4 sm:py-3">
				<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Market Stats</h2>
				{error && <span className="text-[9px] text-amber-500 sm:text-[10px]">{error}</span>}
			</div>

			<div className="grid grid-cols-2 gap-2 p-2 sm:gap-3 sm:p-3">
				{loading &&
					[...Array(4)].map((_, i) => (
						<div className="flex flex-col gap-1.5 rounded-lg bg-ui-bg-field p-2.5 sm:p-3" key={i}>
							<div className="h-3 w-16 animate-pulse rounded bg-ui-bg-hover/50" />
							<div className="h-5 w-20 animate-pulse rounded bg-ui-bg-hover/30" />
						</div>
					))}
				{!loading && data && (
					<>
						<div className="flex flex-col gap-1 rounded-lg bg-ui-bg-field p-2.5 sm:p-3">
							<span className="text-[9px] text-ui-fg-muted uppercase sm:text-[10px]">
								Total Market Cap
							</span>
							<span className="font-mono font-semibold text-[13px] text-foreground tabular-nums sm:text-[15px]">
								{formatLargeNumber(data.totalMarketCap)}
							</span>
							<span
								className={`text-[9px] tabular-nums sm:text-[10px] ${
									isPositiveChange ? "text-emerald-400" : "text-red-400"
								}`}
							>
								{isPositiveChange ? "+" : ""}
								{data.marketCapChange24h.toFixed(2)}% 24h
							</span>
						</div>

						<div className="flex flex-col gap-1 rounded-lg bg-ui-bg-field p-2.5 sm:p-3">
							<span className="text-[9px] text-ui-fg-muted uppercase sm:text-[10px]">
								24h Volume
							</span>
							<span className="font-mono font-semibold text-[13px] text-foreground tabular-nums sm:text-[15px]">
								{formatLargeNumber(data.totalVolume24h)}
							</span>
						</div>

						<div className="flex flex-col gap-1 rounded-lg bg-ui-bg-field p-2.5 sm:p-3">
							<span className="text-[9px] text-ui-fg-muted uppercase sm:text-[10px]">
								BTC Dominance
							</span>
							<div className="flex items-center gap-2">
								<span className="font-mono font-semibold text-[13px] text-amber-400 tabular-nums sm:text-[15px]">
									{data.btcDominance.toFixed(1)}%
								</span>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-ui-bg-hover/50">
								<div
									className="h-full rounded-full bg-amber-400"
									style={{ width: `${data.btcDominance}%` }}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1 rounded-lg bg-ui-bg-field p-2.5 sm:p-3">
							<span className="text-[9px] text-ui-fg-muted uppercase sm:text-[10px]">
								ETH Dominance
							</span>
							<div className="flex items-center gap-2">
								<span className="font-mono font-semibold text-[13px] text-blue-400 tabular-nums sm:text-[15px]">
									{data.ethDominance.toFixed(1)}%
								</span>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-ui-bg-hover/50">
								<div
									className="h-full rounded-full bg-blue-400"
									style={{ width: `${data.ethDominance}%` }}
								/>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
