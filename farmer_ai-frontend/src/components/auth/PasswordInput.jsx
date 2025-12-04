import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { calculatePasswordStrength } from '../../utils/passwordValidation';
import styles from './PasswordInput.module.css';

const PasswordInput = ({
    value,
    onChange,
    name = "password",
    label = "Password",
    placeholder = "Enter password",
    error,
    showStrength = false,
    required = true
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const strength = showStrength ? calculatePasswordStrength(value) : null;

    const toggleVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.wrapper}>
            <label htmlFor={name} className={styles.label}>
                {label}
                {required && <span className={styles.required} aria-hidden="true">*</span>}
            </label>

            <div className={styles.inputContainer}>
                <Lock size={20} className={styles.lockIcon} aria-hidden="true" />

                <input
                    id={name}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                />

                <button
                    type="button"
                    onClick={toggleVisibility}
                    className={styles.toggleButton}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff size={20} className={styles.eyeIcon} />
                    ) : (
                        <Eye size={20} className={styles.eyeIcon} />
                    )}
                </button>
            </div>

            {showStrength && value && (
                <div className={styles.strengthMeter} role="progressbar" aria-valuenow={strength.score} aria-valuemin="0" aria-valuemax="5" aria-label={`Password strength: ${strength.level}`}>
                    <div className={styles.strengthBars}>
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={`${styles.strengthBar} ${i < strength.score ? styles[strength.level] : ''}`}
                            />
                        ))}
                    </div>
                    <span className={`${styles.strengthText} ${styles[strength.level]}`}>
                        {strength.level === 'weak' && 'Weak'}
                        {strength.level === 'medium' && 'Medium'}
                        {strength.level === 'strong' && 'Strong'}
                    </span>
                </div>
            )}

            {error && (
                <span id={`${name}-error`} className={styles.errorMessage} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};

export default PasswordInput;
