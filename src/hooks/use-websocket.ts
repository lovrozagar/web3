"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { WebSocketManager, type WebSocketState } from "@/classes/websocket-manager"

export interface UseWebSocketOptions<T> {
	url: string
	onMessage: (data: T) => void
	enabled?: boolean
	pauseWhenHidden?: boolean
}

export interface UseWebSocketReturn {
	disconnect: () => void
	reconnect: () => void
	reconnectAttempts: number
	state: WebSocketState
	timeSinceLastMessage: number
}

export function useWebSocket<T>({
	url,
	onMessage,
	enabled = true,
	pauseWhenHidden = true,
}: UseWebSocketOptions<T>): UseWebSocketReturn {
	const [state, setState] = useState<WebSocketState>("idle")
	const [reconnectAttempts, setReconnectAttempts] = useState(0)
	const [timeSinceLastMessage, setTimeSinceLastMessage] = useState(0)
	const managerRef = useRef<WebSocketManager | null>(null)
	const onMessageRef = useRef(onMessage)

	onMessageRef.current = onMessage

	useEffect(() => {
		if (!enabled) {
			managerRef.current?.destroy()
			managerRef.current = null
			setState("idle")
			return
		}

		const manager = new WebSocketManager({
			autoConnect: false,
			onMessage: (data) => onMessageRef.current(data as T),
			onStateChange: (newState) => {
				setState(newState)
				if (managerRef.current) {
					setReconnectAttempts(managerRef.current.getReconnectAttempts())
				}
			},
			pauseWhenHidden,
			url,
		})

		managerRef.current = manager
		manager.connect()

		const interval = setInterval(() => {
			if (managerRef.current) {
				setTimeSinceLastMessage(managerRef.current.getTimeSinceLastMessage())
			}
		}, 1000)

		return () => {
			clearInterval(interval)
			manager.destroy()
			managerRef.current = null
		}
	}, [url, enabled, pauseWhenHidden])

	const reconnect = useCallback(() => {
		managerRef.current?.reconnect()
	}, [])

	const disconnect = useCallback(() => {
		managerRef.current?.disconnect()
	}, [])

	return {
		disconnect,
		reconnect,
		reconnectAttempts,
		state,
		timeSinceLastMessage,
	}
}
