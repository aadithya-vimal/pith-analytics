// src/views/SQLConsole.tsx
import { useState, useEffect } from "react";
import { CodeEditor } from "@/components/sql/CodeEditor";
import { ResultTable } from "@/components/sql/ResultTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConnection } from "@/core/engine/duckdb";
import { listTables } from "@/core/ingestion/file-manager";
import { Play, Database, Table as TableIcon, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { log } from "@/utils/logger";

export default function SQLConsole() {
  const [query, setQuery] = useState<string>("SELECT * FROM ");
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Load tables on mount
  useEffect(() => {
    refreshTables();
  }, []);

  const refreshTables = async () => {
    try {
      const t = await listTables();
      setTables(t);
      if (t.length > 0 && query === "SELECT * FROM ") {
        setQuery(`SELECT * FROM ${t[0]} LIMIT 100`);
      }
    } catch (e) {
      log.error("Failed to refresh tables", e, { component: 'SQLConsole' });
    }
  };

  const runQuery = async () => {
    if (!query.trim()) return;

    setIsRunning(true);
    const start = performance.now();

    try {
      const conn = await getConnection();
      const result = await conn.query(query);
      const rows = result.toArray().map((r: any) => r.toJSON());

      if (rows.length > 0) {
        setColumns(Object.keys(rows[0]));
        setResults(rows);
      } else {
        setResults([]);
        setColumns([]);
        toast.info("Query returned no results");
      }

      const end = performance.now();
      setExecutionTime(end - start);
      toast.success(`Query successful (${rows.length} rows)`);
    } catch (err: any) {
      log.error("SQL query failed", err, { component: 'SQLConsole', metadata: { query } });
      toast.error("SQL Error", {
        description: err.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleTableClick = (tableName: string) => {
    setQuery(`SELECT * FROM ${tableName} LIMIT 100`);
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Sidebar: Schema Browser */}
      <Card className="w-64 h-full flex flex-col rounded-none border-l-0 border-t-0 border-b-0">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Schema
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {tables.map(table => (
              <button
                key={table}
                onClick={() => handleTableClick(table)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors group"
              >
                <TableIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span className="truncate font-mono">{table}</span>
              </button>
            ))}
            {tables.length === 0 && (
              <div className="text-xs text-muted-foreground p-2 text-center">
                No tables found.<br />Import data first.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden pr-4 pb-4">
        {/* Editor Section */}
        <div className="h-1/3 min-h-[200px] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">SQL Editor</h2>
            <div className="flex items-center gap-2">
              {executionTime !== null && (
                <span className="text-xs text-muted-foreground font-mono mr-2">
                  {executionTime.toFixed(2)}ms
                </span>
              )}
              <Button
                size="sm"
                onClick={runQuery}
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run Query
              </Button>
            </div>
          </div>
          <CodeEditor
            value={query}
            onChange={(val) => setQuery(val || "")}
            onRun={runQuery}
          />
        </div>

        {/* Results Section */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <h2 className="text-sm font-semibold text-muted-foreground">Results</h2>
          <ResultTable data={results} columns={columns} />
        </div>
      </div>
    </div>
  );
}