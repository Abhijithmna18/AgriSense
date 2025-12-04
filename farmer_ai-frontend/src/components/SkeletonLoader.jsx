import React from 'react';
import styles from './SkeletonLoader.module.css';

const SkeletonCard = () => (
    <div className={styles.skeletonCard}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonBody}>
            <div className={`${styles.skeletonLine} ${styles.title}`}></div>
            <div className={`${styles.skeletonLine} ${styles.subtitle}`}></div>
            <div className={`${styles.skeletonLine} ${styles.text}`}></div>
        </div>
    </div>
);

export const SkeletonLoader = ({ count = 4 }) => {
    return (
        <div className="row g-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="col-lg-3 col-md-6">
                    <SkeletonCard />
                </div>
            ))}
        </div>
    );
};
