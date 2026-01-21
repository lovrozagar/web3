import { describe, expect, it } from "vitest"
import {
	calculateSpread,
	cn,
	formatCompactPrice,
	formatPercent,
	formatPrice,
	formatQuantity,
	formatVolume,
	getPriceDirection,
	truncateAddress,
} from "@/lib/utils"

describe("formatPrice", () => {
	describe("standard formatting", () => {
		it("formats prices below 1000 with 2 decimal places", () => {
			expect(formatPrice("123.456")).toBe("123.46")
			expect(formatPrice(99.999)).toBe("100.00")
			expect(formatPrice("0.12")).toBe("0.12")
		})

		it("formats prices >= 1000 with locale formatting", () => {
			expect(formatPrice("1234.56")).toBe("1,234.56")
			expect(formatPrice(10000)).toBe("10,000.00")
			expect(formatPrice("999999.99")).toBe("999,999.99")
		})

		it("formats very large numbers correctly", () => {
			expect(formatPrice(89000)).toBe("89,000.00")
			expect(formatPrice(100000000)).toBe("100,000,000.00")
		})

		it("formats zero correctly", () => {
			expect(formatPrice(0)).toBe("0.00")
			expect(formatPrice("0")).toBe("0.00")
		})
	})

	describe("decimal precision", () => {
		it("respects custom decimal places", () => {
			expect(formatPrice("123.456789", 4)).toBe("123.4568")
			expect(formatPrice(1000.1234, 3)).toBe("1,000.123")
		})

		it("rounds correctly at boundary", () => {
			expect(formatPrice("123.555")).toBe("123.56") // rounds up
			expect(formatPrice("123.554")).toBe("123.55") // rounds down
		})

		it("handles 0 decimal places", () => {
			expect(formatPrice("123.999", 0)).toBe("124")
		})
	})

	describe("edge cases", () => {
		it("handles very small numbers", () => {
			expect(formatPrice(0.01)).toBe("0.01")
			expect(formatPrice(0.001)).toBe("0.00")
			expect(formatPrice(0.001, 4)).toBe("0.0010")
		})

		it("handles negative numbers", () => {
			expect(formatPrice(-100.5)).toBe("-100.50")
			/* negative numbers < -1000 don't get locale formatting in current impl */
			expect(formatPrice("-1234.56")).toBe("-1234.56")
		})

		it("handles string inputs", () => {
			expect(formatPrice("3000.50")).toBe("3,000.50")
			expect(formatPrice("  100  ")).toBe("100.00")
		})
	})
})

describe("formatPercent", () => {
	describe("positive percentages", () => {
		it("adds + sign for positive values", () => {
			expect(formatPercent("5.5")).toBe("+5.50%")
			expect(formatPercent(10)).toBe("+10.00%")
			expect(formatPercent(0.01)).toBe("+0.01%")
		})

		it("handles large positive percentages", () => {
			expect(formatPercent(150.5)).toBe("+150.50%")
			expect(formatPercent(1000)).toBe("+1000.00%")
		})
	})

	describe("negative percentages", () => {
		it("preserves - sign for negative values", () => {
			expect(formatPercent("-5.5")).toBe("-5.50%")
			expect(formatPercent(-10)).toBe("-10.00%")
		})

		it("handles large negative percentages", () => {
			expect(formatPercent(-99.99)).toBe("-99.99%")
		})
	})

	describe("edge cases", () => {
		it("treats zero as positive", () => {
			expect(formatPercent(0)).toBe("+0.00%")
			expect(formatPercent("0")).toBe("+0.00%")
		})

		it("handles very small changes", () => {
			expect(formatPercent(0.001)).toBe("+0.00%")
			expect(formatPercent(-0.001)).toBe("-0.00%")
		})

		it("handles string inputs", () => {
			expect(formatPercent("5.5")).toBe("+5.50%")
			expect(formatPercent("-3.25")).toBe("-3.25%")
		})
	})
})

describe("formatQuantity", () => {
	describe("large quantities", () => {
		it("formats quantities >= 1M with M suffix", () => {
			expect(formatQuantity("1500000")).toBe("1.50M")
			expect(formatQuantity(2500000)).toBe("2.50M")
			expect(formatQuantity(1000000)).toBe("1.00M")
		})

		it("formats quantities >= 1K with K suffix", () => {
			expect(formatQuantity("1500")).toBe("1.50K")
			expect(formatQuantity(1000)).toBe("1.00K")
			expect(formatQuantity(999999)).toBe("1000.00K")
		})
	})

	describe("small quantities", () => {
		it("formats small quantities with 4 decimal places", () => {
			expect(formatQuantity("123.456")).toBe("123.4560")
			expect(formatQuantity(0.1234)).toBe("0.1234")
			expect(formatQuantity(0.0001)).toBe("0.0001")
		})

		it("formats integer quantities", () => {
			expect(formatQuantity(24)).toBe("24.0000")
			expect(formatQuantity(1)).toBe("1.0000")
		})
	})

	describe("edge cases", () => {
		it("handles zero", () => {
			expect(formatQuantity(0)).toBe("0.0000")
		})

		it("handles boundary at exactly 1000", () => {
			expect(formatQuantity(1000)).toBe("1.00K")
			expect(formatQuantity(999.9999)).toBe("999.9999")
		})
	})
})

