import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'bg-red-600', requireInput = false, inputPlaceholder = '' }) => {
    const [inputValue, setInputValue] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            modalRef.current?.focus();
        } else {
            setInputValue(''); // Reset input on close
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isConfirmDisabled = requireInput && inputValue !== inputPlaceholder;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div
                ref={modalRef}
                className="bg-[#1f2937] border border-[#374151] rounded-lg shadow-2xl w-full max-w-md p-6 transform transition-all"
                tabIndex={-1}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-900/30 rounded-full">
                            <AlertTriangle className="text-red-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-300 mb-4">{message}</p>

                    {requireInput && (
                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Type <span className="text-white font-mono select-all">{inputPlaceholder}</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-[#111827] border border-[#374151] rounded text-white px-3 py-2 text-sm focus:border-[#FFD166] focus:outline-none"
                                placeholder={inputPlaceholder}
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirmDisabled}
                        className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed bg-gray-600' : `${confirmColor} hover:brightness-110`}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
