"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "dex-favorite-tokens"

/* external store for cross-tab sync */
let favorites: Set<string> = new Set()
const listeners: Set<() => void> = new Set()

/* cached empty set for server snapshot to avoid infinite loop */
const EMPTY_SET: Set<string> = new Set()

function getSnapshot(): Set<string> {
	return favorites
}

function getServerSnapshot(): Set<string> {
	return EMPTY_SET
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

function loadFavorites(): Set<string> {
	if (typeof window === "undefined") return new Set()
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			return new Set(JSON.parse(stored))
		}
	} catch {
		/* invalid json */
	}
	return new Set()
}

function saveFavorites(favs: Set<string>): void {
	if (typeof window === "undefined") return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...favs]))
	} catch {
		/* localstorage full */
	}
}

/* initialize on client */
if (typeof window !== "undefined") {
	favorites = loadFavorites()

	/* listen for changes from other tabs */
	window.addEventListener("storage", (e) => {
		if (e.key === STORAGE_KEY && e.newValue) {
			try {
				favorites = new Set(JSON.parse(e.newValue))
				emitChange()
			} catch {
				/* invalid json */
			}
		}
	})
}

export interface UseFavoriteTokensReturn {
	favorites: Set<string>
	isFavorite: (symbol: string) => boolean
	toggleFavorite: (symbol: string) => void
	addFavorite: (symbol: string) => void
	removeFavorite: (symbol: string) => void
}

export function useFavoriteTokens(): UseFavoriteTokensReturn {
	const currentFavorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

	const isFavorite = useCallback(
		(symbol: string) => currentFavorites.has(symbol),
		[currentFavorites],
	)

	const addFavorite = useCallback((symbol: string) => {
		favorites = new Set([...favorites, symbol])
		saveFavorites(favorites)
		emitChange()
	}, [])

	const removeFavorite = useCallback((symbol: string) => {
		favorites = new Set([...favorites].filter((s) => s !== symbol))
		saveFavorites(favorites)
		emitChange()
	}, [])

	const toggleFavorite = useCallback(
		(symbol: string) => {
			if (favorites.has(symbol)) {
				removeFavorite(symbol)
			} else {
				addFavorite(symbol)
			}
		},
		[addFavorite, removeFavorite],
	)

	return {
		addFavorite,
		favorites: currentFavorites,
		isFavorite,
		removeFavorite,
		toggleFavorite,
	}
}
