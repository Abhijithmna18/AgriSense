import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CropCard.css';

const CropCard = ({ crop }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/crops/${crop._id}`);
    };

    return (
        <div className="crop-card" onClick={handleClick} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && handleClick()}>
            <div className="crop-card-image">
                <img
                    src={crop.thumbnailUrl || crop.images?.[0] || '/placeholder-crop.jpg'}
                    alt={crop.name}
                    loading="lazy"
                />
            </div>
            <div className="crop-card-body">
                <h5 className="crop-card-title">{crop.name}</h5>
                {crop.scientificName && (
                    <p className="crop-card-scientific">{crop.scientificName}</p>
                )}
                <p className="crop-card-description">
                    {crop.shortDescription || crop.description?.substring(0, 80) + '...'}
                </p>
                {crop.avgPrice && (
                    <div className="crop-card-price">
                        <span className="price-label">Avg Price:</span>
                        <span className="price-value">₹{crop.avgPrice}/kg</span>
                    </div>
                )}
                <button className="btn btn-success btn-sm mt-2">View Details</button>
            </div>
        </div>
    );
};

export default CropCard;
