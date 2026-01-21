"use client"

import { useEffect, useState } from "react"
import { useGasPrice as useWagmiGasPrice } from "wagmi"

export interface GasPriceData {
	low: bigint
	standard: bigint
	fast: bigint
	instant: bigint
	lastUpdated: number
}

export interface UseGasPriceReturn {
	data: GasPriceData | null
	isLoading: boolean
	error: Error | null
	refetch: () => void
}

/* convert gwei to bigint wei */
function _gweiToWei(gwei: number): bigint {
	return BigInt(Math.round(gwei * 1e9))
}

/* format wei to gwei string */
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

export function useGasPriceData(): UseGasPriceReturn {
	const {
		data: gasPrice,
		isLoading,
		error,
		refetch,
	} = useWagmiGasPrice({
		query: {
			refetchInterval: 15000 /* refetch every 15 seconds */,
		},
	})

	const [gasPriceData, setGasPriceData] = useState<GasPriceData | null>(null)

	useEffect(() => {
		if (gasPrice) {
			/* estimate different priority levels based on current gas price */
			/* low: 80% of current */
			/* standard: current */
			/* fast: 120% of current */
			/* instant: 150% of current */
			const current = gasPrice
			const low = (current * BigInt(80)) / BigInt(100)
			const fast = (current * BigInt(120)) / BigInt(100)
			const instant = (current * BigInt(150)) / BigInt(100)

			setGasPriceData({
				fast,
				instant,
				lastUpdated: Date.now(),
				low,
				standard: current,
			})
		}
	}, [gasPrice])

	return {
		data: gasPriceData,
		error: error as Error | null,
		isLoading,
		refetch,
	}
}

/* get gas level classification for styling */
export function getGasLevel(gwei: number): "low" | "medium" | "high" | "extreme" {
	if (gwei < 20) return "low"
	if (gwei < 50) return "medium"
	if (gwei < 100) return "high"
	return "extreme"
}

/* get estimated transaction cost in usd */
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
