import type { IconProps } from "./types"

export function SwapVerticalIcon({ className, ...props }: IconProps) {
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
				d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
