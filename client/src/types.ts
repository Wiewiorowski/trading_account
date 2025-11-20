
export interface Portfolio {
    id: number;
    name: string;
    base_currency: string;
    created_at: string;
}

export interface Position {
    id: number;
    portfolio_id: number;
    symbol: string;
    display_symbol: string;
    quantity: string; // Decimal from DB comes as string
    cost_basis: string;
    native_currency: string;
    created_at: string;
}

export interface PriceUpdate {
    symbol: string;
    price: number;
    ts: number;
}
