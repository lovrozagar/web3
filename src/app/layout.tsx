import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter-sans",
})

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
		<html className={`${inter.variable} antialiased`} lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
