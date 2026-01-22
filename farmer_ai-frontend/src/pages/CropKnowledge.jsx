import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Compass,
    BookOpen,
    CloudRain,
    Bug,
    TrendingUp,
    Calendar,
    ChevronRight,
    ArrowLeft,
    Send,
    Bot,
    User,
    Loader,
    Video,
    Leaf,
    Sprout,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../services/authApi';
import ExpertBookingPanel from '../components/expert/ExpertBookingPanel';
import BookingSummaryCard from '../components/expert/BookingSummaryCard';

const CropIntelligence = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('explorer');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const chatEndRef = useRef(null);

    // Premium Color Palette & Section Config
    const sections = [
        {
            id: 'explorer',
            label: 'Crop Explorer',
            icon: Compass,
            accent: 'text-emerald-600',
            bgAccent: 'bg-emerald-50',
            borderAccent: 'border-emerald-200',
            description: 'Compare crops and varieties for your land.'
        },
        {
            id: 'cultivation',
            label: 'Cultivation Guide',
            icon: Sprout,
            accent: 'text-green-600',
            bgAccent: 'bg-green-50',
            borderAccent: 'border-green-200',
            description: 'Scientific stage-by-stage growing instructions.'
        },
        {
            id: 'climate',
            label: 'Climate & Soil',
            icon: CloudRain,
            accent: 'text-cyan-600',
            bgAccent: 'bg-cyan-50',
            borderAccent: 'border-cyan-200',
            description: 'Suitability analysis based on environmental factors.'
        },
        {
            id: 'pests',
            label: 'Pest & Disease',
            icon: Bug,
            accent: 'text-rose-500',
            bgAccent: 'bg-rose-50',
            borderAccent: 'border-rose-200',
            description: 'Identification and integrated management strategies.'
        },
        {
            id: 'markets',
            label: 'Prices & Markets',
            icon: TrendingUp,
            accent: 'text-amber-600',
            bgAccent: 'bg-amber-50',
            borderAccent: 'border-amber-200',
            description: 'Market trends and economic insights.'
        },
        {
            id: 'calendar',
            label: 'Sowing Calendar',
            icon: Calendar,
            accent: 'text-indigo-600',
            bgAccent: 'bg-indigo-50',
            borderAccent: 'border-indigo-200',
            description: 'Optimal seasonal planning and risk mitigation.'
        },
        {
            id: 'expert_consultation',
            label: 'Expert Consultation',
            icon: Video,
            accent: 'text-orange-600',
            bgAccent: 'bg-orange-50',
            borderAccent: 'border-orange-200',
            description: 'Connect with verified agricultural experts.'
        },
    ];

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, loading]);

    // Clear history on section switch
    useEffect(() => {
        setChatHistory([]);
        setQuery('');
    }, [activeSection]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = { role: 'user', content: query };
        setChatHistory(prev => [...prev, userMsg]);
        setLoading(true);
        const currentQuery = query;
        setQuery('');

        try {
            const response = await api.post('/api/crop-intelligence/query', {
                query: currentQuery,
                section: activeSection,
                chatHistory: chatHistory
            });

            const aiMsg = { role: 'assistant', content: response.data.response };
            setChatHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMsg = {
                role: 'assistant',
                content: error.response?.data?.message || 'I apologize, but I am unable to access the crop database at this moment. Please try again shortly.'
            };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const activeSectionData = sections.find(s => s.id === activeSection);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-stone-50 font-sans">

            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white border-r border-stone-200 flex flex-col shrink-0 z-10">
                <div className="p-6 border-b border-stone-100">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 flex items-center text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Dashboard
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                <Leaf size={24} />
                            </div>
                            <h1 className="text-xl font-bold text-stone-800 tracking-tight">Crop Intelligence</h1>
                        </div>
                        <p className="text-xs text-stone-500 ml-1">AI-Powered Decision Support</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group text-left ${activeSection === section.id
                                ? `${section.bgAccent} ring-1 ring-inset ${section.borderAccent}`
                                : 'hover:bg-stone-50 text-stone-600'
                                }`}
                        >
                            <div className={`mr-3 p-2 rounded-lg transition-colors ${activeSection === section.id
                                ? 'bg-white shadow-sm'
                                : 'bg-stone-100 group-hover:bg-white'
                                }`}>
                                <section.icon
                                    size={18}
                                    className={activeSection === section.id ? section.accent : 'text-stone-400'}
                                />
                            </div>
                            <div>
                                <span className={`block text-sm font-semibold ${activeSection === section.id ? 'text-stone-900' : 'text-stone-600'
                                    }`}>
                                    {section.label}
                                </span>
                            </div>
                            {activeSection === section.id && (
                                <ChevronRight size={16} className={`ml-auto ${section.accent}`} />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Trust Signal / Footer - Removed as per user request */}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-stone-50/50 relative">

                {/* Header (Context) */}
                {/* Header Removed as per user request */}

                {/* Content Stream (Chat Area) */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth">
                    {/* Expert Booking Section Integration */}
                    {activeSection === 'expert_consultation' && (
                        <div className="max-w-4xl mx-auto mb-8">
                            <ExpertConsultationSection />
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Empty State */}
                        {chatHistory.length === 0 && activeSection !== 'expert_consultation' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center text-center py-20 px-4"
                            >
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${activeSectionData.bgAccent}`}>
                                    <activeSectionData.icon size={40} className={activeSectionData.accent} />
                                </div>
                                <h3 className="text-2xl font-bold text-stone-700 mb-3">
                                    {activeSectionData.label} Assistant
                                </h3>
                                <p className="text-stone-500 max-w-md text-base leading-relaxed">
                                    I am ready to help you with {activeSectionData.label.toLowerCase()}.
                                    Ask for specific data, comparisons, or detailed guides.
                                </p>
                            </motion.div>
                        )}

                        {/* Message Stream */}
                        <AnimatePresence initial={false}>
                            {chatHistory.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    {/* User Query - Minimal */}
                                    {msg.role === 'user' ? (
                                        <div className="max-w-[80%] bg-stone-800 text-stone-50 px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm text-sm font-medium">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        /* AI Response - Document Style */
                                        <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mt-2">
                                            <div className={`h-1 w-full ${activeSectionData.bgAccent.replace('bg-', 'bg-gradient-to-r from-transparent via-')} ${activeSectionData.accent.replace('text-', 'via-')}/50 to-transparent`} />
                                            <div className="p-6 md:p-8">
                                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                                                    <div className={`p-1.5 rounded-md ${activeSectionData.bgAccent}`}>
                                                        <Bot size={16} className={activeSectionData.accent} />
                                                    </div>
                                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                                        Agricultural Insight
                                                    </span>
                                                </div>

                                                {/* Markdown Content */}
                                                <div className="prose prose-stone prose-sm md:prose-base max-w-none text-stone-700
                                                    prose-headings:font-bold prose-headings:text-stone-800 
                                                    prose-h1:text-xl prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
                                                    prose-p:leading-relaxed prose-p:mb-4
                                                    prose-strong:text-stone-900 prose-strong:font-semibold
                                                    prose-ul:list-disc prose-ul:pl-4 prose-ul:space-y-1
                                                    prose-ol:list-decimal prose-ol:pl-4 prose-ol:space-y-1
                                                    prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-table:text-sm
                                                    prose-th:bg-stone-50 prose-th:text-stone-600 prose-th:font-semibold prose-th:p-3 prose-th:text-left prose-th:border-b prose-th:border-stone-200
                                                    prose-td:p-3 prose-td:border-b prose-td:border-stone-100 prose-td:text-stone-600
                                                ">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Loading State - Premium Pulse */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full bg-white rounded-xl shadow-sm p-6 border border-stone-100 flex items-center justify-center gap-3"
                            >
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-sm font-medium text-stone-500">Processing agricultural data...</span>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Area - Floating Bar Style */}
                <div className="px-4 md:px-8 py-6 relative z-10 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSearch} className="relative group">
                            <div className={`absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur ${activeSectionData.bgAccent.replace('bg-', 'bg-gradient-to-r from-')} to-stone-300`}></div>
                            <div className="relative flex items-center bg-white rounded-xl shadow-lg shadow-stone-200/50 border border-stone-200 focus-within:border-stone-300 transition-all">
                                <div className="pl-4 text-stone-400">
                                    <Search size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={`Ask a question about ${activeSectionData.label.toLowerCase()}...`}
                                    className="flex-1 bg-transparent px-4 py-4 text-stone-700 placeholder:text-stone-400 focus:outline-none text-base font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !query.trim()}
                                    className={`m-2 p-2.5 rounded-lg text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${loading || !query.trim()
                                        ? 'bg-stone-300'
                                        : `bg-stone-800 hover:bg-stone-700`
                                        }`}
                                >
                                    {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-xs text-stone-400 mt-3 font-medium">
                            AI can make mistakes. Verify critical agronomic advice with a local expert.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
};

// Sub-component for Expert Logic to keep main file clean
const ExpertConsultationSection = () => {
    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchLatestConsultation = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/consultations');
            // filtering for the next upcoming or most recent active one
            const active = res.data.find(c => c.status === 'upcoming');
            setConsultation(active);
        } catch (error) {
            console.error("Failed to fetch consultations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestConsultation();
    }, []);

    if (loading) return null; // or skeleton

    return (
        <>
            {consultation ? (
                <BookingSummaryCard
                    consultation={consultation}
                    onRefresh={fetchLatestConsultation}
                />
            ) : (
                <ExpertBookingPanel onBookingComplete={fetchLatestConsultation} />
            )}
        </>
    );
};

export default CropIntelligence;
