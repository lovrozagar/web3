"use client"

import { useCallback, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { cn, formatPrice } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/types"

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0]

export function SwapInterface() {
	const { isConnected } = useAccount()
	const { tickers } = useBinanceTicker()

	const [fromToken, setFromToken] = useState("ETH")
	const [toToken, setToToken] = useState("USDT")
	const [fromAmount, setFromAmount] = useState("")
	const [slippage, setSlippage] = useState(0.5)

	const toAmount = useMemo(() => {
		if (!fromAmount || fromToken === "USDT") return ""
		const ticker = tickers[fromToken]
		if (!ticker) return ""
		const price = Number.parseFloat(ticker.price)
		const amount = Number.parseFloat(fromAmount)
		if (Number.isNaN(amount)) return ""
		return (amount * price).toFixed(2)
	}, [fromAmount, fromToken, tickers])

	const priceImpact = useMemo(() => {
		const amount = Number.parseFloat(fromAmount)
		if (Number.isNaN(amount) || amount === 0) return null
		if (amount < 1) return 0.01
		if (amount < 10) return 0.05
		if (amount < 100) return 0.15
		return 0.5
	}, [fromAmount])

	const handleSwapTokens = useCallback(() => {
		setFromToken(toToken)
		setToToken(fromToken)
		setFromAmount("")
	}, [fromToken, toToken])

	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-lg">Swap</h2>
				<div className="flex items-center gap-1">
					{SLIPPAGE_OPTIONS.map((option) => (
						<button
							className={cn(
								"rounded px-2 py-1 font-medium text-xs transition-colors",
								slippage === option
									? "bg-blue-500 text-white"
									: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
							)}
							key={option}
							onClick={() => setSlippage(option)}
							type="button"
						>
							{option}%
						</button>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<div className="rounded-lg bg-zinc-800 p-3">
					<div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
						<span>From</span>
						<span>Balance: —</span>
					</div>
					<div className="flex items-center gap-3">
						<input
							className={cn(
								"flex-1 bg-transparent font-medium text-2xl outline-none",
								"placeholder:text-zinc-600",
							)}
							onChange={(e) => setFromAmount(e.target.value)}
							placeholder="0.0"
							type="text"
							value={fromAmount}
						/>
						<select
							className="rounded-lg bg-zinc-700 px-3 py-2 font-medium outline-none"
							onChange={(e) => setFromToken(e.target.value)}
							value={fromToken}
						>
							{SUPPORTED_TOKENS.map((token) => (
								<option key={token.symbol} value={token.symbol}>
									{token.icon} {token.symbol}
								</option>
							))}
							<option value="USDT">💵 USDT</option>
						</select>
					</div>
				</div>

				<div className="flex justify-center">
					<button
						className={cn(
							"rounded-full bg-zinc-800 p-2 transition-colors hover:bg-zinc-700",
							"-my-4 relative z-10 border-4 border-zinc-900",
						)}
						onClick={handleSwapTokens}
						type="button"
					>
						<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</button>
				</div>

				<div className="rounded-lg bg-zinc-800 p-3">
					<div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
						<span>To</span>
						<span>Balance: —</span>
					</div>
					<div className="flex items-center gap-3">
						<input
							className="flex-1 bg-transparent font-medium text-2xl outline-none placeholder:text-zinc-600"
							placeholder="0.0"
							readOnly
							type="text"
							value={toAmount}
						/>
						<select
							className="rounded-lg bg-zinc-700 px-3 py-2 font-medium outline-none"
							onChange={(e) => setToToken(e.target.value)}
							value={toToken}
						>
							<option value="USDT">💵 USDT</option>
							{SUPPORTED_TOKENS.map((token) => (
								<option key={token.symbol} value={token.symbol}>
									{token.icon} {token.symbol}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{fromAmount && toAmount && (
				<div className="mt-4 space-y-2 rounded-lg bg-zinc-800/50 p-3 text-sm">
					<div className="flex items-center justify-between">
						<span className="text-zinc-500">Rate</span>
						<span>
							1 {fromToken} = ${formatPrice(tickers[fromToken]?.price ?? "0")}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-zinc-500">Price Impact</span>
						<span className={cn(priceImpact && priceImpact > 0.1 ? "text-yellow-500" : "")}>
							{priceImpact ? `~${priceImpact}%` : "—"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-zinc-500">Slippage Tolerance</span>
						<span>{slippage}%</span>
					</div>
				</div>
			)}

			<button
				className={cn(
					"mt-4 w-full rounded-lg py-3 font-semibold transition-colors",
					isConnected
						? "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500"
						: "bg-blue-500 text-white",
				)}
				disabled={!isConnected || !fromAmount}
				type="button"
			>
				{isConnected ? (fromAmount ? "Swap (Demo)" : "Enter amount") : "Connect Wallet"}
			</button>
		</div>
	)
}
