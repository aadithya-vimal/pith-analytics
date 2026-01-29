// src/views/DataIngestion.tsx
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Database, Table as TableIcon, FileText, CheckCircle2, TrendingUp } from "lucide-react";
import { toast, Toaster } from "sonner";
import { ingestFile, listTables, type IngestionResult } from "@/core/ingestion/file-manager";
import { log } from "@/utils/logger";

export default function DataIngestion() {
  const [isUploading, setIsUploading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<IngestionResult | null>(null);

  // Load existing tables on mount
  useEffect(() => {
    refreshTables();
  }, []);

  const refreshTables = async () => {
    try {
      const t = await listTables();
      setTables(t);
    } catch (e) {
      log.error("Failed to list tables", e, { component: 'DataIngestion' });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const file = acceptedFiles[0];
    const toastId = toast.loading(`Ingesting ${file.name}...`);

    try {
      const start = performance.now();
      const result = await ingestFile(file);
      const end = performance.now();

      setLastResult(result);
      await refreshTables();

      toast.success(`Successfully loaded ${result.rowCount.toLocaleString()} rows`, {
        id: toastId,
        description: `Time taken: ${((end - start) / 1000).toFixed(2)}s`,
      });
    } catch (error: any) {
      log.error("Ingestion failed", error, { component: 'DataIngestion', metadata: { fileName: file.name } });
      toast.error("Ingestion Failed", {
        id: toastId,
        description: error.message || "Unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.apache.parquet': ['.parquet']
    },
    multiple: false
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <Toaster />

      {/* Hero Section */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
          Data Ingestion
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Connect your data sources. We support CSV, JSON, and Parquet.
          <br />
          <span className="text-teal-400">Data stays 100% on your device.</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area - Takes 2 columns */}
        <div className="lg:col-span-2 glass rounded-2xl p-8 border border-white/10 dark:border-white/10 border-black/10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Upload className="h-6 w-6 text-teal-400" />
              File Upload
            </h2>
            <p style={{ color: 'var(--text-tertiary)' }}>Drag and drop to ingest instantly</p>
          </div>

          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px]
              ${isDragActive
                ? "border-teal-500 bg-teal-500/10 scale-105"
                : "border-white/20 dark:border-white/20 border-black/20 hover:border-teal-500/50 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5"
              }
            `}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-teal-400" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Processing dataset...</p>
                <div className="w-64 h-1 bg-white/10 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-2xl mb-6 border border-teal-500/20">
                  <Upload className="h-12 w-12 text-teal-400" />
                </div>
                <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {isDragActive ? "Drop your file here" : "Drop files here"}
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                  or click to browse your computer
                </p>
                <div className="flex gap-3">
                  <span className="text-xs bg-teal-500/10 text-teal-400 px-3 py-1.5 rounded-lg border border-teal-500/20 font-medium">.CSV</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-medium">.JSON</span>
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-500/20 font-medium">.PARQUET</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats & Info - 1 column */}
        <div className="space-y-6">
          {/* Active Tables Card */}
          <div className="glass rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-teal-400" />
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Active Tables</h3>
            </div>
            {tables.length === 0 ? (
              <div className="text-center py-8 text-sm border-2 border-dashed border-white/10 dark:border-white/10 border-black/10 rounded-xl" style={{ color: 'var(--text-tertiary)' }}>
                No tables loaded yet
              </div>
            ) : (
              <ul className="space-y-2">
                {tables.map((table, i) => (
                  <li
                    key={table}
                    className="flex items-center justify-between p-3 bg-white/5 dark:bg-white/5 bg-black/5 rounded-xl border border-white/10 dark:border-white/10 border-black/10 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 transition-all animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <TableIcon className="h-4 w-4 text-teal-400" />
                      <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{table}</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Last Ingestion Stats */}
          {lastResult && (
            <div className="glass rounded-2xl p-6 border border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-teal-400" />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Ingestion Summary</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Table Name:</span>
                  <span className="font-mono font-bold text-teal-400">{lastResult.tableName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Rows:</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{lastResult.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Columns:</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{lastResult.columns.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Database,
            title: 'DuckDB WASM',
            description: 'Lightning-fast in-browser database processing',
            color: 'teal',
          },
          {
            icon: FileText,
            title: 'Multiple Formats',
            description: 'Support for CSV, JSON, and Parquet files',
            color: 'emerald',
          },
          {
            icon: CheckCircle2,
            title: 'Instant Processing',
            description: 'Process millions of rows in seconds',
            color: 'cyan',
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="glass-hover rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10 group animate-scale-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-${feature.color}-500/20`}>
              <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}