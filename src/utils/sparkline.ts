export function generateSparklineData(currentPrice: number, changePercent: number): number[] {
	const points = 20
	const data: number[] = []

	const startPrice = currentPrice / (1 + changePercent / 100)

	for (let i = 0; i < points; i++) {
		const progress = i / (points - 1)
		const trend = startPrice + (currentPrice - startPrice) * progress
		const noise = (Math.random() - 0.5) * (currentPrice - startPrice) * 0.3
		data.push(trend + noise)
	}

	data[data.length - 1] = currentPrice

	return data
}
