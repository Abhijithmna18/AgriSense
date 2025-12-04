import React from 'react';
import { useData } from '../context/DataContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { motion } from 'framer-motion';
import { AlertTriangle, Leaf, Bug, Calendar } from 'lucide-react';
import styles from './ExpertAdvisories.module.css';

const getIcon = (type) => {
    switch (type) {
        case 'alert':
            return <AlertTriangle size={24} />;
        case 'success':
            return <Leaf size={24} />;
        default:
            return <Bug size={24} />;
    }
};

const getTypeClass = (type) => {
    switch (type) {
        case 'alert':
            return styles.alert;
        case 'success':
            return styles.success;
        default:
            return styles.info;
    }
};

export const ExpertAdvisories = () => {
    const { data } = useData();
    const [ref, isVisible] = useScrollReveal();

    return (
        <section id="advisories" className={styles.section} ref={ref}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-5"
                >
                    <h2 className={styles.sectionTitle}>Expert Advisories</h2>
                    <p className={styles.sectionSubtitle}>
                        Stay ahead with timely insights from agricultural experts
                    </p>
                </motion.div>

                <div className="row g-4">
                    {data.advisories.map((advisory, index) => (
                        <div key={advisory.id} className="col-lg-4 col-md-6">
                            <motion.div
                                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                animate={
                                    isVisible
                                        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                                        : {}
                                }
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                className={`${styles.advisoryCard} ${getTypeClass(advisory.type)}`}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.iconContainer}>
                                        {getIcon(advisory.type)}
                                    </div>
                                    <div className={styles.dateContainer}>
                                        <Calendar size={16} />
                                        <span>{advisory.date}</span>
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    <h3 className={styles.advisoryTitle}>{advisory.title}</h3>
                                    <p className={styles.advisoryDescription}>
                                        {advisory.description}
                                    </p>
                                </div>

                                <div className={styles.cardFooter}>
                                    <button className={styles.actionButton}>
                                        View Details
                                    </button>
                                </div>

                                {/* Decorative Corner */}
                                <div className={styles.cornerDecoration}></div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
