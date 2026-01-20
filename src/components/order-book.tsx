"use client"

import { memo, useMemo } from "react"
import { useBinanceDepth } from "@/hooks/use-binance-depth"
import { cn, formatPrice, formatQuantity } from "@/lib/utils"
import type { OrderBookEntry } from "@/types"

interface OrderRowProps {
	entry: OrderBookEntry
	maxTotal: number
	type: "bid" | "ask"
}

const OrderRow = memo(function OrderRow({ entry, maxTotal, type }: OrderRowProps) {
	const depthPercent = (entry.total / maxTotal) * 100
	const isBid = type === "bid"

	return (
		<div className="group relative flex h-5 items-center justify-between px-2 font-mono text-[11px] sm:h-7 sm:text-[13px]">
			<div
				className={cn(
					"absolute inset-y-0.5 rounded-l-md transition-all duration-300 ease-out sm:inset-y-1 sm:rounded-l-lg",
					isBid
						? "right-0 bg-gradient-to-l from-emerald-500/25 to-emerald-500/5"
						: "right-0 bg-gradient-to-l from-red-500/25 to-red-500/5",
				)}
				style={{ width: `${Math.min(depthPercent, 100)}%` }}
			/>
			<span
				className={cn(
					"relative z-10 tabular-nums transition-colors duration-150",
					isBid ? "text-emerald-400" : "text-red-400",
				)}
			>
				{formatPrice(entry.price)}
			</span>
			<span className="relative z-10 text-zinc-200 tabular-nums transition-colors duration-150 group-hover:text-white">
				{formatQuantity(entry.quantity)}
			</span>
		</div>
	)
})

function SkeletonRow({ type }: { type: "bid" | "ask" }) {
	return (
		<div className="flex h-5 items-center justify-between px-2 sm:h-7">
			<div
				className={cn(
					"h-2.5 w-16 animate-pulse rounded sm:h-3 sm:w-24",
					type === "bid" ? "bg-emerald-500/20" : "bg-red-500/20",
				)}
			/>
			<div className="h-2.5 w-12 animate-pulse rounded bg-zinc-700/30 sm:h-3 sm:w-16" />
		</div>
	)
}

export function OrderBook() {
	const { orderBook, status } = useBinanceDepth("ethusdt")

	const maxBidTotal = useMemo(
		() => Math.max(...orderBook.bids.map((b) => b.total), 1),
		[orderBook.bids],
	)
	const maxAskTotal = useMemo(
		() => Math.max(...orderBook.asks.map((a) => a.total), 1),
		[orderBook.asks],
	)

	const midPrice = orderBook.bids[0]?.price ?? "0"

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/80 backdrop-blur-sm">
			<div className="flex items-center justify-between border-zinc-800/50 border-b px-2 py-2 sm:px-4 sm:py-3">
				<h2 className="font-bold text-[13px] text-white sm:text-[15px]">Order Book</h2>
				<div className="flex items-center gap-1 sm:gap-2">
					<span className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 font-semibold text-[9px] text-zinc-200 sm:px-2.5 sm:py-1 sm:text-[11px]">
						ETH/USDT
					</span>
					<div className="flex items-center gap-1">
						<div
							className={cn(
								"h-1.5 w-1.5 rounded-full transition-colors duration-300",
								status === "connected" && "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]",
								status === "connecting" && "animate-pulse bg-amber-400",
								status === "disconnected" && "bg-red-400",
							)}
						/>
						<span className="hidden text-[10px] text-zinc-500 uppercase tracking-wide sm:inline">
							{status === "connected" ? "Live" : status}
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between px-2 py-1 text-[9px] text-zinc-500 uppercase tracking-wider sm:px-4 sm:py-2 sm:text-[11px]">
				<span>Price</span>
				<span>Amount</span>
			</div>

			{/* Reversed so lowest ask is at bottom */}
			<div className="flex flex-col">
				{orderBook.asks.length > 0
					? orderBook.asks
							.slice(0, 8)
							.reverse()
							.map((entry) => (
								<OrderRow
									entry={entry}
									key={`ask-${entry.price}`}
									maxTotal={maxAskTotal}
									type="ask"
								/>
							))
					: Array.from({ length: 8 }).map((_, i) => (
							<SkeletonRow key={`ask-skeleton-${i}`} type="ask" />
						))}
			</div>

			<div className="mx-1 my-0.5 flex items-center justify-between rounded-lg bg-zinc-800/60 px-1.5 py-1 sm:mx-2 sm:my-1.5 sm:px-3 sm:py-2">
				{orderBook.bids.length > 0 ? (
					<>
						<div className="flex items-center gap-1 sm:gap-2">
							<span className="font-bold text-[13px] text-white tabular-nums sm:text-lg">
								${formatPrice(midPrice)}
							</span>
							<span
								className={cn(
									"text-[9px] sm:text-[11px]",
									Number.parseFloat(orderBook.spreadPercent) < 0.01
										? "text-emerald-400"
										: "text-zinc-400",
								)}
							>
								≈ Mid
							</span>
						</div>
						<div className="text-right">
							<div className="text-[9px] text-zinc-500 sm:text-[11px]">Spread</div>
							<div className="font-mono text-[10px] text-zinc-200 tabular-nums sm:text-[12px]">
								${orderBook.spread}{" "}
								<span className="hidden text-zinc-500 sm:inline">({orderBook.spreadPercent}%)</span>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex items-center gap-1 sm:gap-2">
							<div className="h-4 w-20 animate-pulse rounded bg-zinc-700/50 sm:h-6 sm:w-28" />
							<span className="text-[9px] text-zinc-500 sm:text-[11px]">≈ Mid</span>
						</div>
						<div className="text-right">
							<div className="text-[9px] text-zinc-500 sm:text-[11px]">Spread</div>
							<div className="h-2.5 w-14 animate-pulse rounded bg-zinc-700/30 sm:h-3 sm:w-20" />
						</div>
					</>
				)}
			</div>

			<div className="flex flex-col">
				{orderBook.bids.length > 0
					? orderBook.bids
							.slice(0, 8)
							.map((entry) => (
								<OrderRow
									entry={entry}
									key={`bid-${entry.price}`}
									maxTotal={maxBidTotal}
									type="bid"
								/>
							))
					: Array.from({ length: 8 }).map((_, i) => (
							<SkeletonRow key={`bid-skeleton-${i}`} type="bid" />
						))}
			</div>

			<div className="h-1 sm:h-2" />
		</div>
	)
}
