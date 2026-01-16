import React from 'react';
import { Sprout, Twitter, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const ModernFooter = ({ config }) => {
    const defaultConfig = {
        branding: {
            logo: '',
            companyName: 'AgriSense',
            mission: 'Empowering farmers with artificial intelligence for a sustainable and productive future.'
        },
        socialMedia: [
            { platform: 'twitter', url: '#' },
            { platform: 'facebook', url: '#' },
            { platform: 'instagram', url: '#' },
            { platform: 'linkedin', url: '#' }
        ],
        navigationColumns: [
            {
                title: 'Platform',
                links: [
                    { label: 'Features', url: '#' },
                    { label: 'Pricing', url: '#' },
                    { label: 'Marketplace', url: '/marketplace' },
                    { label: 'AI Advisory', url: '/advisories' },
                    { label: 'Sell on AgriSense', url: '/sell' }
                ]
            },
            {
                title: 'Company',
                links: [
                    { label: 'About Us', url: '#' },
                    { label: 'Careers', url: '#' },
                    { label: 'Blog', url: '#' },
                    { label: 'Contact', url: '#' }
                ]
            }
        ],
        newsletter: {
            heading: 'Stay Updated',
            subtext: 'Subscribe to our newsletter for the latest agricultural trends.',
            placeholder: 'Enter your email'
        },
        legal: {
            copyright: `© ${new Date().getFullYear()} AgriSense. All rights reserved.`,
            privacyPolicyUrl: '/privacy',
            termsOfServiceUrl: '/terms',
            showRegionSelector: false
        }
    };

    const footerConfig = config?.footer || defaultConfig;
    const { branding, socialMedia, navigationColumns, newsletter, legal } = footerConfig;

    const getSocialIcon = (platform) => {
        const icons = {
            twitter: Twitter,
            facebook: Facebook,
            instagram: Instagram,
            linkedin: Linkedin,
            youtube: Youtube
        };
        return icons[platform] || Twitter;
    };

    return (
        <footer className="bg-mint-leaf text-slate-800 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            {branding?.logo ? (
                                <img src={branding.logo} alt={branding.companyName || 'Logo'} className="h-8" />
                            ) : (
                                <>
                                    <div className="w-8 h-8 bg-muted-green rounded-lg flex items-center justify-center">
                                        <Sprout size={20} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-xl font-bold tracking-tight text-slate-900">
                                        {branding?.companyName || defaultConfig.branding.companyName}
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                            {branding?.mission || defaultConfig.branding.mission}
                        </p>
                        <div className="flex gap-4">
                            {(socialMedia || defaultConfig.socialMedia).map((social, i) => {
                                const Icon = getSocialIcon(social.platform);
                                return (
                                    <a
                                        key={i}
                                        href={social.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:bg-muted-green hover:text-white transition-all"
                                    >
                                        <Icon size={16} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {(navigationColumns || defaultConfig.navigationColumns).map((column, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-lg mb-6 text-slate-900">{column.title}</h4>
                            <ul className="space-y-4 text-slate-600">
                                {column.links?.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a href={link.url || '#'} className="hover:text-fresh-green transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-slate-900">
                            {newsletter?.heading || defaultConfig.newsletter.heading}
                        </h4>
                        <p className="text-slate-600 mb-4">
                            {newsletter?.subtext || defaultConfig.newsletter.subtext}
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder={newsletter?.placeholder || defaultConfig.newsletter.placeholder}
                                className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 flex-1 focus:ring-2 focus:ring-fresh-green outline-none shadow-sm"
                            />
                            <button className="bg-fresh-green text-white px-4 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors shadow-md">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                    <p>{legal?.copyright?.replace('{year}', new Date().getFullYear()) || defaultConfig.legal.copyright}</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href={legal?.privacyPolicyUrl || defaultConfig.legal.privacyPolicyUrl} className="hover:text-fresh-green transition-colors">
                            Privacy Policy
                        </a>
                        <a href={legal?.termsOfServiceUrl || defaultConfig.legal.termsOfServiceUrl} className="hover:text-fresh-green transition-colors">
                            Terms of Service
                        </a>
                        {legal?.showRegionSelector && (
                            <button className="hover:text-fresh-green transition-colors">
                                🌐 Region
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ModernFooter;
