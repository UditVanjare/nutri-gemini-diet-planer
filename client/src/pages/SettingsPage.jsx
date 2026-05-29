import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  Bell, 
  Droplet, 
  Utensils, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [waterTracker, setWaterTracker] = useState(user?.reminderPreferences?.waterTracker ?? true);
  const [mealLogging, setMealLogging] = useState(user?.reminderPreferences?.mealLogging ?? true);
  const [workoutAlarm, setWorkoutAlarm] = useState(user?.reminderPreferences?.workoutAlarm ?? false);
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    if (password && password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    const payload = {
      name,
      reminderPreferences: {
        waterTracker,
        mealLogging,
        workoutAlarm
      }
    };

    if (password) {
      payload.password = password;
    }

    const result = await updateProfile(payload);
    setLoading(false);

    if (result.success) {
      setStatus({ type: 'success', message: 'Settings successfully updated!' });
      setPassword('');
      setConfirmPassword('');
    } else {
      setStatus({ type: 'error', message: result.message || 'Failed to save settings.' });
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 p-8 overflow-y-auto custom-scrollbar text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Configure profile preferences, password keys, and alert preferences.</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <Settings size={22} />
        </div>
      </div>

      <div className="max-w-3xl animate-fade-in">
        {status.message && (
          <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm ${
            status.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          
          {/* Section 1: Profile */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
            <h3 className="font-bold text-white mb-4 text-base">Account Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-350">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input px-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-350">Email Address (Read-Only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="glass-input px-4 py-2.5 rounded-xl text-sm font-semibold outline-none opacity-50 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Section 2: Security */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
            <h3 className="font-bold text-white mb-4 text-base">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-350">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input px-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-350">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input px-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Reminders */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
            <h3 className="font-bold text-white mb-4 text-base flex items-center gap-2">
              <Bell size={18} className="text-emerald-400" /> Notifications & Reminders
            </h3>
            
            <div className="flex flex-col gap-4">
              
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-900/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Droplet size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Water Hydration Reminder</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Send a quick ping to log water logs periodically.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waterTracker}
                    onChange={(e) => setWaterTracker(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-1 peer-focus:ring-emerald-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-900/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Utensils size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Meal Intake Log Reminder</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Notify to log breakfast, lunch, and dinner plans.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mealLogging}
                    onChange={(e) => setMealLogging(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-1 peer-focus:ring-emerald-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-900/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Daily Workout Schedule Alarm</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Alert user of workout routines configured by the AI.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workoutAlarm}
                    onChange={(e) => setWorkoutAlarm(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-1 peer-focus:ring-emerald-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-emerald-500/25 disabled:opacity-50"
          >
            {loading ? 'Saving Preferences...' : 'Save Settings'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default SettingsPage;
