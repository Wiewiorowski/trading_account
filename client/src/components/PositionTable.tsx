
import React from 'react';
import type { Position } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
    positions: Position[];
    prices: Record<string, number>;
}

const PositionTable: React.FC<Props> = ({ positions, prices }) => {
    const formatCurrency = (value: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-900/50 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-700">
                        <th className="p-4 font-semibold">Symbol</th>
                        <th className="p-4 font-semibold text-right">Qty</th>
                        <th className="p-4 font-semibold text-right">Last Price</th>
                        <th className="p-4 font-semibold text-right">Market Value</th>
                        <th className="p-4 font-semibold text-right">P&L</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {positions.map((pos) => {
                        const price = prices[pos.symbol];
                        const qty = parseFloat(pos.quantity);
                        const cost = parseFloat(pos.cost_basis);
                        const value = price ? price * qty : 0;
                        const pnl = price ? (price - cost) * qty : 0;
                        const pnlPct = cost ? (pnl / (cost * qty)) * 100 : 0;

                        return (
                            <tr key={pos.id} className="group hover:bg-gray-700/30 transition-colors duration-200">
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-base group-hover:text-blue-400 transition-colors">{pos.display_symbol}</span>
                                        <span className="text-xs text-gray-500 font-mono">{pos.native_currency}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right text-gray-300 font-mono">{qty}</td>
                                <td className="p-4 text-right font-mono text-gray-300">
                                    {price ? (
                                        formatCurrency(price)
                                    ) : (
                                        <span className="inline-block w-16 h-4 bg-gray-700 rounded animate-pulse"></span>
                                    )}
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-white">
                                    {value ? formatCurrency(value) : '-'}
                                </td>
                                <td className={`p-4 text-right font-mono font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {price ? (
                                        <div className="flex flex-col items-end">
                                            <span className="flex items-center gap-1">
                                                {pnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {formatCurrency(pnl)}
                                            </span>
                                            <span className="text-xs opacity-80">
                                                {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                                            </span>
                                        </div>
                                    ) : '-'}
                                </td>
                            </tr>
                        );
                    })}
                    {positions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                                        <TrendingUp size={24} className="text-gray-600" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-400">No positions yet</p>
                                    <p className="text-sm">Add a position to start tracking your portfolio.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PositionTable;
