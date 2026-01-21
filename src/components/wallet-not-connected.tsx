"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"

interface WalletNotConnectedProps {
	message?: string
}

export function WalletNotConnected({
	message = "Connect your wallet to continue",
}: WalletNotConnectedProps) {
	const { openConnectModal } = useConnectModal()

	return (
		<button
			className="flex w-full cursor-pointer flex-col items-center justify-center py-6 text-center transition-colors hover:bg-ui-bg-field/30"
			onClick={openConnectModal}
			type="button"
		>
			<svg
				className="mb-2 h-8 w-8 text-ui-fg-disabled"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				viewBox="0 0 24 24"
			>
				<path
					d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<span className="text-[13px] text-ui-fg-subtle">Wallet not connected</span>
			<span className="text-[11px] text-ui-fg-disabled">{message}</span>
		</button>
	)
}
