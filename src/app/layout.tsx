import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
	description: "Real-time DEX trading interface demo with live prices and order book",
	title: "DEX Dashboard",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html className="antialiased" lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
