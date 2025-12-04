import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';

    return (
        <div className={`spinner-container ${sizeClass}`}>
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Spinner;
