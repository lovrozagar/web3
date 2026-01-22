import type { IconProps } from "./types"

export function ArrowRightIcon({ className, ...props }: IconProps) {
	return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
			<path
				d="M14 5l7 7m0 0l-7 7m7-7H3"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
			/>
		</svg>
	)
}
