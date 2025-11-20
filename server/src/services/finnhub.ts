
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { handleTradeMessage } from './marketData';

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

export function connectFinnhubWS() {
    const url = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;
    console.log('Connecting to Finnhub WS...');

    socket = new WebSocket(url);

    socket.on('open', () => {
        console.log('✅ Finnhub WS Connected');
        reconnectAttempts = 0;
        // Resubscribe to all symbols on reconnect
        subscriptions.forEach(symbol => subscribeSymbol(symbol));
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
        const delay = Math.min(30000, (reconnectAttempts + 1) * 5000);
        console.warn(`⚠️ Finnhub WS Disconnected. Reconnecting in ${delay / 1000}s...`);
        setTimeout(() => {
            reconnectAttempts++;
            connectFinnhubWS();
        }, delay);
    });

    socket.on('error', (err) => {
        console.error('❌ Finnhub WS Error:', err.message);
    });
}

export function subscribeSymbol(symbol: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        subscriptions.add(symbol); // Queue for when open
        return;
    }

    if (!subscriptions.has(symbol)) {
        console.log(`Subscribing to ${symbol}`);
        socket.send(JSON.stringify({ type: 'subscribe', symbol }));
        subscriptions.add(symbol);
    }
}

export function unsubscribeSymbol(symbol: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
    subscriptions.delete(symbol);
}
