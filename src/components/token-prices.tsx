"use client"

import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { cn, formatPercent, formatPrice } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/types"

function StatusIndicator({ status }: { status: string }) {
	return (
		<div className="flex items-center gap-2 text-xs text-zinc-500">
			<div
				className={cn(
					"h-2 w-2 rounded-full",
					status === "connected" && "bg-green-500",
					status === "connecting" && "animate-pulse bg-yellow-500",
					status === "disconnected" && "bg-red-500",
				)}
			/>
			<span className="capitalize">{status}</span>
		</div>
	)
}

export function TokenPrices() {
	const { tickers, status } = useBinanceTicker()

	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-lg">Live Prices</h2>
				<StatusIndicator status={status} />
			</div>

			<div className="space-y-3">
				{SUPPORTED_TOKENS.map((token) => {
					const ticker = tickers[token.symbol]
					const isPositive = ticker && Number.parseFloat(ticker.priceChangePercent) >= 0

					return (
						<div
							className={cn(
								"flex items-center justify-between rounded-lg p-3",
								"bg-zinc-800/50 transition-colors",
								ticker?.direction === "up" && "animate-flash-green",
								ticker?.direction === "down" && "animate-flash-red",
							)}
							key={token.symbol}
						>
							<div className="flex items-center gap-3">
								<span className="text-2xl">{token.icon}</span>
								<div>
									<div className="font-medium">{token.symbol}</div>
									<div className="text-sm text-zinc-500">{token.name}</div>
								</div>
							</div>

							<div className="text-right">
								<div className="font-medium font-mono text-lg">
									${ticker ? formatPrice(ticker.price) : "—"}
								</div>
								<div
									className={cn(
										"font-mono text-sm",
										isPositive ? "text-green-500" : "text-red-500",
									)}
								>
									{ticker ? formatPercent(ticker.priceChangePercent) : "—"}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
