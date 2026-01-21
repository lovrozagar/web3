"use client"

import { memo } from "react"
import { type TradeData, useBinanceTrades } from "@/hooks/use-binance-trades"
import { cn, formatPrice } from "@/lib/utils"
import { ConnectionStatus } from "./connection-status"

interface TradeRowProps {
	trade: TradeData
}

const TradeRow = memo(function TradeRow({ trade }: TradeRowProps) {
	const isBuy = !trade.isBuyerMaker
	const time = new Date(trade.time)
	const timeStr = time.toLocaleTimeString("en-US", {
		hour: "2-digit",
		hour12: false,
		minute: "2-digit",
		second: "2-digit",
	})

	return (
		<div className="flex items-center justify-between py-1 text-[11px] sm:text-[12px]">
			<span className={cn("font-mono tabular-nums", isBuy ? "text-emerald-400" : "text-red-400")}>
				{formatPrice(trade.price)}
			</span>
			<span className="font-mono text-ui-fg-subtle tabular-nums">
				{Number.parseFloat(trade.quantity).toFixed(4)}
			</span>
			<span className="text-ui-fg-muted">{timeStr}</span>
			<span
				className={cn(
					"w-8 text-right font-medium text-[10px] sm:text-[11px]",
					isBuy ? "text-emerald-400" : "text-red-400",
				)}
			>
				{isBuy ? "BUY" : "SELL"}
			</span>
		</div>
	)
})

function LoadingSkeleton() {
	return (
		<div className="flex items-center justify-between py-1">
			<div className="h-3 w-16 animate-pulse rounded bg-ui-bg-hover/50" />
			<div className="h-3 w-12 animate-pulse rounded bg-ui-bg-hover/30" />
			<div className="h-3 w-14 animate-pulse rounded bg-ui-bg-hover/30" />
			<div className="h-3 w-8 animate-pulse rounded bg-ui-bg-hover/30" />
		</div>
	)
}

export function RecentTrades() {
	const { trades, status, reconnect, reconnectAttempts, timeSinceLastMessage } = useBinanceTrades({
		maxTrades: 15,
		symbol: "ethusdt",
	})

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-2 py-2 sm:px-4 sm:py-3">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Recent Trades</h2>
					<span className="rounded bg-ui-bg-component px-1.5 py-0.5 text-[9px] text-ui-fg-muted sm:text-[10px]">
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

			{/* Header */}
			<div className="flex items-center justify-between border-border/30 border-b px-2 py-1.5 text-[9px] text-ui-fg-muted uppercase sm:px-3 sm:text-[10px]">
				<span>Price</span>
				<span>Amount</span>
				<span>Time</span>
				<span className="w-8 text-right">Side</span>
			</div>

			{/* Trade list */}
			<div className="max-h-[280px] overflow-y-auto px-2 py-1 sm:px-3">
				{trades.length === 0
					? [...Array(10)].map((_, i) => <LoadingSkeleton key={i} />)
					: trades.map((trade) => <TradeRow key={trade.id} trade={trade} />)}
			</div>
		</div>
	)
}
