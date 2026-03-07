import React from 'react';
import { Wallet, RefreshCw } from 'lucide-react';

const MiniBankWallet = ({ walletData, onRefresh, loading }) => {
    return (
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    <h3 className="font-semibold">Wallet Balance</h3>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-24"></div>
                </div>
            ) : (
                <>
                    <div className="text-3xl font-bold mb-2">
                        ₹{walletData?.balance?.toLocaleString('en-IN') || '0'}
                    </div>
                    <div className="text-sm text-emerald-100">
                        {walletData?.accountNumber || 'N/A'}
                    </div>
                </>
            )}
        </div>
    );
};

export default MiniBankWallet;
