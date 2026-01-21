"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { useAccount, useBalance, useChainId } from "wagmi"
import { useBinanceTicker } from "@/hooks/use-binance-ticker"
import { useTransactionHistory } from "@/hooks/use-transaction-history"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { getExplorerTxUrl } from "@/lib/constants"
import { cn, formatPrice } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/types"

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 2.0, 3.0]

const ALL_TOKENS = [
	...SUPPORTED_TOKENS,
	{ decimals: 6, icon: "💵", name: "Tether USD", symbol: "USDT" },
]

type SwapState = "idle" | "confirming" | "pending" | "success" | "error"

interface TokenDropdownProps {
	buttonRef: React.RefObject<HTMLButtonElement | null>
	excludeToken: string
	isOpen: boolean
	onClose: () => void
	onSelect: (symbol: string) => void
	selectedToken: string
}

function TokenDropdown({
	buttonRef,
	excludeToken,
	isOpen,
	onClose,
	onSelect,
	selectedToken,
}: TokenDropdownProps) {
	const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			setPosition({
				left: rect.right - 192,
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
			className="fixed z-50 w-48 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
			style={{ left: position.left, top: position.top }}
		>
			{ALL_TOKENS.filter((t) => t.symbol !== excludeToken).map((token) => (
				<button
					className={cn(
						"flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-ui-bg-hover",
						token.symbol === selectedToken && "bg-ui-bg-hover/50",
					)}
					key={token.symbol}
					onClick={() => onSelect(token.symbol)}
					type="button"
				>
					<span className="text-lg">{token.icon}</span>
					<div>
						<div className="font-semibold text-foreground text-sm">{token.symbol}</div>
						<div className="text-ui-fg-muted text-xs">{token.name}</div>
					</div>
				</button>
			))}
		</div>,
		document.body,
	)
}

interface SwapInterfaceProps {
	/* pre-fill the from amount from order book click */
	initialPrice?: string
}

export function SwapInterface({ initialPrice }: SwapInterfaceProps) {
	const { address, isConnected } = useAccount()
	const chainId = useChainId()
	const { openConnectModal } = useConnectModal()
	const { tickers } = useBinanceTicker()
	const { addTransaction, updateTransaction } = useTransactionHistory()
	const { preferences } = useUserPreferences()

	const [fromToken, setFromToken] = useState("ETH")
	const [toToken, setToToken] = useState("USDT")
	const [fromAmount, setFromAmount] = useState("")
	const [slippage, setSlippage] = useState<number | null>(null)
	const [openSelector, setOpenSelector] = useState<"from" | "to" | null>(null)
	const [swapState, setSwapState] = useState<SwapState>("idle")

	/* initialize slippage from user preferences */
	useEffect(() => {
		if (slippage === null) {
			setSlippage(preferences.defaultSlippage)
		}
	}, [slippage, preferences.defaultSlippage])

	/* use preference as fallback until state is initialized */
	const effectiveSlippage = slippage ?? preferences.defaultSlippage

	/* get eth balance */
	const { data: balanceData } = useBalance({
		address,
		query: { enabled: isConnected && fromToken === "ETH" },
	})

	const balance = useMemo(() => {
		if (!balanceData) return null
		/* convert bigint value to number with decimals */
		const value = Number(balanceData.value) / 10 ** balanceData.decimals
		return value
	}, [balanceData])

	/* apply initial price from order book click */
	useEffect(() => {
		if (initialPrice) {
			setFromAmount(initialPrice)
		}
	}, [initialPrice])

	const handleAmountChange = useCallback((value: string) => {
		if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
			setFromAmount(value)
		}
	}, [])

	const handleMaxClick = useCallback(() => {
		if (balance) {
			/* leave some for gas */
			const maxAmount = Math.max(0, balance - 0.01)
			setFromAmount(maxAmount.toFixed(6))
		}
	}, [balance])

	const fromButtonRef = useRef<HTMLButtonElement>(null)
	const toButtonRef = useRef<HTMLButtonElement>(null)

	const fromAmountNum = useMemo(() => {
		const amount = Number.parseFloat(fromAmount)
		return Number.isNaN(amount) ? 0 : amount
	}, [fromAmount])

	const toAmount = useMemo(() => {
		if (!fromAmount || fromToken === "USDT") return ""
		const ticker = tickers[fromToken]
		if (!ticker) return ""
		const price = Number.parseFloat(ticker.price)
		if (Number.isNaN(fromAmountNum)) return ""
		return (fromAmountNum * price).toFixed(2)
	}, [fromAmount, fromAmountNum, fromToken, tickers])

	const minReceived = useMemo(() => {
		if (!toAmount) return ""
		const amount = Number.parseFloat(toAmount)
		const minAmount = amount * (1 - effectiveSlippage / 100)
		return minAmount.toFixed(2)
	}, [toAmount, effectiveSlippage])

	const priceImpact = useMemo(() => {
		if (fromAmountNum === 0) return null
		if (fromAmountNum < 1) return 0.01
		if (fromAmountNum < 10) return 0.05
		if (fromAmountNum < 100) return 0.15
		return 0.5
	}, [fromAmountNum])

	const handleSwapTokens = useCallback(() => {
		setFromToken(toToken)
		setToToken(fromToken)
		setFromAmount("")
	}, [fromToken, toToken])

	/* validation */
	const insufficientBalance = useMemo(() => {
		if (!balance || fromAmountNum === 0) return false
		return fromAmountNum > balance
	}, [balance, fromAmountNum])

	const canSwap = useMemo(() => {
		return isConnected && fromAmountNum > 0 && !insufficientBalance && swapState === "idle"
	}, [isConnected, fromAmountNum, insufficientBalance, swapState])

	const handleSwap = useCallback(async () => {
		if (!canSwap || !address) return

		setSwapState("confirming")
		toast.info("Confirm transaction in your wallet...")

		/* simulate wallet confirmation */
		await new Promise((resolve) => setTimeout(resolve, 1500))

		setSwapState("pending")
		const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`

		/* add to transaction history */
		addTransaction({
			chainId,
			fromAmount,
			fromToken,
			hash: mockTxHash,
			toAmount: toAmount || "0",
			toToken,
		})

		toast.loading("Transaction pending...", {
			description: (
				<a
					className="text-blue-400 underline"
					href={getExplorerTxUrl(chainId, mockTxHash)}
					rel="noopener noreferrer"
					target="_blank"
				>
					View on Explorer
				</a>
			),
			id: mockTxHash,
		})

		/* simulate blockchain confirmation */
		await new Promise((resolve) => setTimeout(resolve, 3000))

		/* 90% success rate for demo */
		const success = Math.random() > 0.1

		if (success) {
			setSwapState("success")
			updateTransaction(mockTxHash, { status: "confirmed" })
			toast.success("Swap successful!", {
				description: `Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
				id: mockTxHash,
			})
			setFromAmount("")
		} else {
			setSwapState("error")
			updateTransaction(mockTxHash, {
				error: "Transaction reverted",
				status: "failed",
			})
			toast.error("Swap failed", {
				description: "Transaction was reverted. Please try again.",
				id: mockTxHash,
			})
		}

		/* reset state after delay */
		setTimeout(() => setSwapState("idle"), 2000)
	}, [
		canSwap,
		address,
		chainId,
		fromAmount,
		fromToken,
		toAmount,
		toToken,
		addTransaction,
		updateTransaction,
	])

	const fromTokenData = ALL_TOKENS.find((t) => t.symbol === fromToken)
	const toTokenData = ALL_TOKENS.find((t) => t.symbol === toToken)

	const getButtonStyle = () => {
		if (swapState === "confirming" || swapState === "pending") {
			return "cursor-wait bg-blue-500/50 text-white"
		}
		if (swapState === "success") {
			return "bg-emerald-500 text-white"
		}
		if (swapState === "error") {
			return "bg-red-500 text-white"
		}
		if (insufficientBalance) {
			return "cursor-not-allowed bg-red-500/20 text-red-400"
		}
		if (canSwap) {
			return "bg-blue-500 text-white hover:bg-blue-600"
		}
		if (isConnected) {
			return "cursor-not-allowed bg-ui-bg-component text-ui-fg-muted"
		}
		return "bg-blue-500 text-white hover:bg-blue-600"
	}

	const getButtonText = () => {
		if (swapState === "confirming") return "Confirming..."
		if (swapState === "pending") return "Swapping..."
		if (swapState === "success") return "Success!"
		if (swapState === "error") return "Failed"
		if (!isConnected) return "Connect Wallet"
		if (insufficientBalance) return "Insufficient Balance"
		return fromAmountNum > 0 ? "Swap (Demo)" : "Enter an amount"
	}

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-2 py-2 sm:px-4 sm:py-3">
				<h2 className="font-bold text-[13px] text-foreground sm:text-[15px]">Swap</h2>
				<div className="flex items-center gap-0.5">
					{SLIPPAGE_OPTIONS.map((option) => (
						<button
							className={cn(
								"cursor-pointer rounded-md px-1.5 py-0.5 font-semibold text-[9px] transition-all duration-150 sm:px-2.5 sm:py-1 sm:text-[11px]",
								effectiveSlippage === option
									? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
									: "bg-ui-bg-field text-ui-fg-muted hover:bg-ui-bg-hover hover:text-ui-fg-subtle",
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
				{/* from token */}
				<div
					className={cn(
						"rounded-lg bg-ui-bg-field p-2 transition-colors focus-within:bg-ui-bg-component sm:p-4",
						insufficientBalance && "ring-1 ring-red-500/50",
					)}
				>
					<div className="mb-1 flex items-center justify-between text-[10px] text-ui-fg-muted sm:mb-2 sm:text-[12px]">
						<span>From</span>
						<span className="flex items-center gap-1">
							<span>Balance:</span>
							<span className={cn("text-ui-fg-subtle", insufficientBalance && "text-red-400")}>
								{balance !== null ? balance.toFixed(4) : "—"}
							</span>
							{balance !== null && fromToken === "ETH" && (
								<button
									className="ml-1 rounded bg-ui-bg-hover px-1.5 py-0.5 font-medium text-[8px] text-blue-400 transition-colors hover:bg-ui-bg-component sm:text-[10px]"
									onClick={handleMaxClick}
									type="button"
								>
									MAX
								</button>
							)}
						</span>
					</div>
					<div className="flex items-center gap-1.5 sm:gap-3">
						<input
							className={cn(
								"min-w-0 flex-1 rounded-lg bg-transparent font-semibold text-lg tabular-nums outline-none sm:text-2xl",
								"text-foreground placeholder:text-ui-fg-muted",
								insufficientBalance && "text-red-400",
							)}
							inputMode="decimal"
							onChange={(e) => handleAmountChange(e.target.value)}
							placeholder="0.0"
							type="text"
							value={fromAmount}
						/>
						<button
							className={cn(
								"flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2",
								"bg-ui-bg-hover transition-colors hover:bg-ui-bg-component",
								"border border-border",
							)}
							onClick={() => setOpenSelector(openSelector === "from" ? null : "from")}
							ref={fromButtonRef}
							type="button"
						>
							<span className="text-sm sm:text-lg">{fromTokenData?.icon}</span>
							<span className="font-bold text-[12px] sm:text-[15px]">{fromToken}</span>
							<svg
								className={cn(
									"h-2.5 w-2.5 text-ui-fg-muted transition-transform sm:h-4 sm:w-4",
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

				{/* swap button */}
				<div className="-my-1.5 sm:-my-2 relative z-10 flex justify-center">
					<button
						className={cn(
							"cursor-pointer rounded-lg bg-ui-bg-component p-1.5 transition-all duration-200 sm:p-2.5",
							"border-[3px] border-card hover:bg-ui-bg-hover sm:border-4",
							"transform hover:rotate-180",
						)}
						onClick={handleSwapTokens}
						type="button"
					>
						<svg
							className="h-3 w-3 text-ui-fg-subtle sm:h-4 sm:w-4"
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

				{/* to token */}
				<div className="rounded-lg bg-ui-bg-field p-2 transition-colors sm:p-4">
					<div className="mb-1 flex items-center justify-between text-[10px] text-ui-fg-muted sm:mb-2 sm:text-[12px]">
						<span>To</span>
						<span className="flex items-center gap-1">
							<span>Balance:</span>
							<span className="text-ui-fg-subtle">—</span>
						</span>
					</div>
					<div className="flex items-center gap-1.5 sm:gap-3">
						<input
							className="min-w-0 flex-1 cursor-default rounded-lg bg-transparent font-semibold text-foreground text-lg tabular-nums outline-none placeholder:text-ui-fg-muted sm:text-2xl"
							placeholder="0.0"
							readOnly
							tabIndex={-1}
							type="text"
							value={toAmount}
						/>
						<button
							className={cn(
								"flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2",
								"bg-ui-bg-hover transition-colors hover:bg-ui-bg-component",
								"border border-border",
							)}
							onClick={() => setOpenSelector(openSelector === "to" ? null : "to")}
							ref={toButtonRef}
							type="button"
						>
							<span className="text-sm sm:text-lg">{toTokenData?.icon}</span>
							<span className="font-bold text-[12px] sm:text-[15px]">{toToken}</span>
							<svg
								className={cn(
									"h-2.5 w-2.5 text-ui-fg-muted transition-transform sm:h-4 sm:w-4",
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

				{/* swap details */}
				{fromAmountNum > 0 && toAmount && (
					<div className="mt-2 space-y-1 rounded-lg bg-ui-bg-field/40 p-2 sm:mt-4 sm:space-y-2 sm:p-3">
						<div className="flex items-center justify-between text-[10px] sm:text-[13px]">
							<span className="text-ui-fg-muted">Rate</span>
							<span className="font-mono text-ui-fg-subtle tabular-nums">
								1 {fromToken} = ${formatPrice(tickers[fromToken]?.price ?? "0")}
							</span>
						</div>
						<div className="flex items-center justify-between text-[10px] sm:text-[13px]">
							<span className="text-ui-fg-muted">Min. Received</span>
							<span className="font-mono text-ui-fg-subtle tabular-nums">
								{minReceived} {toToken}
							</span>
						</div>
						<div className="flex items-center justify-between text-[10px] sm:text-[13px]">
							<span className="text-ui-fg-muted">Price Impact</span>
							<span
								className={cn(
									"font-mono tabular-nums",
									priceImpact && priceImpact > 0.1 ? "text-amber-400" : "text-ui-fg-subtle",
								)}
							>
								{priceImpact ? `~${priceImpact}%` : "—"}
							</span>
						</div>
						<div className="flex items-center justify-between text-[10px] sm:text-[13px]">
							<span className="text-ui-fg-muted">Max Slippage</span>
							<span className="font-mono text-ui-fg-subtle tabular-nums">{effectiveSlippage}%</span>
						</div>
					</div>
				)}

				{/* swap button */}
				<button
					className={cn(
						"mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-[13px] transition-all duration-200 sm:mt-4 sm:py-3.5 sm:text-[15px]",
						getButtonStyle(),
					)}
					disabled={!canSwap && isConnected}
					onClick={!isConnected ? openConnectModal : handleSwap}
					type="button"
				>
					{(swapState === "confirming" || swapState === "pending") && (
						<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								fill="currentColor"
							/>
						</svg>
					)}
					{!isConnected && swapState === "idle" && (
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<rect
								height="14"
								rx="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								width="20"
								x="2"
								y="6"
							/>
							<path d="M16 12h.01" strokeLinecap="round" strokeLinejoin="round" />
							<path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					)}
					{getButtonText()}
				</button>
			</div>
		</div>
	)
}
