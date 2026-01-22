"use client"

import { useTheme } from "next-themes"
import {
	type OrderBookDepth,
	type SlippageTolerance,
	type UserPreferences,
	useUserPreferences,
} from "@/hooks/use-user-preferences"
import { cn } from "@/utils/cn"

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
