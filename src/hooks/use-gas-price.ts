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

export function useGasPriceData(): UseGasPriceReturn {
	const {
		data: gasPrice,
		isLoading,
		error,
		refetch,
	} = useWagmiGasPrice({
		query: {
			refetchInterval: 15000,
		},
	})

	const [gasPriceData, setGasPriceData] = useState<GasPriceData | null>(null)

	useEffect(() => {
		if (gasPrice) {
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
