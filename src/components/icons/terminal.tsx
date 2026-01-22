import type { IconProps } from "./types"

export function TerminalIcon({ className, ...props }: IconProps) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
