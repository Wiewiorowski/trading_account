
import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Portfolio, Position, PriceUpdate } from '../types';
import PositionTable from './PositionTable';
import { Plus } from 'lucide-react';
import AddPositionModal from './AddPositionModal';

const Dashboard: React.FC = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

    useEffect(() => {
        fetchPortfolios();

        // SSE Connection
        const eventSource = new EventSource('/api/stream');

        eventSource.onopen = () => {
            setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
            const update: PriceUpdate = JSON.parse(event.data);
            setPrices(prev => ({ ...prev, [update.symbol]: update.price }));
        };

        eventSource.onerror = () => {
            setConnectionStatus('disconnected');
            eventSource.close();
            // Simple reconnect logic
            setTimeout(() => {
                // In a real app we'd have better reconnect logic, 
                // for MVP a reload or manual refresh is acceptable fallback
                // or just letting the user know.
                // We won't auto-reload to avoid loops, just show status.
            }, 5000);
        };

        return () => eventSource.close();
    }, []);

    useEffect(() => {
        if (selectedPortfolio) {
            fetchPositions(selectedPortfolio.id);
        }
    }, [selectedPortfolio]);

    const fetchPortfolios = async () => {
        const res = await api.get<Portfolio[]>('/portfolios');
        setPortfolios(res.data);
        if (res.data.length > 0 && !selectedPortfolio) {
            setSelectedPortfolio(res.data[0]);
        }
    };

    const fetchPositions = async (id: number) => {
        const res = await api.get<Position[]>(`/portfolios/${id}/positions`);
        setPositions(res.data);
    };

    const handleAddPosition = async (position: any) => {
        if (!selectedPortfolio) return;
        await api.post(`/portfolios/${selectedPortfolio.id}/positions`, position);
        fetchPositions(selectedPortfolio.id);
        setIsModalOpen(false);
    };

    // Calculate Totals
    const totalValue = positions.reduce((sum, pos) => {
        const price = prices[pos.symbol] || 0;
        // Simplified valuation (assuming 1:1 FX for MVP if not implemented fully)
        return sum + (parseFloat(pos.quantity) * price);
    }, 0);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
                                Portfolio Tracker
                            </h1>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-2 transition-all duration-300 ${connectionStatus === 'connected'
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                    : 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                                {connectionStatus === 'connected' ? 'LIVE DATA' : 'OFFLINE'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-lg">
                            Total Asset Value: <span className="text-3xl text-white font-mono font-bold ml-2">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group">
                            <select
                                className="appearance-none bg-gray-900 border border-gray-700 hover:border-gray-600 rounded-xl px-5 py-3 pr-10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[200px]"
                                value={selectedPortfolio?.id || ''}
                                onChange={(e) => setSelectedPortfolio(portfolios.find(p => p.id === parseInt(e.target.value)) || null)}
                            >
                                {portfolios.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.base_currency})</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus size={20} />
                            <span>Add Position</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-800/50">
                    <PositionTable positions={positions} prices={prices} />
                </div>

                {isModalOpen && (
                    <AddPositionModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleAddPosition}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
