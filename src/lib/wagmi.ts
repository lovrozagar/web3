import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, mainnet, optimism } from "wagmi/chains"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
	console.warn("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID - wallet connect will not work")
}

export const config = getDefaultConfig({
	appName: "DEX Dashboard",
	chains: [mainnet, arbitrum, optimism],
	projectId: projectId ?? "placeholder",
	ssr: true,
})
