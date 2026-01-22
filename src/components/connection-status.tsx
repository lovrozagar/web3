"use client"

import type { WebSocketState } from "@/classes/websocket-manager"
import { CONNECTION_STATUS_CONFIG } from "@/constants/ui"
import { cn } from "@/utils/cn"

interface ConnectionStatusProps {
	state: WebSocketState
	reconnectAttempts?: number
	timeSinceLastMessage?: number
	onReconnect?: () => void
	showLastUpdate?: boolean
	compact?: boolean
}

function formatTimeSince(ms: number): string {
	if (ms === 0) return ""
	const seconds = Math.floor(ms / 1000)
	if (seconds < 60) return `${seconds}s ago`
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes}m ago`
	return "stale"
}

export function ConnectionStatus({
	state,
	reconnectAttempts = 0,
	timeSinceLastMessage = 0,
	onReconnect,
	showLastUpdate = false,
	compact = false,
}: ConnectionStatusProps) {
	const config = CONNECTION_STATUS_CONFIG[state]
	const isStale = timeSinceLastMessage > 30000 && state === "connected"

	if (compact) {
		return (
			<output
				aria-label={`Connection status: ${isStale ? "Stale data" : config.label}`}
				className="flex items-center gap-1.5"
			>
				<div aria-hidden="true" className="relative">
					<div
						className={cn(
							"h-2 w-2 rounded-full",
							isStale ? "bg-amber-500" : config.color,
							config.glow && !isStale && "live-indicator shadow-[0_0_6px_rgba(16,185,129,0.6)]",
						)}
					/>
					{config.pulse && (
						<div
							className={cn("absolute inset-0 h-2 w-2 animate-ping rounded-full", config.color)}
						/>
					)}
				</div>
				<span
					className={cn("text-xs", config.glow && !isStale ? "text-green-400" : "text-ui-fg-muted")}
				>
					{config.label}
				</span>
			</output>
		)
	}

	return (
		<output
			aria-label={`Connection status: ${isStale ? "Stale data" : config.label}`}
			className="flex items-center gap-3"
		>
			<div className="flex items-center gap-1.5">
				<div aria-hidden="true" className="relative">
					<div
						className={cn(
							"h-2.5 w-2.5 rounded-full transition-colors",
							isStale ? "bg-amber-500" : config.color,
						)}
					/>
					{config.pulse && (
						<div
							className={cn(
								"absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-75",
								config.color,
							)}
						/>
					)}
				</div>
				<span className="text-sm text-ui-fg-subtle">{isStale ? "Stale data" : config.label}</span>
			</div>

			{state === "reconnecting" && reconnectAttempts > 0 && (
				<span aria-live="polite" className="text-xs text-zinc-500">
					Attempt {reconnectAttempts}/10
				</span>
			)}

			{showLastUpdate && state === "connected" && timeSinceLastMessage > 0 && (
				<span className={cn("text-xs", isStale ? "text-amber-500" : "text-zinc-500")}>
					{formatTimeSince(timeSinceLastMessage)}
				</span>
			)}

			{(state === "failed" || state === "disconnected") && onReconnect && (
				<button
					aria-label="Reconnect to server"
					className="text-blue-400 text-xs underline underline-offset-2 transition-colors hover:text-blue-300"
					onClick={onReconnect}
					type="button"
				>
					Reconnect
				</button>
			)}
		</output>
	)
}
