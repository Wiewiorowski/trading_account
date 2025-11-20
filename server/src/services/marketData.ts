
import redisClient from '../redis';

interface Trade {
    s: string; // Symbol
    p: number; // Price
    t: number; // Timestamp
    v: number; // Volume
}

export async function handleTradeMessage(trades: Trade[]) {
    if (!trades || trades.length === 0) return;

    const pipeline = redisClient.multi();
    const now = Date.now();

    // Group by symbol to get latest price per batch
    const latestPrices: Record<string, number> = {};

    trades.forEach(trade => {
        latestPrices[trade.s] = trade.p;
    });

    for (const [symbol, price] of Object.entries(latestPrices)) {
        const key = `price:${symbol}`;
        // Store latest price and timestamp
        pipeline.hSet(key, {
            price: price.toString(),
            ts: now.toString()
        });
        // Publish update for real-time subscribers
        pipeline.publish('price_updates', JSON.stringify({ symbol, price, ts: now }));
    }

    try {
        await pipeline.exec();
    } catch (err) {
        console.error('Error updating Redis with market data:', err);
    }
}

export async function getLatestPrice(symbol: string): Promise<{ price: number, ts: number } | null> {
    const data = await redisClient.hGetAll(`price:${symbol}`);
    if (!data || !data.price) return null;
    return {
        price: parseFloat(data.price),
        ts: parseInt(data.ts)
    };
}
