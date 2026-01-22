"use client"

import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { useTheme } from "next-themes"

interface ThemedRainbowKitProps {
	children: React.ReactNode
}

export function ThemedRainbowKit({ children }: ThemedRainbowKitProps) {
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
