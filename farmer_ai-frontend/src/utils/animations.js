// Framer Motion Animation Variants for Luxury Homepage

export const fadeInUp = {
    hidden: {
        opacity: 0,
        y: 60,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.6, 0.05, 0.01, 0.9],
        },
    },
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

export const hoverScale = {
    rest: {
        scale: 1,
        y: 0,
    },
    hover: {
        scale: 1.02,
        y: -10,
        transition: {
            duration: 0.4,
            ease: [0.6, 0.05, 0.01, 0.9],
        },
    },
};

export const goldBorderGlow = {
    rest: {
        borderColor: 'rgba(212, 175, 55, 0.2)',
        boxShadow: '0 20px 80px -10px rgba(0, 0, 0, 0.3)',
    },
    hover: {
        borderColor: 'rgba(212, 175, 55, 0.6)',
        boxShadow: '0 20px 80px -10px rgba(212, 175, 55, 0.25), inset 0 0 40px rgba(212, 175, 55, 0.1)',
        transition: {
            duration: 0.4,
        },
    },
};

export const dashboardFloat = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export const buttonHover = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.05,
        y: -2,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.98,
    },
};
