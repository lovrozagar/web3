"use client"

import { useEffect, useState } from "react"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { type PriceAlert, usePriceAlerts } from "@/hooks/use-price-alerts"
import { cn, formatPrice } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/types"

export function PriceAlerts() {
	const { alerts, addAlert, removeAlert, clearTriggered, checkAlerts } = usePriceAlerts()
	const { tickers } = useBinanceTicker()
	const [isAdding, setIsAdding] = useState(false)
	const [newAlertSymbol, setNewAlertSymbol] = useState("BTC")
	const [newAlertPrice, setNewAlertPrice] = useState("")
	const [newAlertDirection, setNewAlertDirection] = useState<"above" | "below">("above")

	/* check alerts whenever prices update */
	useEffect(() => {
		const prices: Record<string, number> = {}
		for (const [symbol, ticker] of Object.entries(tickers)) {
			if (ticker) {
				prices[symbol] = Number.parseFloat(ticker.price)
			}
		}
		if (Object.keys(prices).length > 0) {
			checkAlerts(prices)
		}
	}, [tickers, checkAlerts])

	const handleAddAlert = () => {
		const price = Number.parseFloat(newAlertPrice)
		if (Number.isNaN(price) || price <= 0) return

		addAlert(newAlertSymbol, price, newAlertDirection)
		setNewAlertPrice("")
		setIsAdding(false)
	}

	const activeAlerts = alerts.filter((a) => !a.triggered)
	const triggeredAlerts = alerts.filter((a) => a.triggered)

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-3 py-2 sm:px-4 sm:py-3">
				<div className="flex items-center gap-2">
					<svg
						className="h-4 w-4 text-amber-400"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Price Alerts</h2>
				</div>
				<button
					className="flex h-7 w-7 items-center justify-center rounded-md text-ui-fg-muted transition-colors hover:bg-ui-bg-hover/50 hover:text-foreground"
					onClick={() => setIsAdding(!isAdding)}
					type="button"
				>
					<svg
						className={cn("h-4 w-4 transition-transform", isAdding && "rotate-45")}
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
			</div>

			{/* Add new alert form */}
			{isAdding && (
				<div className="flex flex-col gap-2 border-border border-b bg-ui-bg-field/30 p-3">
					<div className="flex gap-2">
						<select
							className="flex-1 rounded-lg border border-border bg-ui-bg-component px-2 py-1.5 text-foreground text-sm focus:border-blue-500 focus:outline-none"
							onChange={(e) => setNewAlertSymbol(e.target.value)}
							value={newAlertSymbol}
						>
							{SUPPORTED_TOKENS.map((token) => (
								<option key={token.symbol} value={token.symbol}>
									{token.symbol}
								</option>
							))}
						</select>
						<select
							className="rounded-lg border border-border bg-ui-bg-component px-2 py-1.5 text-foreground text-sm focus:border-blue-500 focus:outline-none"
							onChange={(e) => setNewAlertDirection(e.target.value as "above" | "below")}
							value={newAlertDirection}
						>
							<option value="above">Above</option>
							<option value="below">Below</option>
						</select>
					</div>
					<div className="flex gap-2">
						<div className="relative flex-1">
							<span className="-translate-y-1/2 absolute top-1/2 left-3 text-ui-fg-muted">$</span>
							<input
								className="w-full rounded-lg border border-border bg-ui-bg-component py-1.5 pr-3 pl-7 text-foreground text-sm placeholder:text-ui-fg-muted focus:border-blue-500 focus:outline-none"
								onChange={(e) => setNewAlertPrice(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleAddAlert()}
								placeholder="Target price"
								type="number"
								value={newAlertPrice}
							/>
						</div>
						<button
							className="rounded-lg bg-blue-500 px-4 py-1.5 font-medium text-sm text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!newAlertPrice || Number.parseFloat(newAlertPrice) <= 0}
							onClick={handleAddAlert}
							type="button"
						>
							Add
						</button>
					</div>
				</div>
			)}

			{/* Alerts list */}
			<div className="flex flex-col gap-1 p-2 sm:p-3">
				{activeAlerts.length === 0 && triggeredAlerts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-6 text-center">
						<div className="mb-2 text-2xl opacity-50">🔔</div>
						<div className="text-sm text-ui-fg-subtle">No alerts set</div>
						<div className="mt-1 text-ui-fg-muted text-xs">Click + to add a price alert</div>
					</div>
				) : (
					<>
						{activeAlerts.map((alert) => (
							<AlertRow
								alert={alert}
								currentPrice={
									tickers[alert.symbol]
										? Number.parseFloat(tickers[alert.symbol]?.price)
										: undefined
								}
								key={alert.id}
								onRemove={removeAlert}
							/>
						))}
						{triggeredAlerts.length > 0 && (
							<>
								<div className="flex items-center justify-between pt-2">
									<span className="text-[10px] text-ui-fg-muted uppercase">Triggered</span>
									<button
										className="text-[10px] text-ui-fg-subtle hover:text-foreground"
										onClick={clearTriggered}
										type="button"
									>
										Clear all
									</button>
								</div>
								{triggeredAlerts.map((alert) => (
									<AlertRow
										alert={alert}
										currentPrice={
											tickers[alert.symbol]
												? Number.parseFloat(tickers[alert.symbol]?.price)
												: undefined
										}
										key={alert.id}
										onRemove={removeAlert}
									/>
								))}
							</>
						)}
					</>
				)}
			</div>
		</div>
	)
}

