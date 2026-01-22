import type { IconProps } from "./types"

export function CheckIcon({ className, ...props }: IconProps) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={2.5}
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}
