"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useAccount } from "wagmi"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { cn, formatPrice } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/types"

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0]

const ALL_TOKENS = [
	...SUPPORTED_TOKENS,
	{ decimals: 6, icon: "💵", name: "Tether USD", symbol: "USDT" },
]

interface TokenDropdownProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (symbol: string) => void
	selectedToken: string
	excludeToken: string
	buttonRef: React.RefObject<HTMLButtonElement | null>
}

function TokenDropdown({
	isOpen,
	onClose,
	onSelect,
	selectedToken,
	excludeToken,
	buttonRef,
}: TokenDropdownProps) {
	const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			setPosition({
				left: rect.right - 192, // 192px = w-48
				top: rect.bottom + 8,
			})
		} else {
			setPosition(null)
		}
	}, [isOpen, buttonRef])

	useEffect(() => {
		if (!isOpen) return
		function handleClickOutside(event: MouseEvent) {
			if (buttonRef.current?.contains(event.target as Node)) return
			onClose()
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [isOpen, onClose, buttonRef])

	if (!isOpen || !position) return null

	return createPortal(
		<div
			className="fixed z-50 w-48 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl"
			style={{ left: position.left, top: position.top }}
		>
			{ALL_TOKENS.filter((t) => t.symbol !== excludeToken).map((token) => (
				<button
					className={cn(
						"flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-700",
						token.symbol === selectedToken && "bg-zinc-700/50",
					)}
					key={token.symbol}
					onClick={() => onSelect(token.symbol)}
					type="button"
				>
					<span className="text-lg">{token.icon}</span>
					<div>
						<div className="font-semibold text-sm text-white">{token.symbol}</div>
						<div className="text-xs text-zinc-500">{token.name}</div>
					</div>
				</button>
			))}
		</div>,
		document.body,
	)
}

export function SwapInterface() {
	const { isConnected } = useAccount()
	const { openConnectModal } = useConnectModal()
	const { tickers } = useBinanceTicker()

	const [fromToken, setFromToken] = useState("ETH")
	const [toToken, setToToken] = useState("USDT")
	const [fromAmount, setFromAmount] = useState("")
	const [slippage, setSlippage] = useState(0.5)
	const [openSelector, setOpenSelector] = useState<"from" | "to" | null>(null)

	const handleAmountChange = useCallback((value: string) => {
		// Allow empty string, numbers, and single decimal point
		if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
			setFromAmount(value)
		}
	}, [])

	const fromButtonRef = useRef<HTMLButtonElement>(null)
	const toButtonRef = useRef<HTMLButtonElement>(null)

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

	const fromTokenData = ALL_TOKENS.find((t) => t.symbol === fromToken)
	const toTokenData = ALL_TOKENS.find((t) => t.symbol === toToken)

	const getButtonStyle = () => {
		if (isConnected && fromAmount) {
			return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:from-blue-600 hover:to-blue-700"
		}
		if (isConnected) {
			return "cursor-not-allowed bg-zinc-800 text-zinc-500"
		}
		return "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
	}

	const getButtonText = () => {
		if (!isConnected) return "Connect Wallet"
		return fromAmount ? "Swap (Demo)" : "Enter an amount"
	}

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/80 backdrop-blur-sm">
			<div className="flex items-center justify-between border-zinc-800/50 border-b px-2 py-2 sm:px-4 sm:py-3">
				<h2 className="font-bold text-[13px] text-white sm:text-[15px]">Swap</h2>
				<div className="flex items-center gap-0.5">
					{SLIPPAGE_OPTIONS.map((option) => (
						<button
							className={cn(
								"cursor-pointer rounded-md px-1.5 py-0.5 font-semibold text-[9px] transition-all duration-150 sm:px-2.5 sm:py-1 sm:text-[11px]",
								slippage === option
									? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
									: "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300",
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

			<div className="p-2 sm:p-4">
				<div className="rounded-xl bg-zinc-800/60 p-2 transition-colors focus-within:bg-zinc-800/80 sm:p-4">
					<div className="mb-1 flex items-center justify-between text-[10px] text-zinc-500 sm:mb-2 sm:text-[12px]">
						<span>From</span>
						<span className="flex items-center gap-1">
							<span>Balance:</span>
							<span className="text-zinc-400">—</span>
						</span>
					</div>
					<div className="flex items-center gap-1.5 sm:gap-3">
						<input
							className={cn(
								"min-w-0 flex-1 rounded-lg bg-transparent font-semibold text-lg tabular-nums outline-none sm:text-2xl",
								"text-white placeholder:text-zinc-500",
							)}
							inputMode="decimal"
							onChange={(e) => handleAmountChange(e.target.value)}
							placeholder="0.0"
							type="text"
							value={fromAmount}
						/>
						<button
							className={cn(
								"flex shrink-0 cursor-pointer items-center gap-1 rounded-xl px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2",
								"bg-zinc-700/80 transition-colors hover:bg-zinc-700",
								"border border-zinc-600/50",
							)}
							onClick={() => setOpenSelector(openSelector === "from" ? null : "from")}
							ref={fromButtonRef}
							type="button"
						>
							<span className="text-sm sm:text-lg">{fromTokenData?.icon}</span>
							<span className="font-bold text-[12px] sm:text-[15px]">{fromToken}</span>
							<svg
								className={cn(
									"h-2.5 w-2.5 text-zinc-400 transition-transform sm:h-4 sm:w-4",
									openSelector === "from" && "rotate-180",
								)}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M19 9l-7 7-7-7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
						<TokenDropdown
							buttonRef={fromButtonRef}
							excludeToken={toToken}
							isOpen={openSelector === "from"}
							onClose={() => setOpenSelector(null)}
							onSelect={(symbol) => {
								setFromToken(symbol)
								setOpenSelector(null)
							}}
							selectedToken={fromToken}
						/>
					</div>
				</div>

				<div className="-my-1.5 sm:-my-2 relative z-10 flex justify-center">
					<button
						className={cn(
							"cursor-pointer rounded-xl bg-zinc-800 p-1.5 transition-all duration-200 sm:p-2.5",
							"border-[3px] border-zinc-900 hover:bg-zinc-700 sm:border-4",
							"transform hover:rotate-180",
						)}
						onClick={handleSwapTokens}
						type="button"
					>
						<svg
							className="h-3 w-3 text-zinc-300 sm:h-4 sm:w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</button>
				</div>

				<div className="rounded-xl bg-zinc-800/60 p-2 transition-colors sm:p-4">
					<div className="mb-1 flex items-center justify-between text-[10px] text-zinc-500 sm:mb-2 sm:text-[12px]">
						<span>To</span>
						<span className="flex items-center gap-1">
							<span>Balance:</span>
							<span className="text-zinc-400">—</span>
						</span>
					</div>
					<div className="flex items-center gap-1.5 sm:gap-3">
						<input
							className="min-w-0 flex-1 rounded-lg bg-transparent font-semibold text-lg text-white tabular-nums outline-none placeholder:text-zinc-500 sm:text-2xl"
							placeholder="0.0"
							readOnly
							type="text"
							value={toAmount}
						/>
						<button
							className={cn(
								"flex shrink-0 cursor-pointer items-center gap-1 rounded-xl px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2",
								"bg-zinc-700/80 transition-colors hover:bg-zinc-700",
								"border border-zinc-600/50",
							)}
							onClick={() => setOpenSelector(openSelector === "to" ? null : "to")}
							ref={toButtonRef}
							type="button"
						>
							<span className="text-sm sm:text-lg">{toTokenData?.icon}</span>
							<span className="font-bold text-[12px] sm:text-[15px]">{toToken}</span>
							<svg
								className={cn(
									"h-2.5 w-2.5 text-zinc-400 transition-transform sm:h-4 sm:w-4",
									openSelector === "to" && "rotate-180",
								)}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M19 9l-7 7-7-7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
						<TokenDropdown
							buttonRef={toButtonRef}
							excludeToken={fromToken}
							isOpen={openSelector === "to"}
							onClose={() => setOpenSelector(null)}
							onSelect={(symbol) => {
								setToToken(symbol)
								setOpenSelector(null)
							}}
							selectedToken={toToken}
						/>
					</div>
				</div>

				{fromAmount && toAmount && (
					<div className="mt-2 space-y-1 rounded-xl bg-zinc-800/40 p-2 sm:mt-4 sm:space-y-2 sm:p-3">
						<div className="flex items-center justify-between text-[10px] sm:text-[13px]">
							<span className="text-zinc-500">Rate</span>
							<span className="font-mono text-zinc-200 tabular-nums">
								1 {fromToken} = ${formatPrice(tickers[fromToken]?.price ?? "0")}
							</span>
						</div>
						<div className="flex items-center justify-between text-[10px] sm:text-[13px]">
							<span className="text-zinc-500">Price Impact</span>
							<span
								className={cn(
									"font-mono tabular-nums",
									priceImpact && priceImpact > 0.1 ? "text-amber-400" : "text-zinc-300",
								)}
							>
								{priceImpact ? `~${priceImpact}%` : "—"}
							</span>
						</div>
						<div className="flex items-center justify-between text-[10px] sm:text-[13px]">
							<span className="text-zinc-500">Max Slippage</span>
							<span className="font-mono text-zinc-200 tabular-nums">{slippage}%</span>
						</div>
					</div>
				)}

				<button
					className={cn(
						"mt-2 w-full cursor-pointer rounded-xl py-2.5 font-bold text-[13px] transition-all duration-200 sm:mt-4 sm:py-3.5 sm:text-[15px]",
						getButtonStyle(),
					)}
					disabled={isConnected && !fromAmount}
					onClick={!isConnected ? openConnectModal : undefined}
					type="button"
				>
					{getButtonText()}
				</button>
			</div>
		</div>
	)
}
