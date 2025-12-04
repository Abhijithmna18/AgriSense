import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import styles from './HeroSection.module.css';

export const HeroSection = () => {
    const { data, adminMode, updateData } = useData();
    const [editingField, setEditingField] = useState(null);

    const handleEdit = (field, value) => {
        updateData(`hero.${field}`, value);
        setEditingField(null);
    };

    const EditableText = ({ field, value, className, as: Component = 'h1' }) => {
        if (adminMode) {
            return (
                <Component className={className}>
                    {editingField === field ? (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => updateData(`hero.${field}`, e.target.value)}
                            onBlur={() => setEditingField(null)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingField(null);
                            }}
                            autoFocus
                            className={styles.editInput}
                        />
                    ) : (
                        <span
                            onClick={() => setEditingField(field)}
                            className={styles.editable}
                            title="Click to edit"
                        >
                            {value}
                        </span>
                    )}
                </Component>
            );
        }

        return <Component className={className}>{value}</Component>;
    };

    return (
        <section className={styles.hero}>
            <div className={styles.heroBackground}>
                <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
                    alt="Agricultural field at sunset"
                    className={styles.backgroundImage}
                />
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.heroContent}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className={styles.textContainer}
                >
                    <EditableText
                        field="title"
                        value={data.hero.title}
                        className={styles.title}
                        as="h1"
                    />

                    <EditableText
                        field="subtitle"
                        value={data.hero.subtitle}
                        className={styles.subtitle}
                        as="p"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <button className={styles.ctaButton}>
                            <Sparkles size={20} />
                            {adminMode && editingField === 'cta' ? (
                                <input
                                    type="text"
                                    value={data.hero.cta}
                                    onChange={(e) => updateData('hero.cta', e.target.value)}
                                    onBlur={() => setEditingField(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') setEditingField(null);
                                    }}
                                    autoFocus
                                    className={styles.ctaInput}
                                />
                            ) : (
                                <span
                                    onClick={() => adminMode && setEditingField('cta')}
                                    className={adminMode ? styles.editable : ''}
                                >
                                    {data.hero.cta}
                                </span>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
