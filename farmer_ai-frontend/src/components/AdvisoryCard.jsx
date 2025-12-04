import React from 'react';
import './AdvisoryCard.css';

const AdvisoryCard = ({ advisory }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="advisory-card">
            <div className="advisory-date">
                <small>{formatDate(advisory.createdAt)}</small>
            </div>
            <h6 className="advisory-title">{advisory.title}</h6>
            <p className="advisory-summary">{advisory.summary}</p>
            {advisory.link && (
                <a
                    href={advisory.link}
                    className="advisory-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Read More →
                </a>
            )}
        </div>
    );
};

export default AdvisoryCard;
