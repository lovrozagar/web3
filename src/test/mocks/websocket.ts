import { vi } from "vitest"

type WebSocketEventType = "open" | "message" | "close" | "error"
type WebSocketEventHandler = (event: Event | MessageEvent | CloseEvent) => void

interface MockWebSocketInstance {
	url: string
	readyState: number
	send: ReturnType<typeof vi.fn>
	close: ReturnType<typeof vi.fn>
	simulateOpen: () => void
	simulateMessage: (data: unknown) => void
	simulateClose: (code?: number, reason?: string) => void
	simulateError: () => void
}

/* store instances globally for test access */
const instances: MockWebSocket[] = []

/* mockwebsocket - full websocket mock for testing */
export class MockWebSocket implements MockWebSocketInstance {
	/* static accessors that work with the module-scoped array */
	static get instances(): MockWebSocket[] {
		return instances
	}
	static set instances(value: MockWebSocket[]) {
		instances.length = 0
		instances.push(...value)
	}

	static originalWebSocket: typeof WebSocket | undefined

	/* websocket static constants */
	static readonly CONNECTING = 0
	static readonly OPEN = 1
	static readonly CLOSING = 2
	static readonly CLOSED = 3

	url: string
	readyState = 0 // CONNECTING
	protocol = ""
	extensions = ""
	bufferedAmount = 0
	binaryType: BinaryType = "blob"

	/* instance constants (same as static) */
	readonly CONNECTING = 0
	readonly OPEN = 1
	readonly CLOSING = 2
	readonly CLOSED = 3

	onopen: ((event: Event) => void) | null = null
	onmessage: ((event: MessageEvent) => void) | null = null
	onclose: ((event: CloseEvent) => void) | null = null
	onerror: ((event: Event) => void) | null = null

	send = vi.fn()
	close = vi.fn()

	private eventListeners: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map()

	constructor(url: string, _protocols?: string | string[]) {
		this.url = url
		instances.push(this)

		/* auto-connect after microtask (simulates real websocket behavior) */
		queueMicrotask(() => {
			if (this.readyState === 0) {
				this.simulateOpen()
			}
		})
	}

	addEventListener(type: WebSocketEventType, handler: WebSocketEventHandler): void {
		if (!this.eventListeners.has(type)) {
			this.eventListeners.set(type, new Set())
		}
		const handlers = this.eventListeners.get(type)
		if (handlers) {
			handlers.add(handler)
		}
	}

	removeEventListener(type: WebSocketEventType, handler: WebSocketEventHandler): void {
		this.eventListeners.get(type)?.delete(handler)
	}

	dispatchEvent(event: Event): boolean {
		const type = event.type as WebSocketEventType
		const handlers = this.eventListeners.get(type)
		if (handlers) {
			for (const handler of handlers) {
				handler(event)
			}
		}
		return true
	}

	simulateOpen(): void {
		this.readyState = 1 /* OPEN */
		const event = new Event("open")
		this.onopen?.(event)
		this.dispatchEvent(event)
	}

	simulateMessage(data: unknown): void {
		if (this.readyState !== 1) return
		const stringData = typeof data === "string" ? data : JSON.stringify(data)
		const event = new MessageEvent("message", { data: stringData })
		this.onmessage?.(event)
		this.dispatchEvent(event)
	}

	simulateClose(code = 1000, reason = ""): void {
		this.readyState = 3 /* CLOSED */
		const event = new CloseEvent("close", { code, reason, wasClean: code === 1000 })
		this.onclose?.(event)
		this.dispatchEvent(event)
	}

	simulateError(): void {
		const event = new Event("error")
		this.onerror?.(event)
		this.dispatchEvent(event)
	}

	static setup(): { instances: MockWebSocket[] } {
		MockWebSocket.instances = []
		MockWebSocket.originalWebSocket = global.WebSocket
		global.WebSocket = MockWebSocket as unknown as typeof WebSocket
		return { instances: MockWebSocket.instances }
	}

	static cleanup(): void {
		if (MockWebSocket.originalWebSocket) {
			global.WebSocket = MockWebSocket.originalWebSocket
		}
		MockWebSocket.instances = []
	}

	static getLastInstance(): MockWebSocket | undefined {
		return MockWebSocket.instances[MockWebSocket.instances.length - 1]
	}
}
