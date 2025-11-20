
import { finnhubClient } from './finnhub';
import redisClient from '../redis';

const BASE_CURRENCY = 'PLN';

export async function getExchangeRate(from: string, to: string = BASE_CURRENCY): Promise<number> {
    if (from === to) return 1;

    const pair = `${from}/${to}`; // e.g. USD/PLN
    const cacheKey = `fx:${pair}`;

    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        return parseFloat(cached);
    }

    // Fetch from Finnhub (using forex rates if available, or estimate)
    // For MVP, we might use a static fallback or a specific endpoint
    // Finnhub forex: /forex/rates?base=USD
    try {
        // Note: Finnhub free tier might not support all forex. 
        // We'll implement a simple fetcher or mock for now if needed.
        // Using a mock for common pairs if API fails or for MVP speed.

        // Mock rates for MVP to ensure it works without complex forex API subscription
        const mockRates: Record<string, number> = {
            'USD/PLN': 4.0,
            'EUR/PLN': 4.3,
            'GBP/PLN': 5.0,
        };

        const rate = mockRates[pair];
        if (rate) {
            await redisClient.set(cacheKey, rate.toString(), { EX: 3600 }); // Cache for 1 hour
            return rate;
        }

        return 1; // Fallback
    } catch (err) {
        console.error(`Error fetching FX rate for ${pair}`, err);
        return 1;
    }
}
