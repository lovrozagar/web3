"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { cn } from "@/lib/utils"

export function WalletConnect() {
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

				return (
					<div
						{...(!ready && {
							"aria-hidden": true,
							style: {
								opacity: 0,
								pointerEvents: "none",
								userSelect: "none",
							},
						})}
					>
						{(() => {
							if (!connected) {
								return (
									<button
										className={cn(
											"rounded-lg bg-blue-500 px-4 py-2 font-medium text-white",
											"transition-colors hover:bg-blue-600",
										)}
										onClick={openConnectModal}
										type="button"
									>
										Connect Wallet
									</button>
								)
							}

							if (chain.unsupported) {
								return (
									<button
										className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white"
										onClick={openChainModal}
										type="button"
									>
										Wrong network
									</button>
								)
							}

							return (
								<div className="flex items-center gap-2">
									<button
										className={cn(
											"flex items-center gap-2 rounded-lg px-3 py-2",
											"bg-zinc-800 transition-colors hover:bg-zinc-700",
										)}
										onClick={openChainModal}
										type="button"
									>
										{chain.hasIcon && (
											<div
												className="h-5 w-5 overflow-hidden rounded-full"
												style={{ background: chain.iconBackground }}
											>
												{chain.iconUrl && (
													<img
														alt={chain.name ?? "Chain icon"}
														className="h-5 w-5"
														src={chain.iconUrl}
													/>
												)}
											</div>
										)}
										<span className="text-sm">{chain.name}</span>
									</button>

									<button
										className={cn(
											"flex items-center gap-2 rounded-lg px-3 py-2",
											"bg-zinc-800 transition-colors hover:bg-zinc-700",
										)}
										onClick={openAccountModal}
										type="button"
									>
										<span className="font-medium text-sm">{account.displayName}</span>
										{account.displayBalance && (
											<span className="text-sm text-zinc-400">{account.displayBalance}</span>
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
