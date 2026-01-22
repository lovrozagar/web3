"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { WagmiProvider } from "wagmi"
import { ThemedRainbowKit } from "@/components/rainbow-kit-provider"
import { getQueryClient } from "@/config/query-client"
import { config } from "@/config/wagmi"

export function Providers({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()

	return (
		<ThemeProvider
			attribute="data-theme"
			defaultTheme="system"
			disableTransitionOnChange
			enableSystem
		>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<ThemedRainbowKit>{children}</ThemedRainbowKit>
				</QueryClientProvider>
			</WagmiProvider>
			<Toaster position="bottom-right" />
		</ThemeProvider>
	)
}
