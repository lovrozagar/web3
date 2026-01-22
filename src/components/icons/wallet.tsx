import type { IconProps } from "./types"

export function WalletIcon({ className, ...props }: IconProps) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			viewBox="0 0 24 24"
			{...props}
		>
			<rect
				height="14"
				rx="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				width="20"
				x="2"
				y="6"
			/>
			<path d="M16 12h.01" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}
