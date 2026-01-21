import type { OrderBookEntry, PriceDirection, TickerData } from "@/types"

interface CreateTickerDataOptions {
	symbol?: string
	price?: string
	priceChange?: string
	priceChangePercent?: string
	high24h?: string
	low24h?: string
	volume24h?: string
	quoteVolume24h?: string
	direction?: PriceDirection
}

export function createTickerData(options: CreateTickerDataOptions = {}): TickerData {
	const price = options.price ?? "3000.00"
	const priceNum = Number.parseFloat(price)

	return {
		direction: options.direction ?? "neutral",
		high24h: options.high24h ?? (priceNum * 1.02).toFixed(2),
		low24h: options.low24h ?? (priceNum * 0.98).toFixed(2),
		price,
		priceChange: options.priceChange ?? "50.00",
		priceChangePercent: options.priceChangePercent ?? "1.69",
		quoteVolume24h: options.quoteVolume24h ?? "150000000.00",
		symbol: options.symbol ?? "ETH",
		volume24h: options.volume24h ?? "50000.00",
	}
}

/* create binance websocket ticker message format */
export function createBinanceTickerMessage(
	symbol: string,
	price: string,
	changePercent: string,
): { data: Record<string, string>; stream: string } {
	const priceNum = Number.parseFloat(price)
	const change = priceNum * (Number.parseFloat(changePercent) / 100)

	return {
		data: {
			c: price,
			h: (priceNum * 1.02).toFixed(2),
			l: (priceNum * 0.98).toFixed(2),
			P: changePercent,
			p: change.toFixed(2),
			q: "150000000.00",
			s: `${symbol}USDT`,
			v: "50000.00",
		},
		stream: `${symbol.toLowerCase()}usdt@ticker`,
	}
}

interface CreateOrderBookEntryOptions {
	price?: string
	quantity?: string
	total?: number
}

export function createOrderBookEntry(options: CreateOrderBookEntryOptions = {}): OrderBookEntry {
	return {
		price: options.price ?? "3000.00",
		quantity: options.quantity ?? "1.5000",
		total: options.total ?? 1.5,
	}
}

export function createOrderBookBids(count: number, basePrice = 3000): OrderBookEntry[] {
	let runningTotal = 0
	return Array.from({ length: count }, (_, i) => {
		const price = (basePrice - i * 0.01).toFixed(2)
		const quantity = (Math.random() * 10 + 0.1).toFixed(4)
		runningTotal += Number.parseFloat(quantity)
		return {
			price,
			quantity,
			total: runningTotal,
		}
	})
}

export function createOrderBookAsks(count: number, basePrice = 3000.01): OrderBookEntry[] {
	let runningTotal = 0
	return Array.from({ length: count }, (_, i) => {
		const price = (basePrice + i * 0.01).toFixed(2)
		const quantity = (Math.random() * 10 + 0.1).toFixed(4)
		runningTotal += Number.parseFloat(quantity)
		return {
			price,
			quantity,
			total: runningTotal,
		}
	})
}

/* create binance websocket depth message format */
export function createBinanceDepthMessage(
	bidsCount = 10,
	asksCount = 10,
	basePrice = 3000,
): { bids: [string, string][]; asks: [string, string][]; lastUpdateId: number } {
	const bids: [string, string][] = Array.from({ length: bidsCount }, (_, i) => [
		(basePrice - i * 0.01).toFixed(2),
		(Math.random() * 10 + 0.1).toFixed(4),
	])

	const asks: [string, string][] = Array.from({ length: asksCount }, (_, i) => [
		(basePrice + 0.01 + i * 0.01).toFixed(2),
		(Math.random() * 10 + 0.1).toFixed(4),
	])

	return {
		asks,
		bids,
		lastUpdateId: Date.now(),
	}
}

interface CreateTradeOptions {
	id?: number
	price?: string
	quantity?: string
	time?: number
	isBuyerMaker?: boolean
}

export function createTrade(options: CreateTradeOptions = {}) {
	return {
		id: options.id ?? Math.floor(Math.random() * 1000000),
		isBuyerMaker: options.isBuyerMaker ?? Math.random() > 0.5,
		price: options.price ?? "3000.00",
		quantity: options.quantity ?? "0.5000",
		time: options.time ?? Date.now(),
	}
}

