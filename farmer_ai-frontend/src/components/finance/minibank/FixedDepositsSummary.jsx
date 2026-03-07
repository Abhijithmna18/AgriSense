import React from 'react';
import { PiggyBank, Plus } from 'lucide-react';

const FixedDepositsSummary = ({ deposits = [], onCreateFD }) => {
    const totalInvested = deposits.reduce((sum, fd) => sum + (fd.amount || 0), 0);

    const handleCreateClick = () => {
        if (onCreateFD) {
            onCreateFD();
        }
    };

    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900">Fixed Deposits</h4>
                <button
                    onClick={handleCreateClick}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            
            {deposits.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <PiggyBank className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No fixed deposits</p>
                    <button
                        onClick={handleCreateClick}
                        className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Create your first FD
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="text-sm text-blue-600 mb-1">Total Invested</div>
                        <div className="text-2xl font-bold text-blue-900">
                            ₹{totalInvested.toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {deposits.map((fd, index) => (
                            <div key={index} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-slate-900">
                                            ₹{fd.amount?.toLocaleString('en-IN') || '0'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {fd.rate || '0'}% • {fd.duration || '0'} months
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        Matures: {fd.maturityDate || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FixedDepositsSummary;
