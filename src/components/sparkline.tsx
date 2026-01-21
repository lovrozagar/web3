"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"

interface SparklineProps {
	/** Array of price values */
	data: number[]
	/** Width of the sparkline */
	width?: number
	/** Height of the sparkline */
	height?: number
	/** Color for positive trend */
	positiveColor?: string
	/** Color for negative trend */
	negativeColor?: string
	/** Show area fill under the line */
	showArea?: boolean
	/** Additional className */
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

		/* normalize data to fit within the height */
		const padding = 2
		const chartHeight = height - padding * 2
		const chartWidth = width - padding * 2

		const points = data.map((value, index) => {
			const x = padding + (index / (data.length - 1)) * chartWidth
			const y = padding + chartHeight - ((value - min) / range) * chartHeight
			return { x, y }
		})

		/* create line path */
		const pathLine = points
			.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
			.join(" ")

		/* create area path (for gradient fill) */
		const pathArea = `${pathLine} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`

		/* determine trend color */
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

/** Generate mock sparkline data based on current price and change percent */
export function generateSparklineData(currentPrice: number, changePercent: number): number[] {
	const points = 20
	const data: number[] = []

	/* calculate starting price based on change percent */
	const startPrice = currentPrice / (1 + changePercent / 100)

	/* generate semi-random path from start to current */
	for (let i = 0; i < points; i++) {
		const progress = i / (points - 1)
		const trend = startPrice + (currentPrice - startPrice) * progress
		/* add some noise */
		const noise = (Math.random() - 0.5) * (currentPrice - startPrice) * 0.3
		data.push(trend + noise)
	}

	/* ensure last point is exactly current price */
	data[data.length - 1] = currentPrice

	return data
}
