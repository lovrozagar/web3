import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/* import the hook fresh for each test by resetting module */
let useFavoriteTokens: typeof import("@/hooks/use-favorite-tokens").useFavoriteTokens

describe("useFavoriteTokens", () => {
	beforeEach(async () => {
		localStorage.clear()
		vi.clearAllMocks()
		vi.resetModules()
		const module = await import("@/hooks/use-favorite-tokens")
		useFavoriteTokens = module.useFavoriteTokens
	})

	afterEach(() => {
		localStorage.clear()
	})

	describe("initial state", () => {
		it("returns empty favorites when localStorage is empty", () => {
			const { result } = renderHook(() => useFavoriteTokens())
			expect(result.current.isFavorite("BTC")).toBe(false)
			expect(result.current.isFavorite("ETH")).toBe(false)
		})

		it("returns favorites object with expected shape", () => {
			const { result } = renderHook(() => useFavoriteTokens())
			expect(result.current.favorites).toBeDefined()
			expect(typeof result.current.isFavorite).toBe("function")
			expect(typeof result.current.toggleFavorite).toBe("function")
			expect(typeof result.current.addFavorite).toBe("function")
			expect(typeof result.current.removeFavorite).toBe("function")
		})
	})

	describe("toggleFavorite", () => {
		it("adds token to favorites when not favorited", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			expect(result.current.isFavorite("BTC")).toBe(false)

			act(() => {
				result.current.toggleFavorite("BTC")
			})

			expect(result.current.isFavorite("BTC")).toBe(true)
		})

		it("removes token from favorites when already favorited", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			act(() => {
				result.current.toggleFavorite("BTC")
			})
			expect(result.current.isFavorite("BTC")).toBe(true)

			act(() => {
				result.current.toggleFavorite("BTC")
			})

			expect(result.current.isFavorite("BTC")).toBe(false)
		})

		it("persists changes to localStorage", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			act(() => {
				result.current.toggleFavorite("BTC")
			})

			expect(localStorage.setItem).toHaveBeenCalledWith("dex-favorite-tokens", expect.any(String))

			const stored = localStorage.getItem("dex-favorite-tokens")
			expect(stored).toBeTruthy()
			if (stored) {
				expect(JSON.parse(stored)).toContain("BTC")
			}
		})
	})

	describe("addFavorite", () => {
		it("adds a token to favorites", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			act(() => {
				result.current.addFavorite("ETH")
			})

			expect(result.current.isFavorite("ETH")).toBe(true)
		})

		it("can add multiple favorites", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			act(() => {
				result.current.addFavorite("BTC")
				result.current.addFavorite("ETH")
				result.current.addFavorite("SOL")
			})

			expect(result.current.isFavorite("BTC")).toBe(true)
			expect(result.current.isFavorite("ETH")).toBe(true)
			expect(result.current.isFavorite("SOL")).toBe(true)
		})
	})

	describe("removeFavorite", () => {
		it("removes a token from favorites", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			act(() => {
				result.current.addFavorite("BTC")
			})
			expect(result.current.isFavorite("BTC")).toBe(true)

			act(() => {
				result.current.removeFavorite("BTC")
			})
			expect(result.current.isFavorite("BTC")).toBe(false)
		})

		it("does nothing for non-favorited tokens", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			expect(result.current.isFavorite("BTC")).toBe(false)

			act(() => {
				result.current.removeFavorite("BTC")
			})

			expect(result.current.isFavorite("BTC")).toBe(false)
		})
	})

	describe("isFavorite", () => {
		it("returns true for favorited tokens", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			act(() => {
				result.current.addFavorite("BTC")
			})

			expect(result.current.isFavorite("BTC")).toBe(true)
		})

		it("returns false for non-favorited tokens", () => {
			const { result } = renderHook(() => useFavoriteTokens())

			act(() => {
				result.current.addFavorite("BTC")
			})

			expect(result.current.isFavorite("ETH")).toBe(false)
		})
	})

	describe("state persistence", () => {
		it("updates shared state across multiple hook instances", () => {
			const { result: result1 } = renderHook(() => useFavoriteTokens())
			const { result: result2 } = renderHook(() => useFavoriteTokens())

			act(() => {
				result1.current.addFavorite("BTC")
			})

			expect(result1.current.isFavorite("BTC")).toBe(true)
			expect(result2.current.isFavorite("BTC")).toBe(true)
		})
	})
})
