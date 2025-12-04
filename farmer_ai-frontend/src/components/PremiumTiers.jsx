import React from 'react';
import { useData } from '../context/DataContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { motion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';
import styles from './PremiumTiers.module.css';

export const PremiumTiers = () => {
    const { data, adminMode, updateData } = useData();
    const [ref, isVisible] = useScrollReveal();

    return (
        <section id="premium" className={styles.section} ref={ref}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-5"
                >
                    <h2 className={styles.sectionTitle}>Premium Offerings</h2>
                    <p className={styles.sectionSubtitle}>
                        Choose the perfect plan to elevate your farming business
                    </p>
                </motion.div>

                <div className="row g-4">
                    {data.premiumTiers.map((tier, index) => (
                        <div key={tier.id} className="col-lg-4 col-md-6">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`${styles.tierCard} ${tier.popular ? styles.popular : ''}`}
                            >
                                {tier.popular && (
                                    <div className={styles.popularRibbon}>
                                        <Crown size={16} />
                                        Most Popular
                                    </div>
                                )}

                                <div className={styles.tierHeader}>
                                    <h3 className={styles.tierName}>{tier.name}</h3>
                                    <p className={styles.tierSubtitle}>{tier.subtitle}</p>
                                    <div className={styles.tierPrice}>
                                        {tier.price === 0 ? (
                                            <span className={styles.free}>Free</span>
                                        ) : (
                                            <>
                                                <span className={styles.currency}>₹</span>
                                                {adminMode ? (
                                                    <input
                                                        type="number"
                                                        value={tier.price}
                                                        onChange={(e) =>
                                                            updateData(
                                                                `premiumTiers.${index}.price`,
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        className={styles.priceInput}
                                                    />
                                                ) : (
                                                    <span className={styles.amount}>{tier.price}</span>
                                                )}
                                                <span className={styles.period}>/month</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.tierFeatures}>
                                    {tier.features.map((feature, idx) => (
                                        <div key={idx} className={styles.feature}>
                                            <Check size={18} className={styles.checkIcon} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className={styles.tierButton}>
                                    {tier.price === 0 ? 'Get Started' : 'Subscribe Now'}
                                </button>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
