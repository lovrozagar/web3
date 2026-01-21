"use client"

import { useCallback, useRef, useSyncExternalStore } from "react"
import { toast } from "sonner"

const STORAGE_KEY = "dex-limit-orders"

export type OrderSide = "buy" | "sell"
export type OrderStatus = "open" | "filled" | "cancelled"

export interface LimitOrder {
	id: string
	side: OrderSide
	tokenFrom: string
	tokenTo: string
	amount: string
	limitPrice: number
	status: OrderStatus
	createdAt: number
	filledAt?: number
}

/* external store for cross-tab sync */
let orders: LimitOrder[] = []
const listeners: Set<() => void> = new Set()

/* cached empty array for server snapshot to avoid infinite loop */
const EMPTY_ORDERS: LimitOrder[] = []

function getSnapshot(): LimitOrder[] {
	return orders
}

function getServerSnapshot(): LimitOrder[] {
	return EMPTY_ORDERS
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

function emitChange(): void {
	for (const listener of listeners) {
		listener()
	}
}

function loadOrders(): LimitOrder[] {
	if (typeof window === "undefined") return []
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			return JSON.parse(stored)
		}
	} catch {
		/* invalid json */
	}
	return []
}

function saveOrders(orderList: LimitOrder[]): void {
	if (typeof window === "undefined") return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(orderList))
	} catch {
		/* localstorage full */
	}
}

/* initialize on client */
if (typeof window !== "undefined") {
	orders = loadOrders()

	/* listen for changes from other tabs */
	window.addEventListener("storage", (e) => {
		if (e.key === STORAGE_KEY && e.newValue) {
			try {
				orders = JSON.parse(e.newValue)
				emitChange()
			} catch {
				/* invalid json */
			}
		}
	})
}

export interface UseLimitOrdersReturn {
	orders: LimitOrder[]
	createOrder: (
		side: OrderSide,
		tokenFrom: string,
		tokenTo: string,
		amount: string,
		limitPrice: number,
	) => void
	cancelOrder: (id: string) => void
	clearFilled: () => void
	checkOrders: (prices: Record<string, number>) => void
}

export function useLimitOrders(): UseLimitOrdersReturn {
	const currentOrders = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
	const filledRef = useRef<Set<string>>(new Set())

	const createOrder = useCallback(
		(side: OrderSide, tokenFrom: string, tokenTo: string, amount: string, limitPrice: number) => {
			const newOrder: LimitOrder = {
				amount,
				createdAt: Date.now(),
				id: `${side}-${tokenFrom}-${tokenTo}-${Date.now()}`,
				limitPrice,
				side,
				status: "open",
				tokenFrom,
				tokenTo,
			}
			orders = [newOrder, ...orders]
			saveOrders(orders)
			emitChange()
			toast.success(
				`Limit ${side} order created: ${amount} ${tokenFrom} at $${limitPrice.toLocaleString()}`,
			)
		},
		[],
	)

	const cancelOrder = useCallback((id: string) => {
		orders = orders.map((o) => (o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o))
		saveOrders(orders)
		emitChange()
		toast.info("Order cancelled")
	}, [])

	const clearFilled = useCallback(() => {
		orders = orders.filter((o) => o.status === "open")
		saveOrders(orders)
		emitChange()
	}, [])

	const checkOrders = useCallback((prices: Record<string, number>) => {
		let updated = false
		const updatedOrders = orders.map((order) => {
			if (order.status !== "open") return order

			/* for eth/usdt pairs, check if price condition is met */
			const pairKey = order.tokenFrom === "USDT" ? order.tokenTo : order.tokenFrom
			const currentPrice = prices[pairKey]
			if (currentPrice === undefined) return order

			/* buy order fills when price drops to or below limit */
			/* sell order fills when price rises to or above limit */
			const shouldFill =
				(order.side === "buy" && currentPrice <= order.limitPrice) ||
				(order.side === "sell" && currentPrice >= order.limitPrice)

			if (shouldFill && !filledRef.current.has(order.id)) {
				filledRef.current.add(order.id)
				toast.success(
					`Limit ${order.side} order filled: ${order.amount} ${order.tokenFrom} at $${currentPrice.toLocaleString()}`,
					{ duration: 10000 },
				)
				updated = true
				return { ...order, filledAt: Date.now(), status: "filled" as OrderStatus }
			}

			return order
		})

		if (updated) {
			orders = updatedOrders
			saveOrders(orders)
			emitChange()
		}
	}, [])

	return {
		cancelOrder,
		checkOrders,
		clearFilled,
		createOrder,
		orders: currentOrders,
	}
}
