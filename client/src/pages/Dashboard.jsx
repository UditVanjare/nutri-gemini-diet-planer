import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Plus, 
  Droplet, 
  Scale, 
  Calculator, 
  Utensils, 
  ArrowRight,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setIsQuickChatOpen } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [latestPlan, setLatestPlan] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [waterTotal, setWaterTotal] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiClass, setBmiClass] = useState('');
  const [error, setError] = useState('');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch diet history
      const planRes = await API.get('/diet/history');
      if (planRes.data.success) {
        setPlans(planRes.data.history);
        if (planRes.data.history.length > 0) {
          setLatestPlan(planRes.data.history[0]);
        }
      }

      // 2. Fetch progress history
      const progressRes = await API.get('/progress');
      if (progressRes.data.success) {
        setProgressLogs(progressRes.data.logs);
        setWaterTotal(progressRes.data.todayWater);
        if (progressRes.data.latestWeight) {
          setCurrentWeight(progressRes.data.latestWeight);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate BMI whenever weight or latestPlan height changes
  useEffect(() => {
    const height = latestPlan?.height || user?.height; // fallback to latest plan or generic height
    const weight = currentWeight;

    if (height && weight) {
      const heightInMeters = height / 100;
      const bmiVal = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      setBmi(bmiVal);

      if (bmiVal < 18.5) {
        setBmiClass('Underweight');
      } else if (bmiVal >= 18.5 && bmiVal < 25) {
        setBmiClass('Normal weight');
      } else if (bmiVal >= 25 && bmiVal < 30) {
        setBmiClass('Overweight');
      } else {
        setBmiClass('Obese');
      }
    } else {
      setBmi(null);
      setBmiClass('');
    }
  }, [currentWeight, latestPlan, user]);

  // Log water intake increment
  const handleLogWater = async (amount) => {
    try {
      const { data } = await API.post('/progress', { waterIncrement: amount });
      if (data.success) {
        setWaterTotal(data.log.waterIntake);
      }
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  // Log weight entry
  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput) || weightInput <= 0) return;

    try {
      const { data } = await API.post('/progress', { weight: parseFloat(weightInput) });
      if (data.success) {
        setWeightInput('');
        setCurrentWeight(data.log.weight);
        fetchDashboardData(); // Refresh history for graph update
      }
    } catch (err) {
      console.error('Failed to log weight:', err);
    }
  };

  // Prepare Chart Data: Weight Progress (Line Graph)
  const weightChartData = {
    labels: progressLogs.filter(l => l.weight).map(l => l.date),
    datasets: [
      {
        label: 'Weight (kg)',
        data: progressLogs.filter(l => l.weight).map(l => l.weight),
        borderColor: '#10b981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointHoverRadius: 6,
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  // Prepare Chart Data: Macro Split (Pie Chart)
  const macroChartData = latestPlan ? {
    labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
    datasets: [
      {
        data: [
          latestPlan.generatedPlan.protein,
          latestPlan.generatedPlan.carbs,
          latestPlan.generatedPlan.fat
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // Emerald
          'rgba(59, 130, 246, 0.7)', // Blue
          'rgba(245, 158, 11, 0.7)', // Amber
        ],
        borderColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
        ],
        borderWidth: 1,
      }
    ]
  } : null;

  const macroChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f8fafc',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
      }
    }
  };

  // Helper for BMI classification colors
  const getBmiColor = () => {
    switch (bmiClass) {
      case 'Normal weight': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'Underweight': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
      case 'Overweight': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'Obese': return 'text-red-400 border-red-500/20 bg-red-500/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/40';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="text-slate-400 font-semibold animate-pulse">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-950 p-8 overflow-y-auto custom-scrollbar text-slate-100">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Welcome back, <span className="text-emerald-400">{user?.name}</span>!</h2>
          <p className="text-slate-400 text-sm mt-1">Here is a quick look at your health parameters and today's status.</p>
        </div>
        <button
          onClick={() => setIsQuickChatOpen(true)}
          className="w-fit px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2 cursor-pointer"
        >
          <Activity size={18} /> Create New Diet Plan <ArrowRight size={18} />
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout of Dash Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
        
        {/* Card 1: BMI Calculator */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-white">BMI Index</h3>
              <p className="text-xs text-slate-400 mt-0.5">Body Mass Index calculator</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Calculator size={20} />
            </div>
          </div>
          
          {bmi ? (
            <div className="flex flex-col items-center my-4">
              <div className="text-5xl font-black text-white text-glow-emerald">{bmi}</div>
              <div className={`mt-3 px-4 py-1.5 rounded-full border text-xs font-bold ${getBmiColor()}`}>
                {bmiClass}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm italic">Log weight and configure height to calculate BMI.</p>
            </div>
          )}

          <div className="border-t border-slate-800/60 pt-4 flex flex-col gap-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Current Weight:</span>
              <span className="font-bold text-slate-200">{currentWeight ? `${currentWeight} kg` : 'Not logged'}</span>
            </div>
            <div className="flex justify-between">
              <span>Configured Height:</span>
              <span className="font-bold text-slate-200">{latestPlan?.height ? `${latestPlan.height} cm` : 'Not logged'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Water Tracker */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-white">Water Hydration</h3>
              <p className="text-xs text-slate-400 mt-0.5">Target: 3.0 Liters (3000 ml)</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Droplet size={20} />
            </div>
          </div>

          <div className="flex flex-col items-center my-4">
            <div className="text-4xl font-extrabold text-blue-400">{waterTotal} <span className="text-sm font-semibold text-slate-400">ml</span></div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden border border-slate-700/50">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (waterTotal / 3000) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleLogWater(250)}
              className="py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-xl font-bold text-xs transition-all duration-200 flex justify-center items-center gap-1.5"
            >
              <Plus size={14} /> +250ml
            </button>
            <button
              onClick={() => handleLogWater(500)}
              className="py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-xl font-bold text-xs transition-all duration-200 flex justify-center items-center gap-1.5"
            >
              <Plus size={14} /> +500ml
            </button>
          </div>
        </div>

        {/* Card 3: Weight Logger */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-white">Log Metrics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Track your weight over time</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Scale size={20} />
            </div>
          </div>

          <form onSubmit={handleLogWeight} className="my-4">
            <div className="flex gap-2">
              <input
                type="text"
                inputmode="decimal"
                placeholder="e.g. 72.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="glass-input flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all duration-200"
              >
                Log Weight
              </button>
            </div>
          </form>

          <div className="border-t border-slate-800/60 pt-4 text-xs text-slate-400 flex justify-between">
            <span>Last log weight:</span>
            <span className="font-bold text-slate-200">{currentWeight ? `${currentWeight} kg` : 'None'}</span>
          </div>
        </div>

      </div>

      {/* Graphs & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Left 2 Cols: Weight Chart or Latest Plan */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Line Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-white">Weight Progress Chart</h3>
                <p className="text-xs text-slate-400">Your bodyweight trends mapped chronologically</p>
              </div>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp size={18} />
              </div>
            </div>
            
            <div className="h-64 relative w-full">
              {progressLogs.filter(l => l.weight).length > 0 ? (
                <Line data={weightChartData} options={weightChartOptions} />
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                  <p className="text-slate-500 text-sm">No weight logs recorded yet.</p>
                  <p className="text-slate-600 text-xs">Enter your current weight above to see progress trends!</p>
                </div>
              )}
            </div>
          </div>

          {/* Latest Diet Plan Meals Card */}
          {latestPlan ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800/60 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">Today's Meal Suggestions</h3>
                  <p className="text-xs text-slate-400">Structured recipes based on goal: <span className="text-emerald-400 font-bold">{latestPlan.goal}</span></p>
                </div>
                <Link to="/plans" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  View All Plans <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                    <Utensils size={14} /> Breakfast
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{latestPlan.generatedPlan.meals.breakfast}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                    <Utensils size={14} /> Lunch
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{latestPlan.generatedPlan.meals.lunch}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                    <Utensils size={14} /> Dinner
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{latestPlan.generatedPlan.meals.dinner}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                    <Utensils size={14} /> Evening Snack
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{latestPlan.generatedPlan.meals.snack}</p>
                </div>

              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 text-center flex flex-col justify-center items-center gap-4">
              <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400">
                <Utensils size={32} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">No Diet Plan Active</h4>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">Complete the intake session with our conversational chatbot to generate your personalized nutrition plan.</p>
              </div>
              <button 
                onClick={() => setIsQuickChatOpen(true)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-300 shadow-md cursor-pointer animate-pulse"
              >
                Get Started
              </button>
            </div>
          )}

        </div>

        {/* Right 1 Col: Macro Breakdown & Plan History */}
        <div className="flex flex-col gap-6">
          
          {/* Macro Breakdown Pie */}
          {latestPlan && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col h-fit">
              <h3 className="font-bold text-lg text-white mb-1">Macro Split</h3>
              <p className="text-xs text-slate-400 mb-6">Target Calories: <span className="text-emerald-400 font-extrabold">{latestPlan.generatedPlan.calories} kcal</span></p>
              
              <div className="h-44 relative w-full mb-4">
                <Pie data={macroChartData} options={macroChartOptions} />
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-800/60 pt-4 text-center">
                <div>
                  <div className="text-xs text-slate-400">Protein</div>
                  <div className="text-sm font-extrabold text-emerald-400">{latestPlan.generatedPlan.protein}g</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Carbs</div>
                  <div className="text-sm font-extrabold text-blue-400">{latestPlan.generatedPlan.carbs}g</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Fats</div>
                  <div className="text-sm font-extrabold text-amber-400">{latestPlan.generatedPlan.fat}g</div>
                </div>
              </div>
            </div>
          )}

          {/* Previous plans summary */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col grow">
            <h3 className="font-bold text-lg text-white mb-1">Previous Plans</h3>
            <p className="text-xs text-slate-400 mb-4">Recent recommendations</p>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {plans.length > 0 ? (
                plans.map((p, idx) => (
                  <Link
                    key={p._id}
                    to="/plans"
                    className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 transition-all duration-300 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.goal}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-400">{p.generatedPlan.calories} kcal</div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">No plan history.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
