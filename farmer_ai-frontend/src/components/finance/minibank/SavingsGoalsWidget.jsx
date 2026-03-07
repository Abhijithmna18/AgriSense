import React from 'react';
import { Target, Plus } from 'lucide-react';

const SavingsGoalsWidget = ({ goals = [], onAddContribution, onCreateGoal }) => {
    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900">Savings Goals</h4>
                <button
                    onClick={onCreateGoal}
                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            
            {goals.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No savings goals yet</p>
                    <button
                        onClick={onCreateGoal}
                        className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        Create your first goal
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {goals.map((goal, index) => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                            <div key={index} className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-medium text-slate-900">{goal.name || 'Goal'}</div>
                                        <div className="text-xs text-slate-500">
                                            ₹{goal.currentAmount?.toLocaleString('en-IN') || '0'} / ₹{goal.targetAmount?.toLocaleString('en-IN') || '0'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onAddContribution(goal)}
                                        className="text-xs px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-slate-600 mt-1">{progress.toFixed(0)}% complete</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavingsGoalsWidget;
