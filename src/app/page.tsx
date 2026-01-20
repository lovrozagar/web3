"use client"

import Link from "next/link"
import { useState } from "react"
import { OrderBook } from "@/components/order-book"
import { SwapInterface } from "@/components/swap-interface"
import { TokenPrices } from "@/components/token-prices"
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
	{ color: "bg-purple-600/80 hover:bg-purple-500/80", name: "wagmi v2", url: "https://wagmi.sh" },
	{ color: "bg-green-600/80 hover:bg-green-500/80", name: "viem", url: "https://viem.sh" },
	{
		color:
			"bg-gradient-to-r from-pink-500/80 to-violet-500/80 hover:from-pink-400/80 hover:to-violet-400/80",
		name: "RainbowKit",
		url: "https://rainbowkit.com",
	},
	{
		color: "bg-sky-600/80 hover:bg-sky-500/80",
		name: "TailwindCSS",
		url: "https://tailwindcss.com",
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
]

const FEATURES = [
	{ icon: "chart", label: "Real-time Prices" },
	{ icon: "book", label: "Live Order Book" },
	{ icon: "wallet", label: "Wallet Connect" },
	{ icon: "swap", label: "Token Swap" },
]

export default function Home() {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		await navigator.clipboard.writeText(CLONE_COMMAND)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="relative min-h-screen overflow-x-hidden">
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
						<span className="font-extrabold text-white sm:text-lg">DEX Dashboard</span>
						<span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 sm:text-xs">
							1.0.0
						</span>
					</Link>
					<WalletConnect />
				</div>
			</header>

			<main className="relative mx-auto max-w-7xl px-3 sm:px-6">
				<section className="pt-8 pb-8 text-center sm:pt-14 sm:pb-12">
					<h2 className="mb-2 font-extrabold text-blue-400 text-xl sm:mb-3 sm:text-2xl">
						Mini DEX Dashboard
					</h2>
					<p className="mb-3 font-extrabold text-2xl text-white sm:mb-4 sm:text-5xl">
						Real-time DeFi trading interface.
					</p>
					<p className="mx-auto mb-6 max-w-xl text-sm text-zinc-300 sm:mb-8 sm:text-lg">
						Designed for developers. Built with modern tech.
					</p>

					<div className="mx-auto mb-5 flex max-w-md items-center justify-between gap-3 rounded-2xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-3 sm:mb-6 sm:px-5 sm:py-3.5">
						<code className="truncate font-mono text-xs text-zinc-300 sm:text-sm">
							{CLONE_COMMAND}
						</code>
						<button
							className="shrink-0 cursor-pointer rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
							onClick={handleCopy}
							type="button"
						>
							{copied ? (
								<svg
									className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							) : (
								<svg
									className="h-4 w-4 sm:h-5 sm:w-5"
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
							)}
						</button>
					</div>

					<a
						className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-blue-600 sm:px-6 sm:py-3 sm:text-base"
						href={GITHUB_REPO_URL}
						rel="noopener noreferrer"
						target="_blank"
					>
						View on GitHub
					</a>

					<div className="mt-10 flex flex-wrap justify-center gap-3 sm:mt-14 sm:gap-4">
						{FEATURES.map((feature) => (
							<div
								className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 sm:gap-2.5 sm:px-5 sm:py-3"
								key={feature.label}
							>
								<svg
									className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5"
									fill="none"
									stroke="currentColor"
									strokeWidth={2.5}
									viewBox="0 0 24 24"
								>
									<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								<span className="text-sm text-zinc-300 sm:text-base">{feature.label}</span>
							</div>
						))}
					</div>
				</section>

				<section className="relative pb-12 sm:pb-20">
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="h-[500px] w-[800px] rounded-full bg-purple-500/[0.07] blur-[100px]" />
					</div>
					<div className="relative grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
						<div className="md:col-span-1">
							<TokenPrices />
						</div>
						<div className="md:col-span-1">
							<OrderBook />
						</div>
						<div className="md:col-span-2 lg:col-span-1">
							<SwapInterface />
						</div>
					</div>
				</section>

				<section className="border-zinc-800/50 border-t py-12 sm:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h3 className="mb-3 font-bold text-lg text-white sm:mb-4 sm:text-2xl">
							Built with Modern Tech
						</h3>
						<p className="mb-8 text-[13px] text-zinc-300 sm:mb-10 sm:text-base">
							Next.js 16 · TypeScript · React 19 · wagmi v2 · viem · RainbowKit
						</p>

						<div className="mb-12 flex flex-wrap justify-center gap-2 sm:gap-3">
							{TECH_STACK.map((tech) => (
								<a
									className={`${tech.color} hover:-translate-y-0.5 inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 font-medium text-[11px] text-white shadow-lg transition-all duration-200 hover:shadow-xl sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[13px]`}
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
							<div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-white sm:text-3xl">60</div>
								<div className="text-[10px] text-zinc-500 sm:text-xs">FPS Rendering</div>
							</div>
							<div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-white sm:text-3xl">100ms</div>
								<div className="text-[10px] text-zinc-500 sm:text-xs">Live Updates</div>
							</div>
							<div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-white sm:text-3xl">10+</div>
								<div className="text-[10px] text-zinc-500 sm:text-xs">Wallet Support</div>
							</div>
							<div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-white sm:text-3xl">100%</div>
								<div className="text-[10px] text-zinc-500 sm:text-xs">TypeScript</div>
							</div>
						</div>
					</div>
				</section>

				<footer className="border-zinc-800/50 border-t py-8 text-center sm:py-12">
					<div className="flex items-center justify-center gap-4">
						<a
							className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-zinc-300 transition-colors hover:text-white sm:text-sm"
							href={GITHUB_REPO_URL}
							rel="noopener noreferrer"
							target="_blank"
						>
							<svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							View Source
						</a>
						<span className="text-zinc-700">|</span>
						<a
							className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-zinc-300 transition-colors hover:text-white sm:text-sm"
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
