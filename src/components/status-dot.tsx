"use client"

import type { WebSocketState } from "@/classes/websocket-manager"
import { CONNECTION_STATUS_CONFIG } from "@/constants/ui"
import { cn } from "@/utils/cn"

export function StatusDot({ state, className }: { state: WebSocketState; className?: string }) {
	const config = CONNECTION_STATUS_CONFIG[state]

	return (
		<output
			aria-label={`Connection: ${config.label}`}
			className={cn("relative", className)}
			title={config.label}
		>
			<div aria-hidden="true" className={cn("h-2 w-2 rounded-full", config.color)} />
			{config.pulse && (
				<div
					aria-hidden="true"
					className={cn(
						"absolute inset-0 h-2 w-2 animate-ping rounded-full opacity-75",
						config.color,
					)}
				/>
			)}
		</output>
	)
}
