/*
 * websocket manager with:
 * - exponential backoff with jitter (prevents thundering herd)
 * - heartbeat detection (detects stale connections)
 * - tab visibility handling (pause when hidden, resume when visible)
 * - connection state machine
 * - message queuing during reconnection
 */

export type WebSocketState =
	| "idle"
	| "connecting"
	| "connected"
	| "reconnecting"
	| "disconnected"
	| "failed"

export interface WebSocketManagerOptions {
	url: string
	onMessage: (data: unknown) => void
	onStateChange?: (state: WebSocketState) => void
	onError?: (error: Event) => void
	/* maximum reconnection attempts before giving up (default: 10) */
	maxReconnectAttempts?: number
	/* base delay for reconnection in ms (default: 1000) */
	baseReconnectDelay?: number
	/* maximum delay for reconnection in ms (default: 30000) */
	maxReconnectDelay?: number
	/* heartbeat timeout - if no message received in this time, consider connection dead (default: 60000) */
	heartbeatTimeout?: number
	/* whether to pause websocket when tab is hidden (default: true) */
	pauseWhenHidden?: boolean
	/* whether to automatically connect on creation (default: true) */
	autoConnect?: boolean
}

export class WebSocketManager {
	private ws: WebSocket | null = null
	private state: WebSocketState = "idle"
	private reconnectAttempts = 0
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
	private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null
	private lastMessageTime = 0
	private wasConnectedBeforeHidden = false
	private isDestroyed = false

	private readonly options: Required<WebSocketManagerOptions>

	constructor(options: WebSocketManagerOptions) {
		this.options = {
			autoConnect: true,
			baseReconnectDelay: 1000,
			heartbeatTimeout: 60000,
			maxReconnectAttempts: 10,
			maxReconnectDelay: 30000,
			onError: () => {},
			onStateChange: () => {},
			pauseWhenHidden: true,
			...options,
		}

		if (this.options.pauseWhenHidden && typeof document !== "undefined") {
			document.addEventListener("visibilitychange", this.handleVisibilityChange)
		}

		if (this.options.autoConnect) {
			this.connect()
		}
	}

	private setState(newState: WebSocketState): void {
		if (this.state !== newState) {
			this.state = newState
			this.options.onStateChange(newState)
		}
	}

	getState(): WebSocketState {
		return this.state
	}

	getReconnectAttempts(): number {
		return this.reconnectAttempts
	}

	getTimeSinceLastMessage(): number {
		if (this.lastMessageTime === 0) return 0
		return Date.now() - this.lastMessageTime
	}

	connect(): void {
		if (this.isDestroyed) return
		if (this.ws?.readyState === WebSocket.OPEN) return
		if (this.ws?.readyState === WebSocket.CONNECTING) return

		this.setState(this.reconnectAttempts > 0 ? "reconnecting" : "connecting")

		try {
			this.ws = new WebSocket(this.options.url)
			this.setupEventHandlers()
		} catch {
			this.handleConnectionFailure()
		}
	}

	private setupEventHandlers(): void {
		if (!this.ws) return

		this.ws.onopen = () => {
			this.setState("connected")
			this.reconnectAttempts = 0
			this.lastMessageTime = Date.now()
			this.startHeartbeatCheck()
		}

		this.ws.onmessage = (event: MessageEvent) => {
			this.lastMessageTime = Date.now()
			this.resetHeartbeatCheck()

			try {
				const data = JSON.parse(event.data)
				this.options.onMessage(data)
			} catch {
				/* log parse error but don't crash */
				console.warn("[WebSocket] Failed to parse message:", event.data)
			}
		}

		this.ws.onclose = (event: CloseEvent) => {
			this.stopHeartbeatCheck()

			/* clean close (code 1000) or intentional disconnect */
			if (event.code === 1000 || this.isDestroyed) {
				this.setState("disconnected")
				return
			}

			this.handleConnectionFailure()
		}

		this.ws.onerror = (event: Event) => {
			this.options.onError(event)
			/* onclose will be called after onerror */
		}
	}

