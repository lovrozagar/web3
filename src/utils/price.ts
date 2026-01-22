import type { PriceDirection } from "@/types"

export function getPriceDirection(current: string, previous: string): PriceDirection {
	const curr = Number.parseFloat(current)
	const prev = Number.parseFloat(previous)
	if (curr > prev) return "up"
	if (curr < prev) return "down"
	return "neutral"
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
