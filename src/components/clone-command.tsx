"use client"

import { useState } from "react"
import { CheckIcon } from "@/components/icons/check"
import { CopyIcon } from "@/components/icons/copy"
import { TerminalIcon } from "@/components/icons/terminal"
import { GITHUB_REPO_URL } from "@/constants/ui"

const CLONE_COMMAND = `git clone ${GITHUB_REPO_URL}`

export function CloneCommand() {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		await navigator.clipboard.writeText(CLONE_COMMAND)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="mx-auto mb-5 flex max-w-lg items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:mb-6 sm:px-5 sm:py-4">
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ui-bg-field">
				<TerminalIcon className="h-4 w-4 text-ui-fg-muted" />
			</div>
			<code className="min-w-0 flex-1 truncate font-mono text-foreground text-xs sm:text-sm">
				{CLONE_COMMAND}
			</code>
			<button
				className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-medium text-xs transition-all sm:text-sm ${
					copied
						? "bg-emerald-500/20 text-emerald-500"
						: "bg-ui-bg-field text-ui-fg-subtle hover:bg-ui-bg-hover hover:text-foreground"
				}`}
				onClick={handleCopy}
				type="button"
			>
				{copied ? (
					<span className="flex items-center gap-1.5">
						<CheckIcon className="h-3.5 w-3.5" />
						Copied
					</span>
				) : (
					<span className="flex items-center gap-1.5">
						<CopyIcon className="h-3.5 w-3.5" />
						Copy
					</span>
				)}
			</button>
		</div>
	)
}
