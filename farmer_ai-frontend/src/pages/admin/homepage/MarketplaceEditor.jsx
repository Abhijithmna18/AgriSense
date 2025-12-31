import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, Check, Loader, Plus, Trash2, Edit2, GripVertical, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import homepageService from '../../../services/homepageService';
import ModernMarketplace from '../../../components/ModernMarketplace';

const MarketplaceEditor = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        viewAllLink: '',
        carousel: {
            autoPlay: true,
            slideDuration: 3,
            navigationStyle: 'dots',
            itemsPerView: { desktop: 4, tablet: 2, mobile: 1 }
        },
        featuredProducts: []
    });

    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [currentProductIndex, setCurrentProductIndex] = useState(null);
    const [productForm, setProductForm] = useState({
        productId: '',
        productName: '',
        productPrice: 0,
        carouselImage: '',
        badge: 'none',
        quickAction: 'viewDetails',
        showOnHome: true,
        order: 0
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const config = await homepageService.getHomepageConfig();
            if (config && config.marketplace) {
                const mkt = config.marketplace;
                setFormData({
                    title: mkt.title || '',
                    subtitle: mkt.subtitle || '',
                    viewAllLink: mkt.viewAllLink || '/marketplace',
                    carousel: {
                        autoPlay: mkt.carousel?.autoPlay ?? true,
                        slideDuration: mkt.carousel?.slideDuration || 3,
                        navigationStyle: mkt.carousel?.navigationStyle || 'dots',
                        itemsPerView: {
                            desktop: mkt.carousel?.itemsPerView?.desktop || 4,
                            tablet: mkt.carousel?.itemsPerView?.tablet || 2,
                            mobile: mkt.carousel?.itemsPerView?.mobile || 1
                        }
                    },
                    featuredProducts: mkt.featuredProducts || []
                });
            }
        } catch (err) {
            setError('Failed to load configuration');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const currentConfig = await homepageService.getHomepageConfig();
            const updatedConfig = {
                ...currentConfig,
                marketplace: formData
            };

            await homepageService.updateHomepageConfig(updatedConfig);
            setSuccess('Marketplace section updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    // Product Management
    const handleAddProduct = () => {
        setProductForm({
            productId: `product_${Date.now()}`,
            productName: 'New Product',
            productPrice: 0,
            carouselImage: '',
            badge: 'none',
            quickAction: 'viewDetails',
            showOnHome: true,
            order: formData.featuredProducts.length
        });
        setCurrentProductIndex(-1);
        setIsEditingProduct(true);
    };

    const handleEditProduct = (index) => {
        setProductForm({ ...formData.featuredProducts[index] });
        setCurrentProductIndex(index);
        setIsEditingProduct(true);
    };

    const handleDeleteProduct = (index) => {
        if (window.confirm('Remove this product from the carousel?')) {
            const newProducts = [...formData.featuredProducts];
            newProducts.splice(index, 1);
            setFormData({ ...formData, featuredProducts: newProducts });
        }
    };

    const handleSaveProduct = () => {
        const newProducts = [...formData.featuredProducts];
        if (currentProductIndex === -1) {
            newProducts.push(productForm);
        } else {
            newProducts[currentProductIndex] = productForm;
        }
        setFormData({ ...formData, featuredProducts: newProducts });
        setIsEditingProduct(false);
    };

    const handleToggleVisibility = (index) => {
        const newProducts = [...formData.featuredProducts];
        newProducts[index] = { ...newProducts[index], showOnHome: !newProducts[index].showOnHome };
        setFormData({ ...formData, featuredProducts: newProducts });
    };

    const handleReorder = (newOrder) => {
        setFormData({ ...formData, featuredProducts: newOrder });
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-8 text-[var(--admin-text-primary)]">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Marketplace Carousel Editor</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-70"
                >
                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><AlertCircle size={20} />{error}</div>}
            {success && <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2"><Check size={20} />{success}</div>}

            {/* Section Messaging */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 border-b border-[var(--admin-border)] pb-2">Section Messaging</h2>
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Section Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g., Shop Our Best-Sellers"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Section Subtitle</label>
                        <textarea
                            rows={2}
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Supporting text below the title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">"View All" Button Link</label>
                        <input
                            type="text"
                            value={formData.viewAllLink}
                            onChange={(e) => setFormData({ ...formData, viewAllLink: e.target.value })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="/marketplace"
                        />
                    </div>
                </div>
            </div>

            {/* Carousel Behavior */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 border-b border-[var(--admin-border)] pb-2">Carousel Behavior & UX</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Auto-Play */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.carousel.autoPlay}
                                onChange={(e) => setFormData({ ...formData, carousel: { ...formData.carousel, autoPlay: e.target.checked } })}
                                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <span className="font-medium">Enable Auto-Play</span>
                        </label>
                        {formData.carousel.autoPlay && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5 opacity-80">Slide Duration (seconds)</label>
                                <input
                                    type="number"
                                    min="2"
                                    value={formData.carousel.slideDuration}
                                    onChange={(e) => setFormData({ ...formData, carousel: { ...formData.carousel, slideDuration: Math.max(2, parseInt(e.target.value)) } })}
                                    className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation Style */}
                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-80">Navigation Style</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="navStyle"
                                    checked={formData.carousel.navigationStyle === 'dots'}
                                    onChange={() => setFormData({ ...formData, carousel: { ...formData.carousel, navigationStyle: 'dots' } })}
                                    className="text-emerald-600"
                                />
                                <span>Dot Indicators (Bottom)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="navStyle"
                                    checked={formData.carousel.navigationStyle === 'arrows'}
                                    onChange={() => setFormData({ ...formData, carousel: { ...formData.carousel, navigationStyle: 'arrows' } })}
                                    className="text-emerald-600"
                                />
                                <span>Side Arrows (Left/Right)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="navStyle"
                                    checked={formData.carousel.navigationStyle === 'none'}
                                    onChange={() => setFormData({ ...formData, carousel: { ...formData.carousel, navigationStyle: 'none' } })}
                                    className="text-emerald-600"
                                />
                                <span>None</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Items Per View */}
                <div className="grid md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[var(--admin-border)]">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Desktop Items</label>
                        <select
                            value={formData.carousel.itemsPerView.desktop}
                            onChange={(e) => setFormData({ ...formData, carousel: { ...formData.carousel, itemsPerView: { ...formData.carousel.itemsPerView, desktop: parseInt(e.target.value) } } })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value={2}>2 items</option>
                            <option value={3}>3 items</option>
                            <option value={4}>4 items</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Tablet Items</label>
                        <select
                            value={formData.carousel.itemsPerView.tablet}
                            onChange={(e) => setFormData({ ...formData, carousel: { ...formData.carousel, itemsPerView: { ...formData.carousel.itemsPerView, tablet: parseInt(e.target.value) } } })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value={1}>1 item</option>
                            <option value={2}>2 items</option>
                            <option value={3}>3 items</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Mobile Items</label>
                        <select
                            value={formData.carousel.itemsPerView.mobile}
                            onChange={(e) => setFormData({ ...formData, carousel: { ...formData.carousel, itemsPerView: { ...formData.carousel.itemsPerView, mobile: parseInt(e.target.value) } } })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value={1}>1 item</option>
                            <option value={2}>2 items</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Featured Products</h2>
                    <button
                        onClick={handleAddProduct}
                        className="px-4 py-2 bg-[var(--admin-bg-hover)] text-[var(--admin-text-primary)] border border-[var(--admin-border)] rounded-lg flex items-center gap-2 hover:bg-[var(--admin-border)] transition-colors"
                    >
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>

                <Reorder.Group axis="y" values={formData.featuredProducts} onReorder={handleReorder} className="space-y-3">
                    {formData.featuredProducts.map((product, index) => (
                        <Reorder.Item
                            key={product.productId || index}
                            value={product}
                            className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg p-4 flex items-center gap-4 group cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical className="text-gray-400" size={20} />

                            {/* Product Image Preview */}
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                                {product.carouselImage ? (
                                    <img src={product.carouselImage} alt={product.productName} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={24} className="text-gray-400" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold">{product.productName}</h3>
                                <p className="text-sm opacity-60">₹{product.productPrice?.toLocaleString('en-IN')} • {product.badge !== 'none' ? product.badge : 'No badge'}</p>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400">
                                <button
                                    onClick={() => handleToggleVisibility(index)}
                                    title={product.showOnHome ? "Hide from homepage" : "Show on homepage"}
                                    className={`p-2 rounded-lg hover:bg-[var(--admin-bg-hover)] ${product.showOnHome ? 'text-emerald-500' : 'text-gray-400'}`}
                                >
                                    {product.showOnHome ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    onClick={() => handleEditProduct(index)}
                                    className="p-2 rounded-lg hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)]"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(index)}
                                    className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h2>
                </div>
                <ModernMarketplace config={{ marketplace: formData }} />
            </div>

            {/* Edit Product Modal */}
            <AnimatePresence>
                {isEditingProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold">
                                    {currentProductIndex === -1 ? 'Add Product to Carousel' : 'Edit Product'}
                                </h3>
                                <button onClick={() => setIsEditingProduct(false)} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Product Name *</label>
                                        <input
                                            type="text"
                                            value={productForm.productName}
                                            onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                            placeholder="e.g. Premium Saffron Bulbs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Price (₹) *</label>
                                        <input
                                            type="number"
                                            value={productForm.productPrice}
                                            onChange={(e) => setProductForm({ ...productForm, productPrice: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-1">Carousel Image URL *</label>
                                    <input
                                        type="text"
                                        value={productForm.carouselImage}
                                        onChange={(e) => setProductForm({ ...productForm, carouselImage: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        placeholder="https://..."
                                    />
                                    {productForm.carouselImage && (
                                        <div className="mt-2 w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                                            <img src={productForm.carouselImage} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Badge Overlay</label>
                                        <select
                                            value={productForm.badge}
                                            onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="none">None</option>
                                            <option value="new">New</option>
                                            <option value="bestseller">Best Seller</option>
                                            <option value="sale">Sale</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Quick Action</label>
                                        <select
                                            value={productForm.quickAction}
                                            onChange={(e) => setProductForm({ ...productForm, quickAction: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="viewDetails">View Details</option>
                                            <option value="addToCart">Quick Add to Cart</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={productForm.showOnHome}
                                            onChange={(e) => setProductForm({ ...productForm, showOnHome: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900">Show on Homepage</span>
                                    </label>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    onClick={() => setIsEditingProduct(false)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProduct}
                                    className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    Save Product
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarketplaceEditor;
