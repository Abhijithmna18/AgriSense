import React from 'react';
import { Target, TrendingUp, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const SavingsGoalCard = ({ goal, onContribute }) => {
    const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-4xl">{goal.icon || '🎯'}</div>
                    <div>
                        <h3 className="font-bold text-slate-900">{goal.name}</h3>
                        <p className="text-xs text-slate-500">{goal.description}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    goal.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    goal.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                }`}>
                    {goal.status}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-bold text-emerald-600">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                        style={{ backgroundColor: goal.color || '#10B981' }}
                    />
                </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xs text-emerald-700 mb-1">Current</p>
                    <p className="text-lg font-black text-emerald-600">
                        ₹{goal.currentAmount.toLocaleString()}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-700 mb-1">Target</p>
                    <p className="text-lg font-black text-blue-600">
                        ₹{goal.targetAmount.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} />
                    <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}</span>
                </div>
                {goal.status === 'active' && (
                    <button
                        onClick={() => onContribute(goal)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default SavingsGoalCard;