describe("formatVolume", () => {
	describe("billions", () => {
		it("formats volumes >= 1B with $B suffix", () => {
			expect(formatVolume("1500000000")).toBe("$1.50B")
			expect(formatVolume(10000000000)).toBe("$10.00B")
			expect(formatVolume(1000000000)).toBe("$1.00B")
		})
	})

	describe("millions", () => {
		it("formats volumes >= 1M with $M suffix", () => {
			expect(formatVolume("5000000")).toBe("$5.00M")
			expect(formatVolume(999000000)).toBe("$999.00M")
			expect(formatVolume(1000000)).toBe("$1.00M")
		})
	})

	describe("thousands", () => {
		it("formats volumes >= 1K with $K suffix", () => {
			expect(formatVolume("5000")).toBe("$5.0K")
			expect(formatVolume(999000)).toBe("$999.0K")
			expect(formatVolume(1000)).toBe("$1.0K")
		})
	})

	describe("small volumes", () => {
		it("formats small volumes with $ prefix", () => {
			expect(formatVolume("500")).toBe("$500")
			expect(formatVolume(123.45)).toBe("$123")
			expect(formatVolume(1)).toBe("$1")
		})
	})

	describe("edge cases", () => {
		it("handles zero", () => {
			expect(formatVolume(0)).toBe("$0")
		})

		it("handles boundary values", () => {
			expect(formatVolume(999.99)).toBe("$1000") // rounds
			expect(formatVolume(1000)).toBe("$1.0K")
		})
	})
})

describe("formatCompactPrice", () => {
	describe("large prices", () => {
		it("formats prices >= 10000 with no decimals", () => {
			expect(formatCompactPrice("15000")).toBe("15,000")
			expect(formatCompactPrice(99999)).toBe("99,999")
			expect(formatCompactPrice(89000)).toBe("89,000")
		})
	})

	describe("medium prices", () => {
		it("formats prices >= 1000 with 1 decimal", () => {
			expect(formatCompactPrice("1234.567")).toBe("1,234.6")
			expect(formatCompactPrice(9999.99)).toBe("10,000") // rounds up
			expect(formatCompactPrice(3045.22)).toBe("3,045.2")
		})
	})

	describe("regular prices", () => {
		it("formats prices >= 1 with 2 decimals", () => {
			expect(formatCompactPrice("123.456")).toBe("123.46")
			expect(formatCompactPrice(1.5)).toBe("1.50")
			expect(formatCompactPrice(12.61)).toBe("12.61")
		})
	})

	describe("small prices", () => {
		it("formats prices < 1 with 4 decimals", () => {
			expect(formatCompactPrice("0.12345")).toBe("0.1235")
			expect(formatCompactPrice(0.001)).toBe("0.0010")
			expect(formatCompactPrice(0.19)).toBe("0.1900")
		})
	})

	describe("edge cases", () => {
		it("handles exactly 1", () => {
			expect(formatCompactPrice(1)).toBe("1.00")
		})

		it("handles exactly 1000", () => {
			/* formatcompactprice uses tolocalestring which may format 1000 as "1,000" */
			const result = formatCompactPrice(1000)
			expect(result).toMatch(/1[,.]?000/)
		})

		it("handles exactly 10000", () => {
			expect(formatCompactPrice(10000)).toBe("10,000")
		})
	})
})

