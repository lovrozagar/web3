import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { generateSparklineData, Sparkline } from "@/components/sparkline"

describe("Sparkline", () => {
	const sampleData = [100, 105, 103, 110, 108, 115, 112, 120]
	const upData = [100, 105, 110, 115, 120]
	const downData = [120, 115, 110, 105, 100]

	describe("rendering", () => {
		it("renders SVG element with correct dimensions", () => {
			const { container } = render(<Sparkline data={sampleData} />)

			const svg = container.querySelector("svg")
			expect(svg).toBeInTheDocument()
			expect(svg).toHaveAttribute("width", "60")
			expect(svg).toHaveAttribute("height", "24")
		})

		it("renders with custom dimensions", () => {
			const { container } = render(<Sparkline data={sampleData} height={40} width={100} />)

			const svg = container.querySelector("svg")
			expect(svg).toHaveAttribute("width", "100")
			expect(svg).toHaveAttribute("height", "40")
		})

		it("renders path elements for line and area", () => {
			const { container } = render(<Sparkline data={sampleData} />)

			const paths = container.querySelectorAll("path")
			// Should have area path and line path
			expect(paths.length).toBeGreaterThanOrEqual(1)
		})

		it("renders gradient definition when showArea is true", () => {
			const { container } = render(<Sparkline data={sampleData} showArea />)

			expect(container.querySelector("linearGradient")).toBeInTheDocument()
		})

		it("does not render gradient when showArea is false", () => {
			const { container } = render(<Sparkline data={sampleData} showArea={false} />)

			expect(container.querySelector("linearGradient")).not.toBeInTheDocument()
		})
	})

	describe("trend colors", () => {
		it("uses positive color for upward trend", () => {
			const { container } = render(<Sparkline data={upData} positiveColor="#10b981" />)

			const linePath = container.querySelector('path[stroke="#10b981"]')
			expect(linePath).toBeInTheDocument()
		})

		it("uses negative color for downward trend", () => {
			const { container } = render(<Sparkline data={downData} negativeColor="#ef4444" />)

			const linePath = container.querySelector('path[stroke="#ef4444"]')
			expect(linePath).toBeInTheDocument()
		})

		it("allows custom colors", () => {
			const { container } = render(
				<Sparkline data={upData} negativeColor="#ff0000" positiveColor="#00ff00" />,
			)

			const linePath = container.querySelector('path[stroke="#00ff00"]')
			expect(linePath).toBeInTheDocument()
		})
	})

	describe("edge cases", () => {
		it("renders placeholder for insufficient data", () => {
			const { container } = render(<Sparkline data={[100]} />)

			// Should render a placeholder div instead of SVG
			expect(container.querySelector("svg")).not.toBeInTheDocument()
			expect(container.querySelector("div")).toBeInTheDocument()
		})

		it("renders placeholder for empty data", () => {
			const { container } = render(<Sparkline data={[]} />)

			expect(container.querySelector("svg")).not.toBeInTheDocument()
			expect(container.querySelector("div")).toBeInTheDocument()
		})

		it("handles equal start and end prices (flat trend)", () => {
			const flatData = [100, 99, 101, 100]
			const { container } = render(<Sparkline data={flatData} />)

			// Should use positive color for neutral trend
			const linePath = container.querySelector('path[stroke="#10b981"]')
			expect(linePath).toBeInTheDocument()
		})

		it("handles very small price changes", () => {
			const smallChangeData = [100, 100.001, 100.002, 100.003]
			const { container } = render(<Sparkline data={smallChangeData} />)

			expect(container.querySelector("svg")).toBeInTheDocument()
		})

		it("handles large price swings", () => {
			const volatileData = [100, 200, 50, 300, 25, 400]
			const { container } = render(<Sparkline data={volatileData} />)

			expect(container.querySelector("svg")).toBeInTheDocument()
			expect(container.querySelector("path")).toBeInTheDocument()
		})
	})

	describe("custom className", () => {
		it("applies custom className to SVG", () => {
			const { container } = render(<Sparkline className="custom-class" data={sampleData} />)

			expect(container.querySelector("svg")).toHaveClass("custom-class")
		})

		it("applies custom className to placeholder", () => {
			const { container } = render(<Sparkline className="custom-class" data={[]} />)

			expect(container.querySelector("div")).toHaveClass("custom-class")
		})
	})
})

describe("generateSparklineData", () => {
	it("generates correct number of data points", () => {
		const data = generateSparklineData(100, 5)

		expect(data.length).toBe(20)
	})

	it("ends at current price", () => {
		const currentPrice = 100
		const data = generateSparklineData(currentPrice, 5)

		expect(data[data.length - 1]).toBe(currentPrice)
	})

	it("starts from calculated start price for positive change", () => {
		const currentPrice = 105
		const changePercent = 5
		const data = generateSparklineData(currentPrice, changePercent)

		// Start price should be approximately 100
		expect(data[0]).toBeGreaterThan(90)
		expect(data[0]).toBeLessThan(110)
	})

	it("handles negative change percent", () => {
		const currentPrice = 95
		const changePercent = -5
		const data = generateSparklineData(currentPrice, changePercent)

		// Start price should be higher than current
		expect(data[data.length - 1]).toBe(currentPrice)
	})

	it("handles zero change percent", () => {
		const currentPrice = 100
		const changePercent = 0
		const data = generateSparklineData(currentPrice, changePercent)

		expect(data[data.length - 1]).toBe(currentPrice)
	})
})
