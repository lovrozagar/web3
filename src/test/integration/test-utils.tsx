import { type RenderOptions, render } from "@testing-library/react"
import type { ReactNode } from "react"

/* simple wrapper for tests that don't need providers */
function Wrapper({ children }: { children: ReactNode }) {
	return <>{children}</>
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
	return render(ui, { wrapper: Wrapper, ...options })
}

export * from "@testing-library/react"
export { customRender as render }
