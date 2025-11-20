
CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL, -- Provider symbol (e.g. AAPL, BINANCE:BTCUSDT)
  display_symbol VARCHAR(50) NOT NULL, -- User friendly symbol
  exchange VARCHAR(50),
  quantity DECIMAL(20, 10) NOT NULL,
  cost_basis DECIMAL(20, 10),
  native_currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_positions_portfolio_id ON positions(portfolio_id);
