"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useChainId, useConnection } from "wagmi"
import { cn } from "@/utils/cn"
import { truncateAddress } from "@/utils/format"

export function WalletConnect() {
	const { address, isConnected } = useConnection()
	const chainId = useChainId()

	const prevAddressRef = useRef<string | undefined>(undefined)
	const prevChainIdRef = useRef<number | undefined>(undefined)
	const wasConnectedRef = useRef(false)

	/* track wallet events and show toasts */
	useEffect(() => {
		/* initial connection */
		if (isConnected && !wasConnectedRef.current && address) {
			toast.success("Wallet connected", {
				description: truncateAddress(address),
			})
			wasConnectedRef.current = true
			prevAddressRef.current = address
			prevChainIdRef.current = chainId
			return
		}

		/* disconnection */
		if (!isConnected && wasConnectedRef.current) {
			toast.info("Wallet disconnected")
			wasConnectedRef.current = false
			prevAddressRef.current = undefined
			prevChainIdRef.current = undefined
			return
		}

		/* account change (while connected) */
		if (isConnected && prevAddressRef.current && address !== prevAddressRef.current) {
			toast.info("Account changed", {
				description: truncateAddress(address ?? ""),
			})
			prevAddressRef.current = address
		}

		/* chain change (while connected) */
		if (isConnected && prevChainIdRef.current && chainId !== prevChainIdRef.current) {
			toast.info("Network changed", {
				description: `Switched to chain ${chainId}`,
			})
			prevChainIdRef.current = chainId
		}
	}, [isConnected, address, chainId])

	return (
		<ConnectButton.Custom>
			{({
				account,
				chain,
				openAccountModal,
				openChainModal,
				openConnectModal,
				authenticationStatus,
				mounted,
			}) => {
				const ready = mounted && authenticationStatus !== "loading"
				const connected =
					ready &&
					account &&
					chain &&
					(!authenticationStatus || authenticationStatus === "authenticated")

				/* placeholder button that looks identical - shown while rainbowkit loads */
				const placeholderButton = (
					<button
						className={cn(
							"cursor-pointer rounded-lg bg-blue-500 px-2.5 py-1.5 font-semibold text-white text-xs sm:px-4 sm:py-2 sm:text-sm",
							"transition-colors hover:bg-blue-600",
						)}
						disabled
						type="button"
					>
						<span className="hidden sm:inline">Connect Wallet</span>
						<span className="sm:hidden">Connect</span>
					</button>
				)

				/* show placeholder while not ready */
				if (!ready) {
					return placeholderButton
				}

				return (
					<div>
						{(() => {
							if (!connected) {
								return (
									<button
										className={cn(
											"cursor-pointer rounded-lg bg-blue-500 px-2.5 py-1.5 font-semibold text-white text-xs sm:px-4 sm:py-2 sm:text-sm",
											"transition-colors hover:bg-blue-600",
										)}
										onClick={openConnectModal}
										type="button"
									>
										<span className="hidden sm:inline">Connect Wallet</span>
										<span className="sm:hidden">Connect</span>
									</button>
								)
							}

							if (chain.unsupported) {
								return (
									<button
										className={cn(
											"flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2",
											"bg-red-500/90 font-semibold text-sm text-white transition-colors hover:bg-red-500",
										)}
										onClick={openChainModal}
										type="button"
									>
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											viewBox="0 0 24 24"
										>
											<path
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										<span className="hidden sm:inline">Wrong Network</span>
										<span className="sm:hidden">Switch</span>
									</button>
								)
							}

							/* check if displayname is an ens name (ends with .eth) */
							const isEns = account.displayName?.includes(".")

							return (
								<div className="flex items-center gap-1.5 sm:gap-2">
									{/* Chain selector - compact on mobile */}
									<button
										className={cn(
											"flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2",
											"bg-zinc-800 transition-colors hover:bg-zinc-700",
										)}
										onClick={openChainModal}
										title={chain.name}
										type="button"
									>
										{chain.hasIcon && (
											<div
												className="h-4 w-4 overflow-hidden rounded-full sm:h-5 sm:w-5"
												style={{ background: chain.iconBackground }}
											>
												{chain.iconUrl && (
													<img
														alt={chain.name ?? "Chain icon"}
														className="h-4 w-4 sm:h-5 sm:w-5"
														src={chain.iconUrl}
													/>
												)}
											</div>
										)}
										<span className="hidden font-medium text-sm sm:inline">{chain.name}</span>
									</button>

									{/* Account button */}
									<button
										className={cn(
											"flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2",
											"bg-zinc-800 transition-colors hover:bg-zinc-700",
										)}
										onClick={openAccountModal}
										type="button"
									>
										{/* Show ENS indicator if it's an ENS name */}
										{isEns && (
											<span className="hidden rounded bg-blue-500/20 px-1 py-0.5 font-medium text-[9px] text-blue-400 sm:inline">
												ENS
											</span>
										)}
										<span className="font-semibold text-[12px] sm:text-sm">
											{account.displayName}
										</span>
										{account.displayBalance && (
											<span className="hidden text-[12px] text-zinc-400 sm:inline sm:text-sm">
												{account.displayBalance}
											</span>
										)}
									</button>
								</div>
							)
						})()}
					</div>
				)
			}}
		</ConnectButton.Custom>
	)
}
