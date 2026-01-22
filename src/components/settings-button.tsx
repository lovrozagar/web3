"use client"

import { useEffect, useRef, useState } from "react"
import { CloseIcon } from "@/components/icons/close"
import { SettingsIcon } from "@/components/icons/settings"
import { cn } from "@/utils/cn"
import { SettingsPanel } from "./settings-panel"

export function SettingsButton() {
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isOpen) return

		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}

		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside)
		}, 0)

		return () => {
			clearTimeout(timeoutId)
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen])

	return (
		<div className="relative" ref={containerRef}>
			<button
				aria-label="Settings"
				className={cn(
					"group flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
					"bg-ui-bg-field/60 text-ui-fg-muted hover:bg-ui-bg-hover hover:text-ui-fg-subtle",
					isOpen && "bg-ui-bg-hover text-ui-fg-subtle",
				)}
				onClick={() => setIsOpen(!isOpen)}
				type="button"
			>
				<SettingsIcon className="h-5 w-5 transition-transform duration-300 ease-out group-hover:rotate-90" />
			</button>

			{isOpen && (
				<div
					className={cn(
						"absolute top-full right-0 z-50 mt-2 w-80",
						"rounded-xl border border-border bg-popover p-4 shadow-xl",
					)}
				>
					<div className="mb-3 flex items-center justify-between">
						<h3 className="font-semibold text-foreground">Settings</h3>
						<button
							className="text-ui-fg-muted hover:text-ui-fg-subtle"
							onClick={() => setIsOpen(false)}
							type="button"
						>
							<CloseIcon className="h-5 w-5" />
						</button>
					</div>
					<SettingsPanel />
				</div>
			)}
		</div>
	)
}
