
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const AddPositionModal: React.FC<Props> = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        symbol: '',
        quantity: '',
        cost_basis: '',
        native_currency: 'USD'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800 overflow-hidden transform transition-all">
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white tracking-tight">Add New Position</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Symbol (Finnhub)</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. AAPL, BINANCE:BTCUSDT"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            value={formData.symbol}
                            onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                            <input
                                type="number"
                                step="any"
                                required
                                placeholder="0.00"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cost Basis</label>
                            <input
                                type="number"
                                step="any"
                                required
                                placeholder="0.00"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                value={formData.cost_basis}
                                onChange={e => setFormData({ ...formData, cost_basis: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                        <select
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
                            value={formData.native_currency}
                            onChange={e => setFormData({ ...formData, native_currency: e.target.value })}
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="PLN">PLN - Polish Złoty</option>
                            <option value="GBP">GBP - British Pound</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 mt-2"
                    >
                        Add Position
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPositionModal;
