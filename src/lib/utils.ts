import type { PriceDirection } from "@/types"

export function formatPrice(price: string | number, decimals = 2): string {
	const num = typeof price === "string" ? Number.parseFloat(price) : price
	if (num >= 1000) {
		return num.toLocaleString("en-US", {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals,
		})
	}
	return num.toFixed(decimals)
}

export function formatPercent(percent: string | number): string {
	const num = typeof percent === "string" ? Number.parseFloat(percent) : percent
	const sign = num >= 0 ? "+" : ""
	return `${sign}${num.toFixed(2)}%`
}

export function formatQuantity(qty: string | number): string {
	const num = typeof qty === "string" ? Number.parseFloat(qty) : qty
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(2)}M`
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(2)}K`
	}
	return num.toFixed(4)
}

export function formatVolume(volume: string | number): string {
	const num = typeof volume === "string" ? Number.parseFloat(volume) : volume
	if (num >= 1000000000) {
		return `$${(num / 1000000000).toFixed(2)}B`
	}
	if (num >= 1000000) {
		return `$${(num / 1000000).toFixed(2)}M`
	}
	if (num >= 1000) {
		return `$${(num / 1000).toFixed(1)}K`
	}
	return `$${num.toFixed(0)}`
}

export function formatCompactPrice(price: string | number): string {
	const num = typeof price === "string" ? Number.parseFloat(price) : price
	if (num >= 10000) {
		return num.toLocaleString("en-US", { maximumFractionDigits: 0 })
	}
	if (num >= 1000) {
		return num.toLocaleString("en-US", { maximumFractionDigits: 1 })
	}
	if (num >= 1) {
		return num.toFixed(2)
	}
	return num.toFixed(4)
}

export function getPriceDirection(current: string, previous: string): PriceDirection {
	const curr = Number.parseFloat(current)
	const prev = Number.parseFloat(previous)
	if (curr > prev) return "up"
	if (curr < prev) return "down"
	return "neutral"
}

export function truncateAddress(address: string, chars = 4): string {
	return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function calculateSpread(
	bestBid: string,
	bestAsk: string,
): { spread: string; percent: string } {
	const bid = Number.parseFloat(bestBid)
	const ask = Number.parseFloat(bestAsk)
	const spread = ask - bid
	const percent = (spread / ask) * 100
	return {
		percent: percent.toFixed(3),
		spread: spread.toFixed(2),
	}
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
	return classes.filter(Boolean).join(" ")
}
