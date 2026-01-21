import { QueryClient } from "@tanstack/react-query"

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				/* garbage collect unused data after 10 minutes */
				gcTime: 10 * 60 * 1000,

				/* refetch once on reconnect if data is stale */
				refetchOnReconnect: true,

				/* retry each failed query once */
				retry: 1,

				/* data is fresh for 3 minutes before refetch */
				staleTime: 3 * 60 * 1000,
			},
		},
	})
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
	if (typeof window === "undefined") {
		/* server: always make a new query client */
		return createQueryClient()
	}

	/* browser: reuse existing client to avoid re-creating during suspense */
	if (!browserQueryClient) {
		browserQueryClient = createQueryClient()
	}

	return browserQueryClient
}

export { getQueryClient }
