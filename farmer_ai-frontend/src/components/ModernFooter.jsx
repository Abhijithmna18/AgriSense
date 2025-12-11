import React from 'react';
import { Sprout, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const ModernFooter = () => {
    return (
        <footer className="bg-mint-leaf text-slate-800 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-muted-green rounded-lg flex items-center justify-center">
                                <Sprout size={20} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">AgriSense</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                            Empowering farmers with artificial intelligence for a sustainable and productive future.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:bg-muted-green hover:text-white transition-all">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-slate-900">Platform</h4>
                        <ul className="space-y-4 text-slate-600">
                            <li><a href="#" className="hover:text-fresh-green transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-fresh-green transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-fresh-green transition-colors">Marketplace</a></li>
                            <li><a href="#" className="hover:text-fresh-green transition-colors">AI Advisory</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 text-slate-900">Company</h4>
                        <ul className="space-y-4 text-slate-600">
                            <li><a href="#" className="hover:text-fresh-green transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-fresh-green transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-fresh-green transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-fresh-green transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-slate-900">Stay Updated</h4>
                        <p className="text-slate-600 mb-4">
                            Subscribe to our newsletter for the latest agricultural trends.
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 flex-1 focus:ring-2 focus:ring-fresh-green outline-none shadow-sm"
                            />
                            <button className="bg-fresh-green text-white px-4 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors shadow-md">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                    <p>&copy; 2024 AgriSense. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-fresh-green transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-fresh-green transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ModernFooter;
