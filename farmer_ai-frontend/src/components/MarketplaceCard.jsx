import React from 'react';
import './MarketplaceCard.css';

const MarketplaceCard = ({ item }) => {
    return (
        <div className="marketplace-card">
            <div className="marketplace-card-image">
                <img
                    src={item.imageUrl || '/placeholder-product.jpg'}
                    alt={item.title}
                    loading="lazy"
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
