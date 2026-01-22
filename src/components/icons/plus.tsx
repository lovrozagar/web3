import type { IconProps } from "./types"

export function PlusIcon({ className, ...props }: IconProps) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}