interface AlertRowProps {
	alert: PriceAlert
	currentPrice: number | undefined
	onRemove: (id: string) => void
}

function calculateProgress(
	currentPrice: number | undefined,
	targetPrice: number,
	direction: "above" | "below",
): number {
	if (!currentPrice) return 0
	if (direction === "above") {
		return Math.min((currentPrice / targetPrice) * 100, 100)
	}
	return Math.min((targetPrice / currentPrice) * 100, 100)
}

function AlertRow({ alert, currentPrice, onRemove }: AlertRowProps) {
	const token = SUPPORTED_TOKENS.find((t) => t.symbol === alert.symbol)
	const progress = calculateProgress(currentPrice, alert.targetPrice, alert.direction)

	return (
		<div
			className={cn(
				"group relative flex items-center gap-2 rounded-lg p-2 transition-colors",
				alert.triggered
					? "border border-emerald-500/20 bg-emerald-500/10"
					: "bg-ui-bg-field hover:bg-ui-bg-component",
			)}
		>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-bg-hover/50 text-sm">
				{token?.icon ?? "🪙"}
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center gap-1.5">
					<span className="font-medium text-foreground text-sm">{alert.symbol}</span>
					<span
						className={cn(
							"rounded px-1.5 py-0.5 font-medium text-[10px]",
							alert.direction === "above"
								? "bg-emerald-500/20 text-emerald-400"
								: "bg-red-500/20 text-red-400",
						)}
					>
						{alert.direction === "above" ? "↑" : "↓"} ${formatPrice(alert.targetPrice.toString())}
					</span>
					{alert.triggered && (
						<span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-medium text-[10px] text-emerald-400">
							Triggered
						</span>
					)}
				</div>

				{!alert.triggered && currentPrice && (
					<div className="mt-1 flex items-center gap-2">
						<div className="h-1 flex-1 overflow-hidden rounded-full bg-ui-bg-hover/50">
							<div
								className={cn(
									"h-full rounded-full transition-all",
									progress >= 100 ? "bg-emerald-500" : "bg-blue-500",
								)}
								style={{ width: `${Math.min(progress, 100)}%` }}
							/>
						</div>
						<span className="text-[10px] text-ui-fg-muted tabular-nums">
							{progress.toFixed(0)}%
						</span>
					</div>
				)}
			</div>

			<button
				className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ui-fg-muted opacity-0 transition-all hover:bg-ui-bg-hover/50 hover:text-foreground group-hover:opacity-100"
				onClick={() => onRemove(alert.id)}
				type="button"
			>
				<svg
					className="h-3.5 w-3.5"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					viewBox="0 0 24 24"
				>
					<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>
		</div>
	)
}
