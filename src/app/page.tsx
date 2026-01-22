import Link from "next/link"
import { CloneCommand } from "@/components/clone-command"
import { DashboardGrid } from "@/components/dashboard-grid"
import { DotBackground } from "@/components/dot-background"
import { GasPriceIndicator } from "@/components/gas-price-indicator"
import { HeroStatusPill } from "@/components/hero-status-pill"
import { GitHubIcon } from "@/components/icons/github"
import { SwapVerticalIcon } from "@/components/icons/swap"
import {
	BinanceLogo,
	BiomeLogo,
	NextJsLogo,
	PlaywrightLogo,
	RainbowKitLogo,
	ReactLogo,
	SonnerLogo,
	TailwindLogo,
	TanStackLogo,
	ThemesLogo,
	TypeScriptLogo,
	ViemLogo,
	VitestLogo,
	WagmiLogo,
	WebSocketLogo,
} from "@/components/icons/tech-logos"
import { SettingsButton } from "@/components/settings-button"
import { WalletConnect } from "@/components/wallet-connect"
import { GITHUB_REPO_URL } from "@/constants/ui"

export default function Home() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<DotBackground />
			<header className="sticky top-0 z-50">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6 sm:py-5">
					<Link className="flex items-center gap-2.5 sm:gap-3" href="/">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 sm:h-10 sm:w-10">
							<SwapVerticalIcon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
						</div>
						<span className="font-extrabold text-foreground sm:text-lg">DEX Dashboard</span>
						<span className="rounded-md bg-ui-bg-component px-2 py-0.5 text-[10px] text-ui-fg-muted sm:text-xs">
							1.0.0
						</span>
					</Link>
					<div className="flex items-center gap-2">
						<GasPriceIndicator compact />
						<SettingsButton />
						<WalletConnect />
					</div>
				</div>
			</header>

			<main className="relative mx-auto max-w-7xl px-3 sm:px-6">
				<section className="pt-4 pb-8 text-center sm:pt-8 sm:pb-12">
					<HeroStatusPill />
					<p className="mb-3 font-extrabold text-2xl text-foreground sm:mb-4 sm:text-5xl">
						Live prices. Real order books. Actual swaps.
					</p>
					<p className="mx-auto mb-6 max-w-xl text-sm text-ui-fg-muted sm:mb-8 sm:text-lg">
						Streaming market data via Binance WebSocket.
						<br />
						Connect your wallet and trade.
					</p>

					<CloneCommand />

					<a
						className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-blue-600"
						href={GITHUB_REPO_URL}
						rel="noopener noreferrer"
						target="_blank"
					>
						<GitHubIcon className="h-4 w-4" />
						View on GitHub
					</a>
				</section>

				<section className="relative pb-12 sm:pb-20">
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="h-[500px] w-[800px] animate-[gradient-shift_8s_ease_infinite] rounded-full bg-[length:200%_200%] bg-gradient-to-br from-blue-500/[0.08] via-purple-500/[0.07] to-blue-500/[0.05] blur-[100px]" />
					</div>
					<DashboardGrid />
				</section>

				<section className="border-border/50 border-t py-12 sm:py-20">
					<div className="mx-auto max-w-4xl text-center">
						<h3 className="mb-8 font-bold text-foreground text-lg sm:mb-10 sm:text-2xl">
							Thanks to
						</h3>

						<div className="mb-12 grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
							{[
								{ icon: NextJsLogo, name: "Next.js", url: "https://nextjs.org" },
								{ icon: TypeScriptLogo, name: "TypeScript", url: "https://typescriptlang.org" },
								{ icon: ReactLogo, name: "React", url: "https://react.dev" },
								{ icon: WagmiLogo, name: "wagmi", url: "https://wagmi.sh" },
								{ icon: ViemLogo, name: "viem", url: "https://viem.sh" },
								{ icon: RainbowKitLogo, name: "RainbowKit", url: "https://rainbowkit.com" },
								{ icon: TailwindLogo, name: "Tailwind", url: "https://tailwindcss.com" },
								{ icon: TanStackLogo, name: "TanStack", url: "https://tanstack.com/query" },
								{
									icon: ThemesLogo,
									name: "next-themes",
									url: "https://github.com/pacocoursey/next-themes",
								},
								{ icon: SonnerLogo, name: "Sonner", url: "https://sonner.emilkowal.ski" },
								{
									icon: WebSocketLogo,
									name: "WebSocket",
									url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
								},
								{
									icon: BinanceLogo,
									name: "Binance",
									url: "https://www.binance.com/en/binance-api",
								},
								{ icon: VitestLogo, name: "Vitest", url: "https://vitest.dev" },
								{ icon: PlaywrightLogo, name: "Playwright", url: "https://playwright.dev" },
								{ icon: BiomeLogo, name: "Biome", url: "https://biomejs.dev" },
							].map((tech) => (
								<a
									className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-zinc-900/50 p-3 transition-all duration-200 hover:border-foreground/30 hover:bg-zinc-800/50 sm:gap-3 sm:p-4"
									href={tech.url}
									key={tech.name}
									rel="noopener noreferrer"
									target="_blank"
								>
									<tech.icon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-foreground sm:h-8 sm:w-8" />
									<span className="text-[10px] text-zinc-500 transition-colors group-hover:text-zinc-300 sm:text-xs">
										{tech.name}
									</span>
								</a>
							))}
						</div>

						<div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">60</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">FPS Rendering</div>
							</div>
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">
									100ms
								</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">Live Updates</div>
							</div>
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">10+</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">Wallet Support</div>
							</div>
							<div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center backdrop-blur-sm">
								<div className="mb-2 font-extrabold text-2xl text-foreground sm:text-3xl">100%</div>
								<div className="text-[10px] text-ui-fg-muted sm:text-xs">TypeScript</div>
							</div>
						</div>
					</div>
				</section>

				<footer className="border-border/50 border-t py-8 text-center sm:py-12">
					<div className="flex items-center justify-center gap-4">
						<a
							className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-ui-fg-subtle transition-colors hover:text-foreground sm:text-sm"
							href={GITHUB_REPO_URL}
							rel="noopener noreferrer"
							target="_blank"
						>
							<GitHubIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							View Source
						</a>
						<span className="text-ui-fg-disabled">|</span>
						<a
							className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-ui-fg-subtle transition-colors hover:text-foreground sm:text-sm"
							href="https://github.com/lovrozagar"
							rel="noopener noreferrer"
							target="_blank"
						>
							<GitHubIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							@lovrozagar
						</a>
					</div>
				</footer>
			</main>
		</div>
	)
}
