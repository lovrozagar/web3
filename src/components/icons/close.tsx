import type { IconProps } from "./types"

export function CloseIcon({ className, ...props }: IconProps) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}
