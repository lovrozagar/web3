"use client"

import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { ThemeProvider, useTheme } from "next-themes"
import { config } from "@/lib/wagmi"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useState } from "react"
import { WagmiProvider } from "wagmi"

interface ProvidersProps {
	children: ReactNode
}

function RainbowKitWithTheme({ children }: { children: ReactNode }) {
	const { resolvedTheme } = useTheme()

	const rainbowTheme =
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

	return <RainbowKitProvider theme={rainbowTheme}>{children}</RainbowKitProvider>
}

export function Providers({ children }: ProvidersProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
					},
				},
			}),
	)

	return (
		<ThemeProvider
			attribute="data-theme"
			defaultTheme="dark"
			disableTransitionOnChange
			enableSystem={false}
		>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitWithTheme>{children}</RainbowKitWithTheme>
				</QueryClientProvider>
			</WagmiProvider>
		</ThemeProvider>
	)
}
