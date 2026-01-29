// src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function MainLayout() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Header with Glassmorphism */}
        <header className="h-16 border-b border-white/5 dark:border-white/5 border-black/5 px-6 flex items-center justify-between glass backdrop-blur-xl">
          <h1 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
            Pith Analytics
          </h1>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-10 w-10 rounded-full glass-hover border border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 overflow-hidden"
            title="Toggle Theme"
          >
            {/* Sun Icon */}
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out dark:rotate-90 dark:scale-0">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>

            {/* Moon Icon */}
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100">
              <Moon className="h-5 w-5 text-teal-400" />
            </div>

            <span className="sr-only">Toggle theme</span>
          </button>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-auto p-6 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
