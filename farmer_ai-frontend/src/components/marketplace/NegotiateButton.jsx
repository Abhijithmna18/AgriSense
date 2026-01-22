import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { negotiationAPI } from '../../services/negotiationApi';
import toast from 'react-hot-toast';

const NegotiateButton = ({ 
    product, 
    vendor, 
    className = '', 
    variant = 'primary',
    size = 'md',
    disabled = false 
}) => {
    const navigate = useNavigate();
    const { user, activeRole } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleNegotiate = async () => {
        if (!user) {
            toast.error('Please login to start negotiations');
            navigate('/login');
            return;
        }

        if (activeRole !== 'buyer') {
            toast.error('Only buyers can initiate negotiations');
            return;
        }

        if (vendor._id === user.id) {
            toast.error('You cannot negotiate with yourself');
            return;
        }

        try {
            setLoading(true);

            // Create negotiation with initial terms based on product
            const initialTerms = {
                price: product.pricePerUnit,
                quantity: Math.max(1, product.originalQuantity || 1),
                deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
                qualityRequirements: 'Standard',
                message: `I'm interested in negotiating terms for ${product.name}. Please review my initial offer.`
            };

            const response = await negotiationAPI.createNegotiation(
                product._id,
                vendor._id,
                initialTerms
            );

            toast.success('Negotiation started successfully!');
            navigate(`/negotiations/${response.negotiation._id}`);

        } catch (error) {
            console.error('Error starting negotiation:', error);
            
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                toast.error('You already have an active negotiation for this product');
            } else {
                toast.error('Failed to start negotiation. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getButtonClasses = () => {
        const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
        
        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base'
        };

        const variantClasses = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
            outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
            ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
        };

        return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
    };

    return (
        <button
            onClick={handleNegotiate}
            disabled={disabled || loading}
            className={getButtonClasses()}
            title="Start price negotiation"
        >
            {loading ? (
                <Loader size={16} className="animate-spin" />
            ) : (
                <MessageSquare size={16} />
            )}
            {loading ? 'Starting...' : 'Negotiate'}
        </button>
    );
};

export default NegotiateButton;