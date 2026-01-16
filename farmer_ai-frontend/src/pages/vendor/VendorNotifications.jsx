import React, { useState, useEffect } from 'react';
import { Bell, Check, ShoppingCart, Star, Wallet, Info } from 'lucide-react';
import api from '../../services/authApi';

const VendorNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/notifications');
            setNotifications(data.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_received': return { icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' };
            case 'payment_received': return { icon: Wallet, color: 'bg-green-100 text-green-600' };
            case 'review_posted': return { icon: Star, color: 'bg-yellow-100 text-yellow-600' };
            default: return { icon: Info, color: 'bg-gray-100 text-gray-600' };
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Stay updated on your store activity</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-800"
                    >
                        <Check size={16} />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="text-gray-500">You have no new notifications</p>
                    </div>
                ) : (
                    notifications.map(item => {
                        const { icon: Icon, color } = getIcon(item.type);
                        return (
                            <div
                                key={item._id}
                                className={`p-4 hover:bg-gray-50 transition flex gap-4 ${!item.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {item.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                                    {!item.isRead && (
                                        <button
                                            onClick={() => markAsRead(item._id)}
                                            className="text-xs text-green-600 font-medium mt-2 hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default VendorNotifications;
