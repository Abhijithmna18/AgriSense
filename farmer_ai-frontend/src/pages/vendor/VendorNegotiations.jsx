import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Clock, CheckCircle2, XCircle, ChevronLeft, Search, Filter, Phone, Video } from 'lucide-react';
import negotiationAPI from '../../services/negotiationApi';
import { useAuth } from '../../context/AuthContext';

const VendorNegotiations = () => {
    const { user } = useAuth();
    const [negotiations, setNegotiations] = useState([]);
    const [selectedNegotiation, setSelectedNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchVendorNegotiations();
    }, [filterStatus]);

    const fetchVendorNegotiations = async () => {
        setLoading(true);
        try {
            const status = filterStatus === 'all' ? null : filterStatus;
            const response = await negotiationAPI.getVendorNegotiations(status, 1, 50);
            console.log('Vendor negotiations response:', response);
            setNegotiations(response.negotiations || []);
        } catch (error) {
            console.error('Error fetching negotiations:', error);
            alert('Failed to load negotiations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedNegotiation?.offers]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedNegotiation) return;

        setSendingMessage(true);
        try {
            const lastOffer = selectedNegotiation.offers[selectedNegotiation.offers.length - 1];
            await negotiationAPI.addMessage(
                selectedNegotiation._id,
                lastOffer._id,
                {
                    message: messageText,
                    timestamp: new Date().toISOString()
                }
            );

            // Refresh negotiation details
            const updated = await negotiationAPI.getNegotiation(selectedNegotiation._id);
            setSelectedNegotiation(updated);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleAcceptOffer = async (offerId) => {
        if (!window.confirm('Accept this offer?')) return;

        try {
            await negotiationAPI.acceptOffer(selectedNegotiation._id, offerId);
            const updated = await negotiationAPI.getNegotiation(selectedNegotiation._id);
            setSelectedNegotiation(updated);
            fetchVendorNegotiations();
        } catch (error) {
            console.error('Error accepting offer:', error);
            alert('Failed to accept offer');
        }
    };

    const handleRejectOffer = async (offerId) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        try {
            await negotiationAPI.rejectOffer(selectedNegotiation._id, offerId, reason);
            const updated = await negotiationAPI.getNegotiation(selectedNegotiation._id);
            setSelectedNegotiation(updated);
            fetchVendorNegotiations();
        } catch (error) {
            console.error('Error rejecting offer:', error);
            alert('Failed to reject offer');
        }
    };

    const filteredNegotiations = negotiations.filter(neg =>
        neg.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        neg.buyerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <Clock size={16} />;
            case 'accepted': return <CheckCircle2 size={16} />;
            case 'rejected': return <XCircle size={16} />;
            default: return <MessageCircle size={16} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Negotiations List */}
            <div className={`${selectedNegotiation ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col bg-white border-r border-gray-200`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-900 mb-4">Negotiations</h1>
                    
                    {/* Search */}
                    <div className="relative mb-3">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search negotiations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {['all', 'active', 'accepted', 'rejected', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                                    filterStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Negotiations List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : filteredNegotiations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No negotiations yet</p>
                        </div>
                    ) : (
                        filteredNegotiations.map(negotiation => (
                            <button
                                key={negotiation._id}
                                onClick={() => setSelectedNegotiation(negotiation)}
                                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                                    selectedNegotiation?._id === negotiation._id ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 truncate">{negotiation.productName}</h3>
                                        <p className="text-sm text-gray-600 truncate">From: {negotiation.buyerName}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ml-2 ${getStatusColor(negotiation.status)}`}>
                                        {getStatusIcon(negotiation.status)}
                                        {negotiation.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {new Date(negotiation.updatedAt).toLocaleDateString()}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedNegotiation ? (
                <div className="flex-1 flex flex-col bg-white">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedNegotiation(null)}
                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h2 className="font-bold text-gray-900">{selectedNegotiation.productName}</h2>
                                <p className="text-sm text-gray-600">Buyer: {selectedNegotiation.buyerName}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                                <Phone size={20} />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                                <Video size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages/Offers */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedNegotiation.offers && selectedNegotiation.offers.length > 0 ? (
                            selectedNegotiation.offers.map((offer, index) => (
                                <div key={offer._id} className="space-y-3">
                                    {/* Offer Card */}
                                    <div className={`p-4 rounded-lg border ${
                                        offer.submittedBy === selectedNegotiation.vendorId
                                            ? 'bg-blue-50 border-blue-200 ml-auto max-w-md'
                                            : 'bg-gray-50 border-gray-200 mr-auto max-w-md'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-600">
                                                {offer.submittedBy === selectedNegotiation.vendorId ? 'Your Offer' : 'Buyer Offer'}
                                            </span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${
                                                offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {offer.status === 'accepted' && <CheckCircle2 size={12} />}
                                                {offer.status === 'rejected' && <XCircle size={12} />}
                                                {offer.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price/Unit:</span>
                                                <span className="font-semibold text-gray-900">₹{offer.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Quantity:</span>
                                                <span className="font-semibold text-gray-900">{offer.quantity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total:</span>
                                                <span className="font-semibold text-gray-900">₹{offer.price * offer.quantity}</span>
                                            </div>
                                            {offer.deliveryDate && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Delivery:</span>
                                                    <span className="font-semibold text-gray-900">{new Date(offer.deliveryDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {offer.qualityRequirements && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Quality:</span>
                                                    <span className="font-semibold text-gray-900">{offer.qualityRequirements}</span>
                                                </div>
                                            )}
                                        </div>

                                        {offer.message && (
                                            <p className="text-sm text-gray-700 mt-3 p-2 bg-white rounded border border-gray-200">
                                                {offer.message}
                                            </p>
                                        )}

                                        <div className="text-xs text-gray-500 mt-3">
                                            {new Date(offer.timestamp).toLocaleString()}
                                        </div>

                                        {/* Action Buttons */}
                                        {offer.status === 'pending' && offer.submittedBy !== selectedNegotiation.vendorId && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleAcceptOffer(offer._id)}
                                                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectOffer(offer._id)}
                                                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Messages for this offer */}
                                    {offer.messages && offer.messages.map(msg => (
                                        <div
                                            key={msg._id}
                                            className={`p-3 rounded-lg max-w-md ${
                                                msg.senderRole === 'vendor'
                                                    ? 'bg-blue-100 text-gray-900 ml-auto'
                                                    : 'bg-gray-100 text-gray-900 mr-auto'
                                            }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No offers yet</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    {selectedNegotiation.status === 'active' && (
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sendingMessage || !messageText.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Select a negotiation to start chatting</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorNegotiations;
