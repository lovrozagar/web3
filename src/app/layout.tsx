"use client"

import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider, useTheme } from "next-themes"
import { Toaster } from "sonner"
import { WagmiProvider } from "wagmi"
import { getQueryClient } from "@/lib/query-client"
import { config } from "@/lib/wagmi"
import "./globals.css"

function RainbowKit({ children }: { children: React.ReactNode }) {
	const { resolvedTheme } = useTheme()
	const theme =
		resolvedTheme === "light"
			? lightTheme({
					accentColor: "#3b82f6",
					accentColorForeground: "white",
					borderRadius: "medium",
				})
			: darkTheme({
					accentColor: "#3b82f6",
					accentColorForeground: "white",
					borderRadius: "medium",
				})

	return <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()

	return (
		<html className="antialiased" lang="en" suppressHydrationWarning>
			<head>
				<title>DEX Dashboard</title>
				<meta
					content="Live token prices, order book depth, and swap execution powered by Binance WebSocket"
					name="description"
				/>
			</head>
			<body>
				<ThemeProvider
					attribute="data-theme"
					defaultTheme="system"
					disableTransitionOnChange
					enableSystem
				>
					<WagmiProvider config={config}>
						<QueryClientProvider client={queryClient}>
							<RainbowKit>{children}</RainbowKit>
						</QueryClientProvider>
					</WagmiProvider>
				</ThemeProvider>
				<Toaster position="bottom-right" />
			</body>
		</html>
	)
}
