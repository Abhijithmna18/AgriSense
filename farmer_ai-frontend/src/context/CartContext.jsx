import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            const existingItemIndex = state.items.findIndex(
                item => item._id === action.payload._id && item.buyType === action.payload.buyType
            );

            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += action.payload.quantity || 1;
                return { ...state, items: newItems };
            }
            return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }] };

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => !(item._id === action.payload._id && item.buyType === action.payload.buyType))
            };

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    (item._id === action.payload.id && item.buyType === action.payload.buyType)
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };

        case 'CLEAR_CART':
            return { ...state, items: [] };

        case 'TOGGLE_DRAWER':
            return { ...state, isOpen: !state.isOpen };

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false }, (initial) => {
        const persisted = localStorage.getItem('cart');
        if (persisted) {
            try {
                const parsed = JSON.parse(persisted);
                // Validate items to ensure _id is a valid ObjectId (24 chars)
                // This fixes the CastError where old mock data with id="1" caused backend failures
                const validItems = (parsed.items || []).filter(item =>
                    item._id && typeof item._id === 'string' && item._id.length === 24
                );
                return { ...parsed, items: validItems };
            } catch (e) {
                console.error("Failed to parse cart", e);
                return initial;
            }
        }
        return initial;
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state));
    }, [state]);

    const addToCart = (product, buyType = 'buy', rentalOptions = {}) => {
        dispatch({
            type: 'ADD_ITEM',
            payload: { ...product, buyType, ...rentalOptions }
        });
        dispatch({ type: 'TOGGLE_DRAWER' }); // Open drawer on add
    };

    const removeFromCart = (id, buyType) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { _id: id, buyType } });
    };

    const updateQuantity = (id, buyType, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, buyType, quantity } });
    };

    const clearCart = () => dispatch({ type: 'CLEAR_CART' });
    const toggleCart = () => dispatch({ type: 'TOGGLE_DRAWER' });

    // Calculate totals
    const cartTotal = state.items.reduce((total, item) => {
        const price = item.buyType === 'buy' ? item.price : item.rentPrice.daily * (item.rentalDays || 1);
        const deposit = item.buyType === 'rent' ? (item.deposit || 0) : 0;
        return total + ((price + deposit) * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            items: state.items,
            isOpen: state.isOpen,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
