// src/components/layout/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  TerminalSquare,
  LineChart,
  Settings,
  Bot
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { icon: Database, label: "Data Source", href: "/data" },
  { icon: TerminalSquare, label: "SQL Lab", href: "/sql" },
  { icon: LineChart, label: "Visualize", href: "/visualize" },
  { icon: Bot, label: "AI Insights", href: "/ai" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoClick = () => {
    setShowConfirm(true);
  };

  const confirmNavigation = () => {
    navigate('/');
    setShowConfirm(false);
    toast.info('Navigated to landing page');
  };

  return (
    <aside className="w-16 lg:w-64 border-r border-white/5 glass backdrop-blur-xl flex flex-col h-screen transition-all duration-300 relative z-20">
      {/* Logo/Brand - Clickable */}
      <button
        onClick={handleLogoClick}
        className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5 dark:border-white/5 border-black/5 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-all group cursor-pointer w-full"
      >
        <img src="/logo.jpg" alt="Pith Analytics" className="h-10 w-10 rounded-xl group-hover:scale-110 transition-transform" />
        <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Pith
        </span>
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full border border-white/10 dark:border-white/10 border-black/10 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Return to Landing Page?</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to leave the app and go back to the landing page?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmNavigation}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-lg font-semibold text-white transition-all"
              >
                Yes, Go Back
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 glass border border-white/10 dark:border-white/10 border-black/10 rounded-lg font-semibold transition-all hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10"
                style={{ color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                "hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/5 hover:scale-105",
                isActive
                  ? "bg-gradient-to-r from-teal-600/20 to-emerald-600/20 border border-teal-500/30 shadow-lg shadow-teal-500/10"
                  : "text-white/60 dark:text-white/60 text-black/60 hover:text-white dark:hover:text-white hover:text-black"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-teal-400" : "text-white/60 dark:text-white/60 text-black/60 group-hover:text-white dark:group-hover:text-white group-hover:text-black"
                )} />
                <span className="hidden lg:block">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-white/5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              "hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/5 hover:scale-105",
              isActive
                ? "bg-gradient-to-r from-teal-600/20 to-emerald-600/20 border border-teal-500/30"
                : "text-white/60 dark:text-white/60 text-black/60 hover:text-white dark:hover:text-white hover:text-black"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive ? "text-teal-400" : "text-white/60 dark:text-white/60 text-black/60 group-hover:text-white dark:group-hover:text-white group-hover:text-black"
              )} />
              <span className="hidden lg:block">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
