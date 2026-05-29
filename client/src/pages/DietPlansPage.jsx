import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import API from '../services/api';
import { 
  Trash2, 
  RefreshCw, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  User, 
  Activity, 
  HeartHandshake,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { Pie } from 'react-chartjs-2';

const DietPlansPage = () => {
  const { setIsQuickChatOpen } = useOutletContext();
  const [plans, setPlans] = useState([]);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [error, setError] = useState('');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.get('/diet/history');
      if (data.success) {
        setPlans(data.history);
        if (data.history.length > 0 && !expandedPlanId) {
          setExpandedPlanId(data.history[0]._id); // Expand latest by default
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to fetch plan history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const toggleExpand = (id) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this diet plan?')) {
      try {
        const { data } = await API.delete(`/diet/${id}`);
        if (data.success) {
          setPlans(plans.filter(p => p._id !== id));
          if (expandedPlanId === id) setExpandedPlanId(null);
        }
      } catch (err) {
        console.error('Error deleting plan:', err);
        alert('Failed to delete diet plan.');
      }
    }
  };

  const handleRegenerate = async (id, e) => {
    e.stopPropagation();
    setRegeneratingId(id);
    try {
      const { data } = await API.post(`/diet/${id}/regenerate`);
      if (data.success) {
        alert('New diet plan successfully regenerated and saved!');
        fetchPlans(); // Refresh history list
      }
    } catch (err) {
      console.error('Error regenerating plan:', err);
      alert('Failed to regenerate plan.');
    } finally {
      setRegeneratingId(null);
    }
  };

  // Helper to generate Pie Chart data
  const getMacroChartData = (plan) => {
    return {
      labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
      datasets: [
        {
          data: [
            plan.generatedPlan.protein,
            plan.generatedPlan.carbs,
            plan.generatedPlan.fat
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(245, 158, 11, 0.7)',
          ],
          borderColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  const macroChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { size: 10 }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="text-slate-400 font-semibold animate-pulse">Loading diet plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-950 p-8 overflow-y-auto custom-scrollbar text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Your Diet Plans</h2>
          <p className="text-slate-400 text-sm mt-1">Review, delete, or regenerate your historical AI diet guides.</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <ClipboardList size={22} />
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col justify-center items-center gap-4 animate-fade-in">
          <Calendar size={48} className="text-slate-650" />
          <div>
            <h4 className="font-bold text-white text-lg">No Diet Plans Logged</h4>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">You haven't completed any diet planner sessions yet.</p>
          </div>
          <button 
            onClick={() => setIsQuickChatOpen(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-300 cursor-pointer animate-pulse"
          >
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-fade-in">
          {plans.map((p) => {
            const isExpanded = expandedPlanId === p._id;
            const isRegenerating = regeneratingId === p._id;

            return (
              <div 
                key={p._id}
                className={`glass-panel rounded-2xl border transition-all duration-300 ${
                  isExpanded ? 'border-emerald-500/30 shadow-emerald-500/5' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header Summary */}
                <div 
                  onClick={() => toggleExpand(p._id)}
                  className="p-6 flex justify-between items-center cursor-pointer select-none"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400">
                      <Flame size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2.5">
                        {p.goal}
                        <span className="text-xs text-slate-400 font-medium">({p.preference})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar size={12} /> {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-extrabold text-white text-base">{p.generatedPlan.calories} kcal</div>
                      <div className="text-[10px] text-slate-400 font-bold">protein: {p.generatedPlan.protein}g</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleRegenerate(p._id, e)}
                        disabled={isRegenerating}
                        className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-emerald-400 rounded-xl transition-all duration-200 disabled:opacity-50"
                        title="Regenerate plan using same parameters"
                      >
                        <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                      </button>
                      
                      <button
                        onClick={(e) => handleDelete(p._id, e)}
                        className="p-2.5 bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-450 hover:text-red-400 rounded-xl transition-all duration-200"
                        title="Delete plan"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="text-slate-400 pl-2">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-850/60 pt-6 animate-fade-in">
                    
                    {/* 3 Columns details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      
                      {/* Biometrics */}
                      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 flex flex-col gap-3">
                        <h4 className="font-bold text-xs text-white border-b border-slate-800/80 pb-2 flex items-center gap-1.5">
                          <User size={13} className="text-emerald-400" /> Biometrics Input
                        </h4>
                        <div className="grid grid-cols-2 gap-y-2.5 text-xs text-slate-400">
                          <span>Age:</span><span className="font-bold text-slate-200">{p.age} years</span>
                          <span>Gender:</span><span className="font-bold text-slate-200">{p.gender}</span>
                          <span>Height / Weight:</span><span className="font-bold text-slate-200">{p.height}cm / {p.weight}kg</span>
                          <span>Target Weight:</span><span className="font-bold text-slate-200">{p.targetWeight ? `${p.targetWeight} kg` : 'N/A'}</span>
                          <span>Activity Level:</span><span className="font-bold text-slate-200">{p.activityLevel}</span>
                        </div>
                      </div>

                      {/* Restrictions */}
                      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 flex flex-col gap-3">
                        <h4 className="font-bold text-xs text-white border-b border-slate-800/80 pb-2 flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-emerald-400" /> Sensitivities
                        </h4>
                        <div className="flex flex-col gap-2 text-xs text-slate-400">
                          <div>
                            <span className="block text-[10px] text-slate-550 uppercase font-extrabold">Allergies:</span>
                            <span className="font-bold text-slate-200 text-sm leading-normal">{p.allergies || 'None'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-550 uppercase font-extrabold">Medical restrictions:</span>
                            <span className="font-bold text-slate-200 text-sm leading-normal">{p.medicalRestrictions || 'None'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Macro Breakdown chart */}
                      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 flex flex-col items-center">
                        <h4 className="font-bold text-xs text-white border-b border-slate-800/80 pb-2 w-full text-center mb-2">
                          Macro Target
                        </h4>
                        <div className="h-32 relative w-full">
                          <Pie data={getMacroChartData(p)} options={macroChartOptions} />
                        </div>
                        <div className="text-[10px] font-bold text-emerald-400 mt-2">
                          Water recommendation: {p.generatedPlan.waterIntake} Liters
                        </div>
                      </div>

                    </div>

                    {/* Meal details */}
                    <div className="mb-6">
                      <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                        <Flame size={16} className="text-emerald-400" /> Suggested Daily Menu
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Breakfast</span>
                          <p className="text-xs text-slate-350 mt-1 leading-relaxed font-semibold">{p.generatedPlan.meals.breakfast}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Lunch</span>
                          <p className="text-xs text-slate-350 mt-1 leading-relaxed font-semibold">{p.generatedPlan.meals.lunch}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Dinner</span>
                          <p className="text-xs text-slate-350 mt-1 leading-relaxed font-semibold">{p.generatedPlan.meals.dinner}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Snack</span>
                          <p className="text-xs text-slate-350 mt-1 leading-relaxed font-semibold">{p.generatedPlan.meals.snack}</p>
                        </div>
                      </div>
                    </div>

                    {/* Exercise details */}
                    {p.generatedPlan.exerciseRecommendations && p.generatedPlan.exerciseRecommendations.length > 0 && (
                      <div className="border-t border-slate-850/60 pt-5">
                        <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                          <Activity size={16} className="text-emerald-400" /> Workout & Habits Guide
                        </h4>
                        <ul className="flex flex-col gap-2 list-none text-xs text-slate-300">
                          {p.generatedPlan.exerciseRecommendations.map((rec, index) => (
                            <li key={index} className="flex gap-2 items-start font-medium leading-relaxed">
                              <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded mt-0.5"><HeartHandshake size={10} /></span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default DietPlansPage;
