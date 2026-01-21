"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import {
	type OrderBookDepth,
	type SlippageTolerance,
	type UserPreferences,
	useUserPreferences,
} from "@/hooks/use-user-preferences"
import { cn } from "@/lib/utils"

function getSpeedLabel(speed: number): string {
	if (speed === 100) return "Fast"
	if (speed === 250) return "Normal"
	if (speed === 500) return "Slow"
	return "Very Slow"
}

export function SettingsPanel() {
	const {
		preferences,
		resetPreferences,
		setDefaultSlippage,
		setOrderBookDepth,
		setOrderBookUpdateSpeed,
	} = useUserPreferences()
	const { theme, setTheme } = useTheme()

	return (
		<div className="flex flex-col gap-4">
			{/* Theme */}
			<div className="flex flex-col gap-2">
				<label className="font-medium text-sm text-ui-fg-subtle">Theme</label>
				<div className="flex gap-2">
					{(["dark", "light"] as const).map((t) => (
						<button
							className={cn(
								"flex-1 rounded-lg px-3 py-2 text-sm capitalize transition-colors",
								theme === t
									? "bg-blue-600 text-white"
									: "bg-ui-bg-component text-ui-fg-muted hover:bg-ui-bg-hover",
							)}
							key={t}
							onClick={() => setTheme(t)}
							type="button"
						>
							{t}
						</button>
					))}
				</div>
			</div>

			{/* Default Slippage */}
			<div className="flex flex-col gap-2">
				<label className="font-medium text-sm text-ui-fg-subtle">Default Slippage Tolerance</label>
				<div className="flex flex-wrap gap-2">
					{([0.1, 0.5, 1, 2, 3] as SlippageTolerance[]).map((slippage) => (
						<button
							className={cn(
								"rounded-lg px-3 py-2 text-sm transition-colors",
								preferences.defaultSlippage === slippage
									? "bg-blue-600 text-white"
									: "bg-ui-bg-component text-ui-fg-muted hover:bg-ui-bg-hover",
							)}
							key={slippage}
							onClick={() => setDefaultSlippage(slippage)}
							type="button"
						>
							{slippage}%
						</button>
					))}
				</div>
				<p className="text-ui-fg-muted text-xs">
					Applied to new swaps. Higher values reduce failed transactions but may result in worse
					rates.
				</p>
			</div>

			{/* Order Book Depth */}
			<div className="flex flex-col gap-2">
				<label className="font-medium text-sm text-ui-fg-subtle">Order Book Depth</label>
				<div className="flex gap-2">
					{([10, 20] as OrderBookDepth[]).map((depth) => (
						<button
							className={cn(
								"flex-1 rounded-lg px-3 py-2 text-sm transition-colors",
								preferences.orderBookDepth === depth
									? "bg-blue-600 text-white"
									: "bg-ui-bg-component text-ui-fg-muted hover:bg-ui-bg-hover",
							)}
							key={depth}
							onClick={() => setOrderBookDepth(depth)}
							type="button"
						>
							{depth} levels
						</button>
					))}
				</div>
			</div>

			{/* Order Book Update Speed */}
			<div className="flex flex-col gap-2">
				<label className="font-medium text-sm text-ui-fg-subtle">Order Book Update Speed</label>
				<div className="flex flex-wrap gap-2">
					{([100, 250, 500, 1000] as UserPreferences["orderBookUpdateSpeed"][]).map((speed) => (
						<button
							className={cn(
								"rounded-lg px-3 py-2 text-sm transition-colors",
								preferences.orderBookUpdateSpeed === speed
									? "bg-blue-600 text-white"
									: "bg-ui-bg-component text-ui-fg-muted hover:bg-ui-bg-hover",
							)}
							key={speed}
							onClick={() => setOrderBookUpdateSpeed(speed)}
							type="button"
						>
							{getSpeedLabel(speed)}
						</button>
					))}
				</div>
				<p className="text-ui-fg-muted text-xs">
					Slower updates reduce CPU usage on lower-end devices.
				</p>
			</div>

			{/* Reset */}
			<div className="flex items-center border-border/50 border-t pt-4">
				<button
					className="text-sm text-ui-fg-muted transition-colors hover:text-ui-fg-subtle"
					onClick={resetPreferences}
					type="button"
				>
					Reset to defaults
				</button>
			</div>
		</div>
	)
}

/* settings button with dropdown */
export function SettingsButton() {
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isOpen) return

		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}

		/* delay to prevent immediate close on the same click that opens */
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside)
		}, 0)

		return () => {
			clearTimeout(timeoutId)
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen])

	return (
		<div className="relative" ref={containerRef}>
			<button
				aria-label="Settings"
				className={cn(
					"group flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
					"bg-ui-bg-field/60 text-ui-fg-muted hover:bg-ui-bg-hover hover:text-ui-fg-subtle",
					isOpen && "bg-ui-bg-hover text-ui-fg-subtle",
				)}
				onClick={() => setIsOpen(!isOpen)}
				type="button"
			>
				<svg
					className="h-5 w-5 transition-transform duration-300 ease-out group-hover:rotate-90"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
					<path
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
			</button>

			{isOpen && (
				<div
					className={cn(
						"absolute top-full right-0 z-50 mt-2 w-80",
						"rounded-xl border border-border bg-popover p-4 shadow-xl",
					)}
				>
					<div className="mb-3 flex items-center justify-between">
						<h3 className="font-semibold text-foreground">Settings</h3>
						<button
							className="text-ui-fg-muted hover:text-ui-fg-subtle"
							onClick={() => setIsOpen(false)}
							type="button"
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									d="M6 18L18 6M6 6l12 12"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
					</div>
					<SettingsPanel />
				</div>
			)}
		</div>
	)
}
