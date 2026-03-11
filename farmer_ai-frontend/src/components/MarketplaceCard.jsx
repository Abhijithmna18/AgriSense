import React, { useState } from 'react';
import './MarketplaceCard.css';

const MarketplaceCard = ({ item }) => {
    const [imageError, setImageError] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        return `${baseUrl}${path}`;
    };

    const getDefaultImage = () => {
        return 'https://images.unsplash.com/photo-1627920769842-894768393af8?auto=format&fit=crop&q=80&w=600';
    };

    return (
        <div className="marketplace-card">
            <div className="marketplace-card-image">
                <img
                    src={imageError ? getDefaultImage() : (getImageUrl(item.imageUrl) || getDefaultImage())}
                    alt={item.title}
                    loading="lazy"
                    crossOrigin="anonymous"
                    onError={() => setImageError(true)}
                />
                {item.rating && (
                    <div className="marketplace-rating">
                        <span>⭐ {item.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>
            <div className="marketplace-card-body">
                <h6 className="marketplace-card-title">{item.title}</h6>
                <p className="marketplace-seller">
                    <small>by {item.seller?.name || 'Unknown Seller'}</small>
                </p>
                <div className="marketplace-price">
                    <span className="price">₹{item.price}</span>
                </div>
                <button className="btn btn-outline-success btn-sm w-100">
                    View Product
                </button>
            </div>
        </div>
    );
};

export default MarketplaceCard;
