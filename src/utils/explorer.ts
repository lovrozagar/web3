import { BLOCK_EXPLORERS } from "@/constants/explorers"

export function getExplorerTxUrl(chainId: number, txHash: string): string {
	const explorer = BLOCK_EXPLORERS[chainId] ?? BLOCK_EXPLORERS[1]
	return `${explorer}/tx/${txHash}`
}
