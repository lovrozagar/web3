import react from "@vitejs/plugin-react"
import { resolve } from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@test": resolve(__dirname, "./src/test"),
		},
	},
	test: {
		coverage: {
			exclude: [
				"node_modules/**",
				"src/app/**",
				"src/test/**",
				"**/*.d.ts",
				"**/*.config.*",
				"**/types/**",
			],
			include: ["src/**/*.{ts,tsx}"],
			provider: "v8",
			reporter: ["text", "json", "html"],
			thresholds: {
				statements: 80,
				branches: 75,
				functions: 80,
				lines: 80,
			},
		},
		environment: "jsdom",
		globals: true,
		include: [
			"src/test/unit/**/*.{test,spec}.{ts,tsx}",
			"src/test/integration/**/*.{test,spec}.{ts,tsx}",
		],
		setupFiles: ["./src/test/setup.ts"],
		testTimeout: 10000,
		pool: "forks",
	},
})
