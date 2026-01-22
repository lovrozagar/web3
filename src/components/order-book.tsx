"use client"

import { memo, useMemo, useState } from "react"
import { type UpdateSpeed, useBinanceDepth } from "@/hooks/use-binance-depth"
import { type OrderBookDepth, useUserPreferences } from "@/hooks/use-user-preferences"
import type { OrderBookEntry } from "@/types"
import { cn } from "@/utils/cn"
import { formatPrice, formatQuantity } from "@/utils/format"
import { ConnectionStatus } from "./connection-status"

const DEPTH_OPTIONS: { label: string; value: OrderBookDepth }[] = [
	{ label: "10", value: 10 },
	{ label: "20", value: 20 },
]

type PriceGrouping = 0.01 | 0.1 | 1 | 10

const GROUPING_OPTIONS: { label: string; value: PriceGrouping }[] = [
	{ label: "0.01", value: 0.01 },
	{ label: "0.1", value: 0.1 },
	{ label: "1", value: 1 },
	{ label: "10", value: 10 },
]

function groupOrders(
	orders: OrderBookEntry[],
	grouping: PriceGrouping,
	type: "bid" | "ask",
): OrderBookEntry[] {
	if (grouping === 0.01) return orders /* no grouping needed */

	const grouped = new Map<string, { quantity: number; total: number }>()

	for (const order of orders) {
		const price = Number.parseFloat(order.price)
		const groupedPrice =
			type === "bid"
				? Math.floor(price / grouping) * grouping
				: Math.ceil(price / grouping) * grouping

		const key = groupedPrice.toFixed(2)
		const existing = grouped.get(key)

		if (existing) {
			existing.quantity += Number.parseFloat(order.quantity)
			existing.total = order.total
		} else {
			grouped.set(key, {
				quantity: Number.parseFloat(order.quantity),
				total: order.total,
			})
		}
	}

	return Array.from(grouped.entries()).map(([price, data]) => ({
		price,
		quantity: data.quantity.toString(),
		total: data.total,
	}))
}

interface OrderRowProps {
	entry: OrderBookEntry
	maxQuantity: number
	onPriceClick?: (price: string) => void
	type: "bid" | "ask"
}

