import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, mainnet, optimism } from "wagmi/chains"
import { getPublicEnv } from "@/config/env"

export const config = getDefaultConfig({
	appName: "DEX Dashboard",
	chains: [mainnet, arbitrum, optimism],
	projectId: getPublicEnv().WALLETCONNECT_PROJECT_ID,
	ssr: true,
})
