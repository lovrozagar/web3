"use client"

import { memo, useMemo } from "react"
import { cn } from "@/utils/cn"

interface SparklineProps {
	data: number[]
	width?: number
	height?: number
	positiveColor?: string
	negativeColor?: string
	showArea?: boolean
	className?: string
}

export const Sparkline = memo(function Sparkline({
	data,
	width = 60,
	height = 24,
	positiveColor = "#10b981",
	negativeColor = "#ef4444",
	showArea = true,
	className,
}: SparklineProps) {
	const { color, pathArea, pathLine } = useMemo(() => {
		if (data.length < 2) {
			return { color: positiveColor, pathArea: "", pathLine: "" }
		}

		const min = Math.min(...data)
		const max = Math.max(...data)
		const range = max - min || 1

		const padding = 2
		const chartHeight = height - padding * 2
		const chartWidth = width - padding * 2

		const points = data.map((value, index) => {
			const x = padding + (index / (data.length - 1)) * chartWidth
			const y = padding + chartHeight - ((value - min) / range) * chartHeight
			return { x, y }
		})

		const pathLine = points
			.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
			.join(" ")

		const pathArea = `${pathLine} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`

		const isPositive = data[data.length - 1] >= data[0]
		const color = isPositive ? positiveColor : negativeColor

		return { color, pathArea, pathLine }
	}, [data, width, height, positiveColor, negativeColor])

	if (data.length < 2) {
		return (
			<div
				className={cn("animate-pulse rounded bg-zinc-700/30", className)}
				style={{ height, width }}
			/>
		)
	}

	const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`

	return (
		<svg
			className={cn("overflow-visible", className)}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			width={width}
		>
			{showArea && (
				<>
					<defs>
						<linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
							<stop offset="0%" stopColor={color} stopOpacity="0.3" />
							<stop offset="100%" stopColor={color} stopOpacity="0" />
						</linearGradient>
					</defs>
					<path d={pathArea} fill={`url(#${gradientId})`} />
				</>
			)}
			<path
				d={pathLine}
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	)
})
