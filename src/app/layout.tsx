import { Providers } from "@/components/providers"
import { getPublicEnv } from "@/config/env"
import "@rainbow-me/rainbowkit/styles.css"
import type { Metadata } from "next"
import "./globals.css"

const SITE_NAME = "DEX Dashboard"
const SITE_DESCRIPTION =
	"Live token prices, order book depth, and swap execution powered by Binance WebSocket. Trade ETH, BTC, SOL and more with real-time market data."
const SITE_URL = getPublicEnv()
	.GITHUB_REPO_URL.replace("github.com", "lovrozagar.github.io")
	.replace(/\.git$/, "")

export const metadata: Metadata = {
	alternates: {
		canonical: SITE_URL,
	},
	applicationName: SITE_NAME,
	authors: [{ name: "Lovro Zagar", url: "https://github.com/lovrozagar" }],
	creator: "Lovro Zagar",
	description: SITE_DESCRIPTION,
	generator: "Next.js",
	keywords: [
		"DEX",
		"decentralized exchange",
		"crypto",
		"cryptocurrency",
		"trading",
		"swap",
		"token prices",
		"order book",
		"Binance",
		"WebSocket",
		"ETH",
		"BTC",
		"SOL",
		"wagmi",
		"viem",
		"RainbowKit",
		"Web3",
	],
	metadataBase: new URL(SITE_URL),
	openGraph: {
		description: SITE_DESCRIPTION,
		locale: "en_US",
		siteName: SITE_NAME,
		title: SITE_NAME,
		type: "website",
		url: SITE_URL,
	},
	publisher: "Lovro Zagar",
	robots: {
		follow: true,
		googleBot: {
			follow: true,
			index: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
		index: true,
	},
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	twitter: {
		card: "summary_large_image",
		creator: "@lovrozagar",
		description: SITE_DESCRIPTION,
		title: SITE_NAME,
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html className="antialiased" lang="en" suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
