"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import type { WebSocketState } from "@/classes/websocket-manager"
import { ArrowDownIcon } from "@/components/icons/arrow-down"
import { ArrowUpIcon } from "@/components/icons/arrow-up"
import { StarIcon } from "@/components/icons/star"
import { TimePeriodToggle } from "@/components/time-period-toggle"
import { useFavoriteTokens } from "@/hooks/use-favorite-tokens"
import { useTimePeriod } from "@/hooks/use-time-period"
import type { TickerData, TokenInfo } from "@/types"
import { SUPPORTED_TOKENS } from "@/types"
import { cn } from "@/utils/cn"
import { formatCompactPrice, formatPercent, formatPrice, formatVolume } from "@/utils/format"
import { generateSparklineData } from "@/utils/sparkline"
import { ConnectionStatus } from "./connection-status"
import { Sparkline } from "./sparkline"

interface TokenRowProps {
	ticker: TickerData | undefined
	token: TokenInfo
	isFavorite: boolean
	onToggleFavorite: () => void
	priceChangePercent: string | null
}

const TokenRow = memo(function TokenRow({
	ticker,
	token,
	isFavorite,
	onToggleFavorite,
	priceChangePercent,
}: TokenRowProps) {
	const [flash, setFlash] = useState<"up" | "down" | null>(null)
	const [expanded, setExpanded] = useState(false)
	const prevPriceRef = useRef<string | null>(null)

	const isPositive = priceChangePercent ? Number.parseFloat(priceChangePercent) >= 0 : true

	/* generate sparkline data based on current price and change */
	const sparklineData = useMemo(() => {
		if (!ticker || !priceChangePercent) return []
		const price = Number.parseFloat(ticker.price)
		const change = Number.parseFloat(priceChangePercent)
		return generateSparklineData(price, change)
	}, [ticker, priceChangePercent])

	/* detect price changes and trigger flash */
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
				"group relative flex min-w-0 flex-col rounded-lg",
				"bg-ui-bg-field hover:bg-ui-bg-component",
				"border border-transparent hover:border-ui-border-subtle",
				expanded && "border-ui-border-subtle bg-ui-bg-component",
			)}
		>
			<div className="flex min-w-0 items-center gap-1 p-2 sm:gap-2 sm:p-3">
				{/* favorite star button */}
				<button
					aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
					className={cn(
						"relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all",
						"hover:bg-ui-bg-hover",
						isFavorite ? "text-amber-400" : "text-ui-fg-disabled hover:text-ui-fg-muted",
					)}
					onClick={(e) => {
						e.stopPropagation()
						onToggleFavorite()
					}}
					type="button"
				>
					<StarIcon
						className="h-3.5 w-3.5 sm:h-4 sm:w-4"
						fill={isFavorite ? "currentColor" : "none"}
					/>
				</button>

				{/* main row content - clickable to expand */}
				<button
					className="flex min-w-0 flex-1 items-center justify-between gap-1.5 text-left sm:gap-2"
					onClick={() => setExpanded(!expanded)}
					type="button"
				>
					<div
						className={cn(
							"pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-[400ms]",
							flash === "up" && "bg-emerald-500/10",
							flash === "down" && "bg-red-500/10",
							flash ? "opacity-100" : "opacity-0",
						)}
					/>

					<div className="relative flex min-w-0 items-center gap-1.5 sm:gap-3">
						<div
							className={cn(
								"flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm sm:h-10 sm:w-10 sm:text-xl",
								"bg-ui-bg-hover transition-transform duration-200 group-hover:scale-105",
							)}
						>
							{token.icon}
						</div>
						<div className="min-w-0">
							<div className="truncate font-bold text-[13px] text-foreground sm:text-[15px]">
								{token.symbol}
							</div>
							<div className="hidden truncate text-[12px] text-ui-fg-muted sm:block sm:text-[13px]">
								{token.name}
							</div>
						</div>
					</div>

					{/* sparkline - hidden on mobile for space */}
					<div className="mx-2 hidden sm:block">
						{ticker ? (
							<Sparkline className="opacity-80" data={sparklineData} height={28} width={50} />
						) : (
							<div className="h-7 w-[50px] animate-pulse rounded bg-ui-bg-hover/50" />
						)}
					</div>

					<div className="relative shrink-0 text-right">
						{ticker ? (
							<>
								<div
									className={cn(
										"font-mono text-[14px] tabular-nums transition-colors duration-150 sm:text-lg",
										flash === "up" && "text-emerald-400",
										flash === "down" && "text-red-400",
										!flash && "text-foreground",
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
										<ArrowUpIcon className="h-2 w-2 sm:h-3 sm:w-3" />
									) : (
										<ArrowDownIcon className="h-2 w-2 sm:h-3 sm:w-3" />
									)}
									{priceChangePercent ? formatPercent(priceChangePercent) : "--"}
								</div>
							</>
						) : (
							<div className="flex flex-col items-end gap-1">
								<div className="h-4 w-16 animate-pulse rounded bg-ui-bg-hover sm:h-6 sm:w-24" />
								<div className="h-3 w-10 animate-pulse rounded bg-ui-bg-hover/50 sm:h-4 sm:w-14" />
							</div>
						)}
					</div>
				</button>
			</div>

			{/* expanded 24h stats */}
			{expanded && ticker && (
				<div className="grid grid-cols-3 gap-2 border-ui-border-subtle border-t px-2 py-2 sm:px-3 sm:py-3">
					<div className="text-center">
						<div className="text-[9px] text-ui-fg-muted uppercase sm:text-[10px]">24h High</div>
						<div className="font-mono text-[11px] text-emerald-400 tabular-nums sm:text-[13px]">
							${formatCompactPrice(ticker.high24h)}
						</div>
					</div>
					<div className="text-center">
						<div className="text-[9px] text-ui-fg-muted uppercase sm:text-[10px]">24h Low</div>
						<div className="font-mono text-[11px] text-red-400 tabular-nums sm:text-[13px]">
							${formatCompactPrice(ticker.low24h)}
						</div>
					</div>
					<div className="text-center">
						<div className="text-[9px] text-ui-fg-muted uppercase sm:text-[10px]">24h Vol</div>
						<div className="font-mono text-[11px] text-ui-fg-subtle tabular-nums sm:text-[13px]">
							{formatVolume(ticker.quoteVolume24h)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
})

interface TokenPricesProps {
	tickers: Record<string, TickerData>
	status: WebSocketState
	reconnect: () => void
	reconnectAttempts: number
	timeSinceLastMessage: number
}

export function TokenPrices({
	tickers,
	status,
	reconnect,
	reconnectAttempts,
	timeSinceLastMessage,
}: TokenPricesProps) {
	const { isFavorite, toggleFavorite } = useFavoriteTokens()
	const { period, setPeriod, getPriceChange } = useTimePeriod()

	/* sort tokens: favorites first, then alphabetically */
	const sortedTokens = useMemo(() => {
		return [...SUPPORTED_TOKENS].sort((a, b) => {
			const aFav = isFavorite(a.symbol)
			const bFav = isFavorite(b.symbol)
			if (aFav && !bFav) return -1
			if (!aFav && bFav) return 1
			return 0
		})
	}, [isFavorite])

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-2 py-2 sm:px-4 sm:py-3">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Live Prices</h2>
					<TimePeriodToggle onChange={setPeriod} value={period} />
				</div>
				<ConnectionStatus
					compact
					onReconnect={reconnect}
					reconnectAttempts={reconnectAttempts}
					state={status}
					timeSinceLastMessage={timeSinceLastMessage}
				/>
			</div>

			<div className="flex flex-col gap-1 p-1.5 sm:gap-2 sm:p-3">
				{sortedTokens.map((token) => (
					<TokenRow
						isFavorite={isFavorite(token.symbol)}
						key={token.symbol}
						onToggleFavorite={() => toggleFavorite(token.symbol)}
						priceChangePercent={getPriceChange(token.symbol, tickers[token.symbol])}
						ticker={tickers[token.symbol]}
						token={token}
					/>
				))}
			</div>

			{/* hint */}
			<div className="flex items-center justify-center border-border border-t py-1 sm:py-1.5">
				<span className="text-[8px] text-ui-fg-disabled sm:text-[9px]">
					Click token for 24h stats
				</span>
			</div>
		</div>
	)
}
