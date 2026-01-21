import type { Metadata } from "next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
	description:
		"Live token prices, order book depth, and swap execution powered by Binance WebSocket",
	title: "DEX Dashboard",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html className="antialiased" lang="en" suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
				<Toaster position="bottom-right" />
			</body>
		</html>
	)
}
