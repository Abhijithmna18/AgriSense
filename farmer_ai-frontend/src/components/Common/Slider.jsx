import React, { useState, useRef, useEffect } from 'react';
import styles from './Slider.module.css';

/**
 * Reusable Slider Component
 * @param {number} value - Current value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step increment
 * @param {function} onChange - Callback (value)
 * @param {string} label - Input label
 * @param {string} unit - Unit suffix (e.g., "%", "px")
 * @param {boolean} disabled - Disabled state
 */
const Slider = ({
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    label,
    unit = '',
    disabled = false
}) => {
    // Calculate fill percentage for the custom track background
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e) => {
        if (!disabled && onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className={`${styles.sliderContainer} ${disabled ? styles.disabled : ''}`}>
            {(label || unit) && (
                <div className={styles.header}>
                    {label && <label>{label}</label>}
                    <span className={styles.value} aria-hidden="true">
                        {value}{unit}
                    </span>
                </div>
            )}

            <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
                {/* Base Grey Track */}
                <div className={styles.trackBase}></div>

                {/* Visual Fill Track */}
                <div
                    className={styles.trackFill}
                    style={{ width: `${percentage}%` }}
                />

                {/* Actual Range Input */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    className={styles.input}
                    disabled={disabled}
                    aria-label={label}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                />
            </div>
        </div>
    );
};

export default Slider;
