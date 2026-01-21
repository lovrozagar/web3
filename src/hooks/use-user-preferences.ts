"use client"

import { useCallback, useSyncExternalStore } from "react"

export type SlippageTolerance = 0.1 | 0.5 | 1 | 2 | 3
export type OrderBookDepth = 10 | 20

export interface UserPreferences {
	defaultSlippage: SlippageTolerance
	orderBookDepth: OrderBookDepth
	/* update speed for order book in ms */
	orderBookUpdateSpeed: 100 | 250 | 500 | 1000
}

const STORAGE_KEY = "dex-user-preferences"

const DEFAULT_PREFERENCES: UserPreferences = {
	defaultSlippage: 0.5,
	orderBookDepth: 20,
	orderBookUpdateSpeed: 250,
}

/* external store for cross-tab sync */
let preferences: UserPreferences = DEFAULT_PREFERENCES
const listeners: Set<() => void> = new Set()

function getSnapshot(): UserPreferences {
	return preferences
}

function getServerSnapshot(): UserPreferences {
	return DEFAULT_PREFERENCES
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

function loadPreferences(): UserPreferences {
	if (typeof window === "undefined") return DEFAULT_PREFERENCES

	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			const parsed = JSON.parse(stored) as Partial<UserPreferences>
			/* merge with defaults to handle missing keys from older versions */
			return {
				...DEFAULT_PREFERENCES,
				...parsed,
			}
		}
	} catch {
		/* invalid json, use defaults */
	}
	return DEFAULT_PREFERENCES
}

function savePreferences(prefs: UserPreferences): void {
	if (typeof window === "undefined") return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
	} catch {
		/* localstorage full or unavailable */
	}
}

/* initialize on client */
if (typeof window !== "undefined") {
	preferences = loadPreferences()

	/* listen for changes from other tabs */
	window.addEventListener("storage", (e) => {
		if (e.key === STORAGE_KEY && e.newValue) {
			try {
				preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(e.newValue) }
				emitChange()
			} catch {
				/* invalid json */
			}
		}
	})
}

export interface UseUserPreferencesReturn {
	preferences: UserPreferences
	resetPreferences: () => void
	setDefaultSlippage: (slippage: SlippageTolerance) => void
	setOrderBookDepth: (depth: OrderBookDepth) => void
	setOrderBookUpdateSpeed: (speed: UserPreferences["orderBookUpdateSpeed"]) => void
	updatePreferences: (updates: Partial<UserPreferences>) => void
}

export function useUserPreferences(): UseUserPreferencesReturn {
	const currentPreferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

	const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
		preferences = { ...preferences, ...updates }
		savePreferences(preferences)
		emitChange()
	}, [])

	const setDefaultSlippage = useCallback(
		(defaultSlippage: SlippageTolerance) => {
			updatePreferences({ defaultSlippage })
		},
		[updatePreferences],
	)

	const setOrderBookDepth = useCallback(
		(orderBookDepth: OrderBookDepth) => {
			updatePreferences({ orderBookDepth })
		},
		[updatePreferences],
	)

	const setOrderBookUpdateSpeed = useCallback(
		(orderBookUpdateSpeed: UserPreferences["orderBookUpdateSpeed"]) => {
			updatePreferences({ orderBookUpdateSpeed })
		},
		[updatePreferences],
	)

	const resetPreferences = useCallback(() => {
		preferences = DEFAULT_PREFERENCES
		savePreferences(preferences)
		emitChange()
	}, [])

	return {
		preferences: currentPreferences,
		resetPreferences,
		setDefaultSlippage,
		setOrderBookDepth,
		setOrderBookUpdateSpeed,
		updatePreferences,
	}
}
