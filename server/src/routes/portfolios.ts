
import { Router } from 'express';
import pool from '../db';
import { subscribeSymbol, unsubscribeSymbol } from '../services/finnhub';

const router = Router();

// Get all portfolios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM portfolios ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create portfolio
router.post('/', async (req, res) => {
    const { name, base_currency } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO portfolios (name, base_currency) VALUES ($1, $2) RETURNING *',
            [name, base_currency || 'PLN']
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get portfolio positions
router.get('/:id/positions', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM positions WHERE portfolio_id = $1', [id]);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Add position
router.post('/:id/positions', async (req, res) => {
    const { id } = req.params;
    const { symbol, display_symbol, quantity, cost_basis, native_currency } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO positions (portfolio_id, symbol, display_symbol, quantity, cost_basis, native_currency)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, symbol, display_symbol || symbol, quantity, cost_basis, native_currency]
        );

        // Subscribe to real-time updates
        subscribeSymbol(symbol);

        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Delete position
router.delete('/positions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Get symbol before deleting to unsubscribe if needed
        const posRes = await pool.query('SELECT symbol FROM positions WHERE id = $1', [id]);
        if (posRes.rows.length > 0) {
            const { symbol } = posRes.rows[0];
            // Check if any other position uses this symbol before unsubscribing
            // For MVP, we might just leave it or check count
            // subscribeSymbol handles dedup, unsubscribe should ideally check refcount
        }

        await pool.query('DELETE FROM positions WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
