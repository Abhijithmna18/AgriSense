import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ValidatedInput - Enhanced input component with strict validation
 * Blocks space bar globally and enforces character restrictions
 */
const ValidatedInput = ({
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    label,
    icon: Icon,
    error,
    required = false,
    validationType = 'text' // 'text', 'email', 'phone', 'username', 'password'
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipMessage, setTooltipMessage] = useState('');
    const [shake, setShake] = useState(false);
    const inputRef = useRef(null);

    // Character validation rules
    const validationRules = {
        phone: /^[0-9]$/,
        username: /^[a-zA-Z0-9@._-]$/,
        email: /^[a-zA-Z0-9@._-]$/,
        text: /^[a-zA-Z]$/,
        password: /^[^\s]$/ // anything except space
    };

    const getValidationMessage = (key, validationType) => {
        if (key === ' ') {
            return 'Spaces are not allowed';
        }

        const messages = {
            phone: 'Only numbers (0-9) are allowed',
            username: 'Only letters, numbers, and @._- are allowed',
            email: 'Only letters, numbers, and @._- are allowed',
            text: 'Only letters are allowed',
            password: 'Spaces are not allowed'
        };

        return messages[validationType] || 'Invalid character';
    };

    const triggerValidationFeedback = (message) => {
        setTooltipMessage(message);
        setShowTooltip(true);
        setShake(true);

        setTimeout(() => setShake(false), 500);
        setTimeout(() => setShowTooltip(false), 2000);
    };

    const handleKeyDown = (e) => {
        const key = e.key;

        // Block spacebar globally
        if (key === ' ') {
            e.preventDefault();
            triggerValidationFeedback('Spaces are not allowed');
            return;
        }

        // For phone type, only allow numbers, backspace, delete, arrow keys, tab
        if (validationType === 'phone') {
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
            if (!allowedKeys.includes(key) && !/^[0-9]$/.test(key)) {
                e.preventDefault();
                triggerValidationFeedback(getValidationMessage(key, 'phone'));
            }
        }

        // For username/email, block invalid characters
        if (validationType === 'username' || validationType === 'email') {
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
            if (!allowedKeys.includes(key) && key.length === 1 && !validationRules[validationType].test(key)) {
                e.preventDefault();
                triggerValidationFeedback(getValidationMessage(key, validationType));
            }
        }

        // For text (names), only allow letters
        if (validationType === 'text') {
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '];
            if (!allowedKeys.includes(key) && key.length === 1 && !/^[a-zA-Z\s]$/.test(key)) {
                e.preventDefault();
                triggerValidationFeedback(getValidationMessage(key, 'text'));
            }
        }

        // For password, only block spaces
        if (validationType === 'password') {
            if (key === ' ') {
                e.preventDefault();
                triggerValidationFeedback('Spaces are not allowed in passwords');
            }
        }
    };

    const handlePaste = (e) => {
        const pastedData = e.clipboardData.getData('text');

        // Block space in pasted content
        if (pastedData.includes(' ')) {
            e.preventDefault();
            triggerValidationFeedback('Pasted content cannot contain spaces');
            return;
        }

        // Validate pasted content for phone
        if (validationType === 'phone' && !/^[0-9]*$/.test(pastedData)) {
            e.preventDefault();
            triggerValidationFeedback('Only numbers can be pasted');
            return;
        }

        // Validate pasted content for username/email
        if ((validationType === 'username' || validationType === 'email')) {
            const regex = validationRules[validationType];
            const isValid = pastedData.split('').every(char => regex.test(char));
            if (!isValid) {
                e.preventDefault();
                triggerValidationFeedback('Pasted content contains invalid characters');
            }
        }
    };

    const inputClassName = `w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 rounded-xl border ${error ? 'border-red-300' : 'border-deep-charcoal/20'
        } bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-all ${shake ? 'animate-shake' : ''
        }`;

    return (
        <div className="relative">
            {label && (
                <label htmlFor={name} className="block text-sm font-semibold text-deep-charcoal mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                )}
                <input
                    ref={inputRef}
                    id={name}
                    type={validationType === 'phone' ? 'tel' : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className={inputClassName}
                    placeholder={placeholder}
                    required={required}
                    inputMode={validationType === 'phone' ? 'numeric' : 'text'}
                    pattern={validationType === 'phone' ? '[0-9]*' : undefined}
                />

                {/* Validation Tooltip */}
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg z-10"
                        >
                            {tooltipMessage}
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default ValidatedInput;
