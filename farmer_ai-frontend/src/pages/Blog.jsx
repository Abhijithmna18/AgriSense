import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, User, ArrowRight, Tag, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernNavbar from '../components/ModernNavbar';
import ModernFooter from '../components/ModernFooter';

const Blog = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Technology', 'Agriculture', 'AI & ML', 'Success Stories', 'Tips & Guides'];

    const blogPosts = [
        {
            title: 'How AI is Revolutionizing Crop Disease Detection',
            excerpt: 'Discover how machine learning models can identify plant diseases early, saving crops and increasing yields.',
            author: 'Dr. Sarah Chen',
            date: 'March 15, 2024',
            category: 'AI & ML',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
            readTime: '5 min read'
        },
        {
            title: '10 Tips for Maximizing Your Farm\'s Water Efficiency',
            excerpt: 'Learn practical strategies to reduce water usage while maintaining or improving crop yields.',
            author: 'John Martinez',
            date: 'March 12, 2024',
            category: 'Tips & Guides',
            image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
            readTime: '7 min read'
        },
        {
            title: 'Success Story: How AgriSense Helped Increase Yields by 40%',
            excerpt: 'Meet farmer Rajesh Kumar who transformed his 50-acre farm using data-driven insights.',
            author: 'Emily Rodriguez',
            date: 'March 10, 2024',
            category: 'Success Stories',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
            readTime: '6 min read'
        },
        {
            title: 'The Future of Precision Agriculture: Trends to Watch',
            excerpt: 'Explore emerging technologies that will shape the future of farming in the next decade.',
            author: 'Dr. Michael Thompson',
            date: 'March 8, 2024',
            category: 'Technology',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
            readTime: '8 min read'
        },
        {
            title: 'Understanding Soil Health: A Comprehensive Guide',
            excerpt: 'Everything you need to know about soil testing, nutrients, and maintaining healthy soil.',
            author: 'Lisa Anderson',
            date: 'March 5, 2024',
            category: 'Agriculture',
            image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
            readTime: '10 min read'
        },
        {
            title: 'Smart Irrigation Systems: A Complete Buyer\'s Guide',
            excerpt: 'Compare different irrigation technologies and find the best solution for your farm.',
            author: 'David Park',
            date: 'March 1, 2024',
            category: 'Technology',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
            readTime: '6 min read'
        }
    ];

    const filteredPosts = selectedCategory === 'All' 
        ? blogPosts 
        : blogPosts.filter(post => post.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <ModernNavbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
                            <BookOpen className="text-blue-600" size={20} />
                            <span className="text-blue-700 font-semibold text-sm">AgriSense Blog</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            Insights & Stories from
                            <span className="block text-emerald-600 mt-2">the Field</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
                            Expert advice, success stories, and the latest trends in agricultural technology.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="pb-12 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category, index) => (
                            <motion.button
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                                    selectedCategory === category
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                                }`}
                            >
                                {category}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <motion.article
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-emerald-600">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-600 mb-4 line-clamp-3 flex-1">
                                            {post.excerpt}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <User size={14} />
                                                    {post.author}
                                                </span>
                                            </div>
                                            <span className="text-sm text-slate-500">{post.readTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-slate-400 mt-2">
                                            <Calendar size={14} />
                                            {post.date}
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* Load More */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <button className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 flex items-center gap-2 mx-auto">
                            Load More Articles
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20 px-6 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Never Miss an Update
                        </h2>
                        <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                            Subscribe to our newsletter for the latest articles, tips, and agricultural insights delivered to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 rounded-full text-slate-900 outline-none"
                            />
                            <button className="px-8 py-4 bg-white text-emerald-600 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                                Subscribe
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <ModernFooter />
        </div>
    );
};

export default Blog;
