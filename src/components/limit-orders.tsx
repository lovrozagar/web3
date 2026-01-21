"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { type LimitOrder, type OrderSide, useLimitOrders } from "@/hooks/use-limit-orders"
import { cn, formatPrice } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/types"
import { WalletNotConnected } from "./wallet-not-connected"

export function LimitOrders() {
	const { isConnected } = useAccount()
	const { orders, createOrder, cancelOrder, clearFilled, checkOrders } = useLimitOrders()
	const { tickers } = useBinanceTicker()
	const [isCreating, setIsCreating] = useState(false)
	const [side, setSide] = useState<OrderSide>("buy")
	const [tokenFrom, setTokenFrom] = useState("USDT")
	const [tokenTo, setTokenTo] = useState("ETH")
	const [amount, setAmount] = useState("")
	const [limitPrice, setLimitPrice] = useState("")

	/* check orders whenever prices update */
	useEffect(() => {
		const prices: Record<string, number> = {}
		for (const [symbol, ticker] of Object.entries(tickers)) {
			if (ticker) {
				prices[symbol] = Number.parseFloat(ticker.price)
			}
		}
		if (Object.keys(prices).length > 0) {
			checkOrders(prices)
		}
	}, [tickers, checkOrders])

	/* set current price as default when opening form */
	useEffect(() => {
		if (isCreating && !limitPrice) {
			const ticker = tickers[side === "buy" ? tokenTo : tokenFrom]
			if (ticker) {
				const price = Number.parseFloat(ticker.price)
				/* for buy, suggest slightly below current; for sell, slightly above */
				const suggested = side === "buy" ? price * 0.98 : price * 1.02
				setLimitPrice(suggested.toFixed(2))
			}
		}
	}, [isCreating, side, tokenFrom, tokenTo, tickers, limitPrice])

	const handleCreate = () => {
		const price = Number.parseFloat(limitPrice)
		if (!amount || Number.parseFloat(amount) <= 0 || Number.isNaN(price) || price <= 0) return

		createOrder(side, tokenFrom, tokenTo, amount, price)
		setAmount("")
		setLimitPrice("")
		setIsCreating(false)
	}

	const openOrders = orders.filter((o) => o.status === "open")
	const filledOrders = orders.filter((o) => o.status === "filled")
	const cancelledOrders = orders.filter((o) => o.status === "cancelled")

	if (!isConnected) {
		return (
			<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
				<div className="flex items-center gap-2 border-border border-b px-3 py-2 sm:px-4 sm:py-3">
					<svg
						className="h-4 w-4 text-purple-400"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Limit Orders</h2>
				</div>
				<WalletNotConnected message="Connect to place limit orders" />
			</div>
		)
	}

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-3 py-2 sm:px-4 sm:py-3">
				<div className="flex items-center gap-2">
					<svg
						className="h-4 w-4 text-purple-400"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Limit Orders</h2>
					{openOrders.length > 0 && (
						<span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 font-medium text-[10px] text-purple-400">
							{openOrders.length}
						</span>
					)}
				</div>
				<button
					className="flex h-7 w-7 items-center justify-center rounded-md text-ui-fg-muted transition-colors hover:bg-ui-bg-hover/50 hover:text-foreground"
					onClick={() => setIsCreating(!isCreating)}
					type="button"
				>
					<svg
						className={cn("h-4 w-4 transition-transform", isCreating && "rotate-45")}
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
			</div>

			{/* Create order form */}
			{isCreating && (
				<div className="flex flex-col gap-3 border-border border-b bg-ui-bg-field/30 p-3">
					{/* Buy/Sell toggle */}
					<div className="flex gap-1 rounded-lg bg-ui-bg-base/50 p-1">
						<button
							className={cn(
								"flex-1 rounded-md py-1.5 font-medium text-sm transition-colors",
								side === "buy"
									? "bg-emerald-500/20 text-emerald-400"
									: "text-ui-fg-muted hover:text-foreground",
							)}
							onClick={() => setSide("buy")}
							type="button"
						>
							Buy
						</button>
						<button
							className={cn(
								"flex-1 rounded-md py-1.5 font-medium text-sm transition-colors",
								side === "sell"
									? "bg-red-500/20 text-red-400"
									: "text-ui-fg-muted hover:text-foreground",
							)}
							onClick={() => setSide("sell")}
							type="button"
						>
							Sell
						</button>
					</div>

					{/* Token selectors */}
					<div className="flex items-center gap-2">
						<select
							className="flex-1 rounded-lg border border-border bg-ui-bg-component px-2 py-1.5 text-foreground text-sm focus:border-blue-500 focus:outline-none"
							onChange={(e) => setTokenFrom(e.target.value)}
							value={tokenFrom}
						>
							{SUPPORTED_TOKENS.map((token) => (
								<option key={token.symbol} value={token.symbol}>
									{token.symbol}
								</option>
							))}
							<option value="USDT">USDT</option>
						</select>
						<svg
							className="h-4 w-4 text-ui-fg-muted"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M14 5l7 7m0 0l-7 7m7-7H3"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
						<select
							className="flex-1 rounded-lg border border-border bg-ui-bg-component px-2 py-1.5 text-foreground text-sm focus:border-blue-500 focus:outline-none"
							onChange={(e) => setTokenTo(e.target.value)}
							value={tokenTo}
						>
							{SUPPORTED_TOKENS.map((token) => (
								<option key={token.symbol} value={token.symbol}>
									{token.symbol}
								</option>
							))}
							<option value="USDT">USDT</option>
						</select>
					</div>

					{/* Amount and price */}
					<div className="flex gap-2">
						<div className="relative flex-1">
							<input
								className="w-full rounded-lg border border-border bg-ui-bg-component px-3 py-1.5 text-foreground text-sm placeholder:text-ui-fg-muted focus:border-blue-500 focus:outline-none"
								onChange={(e) => setAmount(e.target.value)}
								placeholder="Amount"
								type="number"
								value={amount}
							/>
						</div>
						<div className="relative flex-1">
							<span className="-translate-y-1/2 absolute top-1/2 left-3 text-ui-fg-muted">$</span>
							<input
								className="w-full rounded-lg border border-border bg-ui-bg-component py-1.5 pr-3 pl-7 text-foreground text-sm placeholder:text-ui-fg-muted focus:border-blue-500 focus:outline-none"
								onChange={(e) => setLimitPrice(e.target.value)}
								placeholder="Limit price"
								type="number"
								value={limitPrice}
							/>
						</div>
					</div>

					<button
						className={cn(
							"w-full rounded-lg py-2 font-medium text-sm text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50",
							side === "buy"
								? "bg-emerald-500 hover:bg-emerald-600"
								: "bg-red-500 hover:bg-red-600",
						)}
						disabled={!amount || !limitPrice}
						onClick={handleCreate}
						type="button"
					>
						Place {side === "buy" ? "Buy" : "Sell"} Order
					</button>
				</div>
			)}

			{/* Orders list */}
			<div className="flex flex-col gap-1 p-2 sm:p-3">
				{orders.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-6 text-center">
						<div className="mb-2 text-2xl opacity-50">📋</div>
						<div className="text-sm text-ui-fg-subtle">No limit orders</div>
						<div className="mt-1 text-ui-fg-muted text-xs">Click + to create one</div>
					</div>
				) : (
					<>
						{openOrders.length > 0 && (
							<>
								<span className="text-[10px] text-ui-fg-muted uppercase">Open</span>
								{openOrders.map((order) => (
									<OrderRow
										currentPrice={
											tickers[order.tokenFrom === "USDT" ? order.tokenTo : order.tokenFrom]
												? Number.parseFloat(
														tickers[order.tokenFrom === "USDT" ? order.tokenTo : order.tokenFrom]
															?.price,
													)
												: undefined
										}
										key={order.id}
										onCancel={cancelOrder}
										order={order}
									/>
								))}
							</>
						)}
						{filledOrders.length > 0 && (
							<>
								<div className="flex items-center justify-between pt-2">
									<span className="text-[10px] text-ui-fg-muted uppercase">Filled</span>
									<button
										className="text-[10px] text-ui-fg-subtle hover:text-foreground"
										onClick={clearFilled}
										type="button"
									>
										Clear
									</button>
								</div>
								{filledOrders.slice(0, 3).map((order) => (
									<OrderRow key={order.id} order={order} />
								))}
							</>
						)}
						{cancelledOrders.length > 0 && (
							<>
								<span className="pt-2 text-[10px] text-ui-fg-muted uppercase">Cancelled</span>
								{cancelledOrders.slice(0, 2).map((order) => (
									<OrderRow key={order.id} order={order} />
								))}
							</>
						)}
					</>
				)}
			</div>
		</div>
	)
}

