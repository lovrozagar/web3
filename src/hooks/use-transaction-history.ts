"use client"

import { useCallback, useEffect, useState } from "react"

export type TransactionStatus = "pending" | "confirmed" | "failed"

export interface Transaction {
	/* transaction hash */
	hash: string
	/* chain id */
	chainId: number
	/* transaction status */
	status: TransactionStatus
	/* timestamp when transaction was submitted */
	timestamp: number
	/* from token symbol */
	fromToken: string
	/* to token symbol */
	toToken: string
	/* amount sent */
	fromAmount: string
	/* amount received (estimated for pending) */
	toAmount: string
	/* error message if failed */
	error?: string
}

const STORAGE_KEY = "web3-tx-history"
const MAX_TRANSACTIONS = 50
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 /* 30 days */

function loadTransactions(): Transaction[] {
	if (typeof window === "undefined") return []

	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return []

		const transactions: Transaction[] = JSON.parse(stored)
		/* filter out old transactions */
		const now = Date.now()
		return transactions.filter((tx) => now - tx.timestamp < MAX_AGE_MS)
	} catch {
		console.warn("[TransactionHistory] Failed to load from localStorage")
		return []
	}
}

function saveTransactions(transactions: Transaction[]): void {
	if (typeof window === "undefined") return

	try {
		/* limit to max transactions */
		const limited = transactions.slice(0, MAX_TRANSACTIONS)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
	} catch (error) {
		/* handle quota exceeded */
		if (error instanceof Error && error.name === "QuotaExceededError") {
			/* remove oldest half and try again */
			const half = transactions.slice(0, Math.floor(transactions.length / 2))
			localStorage.setItem(STORAGE_KEY, JSON.stringify(half))
		}
	}
}

export interface UseTransactionHistoryReturn {
	/* add a new pending transaction */
	addTransaction: (tx: Omit<Transaction, "status" | "timestamp">) => void
	/* clear all transaction history */
	clearHistory: () => void
	/* get transactions filtered by status */
	getByStatus: (status: TransactionStatus) => Transaction[]
	/* remove a single transaction */
	removeTransaction: (hash: string) => void
	/* all transactions, newest first */
	transactions: Transaction[]
	/* update transaction status */
	updateTransaction: (hash: string, update: Partial<Pick<Transaction, "status" | "error">>) => void
}

export function useTransactionHistory(): UseTransactionHistoryReturn {
	const [transactions, setTransactions] = useState<Transaction[]>([])

	/* load from localstorage on mount */
	useEffect(() => {
		setTransactions(loadTransactions())
	}, [])

	/* sync across tabs */
	useEffect(() => {
		function handleStorageChange(event: StorageEvent): void {
			if (event.key === STORAGE_KEY) {
				setTransactions(loadTransactions())
			}
		}

		window.addEventListener("storage", handleStorageChange)
		return () => window.removeEventListener("storage", handleStorageChange)
	}, [])

	const addTransaction = useCallback((tx: Omit<Transaction, "status" | "timestamp">) => {
		const newTx: Transaction = {
			...tx,
			status: "pending",
			timestamp: Date.now(),
		}

		setTransactions((prev) => {
			const updated = [newTx, ...prev]
			saveTransactions(updated)
			return updated
		})
	}, [])

	const updateTransaction = useCallback(
		(hash: string, update: Partial<Pick<Transaction, "status" | "error">>) => {
			setTransactions((prev) => {
				const updated = prev.map((tx) => (tx.hash === hash ? { ...tx, ...update } : tx))
				saveTransactions(updated)
				return updated
			})
		},
		[],
	)

	const removeTransaction = useCallback((hash: string) => {
		setTransactions((prev) => {
			const updated = prev.filter((tx) => tx.hash !== hash)
			saveTransactions(updated)
			return updated
		})
	}, [])

	const clearHistory = useCallback(() => {
		setTransactions([])
		localStorage.removeItem(STORAGE_KEY)
	}, [])

	const getByStatus = useCallback(
		(status: TransactionStatus) => {
			return transactions.filter((tx) => tx.status === status)
		},
		[transactions],
	)

	return {
		addTransaction,
		clearHistory,
		getByStatus,
		removeTransaction,
		transactions,
		updateTransaction,
	}
}

/* format relative time for display */
export function formatRelativeTime(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000)

	if (seconds < 60) return "just now"
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
	return `${Math.floor(seconds / 86400)}d ago`
}
