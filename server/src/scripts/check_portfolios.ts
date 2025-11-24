
import pool from '../db';

async function checkPortfolios() {
    try {
        const res = await pool.query('SELECT * FROM portfolios');
        console.log('Portfolios:', res.rows);
        if (res.rows.length === 0) {
            console.log('No portfolios found. Creating default portfolio...');
            const insertRes = await pool.query(
                "INSERT INTO portfolios (name, base_currency) VALUES ('My Portfolio', 'USD') RETURNING *"
            );
            console.log('Created portfolio:', insertRes.rows[0]);
        }
    } catch (err) {
        console.error('Error checking portfolios:', err);
    } finally {
        await pool.end();
    }
}

checkPortfolios();
