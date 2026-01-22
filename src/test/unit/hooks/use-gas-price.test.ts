import { describe, expect, it } from "vitest"
import { estimateTransactionCost, formatGwei, getGasLevel } from "@/utils/gas"

describe("gas price utilities", () => {
	describe("formatGwei", () => {
		it("formats small values with 2 decimal places", () => {
			expect(formatGwei(BigInt(500000000))).toBe("0.50")
			expect(formatGwei(BigInt(100000000))).toBe("0.10")
			expect(formatGwei(BigInt(50000000))).toBe("0.05")
		})

		it("formats values between 1-10 with 1 decimal place", () => {
			expect(formatGwei(BigInt(1500000000))).toBe("1.5")
			expect(formatGwei(BigInt(5500000000))).toBe("5.5")
			expect(formatGwei(BigInt(9900000000))).toBe("9.9")
		})

		it("formats values >= 10 as integers", () => {
			expect(formatGwei(BigInt(10000000000))).toBe("10")
			expect(formatGwei(BigInt(25000000000))).toBe("25")
			expect(formatGwei(BigInt(100000000000))).toBe("100")
		})

		it("handles zero", () => {
			expect(formatGwei(BigInt(0))).toBe("0.00")
		})

		it("handles large values", () => {
			expect(formatGwei(BigInt(500000000000))).toBe("500")
			expect(formatGwei(BigInt(1000000000000))).toBe("1000")
		})
	})

	describe("getGasLevel", () => {
		it("returns low for gwei < 20", () => {
			expect(getGasLevel(5)).toBe("low")
			expect(getGasLevel(15)).toBe("low")
			expect(getGasLevel(19.9)).toBe("low")
		})

		it("returns medium for gwei 20-49", () => {
			expect(getGasLevel(20)).toBe("medium")
			expect(getGasLevel(35)).toBe("medium")
			expect(getGasLevel(49.9)).toBe("medium")
		})

		it("returns high for gwei 50-99", () => {
			expect(getGasLevel(50)).toBe("high")
			expect(getGasLevel(75)).toBe("high")
			expect(getGasLevel(99.9)).toBe("high")
		})

		it("returns extreme for gwei >= 100", () => {
			expect(getGasLevel(100)).toBe("extreme")
			expect(getGasLevel(150)).toBe("extreme")
			expect(getGasLevel(500)).toBe("extreme")
		})
	})

	describe("estimateTransactionCost", () => {
		it("calculates transaction cost correctly", () => {
			// 20 gwei, 21000 gas, $3000 ETH
			// Cost = 20 * 21000 * 10^-9 * 3000 = $1.26
			const gasPrice = BigInt(20 * 1e9) // 20 gwei in wei
			const gasLimit = 21000
			const ethPrice = 3000

			const result = estimateTransactionCost(gasPrice, gasLimit, ethPrice)
			expect(result).toBe("$1.26")
		})

		it("shows <$0.01 for very small costs", () => {
			const gasPrice = BigInt(1 * 1e9) // 1 gwei
			const gasLimit = 1000
			const ethPrice = 1

			const result = estimateTransactionCost(gasPrice, gasLimit, ethPrice)
			expect(result).toBe("<$0.01")
		})

		it("formats costs under $1 correctly", () => {
			const gasPrice = BigInt(10 * 1e9) // 10 gwei
			const gasLimit = 21000
			const ethPrice = 2000

			const result = estimateTransactionCost(gasPrice, gasLimit, ethPrice)
			// 10 * 21000 * 10^-9 * 2000 = $0.42
			expect(result).toBe("$0.42")
		})

		it("formats costs over $1 correctly", () => {
			const gasPrice = BigInt(100 * 1e9) // 100 gwei
			const gasLimit = 100000
			const ethPrice = 3000

			const result = estimateTransactionCost(gasPrice, gasLimit, ethPrice)
			// 100 * 100000 * 10^-9 * 3000 = $30
			expect(result).toBe("$30.00")
		})

		it("handles zero gas price", () => {
			const gasPrice = BigInt(0)
			const gasLimit = 21000
			const ethPrice = 3000

			const result = estimateTransactionCost(gasPrice, gasLimit, ethPrice)
			expect(result).toBe("<$0.01")
		})

		it("handles large swap transactions", () => {
			// Typical DEX swap uses ~150k gas
			const gasPrice = BigInt(50 * 1e9) // 50 gwei
			const gasLimit = 150000
			const ethPrice = 3000

			const result = estimateTransactionCost(gasPrice, gasLimit, ethPrice)
			// 50 * 150000 * 10^-9 * 3000 = $22.50
			expect(result).toBe("$22.50")
		})
	})
})
