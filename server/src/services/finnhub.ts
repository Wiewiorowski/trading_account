
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { handleTradeMessage } from './marketData';

// @ts-ignore
import finnhub from 'finnhub';

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

if (!FINNHUB_API_KEY) {
    console.error('❌ FINNHUB_API_KEY is missing in .env');
    process.exit(1);
}

// REST Client
export const finnhubClient = new finnhub.DefaultApi({
    apiKey: FINNHUB_API_KEY
});

// WebSocket Client
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const subscriptions = new Set<string>();
let wasRateLimited = false;

export function connectFinnhubWS() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        console.log('Finnhub WS already connected or connecting');
        return;
    }

    const url = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;
    console.log('Connecting to Finnhub WS...');

    socket = new WebSocket(url);

    socket.on('open', async () => {
        console.log('✅ Finnhub WS Connected');
        reconnectAttempts = 0;
        wasRateLimited = false;

        // Resubscribe to all symbols on reconnect with delay to avoid rate limits
        const symbols = Array.from(subscriptions);
        for (const symbol of symbols) {
            if (socket?.readyState === WebSocket.OPEN) {
                console.log(`Resubscribing to ${symbol}`);
                socket.send(JSON.stringify({ type: 'subscribe', symbol }));
                // Wait 1 second between subscriptions to be safe
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    });

    socket.on('message', (data: WebSocket.Data) => {
        try {
            const message = JSON.parse(data.toString());
            if (message.type === 'trade') {
                handleTradeMessage(message.data);
            }
        } catch (err) {
            console.error('Error parsing Finnhub message:', err);
        }
    });

    socket.on('close', () => {
        let delay = Math.min(30000, (reconnectAttempts + 1) * 5000);

        if (wasRateLimited) {
            console.warn('⚠️ Rate limit hit. Waiting longer before reconnecting...');
            delay = 60000; // Wait 1 minute if rate limited
        }

        console.warn(`⚠️ Finnhub WS Disconnected. Reconnecting in ${delay / 1000}s...`);
        socket = null;

        setTimeout(() => {
            reconnectAttempts++;
            connectFinnhubWS();
        }, delay);
    });

    socket.on('error', (err) => {
        console.error('❌ Finnhub WS Error:', err.message);
        if (err.message.includes('429')) {
            wasRateLimited = true;
        }
    });
}

export function subscribeSymbol(symbol: string) {
    if (subscriptions.has(symbol)) {
        return;
    }
    subscriptions.add(symbol);

    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log(`Subscribing to ${symbol}`);
        socket.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
}

export function unsubscribeSymbol(symbol: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
    subscriptions.delete(symbol);
}
