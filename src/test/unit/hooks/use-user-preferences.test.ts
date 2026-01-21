import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { SlippageTolerance, UserPreferences } from "@/hooks/use-user-preferences"

/* import the hook fresh for each test by resetting module */
let useUserPreferences: typeof import("@/hooks/use-user-preferences").useUserPreferences

describe("useUserPreferences", () => {
	beforeEach(async () => {
		localStorage.clear()
		vi.clearAllMocks()
		vi.resetModules()
		const module = await import("@/hooks/use-user-preferences")
		useUserPreferences = module.useUserPreferences
	})

	afterEach(() => {
		localStorage.clear()
	})

	describe("initial state", () => {
		it("returns default preferences when localStorage is empty", () => {
			const { result } = renderHook(() => useUserPreferences())

			expect(result.current.preferences.defaultSlippage).toBe(0.5)
			expect(result.current.preferences.orderBookDepth).toBe(20)
			expect(result.current.preferences.orderBookUpdateSpeed).toBe(250)
		})

		it("loads preferences from localStorage on mount", async () => {
			localStorage.setItem(
				"dex-user-preferences",
				JSON.stringify({
					defaultSlippage: 1,
					orderBookDepth: 10,
					orderBookUpdateSpeed: 500,
				}),
			)

			vi.resetModules()
			const module = await import("@/hooks/use-user-preferences")
			useUserPreferences = module.useUserPreferences

			const { result } = renderHook(() => useUserPreferences())

			expect(result.current.preferences.defaultSlippage).toBe(1)
			expect(result.current.preferences.orderBookDepth).toBe(10)
			expect(result.current.preferences.orderBookUpdateSpeed).toBe(500)
		})
	})

	describe("setDefaultSlippage", () => {
		it("updates slippage value", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setDefaultSlippage(1)
			})

			expect(result.current.preferences.defaultSlippage).toBe(1)
		})

		it("persists slippage to localStorage", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setDefaultSlippage(2)
			})

			const stored = JSON.parse(localStorage.getItem("dex-user-preferences") || "{}")
			expect(stored.defaultSlippage).toBe(2)
		})

		it("accepts valid slippage values", () => {
			const { result } = renderHook(() => useUserPreferences())

			const validValues: SlippageTolerance[] = [0.1, 0.5, 1, 2, 3]
			for (const value of validValues) {
				act(() => {
					result.current.setDefaultSlippage(value)
				})
				expect(result.current.preferences.defaultSlippage).toBe(value)
			}
		})
	})

	describe("setOrderBookDepth", () => {
		it("updates depth value", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setOrderBookDepth(20)
			})

			expect(result.current.preferences.orderBookDepth).toBe(20)
		})

		it("persists depth to localStorage", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setOrderBookDepth(10)
			})

			const stored = JSON.parse(localStorage.getItem("dex-user-preferences") || "{}")
			expect(stored.orderBookDepth).toBe(10)
		})

		it("accepts valid depth values (10 or 20)", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setOrderBookDepth(10)
			})
			expect(result.current.preferences.orderBookDepth).toBe(10)

			act(() => {
				result.current.setOrderBookDepth(20)
			})
			expect(result.current.preferences.orderBookDepth).toBe(20)
		})
	})

	describe("setOrderBookUpdateSpeed", () => {
		it("updates speed value", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setOrderBookUpdateSpeed(1000)
			})

			expect(result.current.preferences.orderBookUpdateSpeed).toBe(1000)
		})

		it("persists speed to localStorage", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setOrderBookUpdateSpeed(500)
			})

			const stored = JSON.parse(localStorage.getItem("dex-user-preferences") || "{}")
			expect(stored.orderBookUpdateSpeed).toBe(500)
		})

		it("accepts valid speed values", () => {
			const { result } = renderHook(() => useUserPreferences())

			const validSpeeds: UserPreferences["orderBookUpdateSpeed"][] = [100, 250, 500, 1000]
			for (const speed of validSpeeds) {
				act(() => {
					result.current.setOrderBookUpdateSpeed(speed)
				})
				expect(result.current.preferences.orderBookUpdateSpeed).toBe(speed)
			}
		})
	})

	describe("resetPreferences", () => {
		it("resets all preferences to defaults", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setDefaultSlippage(3)
				result.current.setOrderBookDepth(10)
				result.current.setOrderBookUpdateSpeed(1000)
			})

			expect(result.current.preferences.defaultSlippage).toBe(3)

			act(() => {
				result.current.resetPreferences()
			})

			expect(result.current.preferences.defaultSlippage).toBe(0.5)
			expect(result.current.preferences.orderBookDepth).toBe(20)
			expect(result.current.preferences.orderBookUpdateSpeed).toBe(250)
		})

		it("clears localStorage on reset", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setDefaultSlippage(3)
			})

			act(() => {
				result.current.resetPreferences()
			})

			const stored = JSON.parse(localStorage.getItem("dex-user-preferences") || "{}")
			expect(stored.defaultSlippage).toBe(0.5)
		})
	})

	describe("edge cases", () => {
		it("handles corrupted localStorage data", async () => {
			localStorage.setItem("dex-user-preferences", "not-valid-json")
			vi.resetModules()
			const module = await import("@/hooks/use-user-preferences")
			useUserPreferences = module.useUserPreferences

			const { result } = renderHook(() => useUserPreferences())
			expect(result.current.preferences.defaultSlippage).toBe(0.5)
		})

		it("handles partial localStorage data", async () => {
			localStorage.setItem(
				"dex-user-preferences",
				JSON.stringify({
					defaultSlippage: 2,
					// Missing other preferences
				}),
			)

			vi.resetModules()
			const module = await import("@/hooks/use-user-preferences")
			useUserPreferences = module.useUserPreferences

			const { result } = renderHook(() => useUserPreferences())
			expect(result.current.preferences.defaultSlippage).toBe(2)
			expect(result.current.preferences.orderBookDepth).toBe(20)
		})

		it("maintains state across multiple updates", () => {
			const { result } = renderHook(() => useUserPreferences())

			act(() => {
				result.current.setDefaultSlippage(1)
			})

			act(() => {
				result.current.setOrderBookDepth(10)
			})

			expect(result.current.preferences.defaultSlippage).toBe(1)
			expect(result.current.preferences.orderBookDepth).toBe(10)
		})
	})
})
