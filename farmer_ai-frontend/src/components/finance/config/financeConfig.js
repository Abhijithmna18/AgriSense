
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    PieChart,
    Landmark,
    FileText,
    Shield,
    Activity,
    CreditCard,
    DollarSign,
    Package,
    Truck,
    ShoppingCart,
    Wallet,
    MessageSquare
} from 'lucide-react';

// --- SHARED CONSTANTS ---
const SHARED_MODULES = {
    transactions: 'transactions',
    loans: 'credit', // mapped to existing "credit" module ID
    reports: 'reports'
};

// --- FARMER CONFIGURATION (Legacy Reuse) ---
export const FARMER_CONFIG = {
    role: 'farmer',
    context: 'production',
    navigation: [
        { id: 'overview', label: 'Financial Overview', icon: LayoutDashboard },
        { id: 'revenue', label: 'Revenue Tracking', icon: TrendingUp },
        { id: 'expenses', label: 'Expense Manager', icon: TrendingDown },
        { id: 'profitability', label: 'Profitability Analysis', icon: PieChart },
        { id: 'subsidies', label: 'Subsidies & Insurance', icon: Shield },
        { id: 'credit', label: 'Loans & Financial Health', icon: Landmark }, // "credit" maps to Loans
    ],
    overview: {
        kpiCards: [
            {
                id: 'net_cashflow',
                label: 'Net Cashflow',
                dataKey: 'netIncome', // CORRECTED to match API/Snapshot
                icon: Activity,
                color: 'blue'
            },
            {
                id: 'total_revenue',
                label: 'Total Revenue',
                dataKey: 'totalRevenue', // CORRECTED
                icon: TrendingUp,
                color: 'emerald'
            },
            {
                id: 'total_expenses',
                label: 'Total Expenses',
                dataKey: 'totalExpenses',
                icon: TrendingDown,
                color: 'rose'
            },
            {
                id: 'loan_balance',
                label: 'Active Loans',
                dataKey: 'outstandingLoanBalance', // CORRECTED
                icon: Landmark,
                color: 'amber'
            }
        ],
        aiPanel: {
            title: 'Financial Health Assessment',
            metrics: ['Cashflow Stability', 'Expense Discipline', 'Loan Repayment Capacity']
        }
    },
    expenses: {
        categories: [
            'Seeds & Saplings',
            'Fertilizers',
            'Pesticides',
            'Labor',
            'Machinery & Fuel',
            'Irrigation',
            'Land Lease',
            'Miscellaneous'
        ]
    }
};

// --- BUYER CONFIGURATION (New) ---
export const BUYER_CONFIG = {
    role: 'buyer',
    context: 'procurement',
    navigation: [
        { id: 'overview', label: 'Financial Overview', icon: LayoutDashboard },
        { id: 'expenses', label: 'Expense Manager', icon: TrendingDown },
        { id: 'transactions', label: 'Transactions', icon: CreditCard },
        { id: 'margin_analysis', label: 'Margin Analysis', icon: PieChart },
        { id: 'credit', label: 'Loans & Credit', icon: Landmark },
        { id: 'product_reviews', label: 'Product Reviews', icon: MessageSquare }, // New Item
        { id: 'reports', label: 'Reports', icon: FileText }
    ],
    overview: {
        kpiCards: [
            {
                id: 'net_cashflow',
                label: 'Net Cashflow',
                dataKey: 'netIncome',
                icon: Activity,
                color: 'indigo'
            },
            {
                id: 'total_spend',
                label: 'Total Spend (Procurement)',
                dataKey: 'totalExpenses', // Buyer spend = expenses
                icon: ShoppingCart,
                color: 'rose'
            },
            {
                id: 'outstanding_payables',
                label: 'Outstanding Payables',
                dataKey: 'outstandingLoanBalance', // Using loan balance as proxy for now
                icon: Wallet,
                color: 'amber'
            },
            {
                id: 'loan_balance',
                label: 'Loan Balance',
                dataKey: 'outstandingLoanBalance',
                icon: Landmark,
                color: 'blue'
            }
        ],
        aiPanel: {
            title: 'Working Capital Health',
            metrics: ['Expense Leakage Risk', 'Margin Compression Alert', 'Credit Readiness Score']
        }
    },
    expenses: {
        categories: [
            'Crop Procurement',
            'Logistics & Transport',
            'Storage / Warehousing',
            'Packaging',
            'Platform Fees',
            'Payment Gateway Charges',
            'Salaries / Agents',
            'Miscellaneous'
        ]
    },
    transactions: {
        labels: {
            income: 'Refunds / Income',
            expense: 'Procurement / Payments'
        }
    },
    marginAnalysis: {
        metrics: ['Average Margin %', 'Margin per Crop', 'Margin per Supplier']
    }
};

export const getFinanceConfig = (role) => {
    // Default to Farmer if role is missing or not buyer
    if (role === 'buyer') return BUYER_CONFIG;
    return FARMER_CONFIG;
};