interface OrderRowProps {
	order: LimitOrder
	currentPrice?: number
	onCancel?: (id: string) => void
}

function OrderRow({ order, currentPrice, onCancel }: OrderRowProps) {
	const token = SUPPORTED_TOKENS.find(
		(t) => t.symbol === (order.tokenFrom === "USDT" ? order.tokenTo : order.tokenFrom),
	)

	const distancePercent = currentPrice
		? ((order.limitPrice - currentPrice) / currentPrice) * 100
		: 0

	return (
		<div
			className={cn(
				"group relative flex items-center gap-2 rounded-lg p-2 transition-colors",
				order.status === "filled" && "border border-emerald-500/20 bg-emerald-500/10",
				order.status === "cancelled" && "bg-ui-bg-field/20 opacity-60",
				order.status === "open" && "bg-ui-bg-field hover:bg-ui-bg-component",
			)}
		>
			<div
				className={cn(
					"flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
					order.side === "buy" ? "bg-emerald-500/20" : "bg-red-500/20",
				)}
			>
				{token?.icon ?? "🪙"}
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center gap-1.5">
					<span
						className={cn(
							"rounded px-1.5 py-0.5 font-medium text-[10px] uppercase",
							order.side === "buy"
								? "bg-emerald-500/20 text-emerald-400"
								: "bg-red-500/20 text-red-400",
						)}
					>
						{order.side}
					</span>
					<span className="text-foreground text-sm">
						{order.amount} {order.tokenFrom}
					</span>
					<svg
						className="h-3 w-3 text-ui-fg-muted"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M14 5l7 7m0 0l-7 7m7-7H3"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					</svg>
					<span className="text-sm text-ui-fg-subtle">{order.tokenTo}</span>
				</div>

				<div className="mt-0.5 flex items-center gap-2">
					<span className="text-[11px] text-ui-fg-muted">
						@ ${formatPrice(order.limitPrice.toString())}
					</span>
					{order.status === "open" && currentPrice && (
						<span
							className={cn(
								"text-[10px]",
								distancePercent > 0 ? "text-emerald-400" : "text-red-400",
							)}
						>
							{distancePercent > 0 ? "+" : ""}
							{distancePercent.toFixed(1)}%
						</span>
					)}
					{order.status === "filled" && (
						<span className="text-[10px] text-emerald-400">Filled</span>
					)}
					{order.status === "cancelled" && (
						<span className="text-[10px] text-ui-fg-muted">Cancelled</span>
					)}
				</div>
			</div>

			{order.status === "open" && onCancel && (
				<button
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ui-fg-muted opacity-0 transition-all hover:bg-ui-bg-hover/50 hover:text-foreground group-hover:opacity-100"
					onClick={() => onCancel(order.id)}
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
			)}
		</div>
	)
}
