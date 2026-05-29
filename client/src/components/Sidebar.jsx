import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ClipboardList, 
  User, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Health Q&A', path: '/chat', icon: MessageSquare },
    { name: 'Diet Plans', path: '/plans', icon: ClipboardList },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen glass-panel flex flex-col justify-between p-6 border-r border-slate-800 text-slate-300 shrink-0">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-slate-950 glow-emerald">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-white tracking-wide">Nutri<span className="text-emerald-400">Gemini</span></h1>
            <p className="text-xs text-slate-400 font-medium">AI Diet Coach</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
                ${isActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 glow-emerald' 
                  : 'hover:bg-slate-800/40 hover:text-white border border-transparent'}
              `}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="flex flex-col gap-4 border-t border-slate-800 pt-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-white text-sm truncate">{user?.name || 'User'}</h4>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all duration-300 font-medium text-sm text-slate-400"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
