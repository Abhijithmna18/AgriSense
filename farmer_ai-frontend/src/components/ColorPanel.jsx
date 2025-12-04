import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings, X, Palette, Droplet, Sparkles } from 'lucide-react';
import styles from './ColorPanel.module.css';

export const ColorPanel = () => {
    const { theme, updateTheme, applyPreset, presets } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleColorChange = (key, value) => {
        updateTheme({ [key]: value });
    };

    const handleSliderChange = (key, value) => {
        updateTheme({ [key]: parseFloat(value) });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle theme editor"
            >
                {isOpen ? <X size={24} /> : <Settings size={24} />}
            </button>

            {/* Panel */}
            <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>
                        <Palette size={20} />
                        Theme Editor
                    </h3>
                </div>

                <div className={styles.panelBody}>
                    {/* Color Pickers */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>
                            <Droplet size={16} />
                            Colors
                        </h4>

                        <div className={styles.control}>
                            <label>Primary</label>
                            <input
                                type="color"
                                value={theme.primary}
                                onChange={(e) => handleColorChange('primary', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>

                        <div className={styles.control}>
                            <label>Secondary</label>
                            <input
                                type="color"
                                value={theme.secondary}
                                onChange={(e) => handleColorChange('secondary', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>

                        <div className={styles.control}>
                            <label>Surface</label>
                            <input
                                type="color"
                                value={theme.surface}
                                onChange={(e) => handleColorChange('surface', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>

                        <div className={styles.control}>
                            <label>Text</label>
                            <input
                                type="color"
                                value={theme.text}
                                onChange={(e) => handleColorChange('text', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>
                    </div>

                    {/* Gradient Controls */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Gradient</h4>

                        <div className={styles.control}>
                            <label>Start Color</label>
                            <input
                                type="color"
                                value={theme.gradientStart}
                                onChange={(e) => handleColorChange('gradientStart', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>

                        <div className={styles.control}>
                            <label>End Color</label>
                            <input
                                type="color"
                                value={theme.gradientEnd}
                                onChange={(e) => handleColorChange('gradientEnd', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>

                        <div className={styles.control}>
                            <label>Angle: {theme.gradientAngle}°</label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={theme.gradientAngle}
                                onChange={(e) => handleSliderChange('gradientAngle', e.target.value)}
                                className={styles.slider}
                            />
                        </div>
                    </div>

                    {/* Glassmorphism Controls */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>
                            <Sparkles size={16} />
                            Glassmorphism
                        </h4>

                        <div className={styles.control}>
                            <label>Blur: {theme.blurIntensity}px</label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={theme.blurIntensity}
                                onChange={(e) => handleSliderChange('blurIntensity', e.target.value)}
                                className={styles.slider}
                            />
                        </div>

                        <div className={styles.control}>
                            <label>Opacity: {theme.opacity}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={theme.opacity}
                                onChange={(e) => handleSliderChange('opacity', e.target.value)}
                                className={styles.slider}
                            />
                        </div>

                        <div className={styles.control}>
                            <label>Border Whiteness: {theme.borderWhiteness}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={theme.borderWhiteness}
                                onChange={(e) => handleSliderChange('borderWhiteness', e.target.value)}
                                className={styles.slider}
                            />
                        </div>
                    </div>

                    {/* Metallic Accent */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Metallic Accent</h4>

                        <div className={styles.control}>
                            <label>Gold Sheen: {theme.metallicAccent}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={theme.metallicAccent}
                                onChange={(e) => handleSliderChange('metallicAccent', e.target.value)}
                                className={styles.slider}
                            />
                        </div>
                    </div>

                    {/* Preset Themes */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Preset Themes</h4>

                        <div className={styles.presetButtons}>
                            <button
                                className={styles.presetButton}
                                onClick={() => applyPreset('midnightGarden')}
                            >
                                Midnight Garden
                            </button>
                            <button
                                className={styles.presetButton}
                                onClick={() => applyPreset('sunriseHarvest')}
                            >
                                Sunrise Harvest
                            </button>
                            <button
                                className={styles.presetButton}
                                onClick={() => applyPreset('royalSaffron')}
                            >
                                Royal Saffron
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
