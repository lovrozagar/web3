"use client"

import { Component, type ReactNode } from "react"

interface ErrorBoundaryProps {
	children: ReactNode
	fallback?: ReactNode
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
	error: Error | null
	hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { error: null, hasError: false }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error, hasError: true }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error("[ErrorBoundary] Caught error:", error, errorInfo)
		this.props.onError?.(error, errorInfo)
	}

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 p-6">
					<div className="mb-2 font-medium text-lg text-red-400">Something went wrong</div>
					<p className="mb-4 max-w-md text-center text-sm text-zinc-400">
						{this.state.error?.message ?? "An unexpected error occurred"}
					</p>
					<button
						className="rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/30"
						onClick={() => this.setState({ error: null, hasError: false })}
						type="button"
					>
						Try again
					</button>
				</div>
			)
		}

		return this.props.children
	}
}

/** Fallback component for feature sections */
export function FeatureErrorFallback({
	featureName,
	onRetry,
}: {
	featureName: string
	onRetry?: () => void
}): ReactNode {
	return (
		<div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
			<div className="mb-2 font-medium text-lg text-zinc-300">{featureName} unavailable</div>
			<p className="mb-4 text-sm text-zinc-500">Failed to load this component</p>
			{onRetry && (
				<button
					className="rounded-lg bg-zinc-700 px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-600"
					onClick={onRetry}
					type="button"
				>
					Retry
				</button>
			)}
		</div>
	)
}