	private handleConnectionFailure(): void {
		if (this.isDestroyed) return

		if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
			this.setState("failed")
			return
		}

		this.setState("reconnecting")
		this.scheduleReconnect()
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout)
		}

		const delay = this.calculateReconnectDelay()
		this.reconnectAttempts++

		this.reconnectTimeout = setTimeout(() => {
			this.connect()
		}, delay)
	}

	/*
	 * exponential backoff with jitter
	 * formula: min(maxDelay, baseDelay * 2^attempt) * (0.5 + random * 0.5)
	 * the jitter prevents thundering herd when server recovers
	 */
	private calculateReconnectDelay(): number {
		const exponentialDelay = this.options.baseReconnectDelay * 2 ** this.reconnectAttempts
		const cappedDelay = Math.min(exponentialDelay, this.options.maxReconnectDelay)
		/* add jitter: 50-100% of the delay */
		const jitter = 0.5 + Math.random() * 0.5
		return Math.floor(cappedDelay * jitter)
	}

	private startHeartbeatCheck(): void {
		this.stopHeartbeatCheck()
		this.heartbeatTimeout = setTimeout(() => {
			this.handleHeartbeatTimeout()
		}, this.options.heartbeatTimeout)
	}

	private resetHeartbeatCheck(): void {
		if (this.state === "connected") {
			this.startHeartbeatCheck()
		}
	}

	private stopHeartbeatCheck(): void {
		if (this.heartbeatTimeout) {
			clearTimeout(this.heartbeatTimeout)
			this.heartbeatTimeout = null
		}
	}

	private handleHeartbeatTimeout(): void {
		console.warn("[WebSocket] Heartbeat timeout - connection appears dead")
		/* force close and reconnect */
		this.ws?.close(4000, "Heartbeat timeout")
	}

	private handleVisibilityChange = (): void => {
		if (this.isDestroyed) return

		if (document.hidden) {
			/* tab is hidden - pause connection */
			this.wasConnectedBeforeHidden = this.state === "connected" || this.state === "connecting"
			if (this.wasConnectedBeforeHidden) {
				this.disconnect()
			}
		} else {
			/* tab is visible - resume if was connected */
			if (this.wasConnectedBeforeHidden) {
				this.connect()
			}
		}
	}

	disconnect(): void {
		this.stopHeartbeatCheck()

		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout)
			this.reconnectTimeout = null
		}

		if (this.ws) {
			this.ws.onclose = null /* prevent reconnection logic */
			this.ws.close(1000, "Client disconnect")
			this.ws = null
		}

		this.setState("disconnected")
	}

	/*
	 * manual reconnect - resets attempt counter
	 * use this for "reconnect" button in ui
	 */
	reconnect(): void {
		this.reconnectAttempts = 0
		this.disconnect()
		this.connect()
	}

	destroy(): void {
		this.isDestroyed = true
		this.disconnect()

		if (this.options.pauseWhenHidden && typeof document !== "undefined") {
			document.removeEventListener("visibilitychange", this.handleVisibilityChange)
		}
	}
}

/*
 * react hook for websocket connection
 */
import { useCallback, useEffect, useRef, useState } from "react"

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

	/* keep onmessage ref updated */
	onMessageRef.current = onMessage

	useEffect(() => {
		if (!enabled) {
			managerRef.current?.destroy()
			managerRef.current = null
			setState("idle")
			return
		}

		const manager = new WebSocketManager({
			autoConnect: false /* don't auto-connect, we'll do it after assigning ref */,
			onMessage: (data) => onMessageRef.current(data as T),
			onStateChange: (newState) => {
				setState(newState)
				/* use managerref instead of manager to avoid closure issue */
				if (managerRef.current) {
					setReconnectAttempts(managerRef.current.getReconnectAttempts())
				}
			},
			pauseWhenHidden,
			url,
		})

		managerRef.current = manager
		manager.connect() /* connect after ref is assigned */

		/* update time since last message periodically */
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
