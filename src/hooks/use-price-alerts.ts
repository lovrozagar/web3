"use client"

import { useCallback, useRef, useSyncExternalStore } from "react"
import { toast } from "sonner"

const STORAGE_KEY = "dex-price-alerts"

export interface PriceAlert {
	id: string
	symbol: string
	targetPrice: number
	direction: "above" | "below"
	createdAt: number
	triggered: boolean
}

/* external store for cross-tab sync */
let alerts: PriceAlert[] = []
const listeners: Set<() => void> = new Set()

/* cached empty array for server snapshot to avoid infinite loop */
const EMPTY_ALERTS: PriceAlert[] = []

function getSnapshot(): PriceAlert[] {
	return alerts
}

function getServerSnapshot(): PriceAlert[] {
	return EMPTY_ALERTS
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

function loadAlerts(): PriceAlert[] {
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

function saveAlerts(alertList: PriceAlert[]): void {
	if (typeof window === "undefined") return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(alertList))
	} catch {
		/* localstorage full */
	}
}

/* initialize on client */
if (typeof window !== "undefined") {
	alerts = loadAlerts()

	/* listen for changes from other tabs */
	window.addEventListener("storage", (e) => {
		if (e.key === STORAGE_KEY && e.newValue) {
			try {
				alerts = JSON.parse(e.newValue)
				emitChange()
			} catch {
				/* invalid json */
			}
		}
	})
}

export interface UsePriceAlertsReturn {
	alerts: PriceAlert[]
	addAlert: (symbol: string, targetPrice: number, direction: "above" | "below") => void
	removeAlert: (id: string) => void
	clearTriggered: () => void
	checkAlerts: (prices: Record<string, number>) => void
}

export function usePriceAlerts(): UsePriceAlertsReturn {
	const currentAlerts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
	const notifiedRef = useRef<Set<string>>(new Set())

	const addAlert = useCallback(
		(symbol: string, targetPrice: number, direction: "above" | "below") => {
			const newAlert: PriceAlert = {
				createdAt: Date.now(),
				direction,
				id: `${symbol}-${direction}-${targetPrice}-${Date.now()}`,
				symbol,
				targetPrice,
				triggered: false,
			}
			alerts = [...alerts, newAlert]
			saveAlerts(alerts)
			emitChange()
			toast.success(`Alert set: ${symbol} ${direction} $${targetPrice.toLocaleString()}`)
		},
		[],
	)

	const removeAlert = useCallback((id: string) => {
		alerts = alerts.filter((a) => a.id !== id)
		saveAlerts(alerts)
		emitChange()
	}, [])

	const clearTriggered = useCallback(() => {
		alerts = alerts.filter((a) => !a.triggered)
		saveAlerts(alerts)
		emitChange()
	}, [])

	const checkAlerts = useCallback((prices: Record<string, number>) => {
		let updated = false
		const updatedAlerts = alerts.map((alert) => {
			if (alert.triggered) return alert

			const currentPrice = prices[alert.symbol]
			if (currentPrice === undefined) return alert

			const shouldTrigger =
				(alert.direction === "above" && currentPrice >= alert.targetPrice) ||
				(alert.direction === "below" && currentPrice <= alert.targetPrice)

			if (shouldTrigger && !notifiedRef.current.has(alert.id)) {
				notifiedRef.current.add(alert.id)
				toast.info(
					`${alert.symbol} is now ${alert.direction === "above" ? "above" : "below"} $${alert.targetPrice.toLocaleString()}!`,
					{
						description: `Current price: $${currentPrice.toLocaleString()}`,
						duration: 10000,
					},
				)
				updated = true
				return { ...alert, triggered: true }
			}

			return alert
		})

		if (updated) {
			alerts = updatedAlerts
			saveAlerts(alerts)
			emitChange()
		}
	}, [])

	return {
		addAlert,
		alerts: currentAlerts,
		checkAlerts,
		clearTriggered,
		removeAlert,
	}
}
