type PublicEnv = {
	GITHUB_REPO_URL: string
	WALLETCONNECT_PROJECT_ID: string
}

let cachedEnv: PublicEnv | null = null

export function getPublicEnv(): PublicEnv {
	if (cachedEnv) return cachedEnv

	const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL
	const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

	if (!GITHUB_REPO_URL) {
		throw new Error("NEXT_PUBLIC_GITHUB_REPO_URL environment variable is not set")
	}

	if (!WALLETCONNECT_PROJECT_ID) {
		throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable is not set")
	}

	cachedEnv = { GITHUB_REPO_URL, WALLETCONNECT_PROJECT_ID }
	return cachedEnv
}
