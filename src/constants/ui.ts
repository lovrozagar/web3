import { getPublicEnv } from "@/config/env"

export const GITHUB_REPO_URL = getPublicEnv().GITHUB_REPO_URL

export const THEME_OPTIONS = ["dark", "light"] as const

export const SLIPPAGE_OPTIONS = [0.1, 0.5, 1, 2, 3] as const

export const ORDER_BOOK_DEPTH_OPTIONS = [10, 20] as const

export const ORDER_BOOK_SPEED_OPTIONS = [100, 250, 500, 1000] as const

export const PRICE_GROUPING_OPTIONS = [0.01, 0.1, 1, 10] as const

export const CONNECTION_STATUS_CONFIG = {
	connected: {
		color: "bg-green-500",
		glow: true,
		label: "Live",
		pulse: false,
	},
	connecting: {
		color: "bg-amber-500",
		glow: false,
		label: "Connecting",
		pulse: true,
	},
	disconnected: {
		color: "bg-zinc-500",
		glow: false,
		label: "Disconnected",
		pulse: false,
	},
	failed: {
		color: "bg-red-500",
		glow: false,
		label: "Connection failed",
		pulse: false,
	},
	idle: {
		color: "bg-zinc-600",
		glow: false,
		label: "Idle",
		pulse: false,
	},
	reconnecting: {
		color: "bg-amber-500",
		glow: false,
		label: "Reconnecting",
		pulse: true,
	},
} as const

export const TRANSACTION_STATUS_ICONS = {
	confirmed: "✓",
	failed: "✕",
	pending: "◐",
} as const

export const TRANSACTION_STATUS_COLORS = {
	confirmed: "text-green-400",
	failed: "text-red-400",
	pending: "text-amber-400 animate-spin",
} as const

export const TECH_STACK = [
	{ color: "bg-zinc-700 hover:bg-zinc-600", name: "Next.js 16", url: "https://nextjs.org" },
	{
		color: "bg-blue-600/80 hover:bg-blue-500/80",
		name: "TypeScript",
		url: "https://typescriptlang.org",
	},
	{ color: "bg-cyan-600/80 hover:bg-cyan-500/80", name: "React 19", url: "https://react.dev" },
	{ color: "bg-purple-600/80 hover:bg-purple-500/80", name: "wagmi v3", url: "https://wagmi.sh" },
	{ color: "bg-green-600/80 hover:bg-green-500/80", name: "viem", url: "https://viem.sh" },
	{
		color:
			"bg-gradient-to-r from-pink-500/80 to-violet-500/80 hover:from-pink-400/80 hover:to-violet-400/80",
		name: "RainbowKit",
		url: "https://rainbowkit.com",
	},
	{
		color: "bg-sky-600/80 hover:bg-sky-500/80",
		name: "TailwindCSS 4",
		url: "https://tailwindcss.com",
	},
	{
		color: "bg-red-500/80 hover:bg-red-400/80",
		name: "TanStack Query",
		url: "https://tanstack.com/query",
	},
	{
		color: "bg-slate-600/80 hover:bg-slate-500/80",
		name: "next-themes",
		url: "https://github.com/pacocoursey/next-themes",
	},
	{
		color: "bg-orange-500/80 hover:bg-orange-400/80",
		name: "Sonner",
		url: "https://sonner.emilkowal.ski",
	},
	{
		color: "bg-amber-600/80 hover:bg-amber-500/80",
		name: "WebSocket",
		url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
	},
	{
		color: "bg-yellow-500/80 hover:bg-yellow-400/80",
		name: "Binance API",
		url: "https://www.binance.com/en/binance-api",
	},
	{
		color: "bg-emerald-600/80 hover:bg-emerald-500/80",
		name: "Vitest",
		url: "https://vitest.dev",
	},
	{
		color: "bg-green-500/80 hover:bg-green-400/80",
		name: "Playwright",
		url: "https://playwright.dev",
	},
	{
		color: "bg-indigo-500/80 hover:bg-indigo-400/80",
		name: "Biome",
		url: "https://biomejs.dev",
	},
] as const
