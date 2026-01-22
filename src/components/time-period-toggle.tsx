"use client"

import { cn } from "@/utils/cn"

export type TimePeriod = "1h" | "24h" | "7d"

interface TimePeriodToggleProps {
	value: TimePeriod
	onChange: (period: TimePeriod) => void
	className?: string
}

const periods: TimePeriod[] = ["1h", "24h", "7d"]

export function TimePeriodToggle({ value, onChange, className }: TimePeriodToggleProps) {
	return (
		<div className={cn("flex items-center rounded-md bg-ui-bg-field p-0.5", className)}>
			{periods.map((period) => (
				<button
					className={cn(
						"rounded px-1.5 py-0.5 font-medium text-[9px] transition-colors sm:px-2 sm:text-[10px]",
						value === period
							? "bg-ui-bg-base text-foreground shadow-sm"
							: "text-ui-fg-muted hover:text-ui-fg-subtle",
					)}
					key={period}
					onClick={() => onChange(period)}
					type="button"
				>
					{period}
				</button>
			))}
		</div>
	)
}
