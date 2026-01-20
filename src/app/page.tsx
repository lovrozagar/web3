"use client"

import { OrderBook } from "@/components/order-book"
import { SwapInterface } from "@/components/swap-interface"
import { TokenPrices } from "@/components/token-prices"
import { WalletConnect } from "@/components/wallet-connect"

export default function Home() {
	return (
		<div className="min-h-screen">
			<header className="border-zinc-800 border-b bg-zinc-900/80 backdrop-blur-sm">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
					<div className="flex items-center gap-2">
						<span className="text-2xl">📊</span>
						<h1 className="font-bold text-xl">DEX Dashboard</h1>
					</div>
					<WalletConnect />
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-6">
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-1">
						<TokenPrices />
					</div>

					<div className="lg:col-span-1">
						<OrderBook />
					</div>

					<div className="lg:col-span-1">
						<SwapInterface />
					</div>
				</div>

				<footer className="mt-8 text-center text-sm text-zinc-500">
					<p>Demo project - Real-time data from Binance WebSocket API</p>
					<p className="mt-1">Swap functionality is mocked for demonstration purposes</p>
				</footer>
			</main>
		</div>
	)
}
