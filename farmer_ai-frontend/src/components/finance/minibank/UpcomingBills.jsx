import React from 'react';
import { FileText, Calendar } from 'lucide-react';

const UpcomingBills = ({ bills = [], onPayBill }) => {
    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
            <h4 className="font-bold text-slate-900 mb-4">Upcoming Bills</h4>
            
            {bills.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming bills</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bills.map((bill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-full">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">{bill.name || 'Bill'}</div>
                                    <div className="text-xs text-slate-500">Due: {bill.dueDate || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="font-semibold text-slate-900">
                                    ₹{bill.amount?.toLocaleString('en-IN') || '0'}
                                </div>
                                <button
                                    onClick={() => onPayBill(bill.id)}
                                    className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    Pay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingBills;
