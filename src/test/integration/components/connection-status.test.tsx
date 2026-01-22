import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ConnectionStatus } from "@/components/connection-status"
import { StatusDot } from "@/components/status-dot"

describe("ConnectionStatus", () => {
	describe("connected state", () => {
		it("shows Live label when connected", () => {
			render(<ConnectionStatus state="connected" />)

			expect(screen.getByText("Live")).toBeInTheDocument()
			expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Connection status: Live")
		})

		it("shows stale warning when no data for 30+ seconds", () => {
			render(<ConnectionStatus showLastUpdate state="connected" timeSinceLastMessage={35000} />)

			expect(screen.getByText("Stale data")).toBeInTheDocument()
			expect(screen.getByRole("status")).toHaveAttribute(
				"aria-label",
				"Connection status: Stale data",
			)
		})

		it("shows time since last message when showLastUpdate is true", () => {
			render(<ConnectionStatus showLastUpdate state="connected" timeSinceLastMessage={5000} />)

			expect(screen.getByText("5s ago")).toBeInTheDocument()
		})

		it("shows minutes format for longer durations", () => {
			render(<ConnectionStatus showLastUpdate state="connected" timeSinceLastMessage={120000} />)

			expect(screen.getByText("2m ago")).toBeInTheDocument()
		})
	})

	describe("connecting state", () => {
		it("shows Connecting label", () => {
			render(<ConnectionStatus state="connecting" />)

			expect(screen.getByText("Connecting")).toBeInTheDocument()
		})
	})

	describe("reconnecting state", () => {
		it("shows reconnect attempts", () => {
			render(<ConnectionStatus reconnectAttempts={3} state="reconnecting" />)

			expect(screen.getByText("Reconnecting")).toBeInTheDocument()
			expect(screen.getByText("Attempt 3/10")).toBeInTheDocument()
		})
	})

	describe("disconnected state", () => {
		it("shows Disconnected label", () => {
			render(<ConnectionStatus state="disconnected" />)

			expect(screen.getByText("Disconnected")).toBeInTheDocument()
		})

		it("shows reconnect button when onReconnect provided", () => {
			const onReconnect = vi.fn()
			render(<ConnectionStatus onReconnect={onReconnect} state="disconnected" />)

			const reconnectButton = screen.getByRole("button", { name: "Reconnect to server" })
			expect(reconnectButton).toBeInTheDocument()

			fireEvent.click(reconnectButton)
			expect(onReconnect).toHaveBeenCalledTimes(1)
		})
	})

	describe("failed state", () => {
		it("shows Connection failed label", () => {
			render(<ConnectionStatus state="failed" />)

			expect(screen.getByText("Connection failed")).toBeInTheDocument()
		})

		it("shows reconnect button when onReconnect provided", () => {
			const onReconnect = vi.fn()
			render(<ConnectionStatus onReconnect={onReconnect} state="failed" />)

			expect(screen.getByRole("button", { name: "Reconnect to server" })).toBeInTheDocument()
		})
	})

	describe("idle state", () => {
		it("shows Idle label", () => {
			render(<ConnectionStatus state="idle" />)

			expect(screen.getByText("Idle")).toBeInTheDocument()
		})
	})

	describe("compact mode", () => {
		it("renders compact version when compact is true", () => {
			render(<ConnectionStatus compact state="connected" />)

			expect(screen.getByText("Live")).toBeInTheDocument()
			// In compact mode, should have smaller styling
			expect(screen.getByRole("status")).toHaveClass("items-center", "gap-1.5")
		})
	})
})

describe("StatusDot", () => {
	it("renders status dot with correct state", () => {
		render(<StatusDot state="connected" />)

		const statusDot = screen.getByRole("status")
		expect(statusDot).toHaveAttribute("aria-label", "Connection: Live")
		expect(statusDot).toHaveAttribute("title", "Live")
	})

	it("applies custom className", () => {
		render(<StatusDot className="custom-class" state="connected" />)

		expect(screen.getByRole("status")).toHaveClass("custom-class")
	})

	it("shows pulse animation for connecting state", () => {
		const { container } = render(<StatusDot state="connecting" />)

		// Should have pulse animation element
		expect(container.querySelector(".animate-ping")).toBeInTheDocument()
	})

	it("does not show pulse for connected state", () => {
		const { container } = render(<StatusDot state="connected" />)

		expect(container.querySelector(".animate-ping")).not.toBeInTheDocument()
	})
})
