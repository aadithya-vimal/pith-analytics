// src/views/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, Activity, Cpu, Zap, TerminalSquare, Plus, Sparkles, TrendingUp } from "lucide-react";
import { listTables } from "@/core/ingestion/file-manager";
import { getConnection } from "@/core/engine/duckdb";
import { Card } from "@/components/ui/card";
import { log } from "@/utils/logger";

interface TableStats {
  tableCount: number;
  totalRows: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TableStats>({ tableCount: 0, totalRows: 0 });
  const [tables, setTables] = useState<{ name: string; rows: number }[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const tableNames = await listTables();
      const conn = await getConnection();
      let totalRows = 0;
      const tableData: { name: string; rows: number }[] = [];

      for (const name of tableNames) {
        const result = await conn.query(`SELECT COUNT(*) as cnt FROM ${name}`);
        const count = Number(result.toArray()[0].cnt);
        totalRows += count;
        tableData.push({ name, rows: count });
      }

      setStats({ tableCount: tableNames.length, totalRows });
      setTables(tableData);
    } catch (e) {
      log.error("Failed to load dashboard stats", e, { component: 'Dashboard' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
          System Status
        </h1>
        <p className="flex items-center gap-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          Analytics Engine Online • Local-First Mode
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-hover rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10 group animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Active Datasets</div>
            <div className="p-2 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors">
              <Database className="h-5 w-5 text-teal-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{stats.tableCount}</div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Tables loaded in memory</p>
        </div>

        <div className="glass-hover rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10 group animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Total Records</div>
            <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {stats.totalRows > 1000000
              ? `${(stats.totalRows / 1000000).toFixed(2)}M`
              : stats.totalRows.toLocaleString()}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Processed via DuckDB WASM</p>
        </div>

        <div className="glass-hover rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10 group animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>AI Capability</div>
            <div className="p-2 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
              <Cpu className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-4xl font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
            Edge
            <Zap className="h-6 w-6 text-cyan-400 fill-cyan-400" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Llama-3.2-3B Ready</p>
        </div>

        <div className="glass-hover rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10 group animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Architecture</div>
            <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <TerminalSquare className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Universal</div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>WebGPU + WASM</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-8 border border-white/10 dark:border-white/10 border-black/10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-teal-400" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            onClick={() => navigate("/data")}
            className="group flex flex-col items-center justify-center border-2 border-dashed border-white/10 dark:border-white/10 border-black/10 rounded-2xl p-8 hover:border-teal-500/50 hover:bg-teal-500/5 cursor-pointer transition-all hover:scale-105"
          >
            <div className="p-4 bg-white/5 dark:bg-white/5 bg-black/5 rounded-2xl mb-4 group-hover:bg-teal-500 group-hover:scale-110 transition-all">
              <Plus className="h-8 w-8" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Import Data</div>
            <div className="text-sm text-center mt-2" style={{ color: 'var(--text-tertiary)' }}>CSV, JSON, Parquet</div>
          </div>

          <div
            onClick={() => navigate("/ai")}
            className="group flex flex-col items-center justify-center border border-white/10 dark:border-white/10 border-black/10 rounded-2xl p-8 hover:border-emerald-500/50 cursor-pointer transition-all bg-gradient-to-br from-teal-500/5 to-emerald-500/5 hover:scale-105"
          >
            <div className="p-4 bg-white/5 dark:bg-white/5 bg-black/5 rounded-2xl mb-4 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-emerald-500 group-hover:scale-110 transition-all">
              <Sparkles className="h-8 w-8" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Ask Edge AI</div>
            <div className="text-sm text-center mt-2" style={{ color: 'var(--text-tertiary)' }}>Analyze securely on-device</div>
          </div>
        </div>
      </div>

      {/* Active Tables */}
      {tables.length > 0 && (
        <div className="glass rounded-2xl p-8 border border-white/10 dark:border-white/10 border-black/10">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-teal-400" />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Memory State</h2>
          </div>
          <div className="space-y-3">
            {tables.map((t, i) => (
              <div
                key={t.name}
                className="flex items-center justify-between p-4 glass-hover rounded-xl border border-white/10 dark:border-white/10 border-black/10 animate-slide-up cursor-pointer"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => navigate(`/sql?table=${t.name}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-teal-500/20" style={{ color: 'var(--text-primary)' }}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{t.rows.toLocaleString()} rows</div>
                  </div>
                </div>
                <Database className="h-5 w-5 text-teal-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
