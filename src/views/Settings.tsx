// src/views/Settings.tsx
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Trash2, Download, Upload, Database, Palette, Bell, Shield, Info } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { purgeModel } from '@/core/ai/inference';
import { getConnection } from '@/core/engine/duckdb';
import { listTables } from '@/core/ingestion/file-manager';

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('pith-notifications');
        return saved ? JSON.parse(saved) : true;
    });
    const [autoSave, setAutoSave] = useState(() => {
        const saved = localStorage.getItem('pith-autosave');
        return saved ? JSON.parse(saved) : true;
    });
    const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
        const saved = localStorage.getItem('pith-analytics');
        return saved ? JSON.parse(saved) : false;
    });

    // Persist settings to localStorage
    useEffect(() => {
        localStorage.setItem('pith-notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('pith-autosave', JSON.stringify(autoSave));
    }, [autoSave]);

    useEffect(() => {
        localStorage.setItem('pith-analytics', JSON.stringify(analyticsEnabled));
    }, [analyticsEnabled]);

    const handleClearCache = async () => {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            toast.success('Browser cache cleared successfully');
        } catch (error) {
            toast.error('Failed to clear cache');
        }
    };

    const handlePurgeAI = async () => {
        try {
            const count = await purgeModel();
            toast.success(`Purged ${count} AI model cache files`);
        } catch (error) {
            toast.error('Failed to purge AI models');
        }
    };

    const handleExportData = async () => {
        try {
            const tables = await listTables();
            if (tables.length === 0) {
                toast.error('No tables to export');
                return;
            }

            // Show format selection dialog
            const format = await new Promise<'csv' | 'sql' | null>((resolve) => {
                const overlay = document.createElement('div');
                overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
                overlay.innerHTML = `
                    <div class="glass rounded-2xl p-6 max-w-md w-full border border-white/10" style="background: var(--bg-secondary)">
                        <h3 class="text-xl font-bold mb-4" style="color: var(--text-primary)">Export Format</h3>
                        <p class="text-sm mb-4" style="color: var(--text-secondary)">Choose how to export your data (${tables.length} table${tables.length > 1 ? 's' : ''})</p>
                        <div class="space-y-3">
                            <button id="export-csv" class="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-lg font-semibold text-white transition-all">
                                Export as CSV (${tables.length} file${tables.length > 1 ? 's' : ''})
                            </button>
                            <button id="export-sql" class="w-full px-4 py-3 glass border border-white/10 rounded-lg font-semibold transition-all hover:bg-white/10" style="color: var(--text-primary)">
                                Export as SQL Dump
                            </button>
                            <button id="export-cancel" class="w-full px-4 py-3 glass border border-white/10 rounded-lg font-semibold transition-all hover:bg-white/10" style="color: var(--text-secondary)">
                                Cancel
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);

                overlay.querySelector('#export-csv')?.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                    resolve('csv');
                });
                overlay.querySelector('#export-sql')?.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                    resolve('sql');
                });
                overlay.querySelector('#export-cancel')?.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                    resolve(null);
                });
            });

            if (!format) return;

            const conn = await getConnection();

            if (format === 'csv') {
                // Export each table as separate CSV file
                for (const table of tables) {
                    const result = await conn.query(`SELECT * FROM ${table}`);
                    const rows = result.toArray();

                    if (rows.length === 0) continue;

                    // Convert to CSV
                    const headers = Object.keys(rows[0].toJSON());
                    const csvContent = [
                        headers.join(','),
                        ...rows.map(row => {
                            const obj = row.toJSON();
                            return headers.map(h => {
                                const val = obj[h];
                                if (val === null) return '';
                                if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
                                return val;
                            }).join(',');
                        })
                    ].join('\n');

                    // Download CSV
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${table}_export.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
                toast.success(`Exported ${tables.length} table(s) as CSV`);
            } else {
                // Export as SQL dump
                let sqlDump = '-- Pith Analytics SQL Export\n';
                sqlDump += `-- Generated: ${new Date().toISOString()}\n\n`;

                for (const table of tables) {
                    const result = await conn.query(`SELECT * FROM ${table}`);
                    const rows = result.toArray();

                    if (rows.length === 0) continue;

                    sqlDump += `-- Table: ${table}\n`;
                    sqlDump += `DROP TABLE IF EXISTS ${table};\n`;

                    // Get schema
                    const schema = await conn.query(`DESCRIBE ${table}`);
                    const columns = schema.toArray().map((r: any) => `${r.column_name} ${r.column_type}`).join(', ');
                    sqlDump += `CREATE TABLE ${table} (${columns});\n\n`;

                    // Insert data
                    for (const row of rows) {
                        const obj = row.toJSON();
                        const values = Object.values(obj).map(v => {
                            if (v === null) return 'NULL';
                            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
                            if (typeof v === 'bigint') return v.toString();
                            return v;
                        }).join(', ');
                        sqlDump += `INSERT INTO ${table} VALUES (${values});\n`;
                    }
                    sqlDump += '\n';
                }

                // Download SQL
                const blob = new Blob([sqlDump], { type: 'text/sql' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pith_export_${Date.now()}.sql`;
                a.click();
                URL.revokeObjectURL(url);

                toast.success('SQL dump exported successfully');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.sql';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const content = await file.text();
                const conn = await getConnection();

                if (file.name.endsWith('.sql')) {
                    // Import SQL dump
                    const statements = content
                        .split(';')
                        .map(s => s.trim())
                        .filter(s => s && !s.startsWith('--'));

                    let successCount = 0;
                    for (const statement of statements) {
                        try {
                            await conn.query(statement);
                            successCount++;
                        } catch (err) {
                            console.warn('Statement failed:', statement.substring(0, 100), err);
                        }
                    }

                    toast.success(`SQL imported: ${successCount} statement(s) executed`);
                } else if (file.name.endsWith('.csv')) {
                    // Import CSV - need to use DuckDB's file system
                    const tableName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9_]/g, '_');

                    // Register file in DuckDB's virtual file system
                    const db = (await import('@/core/engine/duckdb')).getDB();
                    const buffer = await file.arrayBuffer();
                    await db.registerFileBuffer(file.name, new Uint8Array(buffer));

                    // Create table from CSV
                    await conn.query(`CREATE TABLE IF NOT EXISTS ${tableName} AS SELECT * FROM read_csv_auto('${file.name}')`);

                    toast.success(`CSV imported as table: ${tableName}`);
                }
            } catch (error) {
                console.error('Import error:', error);
                toast.error('Failed to import data. Check console for details.');
            }
        };
        input.click();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <SettingsIcon className="h-8 w-8 text-teal-400" />
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Customize your Pith Analytics experience</p>
                </div>
            </div>

            {/* Appearance Section */}
            <Card className="glass border border-white/10 dark:border-white/10 border-black/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Palette className="h-5 w-5 text-teal-400" />
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-4 rounded-xl border transition-all ${theme === 'light'
                                    ? 'border-teal-500 bg-teal-500/10'
                                    : 'border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30'
                                    }`}
                            >
                                <Sun className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Light</div>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-4 rounded-xl border transition-all ${theme === 'dark'
                                    ? 'border-teal-500 bg-teal-500/10'
                                    : 'border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30'
                                    }`}
                            >
                                <Moon className="h-6 w-6 mx-auto mb-2 text-teal-400" />
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark</div>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`p-4 rounded-xl border transition-all ${theme === 'system'
                                    ? 'border-teal-500 bg-teal-500/10'
                                    : 'border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30'
                                    }`}
                            >
                                <Monitor className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>System</div>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Data Management Section */}
            <Card className="glass border border-white/10 dark:border-white/10 border-black/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Data Management</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10 dark:border-white/10 border-black/10">
                        <div>
                            <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Auto-save queries</div>
                            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Automatically save SQL queries to history</div>
                        </div>
                        <button
                            onClick={() => {
                                setAutoSave(!autoSave);
                                toast.success(autoSave ? 'Auto-save disabled' : 'Auto-save enabled');
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${autoSave ? 'bg-teal-500' : 'bg-white/20 dark:bg-white/20 bg-black/20'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${autoSave ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                        <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            <strong>Export/Import Database Tables</strong>
                        </div>
                        <div className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                            Export your ingested data tables as CSV or SQL files, or import data from files back into DuckDB.
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={handleExportData}
                                variant="outline"
                                className="border-teal-500/30 hover:bg-teal-500/10"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Tables
                            </Button>
                            <Button
                                onClick={handleImportData}
                                variant="outline"
                                className="border-emerald-500/30 hover:bg-emerald-500/10"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import Tables
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Privacy & Security Section */}
            <Card className="glass border border-white/10 dark:border-white/10 border-black/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Privacy & Security</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10 dark:border-white/10 border-black/10">
                        <div>
                            <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Usage analytics</div>
                            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Help improve Pith by sharing anonymous usage data</div>
                        </div>
                        <button
                            onClick={() => {
                                setAnalyticsEnabled(!analyticsEnabled);
                                toast.success(analyticsEnabled ? 'Analytics disabled' : 'Analytics enabled');
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${analyticsEnabled ? 'bg-teal-500' : 'bg-white/20 dark:bg-white/20 bg-black/20'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${analyticsEnabled ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/20">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <strong>100% Private:</strong> All data processing happens locally in your browser. No data is ever sent to external servers.
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Notifications Section */}
            <Card className="glass border border-white/10 dark:border-white/10 border-black/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-5 w-5 text-amber-400" />
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10 dark:border-white/10 border-black/10">
                        <div>
                            <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Show notifications</div>
                            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Display toast notifications for actions and errors</div>
                        </div>
                        <button
                            onClick={() => {
                                setNotifications(!notifications);
                                toast.success(notifications ? 'Notifications disabled' : 'Notifications enabled');
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-teal-500' : 'bg-white/20 dark:bg-white/20 bg-black/20'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Advanced Section */}
            <Card className="glass border border-white/10 dark:border-white/10 border-black/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="h-5 w-5 text-rose-400" />
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Advanced</h2>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleClearCache}
                        variant="outline"
                        className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Browser Cache
                    </Button>

                    <Button
                        onClick={handlePurgeAI}
                        variant="outline"
                        className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Purge AI Models
                    </Button>

                    <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20 mt-4">
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <strong className="text-rose-400">Warning:</strong> Clearing cache or purging AI models will require re-downloading data on next use.
                        </div>
                    </div>
                </div>
            </Card>

            {/* About Section */}
            <Card className="glass border border-white/10 dark:border-white/10 border-black/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>About</h2>
                </div>

                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex justify-between">
                        <span>Version</span>
                        <span className="font-mono text-teal-400">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Engine</span>
                        <span className="font-mono text-emerald-400">DuckDB WASM</span>
                    </div>
                    <div className="flex justify-between">
                        <span>AI Runtime</span>
                        <span className="font-mono text-cyan-400">WebLLM + WebGPU</span>
                    </div>
                    <div className="flex justify-between">
                        <span>License</span>
                        <span className="font-mono">MIT</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