export function createBinanceTradeMessage(
	price: string,
	quantity: string,
	isBuyerMaker: boolean,
): { e: string; s: string; p: string; q: string; T: number; m: boolean; t: number } {
	return {
		e: "trade",
		m: isBuyerMaker,
		p: price,
		q: quantity,
		s: "ETHUSDT",
		T: Date.now(),
		t: Math.floor(Math.random() * 1000000),
	}
}

type TransactionStatus = "pending" | "confirmed" | "failed"

interface CreateTransactionOptions {
	hash?: string
	fromToken?: string
	toToken?: string
	fromAmount?: string
	toAmount?: string
	status?: TransactionStatus
	timestamp?: number
	chainId?: number
	error?: string
}

export function createTransaction(options: CreateTransactionOptions = {}) {
	return {
		chainId: options.chainId ?? 1,
		error: options.error,
		fromAmount: options.fromAmount ?? "1.0",
		fromToken: options.fromToken ?? "ETH",
		hash: options.hash ?? `0x${Math.random().toString(16).slice(2)}`,
		status: options.status ?? "pending",
		timestamp: options.timestamp ?? Date.now(),
		toAmount: options.toAmount ?? "3000.00",
		toToken: options.toToken ?? "USDT",
	}
}

type OrderStatus = "pending" | "filled" | "cancelled"
type OrderSide = "buy" | "sell"

interface CreateLimitOrderOptions {
	id?: string
	token?: string
	price?: string
	amount?: string
	side?: OrderSide
	status?: OrderStatus
	createdAt?: number
	filledAt?: number
}

export function createLimitOrder(options: CreateLimitOrderOptions = {}) {
	return {
		amount: options.amount ?? "1.0",
		createdAt: options.createdAt ?? Date.now(),
		filledAt: options.filledAt,
		id: options.id ?? crypto.randomUUID(),
		price: options.price ?? "3000.00",
		side: options.side ?? "buy",
		status: options.status ?? "pending",
		token: options.token ?? "ETH",
	}
}

type AlertDirection = "above" | "below"

interface CreatePriceAlertOptions {
	id?: string
	token?: string
	price?: string
	direction?: AlertDirection
	createdAt?: number
}

export function createPriceAlert(options: CreatePriceAlertOptions = {}) {
	return {
		createdAt: options.createdAt ?? Date.now(),
		direction: options.direction ?? "above",
		id: options.id ?? crypto.randomUUID(),
		price: options.price ?? "4000.00",
		token: options.token ?? "ETH",
	}
}

interface CreateUserPreferencesOptions {
	defaultSlippage?: number
	orderBookDepth?: 10 | 20
	orderBookUpdateSpeed?: 100 | 250 | 500 | 1000
}

export function createUserPreferences(options: CreateUserPreferencesOptions = {}) {
	return {
		defaultSlippage: options.defaultSlippage ?? 0.5,
		orderBookDepth: options.orderBookDepth ?? 10,
		orderBookUpdateSpeed: options.orderBookUpdateSpeed ?? 100,
	}
}

/* generate a stream of price updates for testing */
export async function* createPriceStream(
	symbol: string,
	startPrice: number,
	volatility = 0.001,
	count = 100,
	intervalMs = 100,
): AsyncGenerator<{ symbol: string; price: string; change: string }> {
	let currentPrice = startPrice

	for (let i = 0; i < count; i++) {
		/* random walk with mean reversion */
		const change = (Math.random() - 0.5) * 2 * volatility * currentPrice
		currentPrice += change
		currentPrice = Math.max(currentPrice * 0.5, currentPrice) /* floor at 50% of start */
		currentPrice = Math.min(currentPrice * 1.5, currentPrice) /* ceiling at 150% of start */

		yield {
			change: ((currentPrice / startPrice - 1) * 100).toFixed(2),
			price: currentPrice.toFixed(2),
			symbol,
		}

		await new Promise((resolve) => setTimeout(resolve, intervalMs))
	}
}

/* simulate burst of trades (for stress testing) */
export function createTradeBurst(
	count: number,
	basePrice = 3000,
): ReturnType<typeof createTrade>[] {
	return Array.from({ length: count }, (_, i) => {
		const priceOffset = (Math.random() - 0.5) * 10
		return createTrade({
			id: i,
			price: (basePrice + priceOffset).toFixed(2),
			quantity: (Math.random() * 5).toFixed(4),
			time: Date.now() - (count - i) * 100 /* spread over time */,
		})
	})
}
