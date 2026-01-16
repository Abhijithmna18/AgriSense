import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoanDetail, runLoanAnalysis, submitLoanDecision } from '../../../api/adminFinanceApi';
import { Loader, AlertTriangle, CheckCircle, XCircle, DollarSign, TrendingUp, ShieldAlert, FileText, User } from 'lucide-react';
import Sidebar from '../../../components/dashboard/Sidebar';
import TopBar from '../../../components/dashboard/TopBar';
import { toast } from 'react-hot-toast';

const LoanReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loanData, setLoanData] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Decision Form
    const [decision, setDecision] = useState('approved');
    const [note, setNote] = useState('');
    const [modifiedAmount, setModifiedAmount] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const data = await getLoanDetail(id);
            setLoanData(data);
            if (data.ai_analysis) {
                setAnalysis(data.ai_analysis);
            }
        } catch (error) {
            console.error("Failed to load loan details", error);
            toast.error("Failed to load loan details");
        } finally {
            setLoading(false);
        }
    };

    const handleRunAnalysis = async () => {
        setAnalyzing(true);
        try {
            const result = await runLoanAnalysis(id);
            setAnalysis(result);
            toast.success("Risk Analysis Complete");
        } catch (error) {
            toast.error("Analysis Failed");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note) return toast.error("Please add a justification note");

        setSubmitting(true);
        try {
            await submitLoanDecision(id, {
                decision,
                note,
                modifiedAmount: decision === 'approved' && modifiedAmount ? Number(modifiedAmount) : undefined
            });
            toast.success(`Loan ${decision} successfully`);
            navigate('/admin/loans');
        } catch (error) {
            toast.error("Failed to submit decision");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;
    if (!loanData) return <div className="p-20 text-center">Loan not found</div>;

    const { loan, farmer_profile } = loanData;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                <TopBar />
                <main className="p-8 max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <button onClick={() => navigate('/admin/loans')} className="text-sm text-gray-500 hover:text-gray-900 mb-2">← Back to Queue</button>
                            <h1 className="text-2xl font-bold text-gray-900">Loan Review: #{loan._id.slice(-6).toUpperCase()}</h1>
                        </div>
                        <div className="flex gap-3">
                            {!analysis && (
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={analyzing}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {analyzing ? <Loader size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                                    Run Risk Analysis
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN: Profile & Details */}
                        <div className="space-y-6">
                            {/* Farmer Profile */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <User size={18} /> Farmer Profile
                                </h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xl text-gray-600">
                                        {farmer_profile?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold">{farmer_profile?.name}</p>
                                        <p className="text-sm text-gray-500">{farmer_profile?.email}</p>
                                        <p className="text-sm text-gray-500">{farmer_profile?.phone || 'No Phone'}</p>
                                    </div>
                                </div>
                                <div className="border-t pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Farm Location</span>
                                        <span className="font-medium">Kodagu, Karnataka</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Primary Crop</span>
                                        <span className="font-medium">Coffee, Pepper</span>
                                    </div>
                                </div>
                            </div>

                            {/* Application Details */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <FileText size={18} /> Application Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Requested Amount</p>
                                        <p className="text-xl font-bold">₹{loan.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Tenure</p>
                                            <p className="font-medium">{loan.tenureMonths} Months</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Purpose</p>
                                            <p className="font-medium">{loan.purpose}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Applied On</p>
                                        <p className="font-medium">{new Date(loan.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MIDDLE COLUMN: Risk Analysis (The Engine Output) */}
                        <div className="lg:col-span-2 space-y-6">
                            {analysis ? (
                                <>
                                    {/* Risk Score Card */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-start mb-6">
                                            <h3 className="font-bold text-gray-900 text-lg">AI Risk Assessment</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${analysis.risk_assessment.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                                                    analysis.risk_assessment.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {analysis.risk_assessment.risk_level.toUpperCase()} RISK
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                                                <p className={`text-3xl font-bold ${analysis.risk_assessment.overall_risk_score > 50 ? 'text-red-600' : 'text-green-600'
                                                    }`}>{analysis.risk_assessment.overall_risk_score}/100</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Default Prob.</p>
                                                <p className="text-3xl font-bold text-gray-900">{analysis.risk_assessment.default_probability_percent}%</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Confidence</p>
                                                <p className="text-3xl font-bold text-gray-900">{analysis.risk_assessment.confidence_score * 100}%</p>
                                            </div>
                                        </div>

                                        {/* Financial Ratios */}
                                        <h4 className="font-semibold text-gray-700 mb-3">Financial Health Ratios</h4>
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="p-3 border rounded-lg">
                                                <span className="text-xs text-gray-500 block">Debt-to-Income</span>
                                                <span className="font-mono font-bold">{analysis.financial_ratios.debt_to_income_ratio}</span>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <span className="text-xs text-gray-500 block">EMI Burden</span>
                                                <span className="font-mono font-bold">{analysis.financial_ratios.emi_to_net_income_ratio}</span>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <span className="text-xs text-gray-500 block">Expense Ratio</span>
                                                <span className="font-mono font-bold">{analysis.financial_ratios.expense_burden_ratio}</span>
                                            </div>
                                        </div>

                                        {/* Risk Factors */}
                                        {analysis.risk_factors.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-700 mb-2">Detected Risk Factors</h4>
                                                <div className="space-y-2">
                                                    {analysis.risk_factors.map((factor, idx) => (
                                                        <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                                            <div>
                                                                <span className="font-bold uppercase text-xs mr-2">{factor.type}</span>
                                                                {factor.description}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommendation */}
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                <TrendingUp size={18} /> AI Recommendation
                                            </h4>
                                            <div className="flex justify-between items-center text-sm text-blue-800">
                                                <span>Recommended Max Amount:</span>
                                                <span className="font-bold text-lg">₹{analysis.loan_recommendation.recommended_max_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-blue-800 mt-1">
                                                <span>Suggested Interest Band:</span>
                                                <span className="font-bold">{analysis.loan_recommendation.interest_rate_band_percent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                                    <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">Analysis Required</h3>
                                    <p className="text-gray-500 mb-6">Run the AI risk engine to generate a credit assessment.</p>
                                    <button
                                        onClick={handleRunAnalysis}
                                        disabled={analyzing}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {analyzing ? 'Analyzing...' : 'Start Analysis'}
                                    </button>
                                </div>
                            )}

                            {/* Decision Panel */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-6">Admin Decision</h3>
                                <form onSubmit={handleSubmit}>

                                    <div className="flex gap-4 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setDecision('approved')}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${decision === 'approved'
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            <CheckCircle size={20} /> Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDecision('rejected')}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${decision === 'rejected'
                                                    ? 'border-red-600 bg-red-50 text-red-700'
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            <XCircle size={20} /> Reject
                                        </button>
                                    </div>

                                    {decision === 'approved' && (
                                        <div className="mb-6 animate-fade-in">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Approved Amount (Optional Override)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">₹</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={modifiedAmount}
                                                    onChange={(e) => setModifiedAmount(e.target.value)}
                                                    placeholder={loan.amount.toString()}
                                                    className="pl-8 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Leave empty to approve original amount ({loan.amount})</p>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Decision Justification / Notes <span className="text-red-500">*</span></label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            rows="4"
                                            required
                                            placeholder="Explain the reason for your decision..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70"
                                    >
                                        {submitting ? 'Processing...' : 'Submit Final Decision'}
                                    </button>

                                </form>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LoanReviewPage;
