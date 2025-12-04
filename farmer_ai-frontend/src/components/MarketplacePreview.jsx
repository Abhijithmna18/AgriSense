import React from 'react';
import { useData } from '../context/DataContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './MarketplacePreview.module.css';

export const MarketplacePreview = () => {
    const { data, adminMode, updateData } = useData();
    const [ref, isVisible] = useScrollReveal();

    return (
        <section id="marketplace" className={styles.section} ref={ref}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-5"
                >
                    <h2 className={styles.sectionTitle}>Marketplace Preview</h2>
                    <p className={styles.sectionSubtitle}>
                        Premium products from verified sellers
                    </p>
                </motion.div>

                <div className="row g-4">
                    {data.marketplaceProducts.map((product, index) => (
                        <div key={product.id} className="col-lg-3 col-md-6">
                            <motion.div
                                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                animate={
                                    isVisible
                                        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                                        : {}
                                }
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={styles.productCard}
                            >
                                <div className={styles.imageContainer}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={styles.productImage}
                                        loading="lazy"
                                    />
                                    <div className={styles.imageOverlay}>
                                        <button className={styles.viewButton}>
                                            <ArrowRight size={20} />
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.productInfo}>
                                    {adminMode ? (
                                        <input
                                            type="text"
                                            value={product.name}
                                            onChange={(e) =>
                                                updateData(
                                                    `marketplaceProducts.${index}.name`,
                                                    e.target.value
                                                )
                                            }
                                            className={styles.nameInput}
                                        />
                                    ) : (
                                        <h3 className={styles.productName}>{product.name}</h3>
                                    )}

                                    <div className={styles.priceTag}>
                                        <span className={styles.currency}>{product.currency}</span>
                                        {adminMode ? (
                                            <input
                                                type="number"
                                                value={product.price}
                                                onChange={(e) =>
                                                    updateData(
                                                        `marketplaceProducts.${index}.price`,
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                className={styles.priceInput}
                                            />
                                        ) : (
                                            <span className={styles.price}>{product.price}</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
