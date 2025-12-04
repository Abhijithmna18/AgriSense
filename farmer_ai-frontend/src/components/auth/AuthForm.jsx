import React from 'react';
import { motion } from 'framer-motion';
import styles from './AuthForm.module.css';

const AuthForm = ({ children, title, subtitle, onSubmit, error, loading, submitText, footer }) => {
    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.card}
            >
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                {error && (
                    <div className={styles.errorAlert} role="alert" aria-live="polite">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={onSubmit} className={styles.form} noValidate>
                    {children}

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={styles.submitButton}
                    >
                        {loading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            submitText
                        )}
                    </motion.button>
                </form>

                {footer && <div className={styles.footer}>{footer}</div>}
            </motion.div>
        </div>
    );
};

export default AuthForm;
