import React, { useRef, useEffect } from 'react';

const OTPInput = ({ value, onChange, length = 6, disabled = false }) => {
    const inputs = useRef([]);

    useEffect(() => {
        if (inputs.current[0]) {
            inputs.current[0].focus();
        }
    }, []);

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newOtp = value.split('');
        newOtp[index] = val.substring(val.length - 1);
        const combined = newOtp.join('');
        onChange(combined);

        if (val && index < length - 1 && inputs.current[index + 1]) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !value[index] && index > 0 && inputs.current[index - 1]) {
            inputs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, length);
        if (isNaN(data)) return;
        onChange(data);
        if (inputs.current[length - 1]) {
            inputs.current[length - 1].focus();
        }
    };

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(ref) => (inputs.current[i] = ref)}
                    type="text"
                    maxLength="1"
                    value={value[i] || ''}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    style={{
                        width: '40px',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '20px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        backgroundColor: disabled ? '#f5f5f5' : 'white',
                        outline: 'none',
                    }}
                    className="form-control" // Optional bootstrap class if available
                />
            ))}
        </div>
    );
};

export default OTPInput;
