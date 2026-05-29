import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Zap, 
  PieChart, 
  Droplet, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  UtensilsCrossed
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-slate-950 glow-emerald">
            <UtensilsCrossed size={22} />
          </div>
          <span className="font-extrabold text-xl tracking-wide">Nutri<span className="text-emerald-400">Gemini</span></span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold hover:text-emerald-400 transition-colors">
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles size={14} className="animate-pulse" />
          <span>Advanced AI-Powered Nutrition</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-8 animate-fade-in">
          Your Personal <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent text-glow-emerald">AI Diet Coach</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 animate-fade-in">
          Meet the chatbot that builds perfect, personalized diet plans, tracks your weight and hydration, and helps you achieve your fitness goals step-by-step.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-16 animate-fade-in">
          <Link
            to={user ? "/chat" : "/signup"}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base rounded-xl shadow-xl hover:shadow-emerald-500/35 transition-all duration-300 flex justify-center items-center gap-3 hover:-translate-y-0.5"
          >
            Start Your Free Plan <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold text-base rounded-xl transition-all duration-300 flex justify-center items-center"
          >
            Sign In Account
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Engineered For Your Success</h2>
          <p className="text-slate-400 max-w-lg mx-auto">Get complete body metrics calculation and personalized daily routines with our automated tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 flex flex-col gap-5 hover:border-emerald-500/35 transition-all duration-300">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit rounded-xl">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Conversational Coach</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Answer 10 short questions about your habits and medical profile. The AI dynamically crafts the ideal plan.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 flex flex-col gap-5 hover:border-emerald-500/35 transition-all duration-300">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 w-fit rounded-xl">
              <PieChart size={24} />
            </div>
            <h3 className="text-xl font-bold">Nutrition Macro Charts</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Instantly view macro ratios (Carbs, Protein, Fats) and calorie targets calculated specifically for your metabolic rate.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 flex flex-col gap-5 hover:border-emerald-500/35 transition-all duration-300">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit rounded-xl">
              <Droplet size={24} />
            </div>
            <h3 className="text-xl font-bold">Water & Weight Trackers</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Log weight and track daily hydration. Progress is visualized in charts that help keep you accountable over time.
            </p>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Loved By Healthy Users</h2>
          <p className="text-slate-400 max-w-lg mx-auto">Hear how NutriGemini is changing lives through tailored nutrition planning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="glass-panel p-8 rounded-2xl border border-slate-800/60 relative">
            <p className="text-slate-300 italic mb-6">
              "The intake chatbot asked me exactly what my medical issues and peanut allergies were. The plan generated fit my dietary restrictions perfectly, and I've already lost 4kg!"
            </p>
            <div>
              <h4 className="font-bold text-white">Sarah Jenkins</h4>
              <p className="text-xs text-slate-400">Weight Loss Goal</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800/60 relative">
            <p className="text-slate-300 italic mb-6">
              "As a vegan, finding high-protein plans can be tough. NutriGemini calculated my macros and suggested simple plant-based meals that allowed me to pack on muscle."
            </p>
            <div>
              <h4 className="font-bold text-white">David Miller</h4>
              <p className="text-xs text-slate-400">Muscle Building Goal</p>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-6 py-20 relative z-10 text-center">
        <div className="glass-panel p-12 md:p-16 rounded-3xl border border-slate-800/90 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
          <h2 className="text-4xl font-extrabold mb-6">Ready to Transform Your Habits?</h2>
          <p className="text-slate-300 max-w-xl mb-8">
            Create your account today, complete your chatbot evaluation, and receive a customized diet plan generated by advanced AI in seconds.
          </p>
          <Link
            to="/signup"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base rounded-xl shadow-xl hover:shadow-emerald-500/35 transition-all duration-300 flex items-center gap-3 hover:-translate-y-0.5"
          >
            Start Your Journey <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 relative z-10 text-slate-500 text-sm text-center">
        <p>© 2026 NutriGemini. All rights reserved.</p>
        <p className="text-xs mt-2 text-slate-600">This platform provides AI suggestions. Consult a medical professional before starting any weight regimen.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