describe("getPriceDirection", () => {
	describe("direction detection", () => {
		it('returns "up" when current > previous', () => {
			expect(getPriceDirection("100", "90")).toBe("up")
			expect(getPriceDirection("1.5", "1.0")).toBe("up")
			expect(getPriceDirection("3000.01", "3000.00")).toBe("up")
		})

		it('returns "down" when current < previous', () => {
			expect(getPriceDirection("90", "100")).toBe("down")
			expect(getPriceDirection("1.0", "1.5")).toBe("down")
			expect(getPriceDirection("2999.99", "3000.00")).toBe("down")
		})

		it('returns "neutral" when prices are equal', () => {
			expect(getPriceDirection("100", "100")).toBe("neutral")
			expect(getPriceDirection("1.5", "1.5")).toBe("neutral")
			expect(getPriceDirection("3000.00", "3000.00")).toBe("neutral")
		})
	})

	describe("edge cases", () => {
		it("handles very small differences", () => {
			expect(getPriceDirection("100.001", "100.000")).toBe("up")
			expect(getPriceDirection("100.000", "100.001")).toBe("down")
		})

		it("handles large numbers", () => {
			expect(getPriceDirection("90000", "89000")).toBe("up")
			expect(getPriceDirection("89000", "90000")).toBe("down")
		})
	})
})

describe("truncateAddress", () => {
	const fullAddress = "0x1234567890abcdef1234567890abcdef12345678"

	describe("default truncation", () => {
		it("truncates address with default 4 chars", () => {
			expect(truncateAddress(fullAddress)).toBe("0x1234...5678")
		})
	})

	describe("custom truncation", () => {
		it("truncates with custom char count", () => {
			expect(truncateAddress(fullAddress, 6)).toBe("0x123456...345678")
			expect(truncateAddress(fullAddress, 2)).toBe("0x12...78")
			/* chars=8 means 8 after 0x prefix, so 0x + 8 chars ... last 8 chars */
			expect(truncateAddress(fullAddress, 8)).toBe("0x12345678...12345678")
		})
	})

	describe("edge cases", () => {
		it("handles short addresses", () => {
			expect(truncateAddress("0x1234")).toBe("0x1234...1234")
		})

		it("handles non-prefixed strings", () => {
			expect(truncateAddress("1234567890")).toBe("123456...7890")
		})
	})
})

describe("calculateSpread", () => {
	describe("spread calculation", () => {
		it("calculates spread and percentage correctly", () => {
			const result = calculateSpread("100", "101")
			expect(result.spread).toBe("1.00")
			expect(result.percent).toBe("0.990")
		})

		it("calculates for realistic prices", () => {
			const result = calculateSpread("3045.22", "3045.23")
			expect(result.spread).toBe("0.01")
			expect(Number.parseFloat(result.percent)).toBeLessThan(0.001)
		})
	})

	describe("spread sizes", () => {
		it("handles small spreads", () => {
			const result = calculateSpread("3200.50", "3200.60")
			expect(result.spread).toBe("0.10")
			expect(Number.parseFloat(result.percent)).toBeLessThan(0.01)
		})

		it("handles large spreads", () => {
			const result = calculateSpread("100", "110")
			expect(result.spread).toBe("10.00")
			expect(result.percent).toBe("9.091")
		})

		it("handles zero spread", () => {
			const result = calculateSpread("100", "100")
			expect(result.spread).toBe("0.00")
			expect(result.percent).toBe("0.000")
		})
	})

	describe("edge cases", () => {
		it("handles inverted bid/ask", () => {
			const result = calculateSpread("110", "100")
			expect(result.spread).toBe("-10.00")
		})
	})
})

describe("cn", () => {
	describe("basic joining", () => {
		it("joins multiple class names", () => {
			expect(cn("foo", "bar", "baz")).toBe("foo bar baz")
		})

		it("joins single class", () => {
			expect(cn("foo")).toBe("foo")
		})
	})

	describe("falsy value filtering", () => {
		it("filters out false", () => {
			expect(cn("foo", false, "bar")).toBe("foo bar")
		})

		it("filters out null", () => {
			expect(cn("foo", null, "bar")).toBe("foo bar")
		})

		it("filters out undefined", () => {
			expect(cn("foo", undefined, "bar")).toBe("foo bar")
		})

		it("filters out empty strings", () => {
			expect(cn("foo", "", "bar")).toBe("foo bar")
		})

		it("filters out all falsy values", () => {
			expect(cn("foo", false, "bar", null, "baz", undefined, "")).toBe("foo bar baz")
		})
	})

	describe("conditional classes", () => {
		it("handles conditional expressions", () => {
			const isActive = true
			const isDisabled = false
			expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active")
		})

		it("handles ternary expressions", () => {
			const isPrimary = true
			expect(cn("btn", isPrimary ? "btn-primary" : "btn-secondary")).toBe("btn btn-primary")
		})
	})

	describe("edge cases", () => {
		it("returns empty string for no arguments", () => {
			expect(cn()).toBe("")
		})

		it("returns empty string for all falsy values", () => {
			expect(cn(false, null, undefined, "")).toBe("")
		})

		it("handles whitespace in class names", () => {
			expect(cn("foo bar", "baz")).toBe("foo bar baz")
		})
	})
})
