import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  CheckCircle,
  Activity,
  Flame,
  Award,
  Edit2,
  Save,
  X
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [latestPlan, setLatestPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Form States
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    height: user?.height || '',
    weight: user?.weight || '',
    targetWeight: user?.targetWeight || '',
    goal: user?.goal || 'Weight Loss',
    activityLevel: user?.activityLevel || 'Sedentary',
    preference: user?.preference || 'Vegetarian',
    allergies: user?.allergies || '',
    medicalRestrictions: user?.medicalRestrictions || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || 'Male',
        height: user.height || '',
        weight: user.weight || '',
        targetWeight: user.targetWeight || '',
        goal: user.goal || 'Weight Loss',
        activityLevel: user.activityLevel || 'Sedentary',
        preference: user.preference || 'Vegetarian',
        allergies: user.allergies || '',
        medicalRestrictions: user.medicalRestrictions || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchLatestPlan = async () => {
      try {
        const { data } = await API.get('/diet/history');
        if (data.success && data.history.length > 0) {
          setLatestPlan(data.history[0]);
        }
      } catch (err) {
        console.error('Failed to load profile plan details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestPlan();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const processedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined
      };

      const res = await updateProfile(processedData);
      if (res.success) {
        setSuccess('Profile biometrics updated successfully!');
        setIsEditing(false);
        // Clear success notification after 3s
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="text-slate-400 font-semibold animate-pulse">Loading profile details...</p>
        </div>
      </div>
    );
  }

  const displayBiometrics = user?.age ? user : (latestPlan ? latestPlan : null);

  return (
    <div className="flex-1 min-h-screen bg-slate-950 p-8 overflow-y-auto custom-scrollbar text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Your Profile</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your account profile settings and active biometrics.</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <User size={22} />
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-2xl animate-fade-in">
          🎉 {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Left Card: Account Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center gap-6 h-fit">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/35 flex items-center justify-center font-black text-emerald-400 text-3xl glow-emerald">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-xl">{user?.name}</h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 mt-1.5">
              <Award size={14} /> Certified Healthy Member
            </p>
          </div>

          <div className="w-full border-t border-slate-800/60 pt-6 flex flex-col gap-4 text-left text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-500" />
              <div>
                <span className="block text-[10px] text-slate-500">Email Address</span>
                <span className="font-bold text-slate-200">{user?.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-slate-500" />
              <div>
                <span className="block text-[10px] text-slate-500">Member Since</span>
                <span className="font-bold text-slate-200">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Cards: Active Goals Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800/60 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" /> Active Biological Target
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <Edit2 size={13} /> Edit Biometrics
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 animate-fade-in">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      required
                    />
                  </div>

                  {/* Age */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Age</label>
                    <input 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      placeholder="e.g. 25"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Gender</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Height */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Height (cm)</label>
                    <input 
                      type="number" 
                      name="height" 
                      value={formData.height} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      placeholder="e.g. 175"
                      min="50"
                      max="280"
                      required
                    />
                  </div>

                  {/* Weight */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Weight (kg)</label>
                    <input 
                      type="number" 
                      name="weight" 
                      value={formData.weight} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      placeholder="e.g. 70"
                      min="10"
                      max="500"
                      required
                    />
                  </div>

                  {/* Target Weight */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Target Weight (kg)</label>
                    <input 
                      type="number" 
                      name="targetWeight" 
                      value={formData.targetWeight} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      placeholder="e.g. 65"
                      min="10"
                      max="500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Goal */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Goal</label>
                    <select 
                      name="goal" 
                      value={formData.goal} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      required
                    >
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Weight Gain">Weight Gain</option>
                      <option value="Muscle Building">Muscle Building</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  {/* Activity Level */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Activity Level</label>
                    <select 
                      name="activityLevel" 
                      value={formData.activityLevel} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      required
                    >
                      <option value="Sedentary">Sedentary</option>
                      <option value="Lightly Active">Lightly Active</option>
                      <option value="Moderately Active">Moderately Active</option>
                      <option value="Very Active">Very Active</option>
                    </select>
                  </div>

                  {/* Preference */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Dietary Preference</label>
                    <select 
                      name="preference" 
                      value={formData.preference} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      required
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Allergies */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Allergies</label>
                    <input 
                      type="text" 
                      name="allergies" 
                      value={formData.allergies} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      placeholder="e.g. Peanuts, Dairy (or 'None')"
                    />
                  </div>

                  {/* Medical Restrictions */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Medical Restrictions</label>
                    <input 
                      type="text" 
                      name="medicalRestrictions" 
                      value={formData.medicalRestrictions} 
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-xl bg-slate-905 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      placeholder="e.g. Diabetes, Hypertension (or 'None')"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-900 pt-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            ) : displayBiometrics ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                  
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Goal</span>
                    <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{displayBiometrics.goal}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Age / Gender</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">{displayBiometrics.age}y / {displayBiometrics.gender}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Height</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">{displayBiometrics.height} cm</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Current Weight</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">{displayBiometrics.weight} kg</span>
                  </div>

                </div>

                {latestPlan && (
                  <div className="p-5 rounded-xl bg-slate-900/20 border border-slate-800 animate-fade-in">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Flame size={14} className="text-emerald-400 animate-pulse" /> Active Daily Nutrition Plan
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                        <div className="text-[10px] text-slate-450">Calories</div>
                        <div className="text-base font-extrabold text-white mt-1">{latestPlan.generatedPlan.calories} kcal</div>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                        <div className="text-[10px] text-slate-450">Protein</div>
                        <div className="text-base font-extrabold text-emerald-400 mt-1">{latestPlan.generatedPlan.protein}g</div>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                        <div className="text-[10px] text-slate-450">Carbs</div>
                        <div className="text-base font-extrabold text-blue-400 mt-1">{latestPlan.generatedPlan.carbs}g</div>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                        <div className="text-[10px] text-slate-450">Fats</div>
                        <div className="text-base font-extrabold text-amber-400 mt-1">{latestPlan.generatedPlan.fat}g</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2.5 text-xs text-slate-400 animate-fade-in">
                  <div className="flex gap-2 items-center">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>Preference: <strong className="text-slate-200">{displayBiometrics.preference}</strong></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>Allergies: <strong className="text-slate-200">{displayBiometrics.allergies || 'None'}</strong></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>Restrictions: <strong className="text-slate-200">{displayBiometrics.medicalRestrictions || 'None'}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-4">No plan biometrics configured.</p>
                <Link to="/chat" className="inline-block px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-950/40">
                  Setup Biometrics Questionnaire
                </Link>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
