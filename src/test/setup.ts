import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach, vi } from "vitest"
import { MockWebSocket } from "./mocks/websocket"

/* set environment variables for tests */
process.env.NEXT_PUBLIC_GITHUB_REPO_URL = "https://github.com/test/web3"
process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = "test-project-id"

/* setup mockwebsocket globally for all tests */
MockWebSocket.setup()

/* cleanup after each test */
afterEach(() => {
	cleanup()
	/* clear websocket instances after each test */
	MockWebSocket.instances = []
})

/* mock window.matchmedia */
Object.defineProperty(window, "matchMedia", {
	value: vi.fn().mockImplementation((query: string) => ({
		addEventListener: vi.fn(),
		addListener: vi.fn(),
		dispatchEvent: vi.fn(),
		matches: false,
		media: query,
		onchange: null,
		removeEventListener: vi.fn(),
		removeListener: vi.fn(),
	})),
	writable: true,
})

/* mock localstorage with actual storage */
const createLocalStorageMock = () => {
	let store: Record<string, string> = {}
	return {
		/* helper for tests to reset the store */
		__reset: () => {
			store = {}
		},
		clear: vi.fn(() => {
			store = {}
		}),
		getItem: vi.fn((key: string) => store[key] ?? null),
		key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
		get length() {
			return Object.keys(store).length
		},
		removeItem: vi.fn((key: string) => {
			delete store[key]
		}),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value
		}),
	}
}

const localStorageMock = createLocalStorageMock()
Object.defineProperty(window, "localStorage", { value: localStorageMock })

/* reset localstorage before each test */
beforeEach(() => {
	localStorageMock.__reset()
	vi.clearAllMocks()
})

/* mock resizeobserver */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	disconnect: vi.fn(),
	observe: vi.fn(),
	unobserve: vi.fn(),
}))

/* mock intersectionobserver */
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	disconnect: vi.fn(),
	observe: vi.fn(),
	root: null,
	rootMargin: "",
	takeRecords: vi.fn(),
	thresholds: [],
	unobserve: vi.fn(),
}))

/* mock requestanimationframe */
global.requestAnimationFrame = vi.fn((cb) => {
	setTimeout(cb, 0)
	return 0
})

global.cancelAnimationFrame = vi.fn()
