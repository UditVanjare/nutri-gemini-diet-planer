import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, UtensilsCrossed, AlertCircle, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      
      {/* Decorative Orb */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-2 bg-emerald-500 rounded-lg text-slate-950 glow-emerald">
          <UtensilsCrossed size={22} />
        </div>
        <span className="font-extrabold text-xl tracking-wide text-white">Nutri<span className="text-emerald-400">Gemini</span></span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative z-10 animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Account</h2>
        <p className="text-slate-400 text-sm text-center mb-8">Start planning your personalized nutrition routine</p>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-semibold text-slate-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              autocomplete="name"
              placeholder="Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input px-4 py-3 rounded-xl outline-none text-sm font-medium"
            />
          </div>

          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autocomplete="username"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input px-4 py-3 rounded-xl outline-none text-sm font-medium"
            />
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="new-password" className="text-xs font-semibold text-slate-300">
              Password (6+ characters)
            </label>
            
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-4 pr-12 py-3 rounded-xl outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
