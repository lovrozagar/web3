import type { Metadata } from "next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
	description: "Real-time DEX trading interface demo with live prices and order book",
	title: "DEX Dashboard",
}

/* inline script to prevent theme flash - runs before react hydration */
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html className="antialiased" lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<Providers>{children}</Providers>
				<Toaster
					position="bottom-right"
					theme="dark"
					toastOptions={{
						style: {
							background: "#18181b",
							border: "1px solid #27272a",
							color: "#fafafa",
						},
					}}
				/>
			</body>
		</html>
	)
}
