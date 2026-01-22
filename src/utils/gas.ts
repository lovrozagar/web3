export function formatGwei(wei: bigint): string {
	const gwei = Number(wei) / 1e9
	if (gwei < 1) {
		return gwei.toFixed(2)
	}
	if (gwei < 10) {
		return gwei.toFixed(1)
	}
	return Math.round(gwei).toString()
}

export function getGasLevel(gwei: number): "low" | "medium" | "high" | "extreme" {
	if (gwei < 20) return "low"
	if (gwei < 50) return "medium"
	if (gwei < 100) return "high"
	return "extreme"
}

export function estimateTransactionCost(
	gasPrice: bigint,
	gasLimit: number,
	ethPrice: number,
): string {
	const costInWei = gasPrice * BigInt(gasLimit)
	const costInEth = Number(costInWei) / 1e18
	const costInUsd = costInEth * ethPrice

	if (costInUsd < 0.01) {
		return "<$0.01"
	}
	if (costInUsd < 1) {
		return `$${costInUsd.toFixed(2)}`
	}
	return `$${costInUsd.toFixed(2)}`
}
