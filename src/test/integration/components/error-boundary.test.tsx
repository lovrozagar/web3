import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ErrorBoundary, FeatureErrorFallback } from "@/components/error-boundary"

/* component that throws an error */
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) {
		throw new Error("Test error message")
	}
	return <div>No error</div>
}

describe("ErrorBoundary", () => {
	/* suppress console.error for these tests */
	const originalError = console.error
	beforeEach(() => {
		console.error = vi.fn()
	})
	afterEach(() => {
		console.error = originalError
	})

	describe("rendering", () => {
		it("renders children when no error occurs", () => {
			render(
				<ErrorBoundary>
					<div>Test content</div>
				</ErrorBoundary>,
			)

			expect(screen.getByText("Test content")).toBeInTheDocument()
		})

		it("renders default error UI when error occurs", () => {
			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(screen.getByText("Something went wrong")).toBeInTheDocument()
			expect(screen.getByText("Test error message")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
		})

		it("renders custom fallback when provided", () => {
			render(
				<ErrorBoundary fallback={<div>Custom fallback</div>}>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(screen.getByText("Custom fallback")).toBeInTheDocument()
			expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument()
		})
	})

	describe("error handling", () => {
		it("calls onError callback when error occurs", () => {
			const onError = vi.fn()

			render(
				<ErrorBoundary onError={onError}>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(onError).toHaveBeenCalledTimes(1)
			expect(onError).toHaveBeenCalledWith(
				expect.any(Error),
				expect.objectContaining({
					componentStack: expect.any(String),
				}),
			)
		})
	})

	describe("recovery", () => {
		it("resets error state when Try again button is clicked", () => {
			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(screen.getByText("Something went wrong")).toBeInTheDocument()

			const tryAgainButton = screen.getByRole("button", { name: "Try again" })
			expect(tryAgainButton).toBeInTheDocument()
			fireEvent.click(tryAgainButton)
			expect(screen.getByText("Something went wrong")).toBeInTheDocument()
		})
	})
})

describe("FeatureErrorFallback", () => {
	it("displays feature name", () => {
		render(<FeatureErrorFallback featureName="Order Book" />)

		expect(screen.getByText("Order Book unavailable")).toBeInTheDocument()
		expect(screen.getByText("Failed to load this component")).toBeInTheDocument()
	})

	it("shows retry button when onRetry is provided", () => {
		const onRetry = vi.fn()
		render(<FeatureErrorFallback featureName="Charts" onRetry={onRetry} />)

		const retryButton = screen.getByRole("button", { name: "Retry" })
		expect(retryButton).toBeInTheDocument()

		fireEvent.click(retryButton)
		expect(onRetry).toHaveBeenCalledTimes(1)
	})

	it("hides retry button when onRetry is not provided", () => {
		render(<FeatureErrorFallback featureName="Swap" />)

		expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
	})
})
