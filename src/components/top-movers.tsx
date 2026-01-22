"use client"

import { useMemo } from "react"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { SUPPORTED_TOKENS } from "@/types"
import { cn } from "@/utils/cn"
import { formatPercent, formatPrice } from "@/utils/format"

interface MoverItemProps {
	symbol: string
	name: string
	icon: string
	price: string
	changePercent: string
}

function MoverItem({ symbol, name, icon, price, changePercent }: MoverItemProps) {
	const changeNum = Number.parseFloat(changePercent)
	const isPositive = changeNum >= 0

	return (
		<div
			className={cn(
				"flex items-center justify-between rounded-lg p-2 sm:p-2.5",
				isPositive ? "bg-emerald-500/10" : "bg-red-500/10",
			)}
		>
			<div className="flex items-center gap-2">
				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ui-bg-hover/50 text-sm sm:h-8 sm:w-8">
					{icon}
				</div>
				<div className="min-w-0">
					<div className="truncate font-semibold text-[12px] text-foreground sm:text-[13px]">
						{symbol}
					</div>
					<div className="truncate text-[10px] text-ui-fg-muted sm:text-[11px]">{name}</div>
				</div>
			</div>
			<div className="text-right">
				<div className="font-mono text-[12px] text-ui-fg-subtle tabular-nums sm:text-[13px]">
					${formatPrice(price)}
				</div>
				<div
					className={cn(
						"flex items-center justify-end gap-0.5 font-mono text-[10px] tabular-nums sm:text-[11px]",
						isPositive ? "text-emerald-400" : "text-red-400",
					)}
				>
					{isPositive ? (
						<svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
							<path
								clipRule="evenodd"
								d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
								fillRule="evenodd"
							/>
						</svg>
					) : (
						<svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
							<path
								clipRule="evenodd"
								d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
								fillRule="evenodd"
							/>
						</svg>
					)}
					{formatPercent(changePercent)}
				</div>
			</div>
		</div>
	)
}

function LoadingSkeleton() {
	return (
		<div className="flex items-center justify-between rounded-lg bg-ui-bg-field p-2 sm:p-2.5">
			<div className="flex items-center gap-2">
				<div className="h-7 w-7 animate-pulse rounded-full bg-ui-bg-hover/50 sm:h-8 sm:w-8" />
				<div className="flex flex-col gap-1">
					<div className="h-3 w-10 animate-pulse rounded bg-ui-bg-hover/50" />
					<div className="h-2.5 w-14 animate-pulse rounded bg-ui-bg-hover/30" />
				</div>
			</div>
			<div className="flex flex-col items-end gap-1">
				<div className="h-3 w-14 animate-pulse rounded bg-ui-bg-hover/50" />
				<div className="h-2.5 w-10 animate-pulse rounded bg-ui-bg-hover/30" />
			</div>
		</div>
	)
}

export function TopMovers() {
	const { tickers } = useBinanceTicker()

	const { gainers, losers } = useMemo(() => {
		const tokenMap = new Map(SUPPORTED_TOKENS.map((t) => [t.symbol, t]))

		const tickerList = Object.entries(tickers)
			.filter(([symbol]) => tokenMap.has(symbol))
			.map(([symbol, ticker]) => {
				const token = tokenMap.get(symbol)
				return {
					changeNum: Number.parseFloat(ticker.priceChangePercent),
					changePercent: ticker.priceChangePercent,
					icon: token?.icon ?? "🪙",
					name: token?.name ?? symbol,
					price: ticker.price,
					symbol,
				}
			})
			.sort((a, b) => b.changeNum - a.changeNum)

		/* top 3 performers */
		const top3 = tickerList.slice(0, 3)
		/* bottom 3 performers (worst, even if positive) */
		const bottom3 = tickerList.slice(-3).reverse()

		return {
			gainers: top3,
			losers: bottom3,
		}
	}, [tickers])

	const hasData = gainers.length > 0 || losers.length > 0

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-2 py-2 sm:px-4 sm:py-3">
				<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Top Movers</h2>
				<span className="text-[9px] text-ui-fg-muted sm:text-[10px]">24h</span>
			</div>

			<div className="flex flex-col gap-3 p-2 sm:gap-4 sm:p-3">
				{/* Top Performers */}
				<div>
					<div className="mb-1.5 flex items-center gap-1.5 sm:mb-2">
						<div className="h-2 w-2 rounded-full bg-emerald-400" />
						<span className="font-medium text-[10px] text-emerald-400 uppercase sm:text-[11px]">
							Best Performers
						</span>
					</div>
					<div className="flex flex-col gap-1.5 sm:gap-2">
						{!hasData && (
							<>
								<LoadingSkeleton />
								<LoadingSkeleton />
								<LoadingSkeleton />
							</>
						)}
						{hasData &&
							gainers.length > 0 &&
							gainers.map((item) => (
								<MoverItem
									changePercent={item.changePercent}
									icon={item.icon}
									key={item.symbol}
									name={item.name}
									price={item.price}
									symbol={item.symbol}
								/>
							))}
						{hasData && gainers.length === 0 && (
							<div className="py-2 text-center text-[11px] text-ui-fg-muted">No gainers today</div>
						)}
					</div>
				</div>

				{/* Bottom Performers */}
				<div>
					<div className="mb-1.5 flex items-center gap-1.5 sm:mb-2">
						<div className="h-2 w-2 rounded-full bg-orange-400" />
						<span className="font-medium text-[10px] text-orange-400 uppercase sm:text-[11px]">
							Worst Performers
						</span>
					</div>
					<div className="flex flex-col gap-1.5 sm:gap-2">
						{!hasData && (
							<>
								<LoadingSkeleton />
								<LoadingSkeleton />
								<LoadingSkeleton />
							</>
						)}
						{hasData &&
							losers.length > 0 &&
							losers.map((item) => (
								<MoverItem
									changePercent={item.changePercent}
									icon={item.icon}
									key={item.symbol}
									name={item.name}
									price={item.price}
									symbol={item.symbol}
								/>
							))}
						{hasData && losers.length === 0 && (
							<div className="py-2 text-center text-[11px] text-ui-fg-muted">No losers today</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
