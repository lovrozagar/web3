"use client"

import { useConnection } from "wagmi"
import { cn } from "@/utils/cn"

export function HeroStatusPill() {
	const { isConnected } = useConnection()

	return (
		<div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1.5 sm:px-4">
			<span className="relative flex h-2 w-2">
				<span
					className={cn(
						"absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
						isConnected ? "bg-emerald-400" : "bg-blue-400",
					)}
				/>
				<span
					className={cn(
						"relative inline-flex h-2 w-2 rounded-full",
						isConnected ? "bg-emerald-500" : "bg-blue-500",
					)}
				/>
			</span>
			<span className="font-medium text-xs text-zinc-400 sm:text-sm">
				{isConnected ? "Wallet connected" : "Connect wallet to start trading"}
			</span>
		</div>
	)
}
