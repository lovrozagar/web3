import type { IconProps } from "./types"

export function ChevronDownIcon({ className, ...props }: IconProps) {
	return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
		</svg>
	)
}
