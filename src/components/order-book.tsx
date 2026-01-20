"use client"

import { useMemo } from "react"
import { useBinanceDepth } from "@/hooks/use-binance-depth"
import { cn, formatPrice, formatQuantity } from "@/lib/utils"
import type { OrderBookEntry } from "@/types"

interface OrderRowProps {
	entry: OrderBookEntry
	maxTotal: number
	type: "bid" | "ask"
}

function OrderRow({ entry, maxTotal, type }: OrderRowProps) {
	const depthPercent = (entry.total / maxTotal) * 100
	const isBid = type === "bid"

	return (
		<div className="relative flex items-center justify-between py-1 font-mono text-sm">
			<div
				className={cn(
					"absolute inset-y-0 right-0 opacity-20",
					isBid ? "bg-green-500" : "bg-red-500",
				)}
				style={{ width: `${depthPercent}%` }}
			/>
			<span className={cn("relative z-10", isBid ? "text-green-500" : "text-red-500")}>
				{formatPrice(entry.price)}
			</span>
			<span className="relative z-10 text-zinc-400">{formatQuantity(entry.quantity)}</span>
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

	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-lg">Order Book</h2>
				<div className="flex items-center gap-2">
					<span className="rounded bg-zinc-800 px-2 py-1 font-medium text-xs">ETH/USDT</span>
					<div
						className={cn(
							"h-2 w-2 rounded-full",
							status === "connected" && "bg-green-500",
							status === "connecting" && "animate-pulse bg-yellow-500",
							status === "disconnected" && "bg-red-500",
						)}
					/>
				</div>
			</div>

			<div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
				<span>Price (USDT)</span>
				<span>Amount (ETH)</span>
			</div>

			<div className="space-y-0.5">
				{orderBook.asks
					.slice(0, 10)
					.reverse()
					.map((entry) => (
						<OrderRow entry={entry} key={entry.price} maxTotal={maxAskTotal} type="ask" />
					))}
			</div>

			<div className="my-3 flex items-center justify-center gap-3 rounded-lg bg-zinc-800 py-2">
				<span className="font-semibold text-lg text-white">
					${formatPrice(orderBook.bids[0]?.price ?? "0")}
				</span>
				<span className="text-xs text-zinc-500">
					Spread: ${orderBook.spread} ({orderBook.spreadPercent}%)
				</span>
			</div>

			<div className="space-y-0.5">
				{orderBook.bids.slice(0, 10).map((entry) => (
					<OrderRow entry={entry} key={entry.price} maxTotal={maxBidTotal} type="bid" />
				))}
			</div>
		</div>
	)
}