const OrderRow = memo(function OrderRow({ entry, maxQuantity, onPriceClick, type }: OrderRowProps) {
	const quantity = Number.parseFloat(entry.quantity)
	const depthPercent = (quantity / maxQuantity) * 100
	const isBid = type === "bid"
	const orderType = isBid ? "buy" : "sell"

	return (
		<button
			aria-label={`${orderType} order at $${entry.price} for ${entry.quantity} ETH. Click to fill swap form.`}
			className="group relative flex h-5 w-full items-center justify-between px-2 font-mono text-[11px] hover:bg-ui-bg-hover/50 sm:h-7 sm:text-[13px]"
			onClick={() => onPriceClick?.(entry.price)}
			type="button"
		>
			{/* depth bar - solid color, smooth width transition */}
			<div
				className={cn(
					"absolute inset-y-0.5 right-0 rounded-l-sm transition-[width] duration-200 ease-out sm:inset-y-1",
					isBid ? "bg-emerald-500/20" : "bg-red-500/20",
				)}
				style={{ width: `${Math.min(depthPercent, 100)}%` }}
			/>
			<span
				className={cn(
					"relative z-10 tabular-nums",
					isBid ? "text-emerald-400" : "text-red-400",
					"group-hover:underline group-hover:underline-offset-2",
				)}
			>
				{formatPrice(entry.price)}
			</span>
			<span className="relative z-10 text-ui-fg-subtle tabular-nums group-hover:text-foreground">
				{formatQuantity(entry.quantity)}
			</span>
		</button>
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
			<div className="h-2.5 w-12 animate-pulse rounded bg-ui-bg-hover/30 sm:h-3 sm:w-16" />
		</div>
	)
}

interface OrderBookProps {
	onPriceSelect?: (price: string, type: "bid" | "ask") => void
}

/* map user preference speed to websocket speed */
function getWsSpeed(speed: number): UpdateSpeed {
	if (speed <= 100) return "100ms"
	return "1000ms"
}

export function OrderBook({ onPriceSelect }: OrderBookProps) {
	const { preferences, setOrderBookDepth } = useUserPreferences()
	const [grouping, setGrouping] = useState<PriceGrouping>(0.01)

	const wsSpeed = getWsSpeed(preferences.orderBookUpdateSpeed)
	const { orderBook, reconnect, reconnectAttempts, status, timeSinceLastMessage } = useBinanceDepth(
		"ethusdt",
		wsSpeed,
	)

	/* how many levels to display (half on each side) */
	const displayLevels = Math.floor(preferences.orderBookDepth / 2)

	const groupedBids = useMemo(
		() => groupOrders(orderBook.bids, grouping, "bid"),
		[orderBook.bids, grouping],
	)
	const groupedAsks = useMemo(
		() => groupOrders(orderBook.asks, grouping, "ask"),
		[orderBook.asks, grouping],
	)

	const maxBidQuantity = useMemo(
		() => Math.max(...groupedBids.map((b) => Number.parseFloat(b.quantity)), 1),
		[groupedBids],
	)
	const maxAskQuantity = useMemo(
		() => Math.max(...groupedAsks.map((a) => Number.parseFloat(a.quantity)), 1),
		[groupedAsks],
	)

	const midPrice = orderBook.bids[0]?.price ?? "0"

	const handlePriceClick = (price: string, type: "bid" | "ask") => {
		onPriceSelect?.(price, type)
	}

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			{/* header */}
			<div className="flex items-center justify-between border-border border-b px-2 py-2 sm:px-4 sm:py-3">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Order Book</h2>
					<span className="rounded bg-ui-bg-component px-1.5 py-0.5 font-mono text-[9px] text-ui-fg-muted sm:text-[10px]">
						ETH/USDT
					</span>
				</div>
				<ConnectionStatus
					compact
					onReconnect={reconnect}
					reconnectAttempts={reconnectAttempts}
					state={status}
					timeSinceLastMessage={timeSinceLastMessage}
				/>
			</div>

			{/* controls */}
			<div className="flex items-center justify-between border-border/30 border-b px-2 py-1.5 sm:px-4 sm:py-2">
				<div className="flex items-center gap-1">
					<span className="text-[8px] text-ui-fg-muted uppercase sm:text-[9px]">Group</span>
					<div className="flex items-center rounded-md bg-ui-bg-field p-0.5">
						{GROUPING_OPTIONS.map((option) => (
							<button
								className={cn(
									"cursor-pointer rounded px-1.5 py-0.5 font-mono text-[8px] transition-all sm:px-2 sm:text-[9px]",
									grouping === option.value
										? "bg-ui-bg-hover text-foreground"
										: "text-ui-fg-muted hover:text-ui-fg-subtle",
								)}
								key={option.value}
								onClick={() => setGrouping(option.value)}
								type="button"
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-[8px] text-ui-fg-muted uppercase sm:text-[9px]">Depth</span>
					<div className="flex items-center rounded-md bg-ui-bg-field p-0.5">
						{DEPTH_OPTIONS.map((option) => (
							<button
								className={cn(
									"cursor-pointer rounded px-1.5 py-0.5 font-semibold text-[8px] transition-all sm:px-2 sm:text-[9px]",
									preferences.orderBookDepth === option.value
										? "bg-ui-bg-hover text-foreground"
										: "text-ui-fg-muted hover:text-ui-fg-subtle",
								)}
								key={option.value}
								onClick={() => setOrderBookDepth(option.value)}
								type="button"
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* column headers */}
			<div className="flex items-center justify-between px-2 py-1 text-[9px] text-ui-fg-muted uppercase tracking-wider sm:px-4 sm:py-2 sm:text-[11px]">
				<span>Price (USDT)</span>
				<span>Amount (ETH)</span>
			</div>

			{/* asks - reversed so lowest ask is at bottom, index-keyed for smooth transitions */}
			<div className="flex flex-col">
				{groupedAsks.length > 0
					? groupedAsks
							.slice(0, displayLevels)
							.reverse()
							.map((entry, index) => (
								<OrderRow
									entry={entry}
									key={`ask-${index}`}
									maxQuantity={maxAskQuantity}
									onPriceClick={(price) => handlePriceClick(price, "ask")}
									type="ask"
								/>
							))
					: Array.from({ length: displayLevels }).map((_, i) => (
							<SkeletonRow key={`ask-skeleton-${i}`} type="ask" />
						))}
			</div>

			{/* spread / mid price */}
			<div className="mx-1 my-0.5 flex items-center justify-between rounded-lg bg-ui-bg-field px-1.5 py-1 sm:mx-2 sm:my-1.5 sm:px-3 sm:py-2">
				{orderBook.bids.length > 0 ? (
					<>
						<div className="flex items-center gap-1 sm:gap-2">
							<span className="font-bold text-[13px] text-foreground tabular-nums sm:text-lg">
								${formatPrice(midPrice)}
							</span>
							<span
								className={cn(
									"text-[9px] sm:text-[11px]",
									Number.parseFloat(orderBook.spreadPercent) < 0.01
										? "text-emerald-400"
										: "text-ui-fg-muted",
								)}
							>
								≈ Mid
							</span>
						</div>
						<div className="text-right">
							<div className="text-[9px] text-ui-fg-muted sm:text-[11px]">Spread</div>
							<div className="font-mono text-[10px] text-ui-fg-subtle tabular-nums sm:text-[12px]">
								${orderBook.spread}{" "}
								<span className="hidden text-ui-fg-muted sm:inline">
									({orderBook.spreadPercent}%)
								</span>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex items-center gap-1 sm:gap-2">
							<div className="h-4 w-20 animate-pulse rounded bg-ui-bg-hover/50 sm:h-6 sm:w-28" />
							<span className="text-[9px] text-ui-fg-muted sm:text-[11px]">≈ Mid</span>
						</div>
						<div className="text-right">
							<div className="text-[9px] text-ui-fg-muted sm:text-[11px]">Spread</div>
							<div className="h-2.5 w-14 animate-pulse rounded bg-ui-bg-hover/30 sm:h-3 sm:w-20" />
						</div>
					</>
				)}
			</div>

			{/* bids - index-keyed for smooth transitions */}
			<div className="flex flex-col">
				{groupedBids.length > 0
					? groupedBids
							.slice(0, displayLevels)
							.map((entry, index) => (
								<OrderRow
									entry={entry}
									key={`bid-${index}`}
									maxQuantity={maxBidQuantity}
									onPriceClick={(price) => handlePriceClick(price, "bid")}
									type="bid"
								/>
							))
					: Array.from({ length: displayLevels }).map((_, i) => (
							<SkeletonRow key={`bid-skeleton-${i}`} type="bid" />
						))}
			</div>

			{/* footer hint */}
			<div className="flex items-center justify-center border-border/30 border-t py-1 sm:py-1.5">
				<span className="text-[8px] text-ui-fg-disabled sm:text-[9px]">
					Click price to fill swap form
				</span>
			</div>
		</div>
	)
}
