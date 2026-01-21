"use client"

import Link from "next/link"
import { useCallback, useState } from "react"
import { GasPriceIndicator } from "@/components/gas-price-indicator"
import { LimitOrders } from "@/components/limit-orders"
import { MarketStats } from "@/components/market-stats"
import { OrderBook } from "@/components/order-book"
import { PriceAlerts } from "@/components/price-alerts"
import { RecentTrades } from "@/components/recent-trades"
import { SettingsButton } from "@/components/settings-panel"
import { SwapInterface } from "@/components/swap-interface"
import { TokenPrices } from "@/components/token-prices"
import { TopMovers } from "@/components/top-movers"
import { TransactionHistory } from "@/components/transaction-history"
import { WalletConnect } from "@/components/wallet-connect"

const GITHUB_REPO_URL =
	process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com/lovrozagar/web3"
const CLONE_COMMAND = `git clone ${GITHUB_REPO_URL}`

const TECH_STACK = [
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
]

function DotBackground() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			{/* Dot pattern - using muted color for better visibility in both themes */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: "radial-gradient(circle, var(--ui-fg-muted) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
					opacity: 0.4,
				}}
			/>
			{/* Radial fade from center */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, var(--background) 70%)",
				}}
			/>
		</div>
	)
}

export default function Home() {
	const [copied, setCopied] = useState(false)
	const [selectedPrice, setSelectedPrice] = useState<string>()

	const handleCopy = async () => {
		await navigator.clipboard.writeText(CLONE_COMMAND)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handlePriceSelect = useCallback((price: string, _type: "bid" | "ask") => {
		/* convert price to a reasonable eth amount for swap */
		/* for example, if user clicks on 3200 usdt bid, we'd want to swap ~0.01 eth */
		const priceNum = Number.parseFloat(price)
		const ethAmount = (100 / priceNum).toFixed(4) // ~$100 worth
		setSelectedPrice(ethAmount)
	}, [])

	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<DotBackground />
			<header className="sticky top-0 z-50">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6 sm:py-5">
					<Link className="flex items-center gap-2.5 sm:gap-3" href="/">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 sm:h-10 sm:w-10">
							<svg
								className="h-5 w-5 text-white sm:h-6 sm:w-6"
								fill="none"
								stroke="currentColor"
								strokeWidth={2.5}
								viewBox="0 0 24 24"
							>
								<path
									d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<span className="font-extrabold text-foreground sm:text-lg">DEX Dashboard</span>
						<span className="rounded-md bg-ui-bg-component px-2 py-0.5 text-[10px] text-ui-fg-muted sm:text-xs">
							1.0.0
						</span>
					</Link>
					<div className="flex items-center gap-2">
						<GasPriceIndicator compact />
						<SettingsButton />
						<WalletConnect />
					</div>
				</div>
			</header>

			<main className="relative mx-auto max-w-7xl px-3 sm:px-6">
				<section className="pt-8 pb-8 text-center sm:pt-14 sm:pb-12">
					<h2 className="mb-2 font-extrabold text-primary text-xl sm:mb-3 sm:text-2xl">
						Mini DEX Dashboard
					</h2>
					<p className="mb-3 font-extrabold text-2xl text-foreground sm:mb-4 sm:text-5xl">
						Real-time DeFi trading interface.
					</p>
					<p className="mx-auto mb-6 max-w-xl text-sm text-ui-fg-muted sm:mb-8 sm:text-lg">
						Designed for developers. Built with modern tech.
					</p>

					<div className="mx-auto mb-5 flex max-w-lg items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:mb-6 sm:px-5 sm:py-4">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ui-bg-field">
							<svg
								className="h-4 w-4 text-ui-fg-muted"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<code className="min-w-0 flex-1 truncate font-mono text-foreground text-xs sm:text-sm">
							{CLONE_COMMAND}
						</code>
						<button
							className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-medium text-xs transition-all sm:text-sm ${
								copied
									? "bg-emerald-500/20 text-emerald-500"
									: "bg-ui-bg-field text-ui-fg-subtle hover:bg-ui-bg-hover hover:text-foreground"
							}`}
							onClick={handleCopy}
							type="button"
						>
							{copied ? (
								<span className="flex items-center gap-1.5">
									<svg
										className="h-3.5 w-3.5"
										fill="none"
										stroke="currentColor"
										strokeWidth={2.5}
										viewBox="0 0 24 24"
									>
										<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									Copied
								</span>
							) : (
								<span className="flex items-center gap-1.5">
									<svg
										className="h-3.5 w-3.5"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									Copy
								</span>
							)}
						</button>
					</div>

					<a
						className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-blue-600"
						href={GITHUB_REPO_URL}
						rel="noopener noreferrer"
						target="_blank"
					>
						<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						View on GitHub
					</a>
				</section>

				<section className="relative pb-12 sm:pb-20">
					{/* Animated gradient background */}
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="h-[500px] w-[800px] animate-[gradient-shift_8s_ease_infinite] rounded-full bg-[length:200%_200%] bg-gradient-to-br from-blue-500/[0.08] via-purple-500/[0.07] to-blue-500/[0.05] blur-[100px]" />
					</div>
					<div className="relative grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
						{/* Column 1: Prices & Market Stats */}
						<div className="flex flex-col gap-3 sm:gap-5 md:col-span-1">
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<TokenPrices />
							</div>
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<MarketStats />
							</div>
						</div>
						{/* Column 2: Order Book, Top Movers & Recent Trades */}
						<div className="flex flex-col gap-3 sm:gap-5 md:col-span-1">
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<OrderBook onPriceSelect={handlePriceSelect} />
							</div>
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<TopMovers />
							</div>
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<RecentTrades />
							</div>
						</div>
						{/* Column 3: Swap, Price Alerts, Transactions, Gas & Limit Orders */}
						<div className="flex flex-col gap-3 sm:gap-5 md:col-span-2 lg:col-span-1">
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<SwapInterface initialPrice={selectedPrice} />
							</div>
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<PriceAlerts />
							</div>
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<TransactionHistory />
							</div>
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<GasPriceIndicator />
							</div>
							<div className="hover:-translate-y-px rounded-xl transition-all duration-300 ease-out hover:shadow-md">
								<LimitOrders />
							</div>
						</div>
					</div>
				</section>

				<section className="border-border/50 border-t py-12 sm:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h3 className="mb-3 font-bold text-foreground text-lg sm:mb-4 sm:text-2xl">
							Built with Modern Tech
						</h3>
						<p className="mb-8 text-[13px] text-ui-fg-subtle sm:mb-10 sm:text-base">
							Next.js 16 · TypeScript · React 19 · wagmi v2 · viem · RainbowKit
						</p>

						<div className="mb-12 flex flex-wrap justify-center gap-2 sm:gap-3">
							{TECH_STACK.map((tech) => (
								<a
									className={`${tech.color} hover:-translate-y-px inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 font-medium text-[11px] text-white shadow-lg transition-all duration-200 hover:shadow-lg sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[13px]`}
									href={tech.url}
									key={tech.name}
									rel="noopener noreferrer"
									target="_blank"
								>
									{tech.name}
									<svg
										className="h-3 w-3 opacity-60 sm:h-3.5 sm:w-3.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</a>
							))}
						</div>

						<div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">60</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">FPS Rendering</div>
							</div>
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">
									100ms
								</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">Live Updates</div>
							</div>
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">10+</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">Wallet Support</div>
							</div>
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">100%</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">TypeScript</div>
							</div>
						</div>
					</div>
				</section>

				<footer className="border-border/50 border-t py-8 text-center sm:py-12">
					<div className="flex items-center justify-center gap-4">
						<a
							className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-ui-fg-subtle transition-colors hover:text-foreground sm:text-sm"
							href={GITHUB_REPO_URL}
							rel="noopener noreferrer"
							target="_blank"
						>
							<svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							View Source
						</a>
						<span className="text-ui-fg-disabled">|</span>
						<a
							className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-ui-fg-subtle transition-colors hover:text-foreground sm:text-sm"
							href="https://github.com/lovrozagar"
							rel="noopener noreferrer"
							target="_blank"
						>
							<svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							@lovrozagar
						</a>
					</div>
				</footer>
			</main>
		</div>
	)
}
