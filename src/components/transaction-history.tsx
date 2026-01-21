"use client"

import { useAccount } from "wagmi"
import {
	formatRelativeTime,
	type Transaction,
	type TransactionStatus,
	useTransactionHistory,
} from "@/hooks/use-transaction-history"
import { getExplorerTxUrl } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { WalletNotConnected } from "./wallet-not-connected"

const STATUS_ICONS: Record<TransactionStatus, string> = {
	confirmed: "✓",
	failed: "✕",
	pending: "◐",
}

const STATUS_COLORS: Record<TransactionStatus, string> = {
	confirmed: "text-green-400",
	failed: "text-red-400",
	pending: "text-amber-400 animate-spin",
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
	const explorerUrl = getExplorerTxUrl(transaction.chainId, transaction.hash)

	return (
		<div className="flex items-center justify-between border-border border-b py-3 last:border-0">
			<div className="flex items-center gap-3">
				<span className={cn("w-6 text-center text-lg", STATUS_COLORS[transaction.status])}>
					{STATUS_ICONS[transaction.status]}
				</span>
				<div>
					<div className="text-sm text-ui-fg-subtle">
						{transaction.fromAmount} {transaction.fromToken} → {transaction.toAmount}{" "}
						{transaction.toToken}
					</div>
					<div className="flex items-center gap-2 text-ui-fg-muted text-xs">
						<span>{formatRelativeTime(transaction.timestamp)}</span>
						{transaction.status === "failed" && transaction.error && (
							<span className="text-red-400">{transaction.error}</span>
						)}
					</div>
				</div>
			</div>
			<a
				className="text-blue-400 text-xs transition-colors hover:text-blue-300"
				href={explorerUrl}
				rel="noopener noreferrer"
				target="_blank"
			>
				View ↗
			</a>
		</div>
	)
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-6 text-center">
			<div className="mb-2 text-3xl opacity-50">📋</div>
			<div className="text-sm text-ui-fg-subtle">No transactions yet</div>
			<div className="mt-1 text-ui-fg-muted text-xs">Your swap history will appear here</div>
		</div>
	)
}

export function TransactionHistory() {
	const { isConnected } = useAccount()
	const { clearHistory, transactions } = useTransactionHistory()

	const pendingCount = transactions.filter((tx) => tx.status === "pending").length

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
			<div className="flex items-center justify-between border-border border-b px-2 py-2 sm:px-4 sm:py-3">
				<div className="flex items-center gap-2">
					<svg
						className="h-4 w-4 text-blue-400"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<h3 className="font-bold text-[13px] text-foreground sm:text-[15px]">
						Recent Transactions
					</h3>
					{pendingCount > 0 && (
						<span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-medium text-[10px] text-amber-400 sm:text-xs">
							{pendingCount} pending
						</span>
					)}
				</div>
				{transactions.length > 0 && (
					<button
						className="text-[10px] text-ui-fg-muted transition-colors hover:text-ui-fg-subtle sm:text-xs"
						onClick={clearHistory}
						type="button"
					>
						Clear
					</button>
				)}
			</div>

			{!isConnected && <WalletNotConnected message="Connect to view transactions" />}
			{isConnected && transactions.length === 0 && (
				<div className="p-2 sm:p-4">
					<EmptyState />
				</div>
			)}
			{isConnected && transactions.length > 0 && (
				<div className="max-h-[300px] overflow-y-auto p-2 sm:p-4">
					{transactions.map((tx) => (
						<TransactionRow key={tx.hash} transaction={tx} />
					))}
				</div>
			)}
		</div>
	)
}

/** Compact version for showing in a dropdown or sidebar */
export function TransactionHistoryCompact() {
	const { transactions } = useTransactionHistory()

	if (transactions.length === 0) return null

	const recent = transactions.slice(0, 3)
	const pendingCount = transactions.filter((tx) => tx.status === "pending").length

	return (
		<div className="rounded-lg bg-ui-bg-field/50 p-3">
			{pendingCount > 0 && (
				<div className="mb-2 text-amber-400 text-xs">
					{pendingCount} transaction{pendingCount > 1 ? "s" : ""} pending
				</div>
			)}
			<div className="space-y-2">
				{recent.map((tx) => (
					<div className="flex items-center gap-2 text-xs" key={tx.hash}>
						<span className={STATUS_COLORS[tx.status]}>{STATUS_ICONS[tx.status]}</span>
						<span className="truncate text-ui-fg-subtle">
							{tx.fromToken} → {tx.toToken}
						</span>
						<span className="text-ui-fg-muted">{formatRelativeTime(tx.timestamp)}</span>
					</div>
				))}
			</div>
		</div>
	)
}
