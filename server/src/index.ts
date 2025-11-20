
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRedis } from './redis';
import pool from './db';

import portfolioRouter from './routes/portfolios';
import { connectFinnhubWS } from './services/finnhub';
import redisClient from './redis';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/portfolios', portfolioRouter);

app.get('/api/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const subscriber = redisClient.duplicate();
    await subscriber.connect();

    await subscriber.subscribe('price_updates', (message) => {
        res.write(`data: ${message}\n\n`);
    });

    req.on('close', () => {
        subscriber.quit();
    });
});

app.get('/health', async (req, res) => {
    try {
        const dbRes = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', dbTime: dbRes.rows[0].now });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

async function startServer() {
    try {
        await connectRedis();
        console.log('✅ Redis connected');

        connectFinnhubWS(); // Start Finnhub WS

        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
}

startServer();
