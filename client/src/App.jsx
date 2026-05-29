import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Sliders, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components & Pages
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import DietPlansPage from './pages/DietPlansPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import QuickChatWidget from './components/QuickChatWidget';

// Protected Route Interceptor
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="text-slate-400 font-semibold animate-pulse font-sans">Verifying security token...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Layout Shell for Authenticated Routes
const AppLayout = () => {
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans relative">
      <Sidebar />
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        <Outlet context={{ isQuickChatOpen, setIsQuickChatOpen }} />
      </div>

      {/* Floating Quick Q&A Toggle Button */}
      <button 
        onClick={() => setIsQuickChatOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
          isQuickChatOpen 
            ? 'bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-400 text-red-400 hover:text-slate-950 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]' 
            : 'bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'
        }`}
        id="global-quick-qa-fab"
      >
        {/* Animated pulsing outer ring */}
        {!isQuickChatOpen && (
          <span className="absolute inset-0 rounded-2xl border border-emerald-500/50 animate-ping opacity-60 pointer-events-none group-hover:hidden" />
        )}
        
        {isQuickChatOpen ? (
          <X className="w-6 h-6 transition-transform duration-300" />
        ) : (
          <Sliders className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
        )}

        {/* Premium slide-out Tooltip */}
        <div className="absolute right-18 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-emerald-400 text-[11px] font-bold tracking-wide uppercase opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-300 shadow-xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Configure Diet Plan
        </div>
      </button>

      {/* Floating Quick Q&A Widget */}
      <QuickChatWidget isOpen={isQuickChatOpen} onClose={() => setIsQuickChatOpen(false)} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected MERN Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/plans" element={<DietPlansPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
