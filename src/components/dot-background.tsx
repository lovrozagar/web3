export function DotBackground() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: "radial-gradient(circle, var(--ui-fg-muted) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
					opacity: 0.4,
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, var(--background) 70%)",
				}}
			/>
		</div>
	)
}
