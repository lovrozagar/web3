"use client"

import { memo, useEffect, useRef, useState } from "react"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { cn, formatPercent, formatPrice } from "@/lib/utils"
import type { TickerData, TokenInfo } from "@/types"
import { SUPPORTED_TOKENS } from "@/types"

interface TokenRowProps {
	token: TokenInfo
	ticker: TickerData | undefined
}

const TokenRow = memo(function TokenRow({ token, ticker }: TokenRowProps) {
	const [flash, setFlash] = useState<"up" | "down" | null>(null)
	const prevPriceRef = useRef<string | null>(null)

	const isPositive = ticker && Number.parseFloat(ticker.priceChangePercent) >= 0

	// Detect price changes and trigger flash
	useEffect(() => {
		if (!ticker) return
		if (prevPriceRef.current !== null && prevPriceRef.current !== ticker.price) {
			const prev = Number.parseFloat(prevPriceRef.current)
			const curr = Number.parseFloat(ticker.price)
			setFlash(curr > prev ? "up" : "down")
			const timeout = setTimeout(() => setFlash(null), 400)
			return () => clearTimeout(timeout)
		}
		prevPriceRef.current = ticker.price
	}, [ticker])

	return (
		<div
			className={cn(
				"group relative flex min-w-0 items-center justify-between gap-1.5 rounded-xl p-2 transition-all duration-200 sm:gap-2 sm:p-3",
				"bg-zinc-800/40 hover:bg-zinc-800/60",
				"border border-transparent hover:border-zinc-700/50",
			)}
		>
			<div
				className={cn(
					"pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-400",
					flash === "up" && "bg-emerald-500/10",
					flash === "down" && "bg-red-500/10",
					flash ? "opacity-100" : "opacity-0",
				)}
			/>

			<div className="relative flex min-w-0 items-center gap-1.5 sm:gap-3">
				<div
					className={cn(
						"flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm sm:h-10 sm:w-10 sm:text-xl",
						"bg-zinc-700/50 transition-transform duration-200 group-hover:scale-105",
					)}
				>
					{token.icon}
				</div>
				<div className="min-w-0">
					<div className="truncate font-bold text-[13px] text-white sm:text-[15px]">
						{token.symbol}
					</div>
					<div className="hidden truncate text-[12px] text-zinc-500 sm:block sm:text-[13px]">
						{token.name}
					</div>
				</div>
			</div>

			<div className="relative shrink-0 text-right">
				{ticker ? (
					<>
						<div
							className={cn(
								"font-mono text-[14px] tabular-nums transition-colors duration-150 sm:text-lg",
								flash === "up" && "text-emerald-400",
								flash === "down" && "text-red-400",
								!flash && "text-white",
							)}
						>
							${formatPrice(ticker.price)}
						</div>
						<div
							className={cn(
								"flex items-center justify-end gap-0.5 font-mono text-[10px] tabular-nums sm:gap-1 sm:text-[13px]",
								isPositive ? "text-emerald-400" : "text-red-400",
							)}
						>
							{isPositive ? (
								<svg className="h-2 w-2 sm:h-3 sm:w-3" fill="currentColor" viewBox="0 0 20 20">
									<path
										clipRule="evenodd"
										d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
										fillRule="evenodd"
									/>
								</svg>
							) : (
								<svg className="h-2 w-2 sm:h-3 sm:w-3" fill="currentColor" viewBox="0 0 20 20">
									<path
										clipRule="evenodd"
										d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
										fillRule="evenodd"
									/>
								</svg>
							)}
							{formatPercent(ticker.priceChangePercent)}
						</div>
					</>
				) : (
					<div className="flex flex-col items-end gap-1">
						<div className="h-4 w-16 animate-pulse rounded bg-zinc-700/50 sm:h-6 sm:w-24" />
						<div className="h-3 w-10 animate-pulse rounded bg-zinc-700/30 sm:h-4 sm:w-14" />
					</div>
				)}
			</div>
		</div>
	)
})

export function TokenPrices() {
	const { tickers, status } = useBinanceTicker()

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/80 backdrop-blur-sm">
			<div className="flex items-center justify-between border-zinc-800/50 border-b px-2 py-2 sm:px-4 sm:py-3">
				<h2 className="font-bold text-[13px] text-white sm:text-[15px]">Live Prices</h2>
				<div className="flex items-center gap-1">
					<div
						className={cn(
							"h-1.5 w-1.5 rounded-full transition-colors duration-300",
							status === "connected" && "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]",
							status === "connecting" && "animate-pulse bg-amber-400",
							status === "disconnected" && "bg-red-400",
						)}
					/>
					<span className="text-[8px] text-zinc-500 uppercase tracking-wide sm:text-[10px]">
						{status === "connected" ? "Live" : status}
					</span>
				</div>
			</div>

			<div className="flex flex-col gap-1 p-1.5 sm:gap-2 sm:p-3">
				{SUPPORTED_TOKENS.map((token) => (
					<TokenRow key={token.symbol} ticker={tickers[token.symbol]} token={token} />
				))}
			</div>
		</div>
	)
}
