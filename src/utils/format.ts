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

export function truncateAddress(address: string, chars = 4): string {
	return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatRelativeTime(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000)

	if (seconds < 60) return "just now"
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
	return `${Math.floor(seconds / 86400)}d ago`
}
