"use client"

import { useEffect, useState } from "react"
import { useConnection } from "wagmi"
import { GasIcon } from "@/components/icons/gas"
import { useGasPriceData } from "@/hooks/use-gas-price"
import { cn } from "@/utils/cn"
import { formatGwei, getGasLevel } from "@/utils/gas"
import { WalletNotConnected } from "./wallet-not-connected"

interface GasPriceIndicatorProps {
	compact?: boolean
}

export function GasPriceIndicator({ compact = false }: GasPriceIndicatorProps) {
	const { isConnected } = useConnection()
	const { data, isLoading, refetch } = useGasPriceData()
	const [timeSinceUpdate, setTimeSinceUpdate] = useState(0)

	/* update time since last update */
	useEffect(() => {
		if (!data?.lastUpdated) return

		const interval = setInterval(() => {
			setTimeSinceUpdate(Math.floor((Date.now() - data.lastUpdated) / 1000))
		}, 1000)

		return () => clearInterval(interval)
	}, [data?.lastUpdated])

	if (!isConnected) {
		if (compact) {
			return null
		}
		return (
			<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm">
				<div className="flex items-center gap-2 border-border border-b px-3 py-2 sm:px-4 sm:py-3">
					<GasIcon className="h-4 w-4 text-emerald-400" />
					<span className="font-bold text-[13px] text-foreground sm:text-[15px]">Gas Price</span>
				</div>
				<WalletNotConnected message="Connect to view gas prices" />
			</div>
		)
	}

	if (isLoading || !data) {
		return (
			<div className="flex items-center gap-2 rounded-lg bg-ui-bg-field/50 px-3 py-2">
				<div className="h-4 w-4 animate-pulse rounded-full bg-ui-bg-hover" />
				<div className="h-4 w-16 animate-pulse rounded bg-ui-bg-hover" />
			</div>
		)
	}

	const standardGwei = Number(data.standard) / 1e9
	const gasLevel = getGasLevel(standardGwei)

	const levelColors = {
		extreme: "text-red-400",
		high: "text-orange-400",
		low: "text-emerald-400",
		medium: "text-amber-400",
	}

	const levelBgColors = {
		extreme: "bg-red-500",
		high: "bg-orange-500",
		low: "bg-emerald-500",
		medium: "bg-amber-500",
	}

	const levelLabels = {
		extreme: "Very High",
		high: "High",
		low: "Low",
		medium: "Normal",
	}

	if (compact) {
		return (
			<button
				className="flex items-center gap-1.5 rounded-md bg-ui-bg-field/50 px-2 py-1 text-xs transition-colors hover:bg-ui-bg-hover/50"
				onClick={() => refetch()}
				title={`Gas: ${formatGwei(data.standard)} Gwei (${levelLabels[gasLevel]}). Click to refresh.`}
				type="button"
			>
				<div className={cn("h-2 w-2 rounded-full", levelBgColors[gasLevel])} />
				<span className={cn("font-mono", levelColors[gasLevel])}>{formatGwei(data.standard)}</span>
				<span className="text-ui-fg-muted">gwei</span>
			</button>
		)
	}

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 backdrop-blur-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<GasIcon className="h-4 w-4 text-emerald-400" />
					<span className="font-medium text-foreground text-sm">Gas Price</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className={cn("h-2 w-2 animate-pulse rounded-full", levelBgColors[gasLevel])} />
					<span className={cn("font-medium text-xs", levelColors[gasLevel])}>
						{levelLabels[gasLevel]}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-4 gap-2">
				<GasTier active={false} gwei={formatGwei(data.low)} label="Slow" time="~5 min" />
				<GasTier active gwei={formatGwei(data.standard)} label="Standard" time="~3 min" />
				<GasTier active={false} gwei={formatGwei(data.fast)} label="Fast" time="~1 min" />
				<GasTier active={false} gwei={formatGwei(data.instant)} label="Instant" time="~15 sec" />
			</div>

			<div className="flex items-center justify-between border-border/50 border-t pt-2">
				<span className="text-[10px] text-ui-fg-muted">Updated {timeSinceUpdate}s ago</span>
				<button
					className="text-[10px] text-ui-fg-subtle transition-colors hover:text-foreground"
					onClick={() => refetch()}
					type="button"
				>
					Refresh
				</button>
			</div>
		</div>
	)
}

interface GasTierProps {
	label: string
	gwei: string
	time: string
	active?: boolean
}

function GasTier({ active, gwei, label, time }: GasTierProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center rounded-lg p-2 transition-colors",
				active
					? "bg-blue-500/10 ring-1 ring-blue-500/30"
					: "bg-ui-bg-field/30 hover:bg-ui-bg-field/50",
			)}
		>
			<span className="text-[10px] text-ui-fg-muted">{label}</span>
			<span className={cn("font-mono text-sm", active ? "text-blue-400" : "text-foreground")}>
				{gwei}
			</span>
			<span className="text-[9px] text-ui-fg-muted">{time}</span>
		</div>
	)
}
