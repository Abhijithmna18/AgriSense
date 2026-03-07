import React from 'react';
import { Send, Download, QrCode, CreditCard } from 'lucide-react';

const QuickBankingActions = ({ onSendMoney, onRequestPayment, onScanQR, onGenerateQR }) => {
    const actions = [
        { icon: Send, label: 'Send Money', onClick: onSendMoney, color: 'text-blue-600' },
        { icon: Download, label: 'Request', onClick: onRequestPayment, color: 'text-green-600' },
        { icon: QrCode, label: 'Scan QR', onClick: onScanQR, color: 'text-purple-600' },
        { icon: CreditCard, label: 'Generate QR', onClick: onGenerateQR, color: 'text-orange-600' }
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={action.onClick}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                    <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickBankingActions;
