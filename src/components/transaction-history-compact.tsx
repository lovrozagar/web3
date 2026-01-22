"use client"

import { TRANSACTION_STATUS_COLORS, TRANSACTION_STATUS_ICONS } from "@/constants/ui"
import { type TransactionStatus, useTransactionHistory } from "@/hooks/use-transaction-history"
import { formatRelativeTime } from "@/utils/format"

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
						<span className={TRANSACTION_STATUS_COLORS[tx.status as TransactionStatus]}>
							{TRANSACTION_STATUS_ICONS[tx.status as TransactionStatus]}
						</span>
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
