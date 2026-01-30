// src/views/AIInsights.tsx
import { useState, useEffect, useRef } from "react";
import { initAI, generateInsight, purgeModel, checkCached, setModel, getCurrentModel, AVAILABLE_MODELS, type AIStatus, type AIModel } from "@/core/ai/inference";
import { getConnection } from "@/core/engine/duckdb";
import { listTables } from "@/core/ingestion/file-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Bot, Send, Database, Loader2, Sparkles, AlertTriangle, Trash2, ShieldAlert, Zap, Terminal, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ResultTable } from "@/components/sql/ResultTable";
import { log } from "@/utils/logger";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: any[];
  columns?: string[];
  executionTime?: number;
}

type PurgeState = "idle" | "confirm" | "purging";

export default function AIInsights() {
  const [status, setStatus] = useState<AIStatus["status"]>("idle");
  const [progress, setProgress] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [schemaContext, setSchemaContext] = useState("");
  const [isCached, setIsCached] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    // Load last used model from localStorage
    try {
      const savedId = localStorage.getItem('pith-ai-last-model');
      const found = AVAILABLE_MODELS.find(m => m.id === savedId);
      if (found) return found;
    } catch (e) {
      // localStorage blocked
    }
    return AVAILABLE_MODELS[0];
  });
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [purgeState, setPurgeState] = useState<PurgeState>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadSchema();
    checkModelCache();
  }, []);

  const checkModelCache = async () => {
    const cached = await checkCached(selectedModel.id);
    setIsCached(cached);
  };

  const loadSchema = async () => {
    try {
      const tables = await listTables();
      if (tables.length === 0) {
        setSchemaContext("No tables found.");
        return;
      }
      let context = "";
      const conn = await getConnection();
      for (const table of tables) {
        const result = await conn.query(`DESCRIBE ${table}`);
        const cols = result.toArray().map((r: any) => `${r.column_name} (${r.column_type})`).join(", ");
        context += `Table: ${table}\nColumns: ${cols}\n\n`;
      }
      setSchemaContext(context);
    } catch (e) {
      log.error("Failed to load schema context", e, { component: 'AIInsights' });
    }
  };

  const handleModelChange = async (model: AIModel) => {
    setSelectedModel(model);
    setModel(model.id);
    setShowModelSelector(false);
    const cached = await checkCached(model.id);
    setIsCached(cached);

    // If engine is already loaded with a different model, reset
    if (status === "ready") {
      setStatus("idle");
      setMessages([]);
      toast.info(`Switched to ${model.name}. Click "Launch AI" to initialize.`);
    }
  };

  const initializeEngine = async () => {
    setStatus("loading");

    // Add beforeunload warning during download
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    try {
      await initAI((report) => {
        setProgress(report.text);
      }, selectedModel.id);
      setStatus("ready");
      setIsCached(true);
      toast.success(`${selectedModel.name} Online`);
    } catch (err: any) {
      log.error("AI initialization failed", err, { component: 'AIInsights' });
      setStatus("error");
      toast.error("Failed to load AI Model", { description: err.message });
    } finally {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  };

  const handlePurge = async () => {
    setPurgeState("purging");
    try {
      const result = await purgeModel();
      if (result.models.length > 0) {
        toast.success(`Purged ${result.count} model(s)`, {
          description: `Deleted: ${result.models.join(', ')}`
        });
      } else {
        toast.info("No cached models found to purge");
      }
      setStatus("idle");
      setIsCached(false);
      setPurgeState("idle");
      setMessages([]);
    } catch (e) {
      toast.error("Failed to purge model");
      setPurgeState("idle");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || status !== "ready") return;
    const userMsg = input;
    setInput("");

    const newHistory: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setStatus("generating");

    const aiMsgIndex = newHistory.length;
    const aiMsgPlaceholder: Message = { role: "assistant", content: "🤔 Analyzing your question and thinking..." };
    setMessages([...newHistory, aiMsgPlaceholder]);

    try {
      let fullText = "";
      await generateInsight(userMsg, schemaContext, (text) => {
        fullText = text;
        setMessages(prev => {
          const updated = [...prev];
          updated[aiMsgIndex] = { ...updated[aiMsgIndex], content: text };
          return updated;
        });
      });

      const sqlMatch = fullText.match(/```sql\s*([\s\S]*?)\s*```/);
      if (sqlMatch && sqlMatch[1]) {
        const sql = sqlMatch[1].trim();
        await executeAndAppendResult(sql, aiMsgIndex);
      }

    } catch (err) {
      toast.error("Generation Failed");
    } finally {
      setStatus("ready");
    }
  };

  const executeAndAppendResult = async (sql: string, msgIndex: number) => {
    try {
      const conn = await getConnection();
      const start = performance.now();
      const result = await conn.query(sql);
      const end = performance.now();

      const rows = result.toArray().map((r: any) => {
        const obj = r.toJSON();
        for (const k in obj) {
          if (typeof obj[k] === 'bigint') obj[k] = Number(obj[k]);
        }
        return obj;
      });

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      setMessages(prev => {
        const updated = [...prev];
        updated[msgIndex] = {
          ...updated[msgIndex],
          sql: sql,
          data: rows,
          columns: columns,
          executionTime: end - start
        };
        return updated;
      });
    } catch (e) {
      log.error("Auto-execution failed", e, { component: 'AIInsights', metadata: { sql } });
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header with Model Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Sparkles className="h-8 w-8 text-teal-400" />
              Pith AI Agent
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Running <strong className="text-teal-400">{selectedModel.name}</strong> locally on your device.
            </p>
          </div>

          {/* Purge Button - Always Visible */}
          <div className="flex items-center gap-2">
            {purgeState === "idle" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPurgeState("confirm")}
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Purge Models
              </Button>
            )}
            {purgeState === "confirm" && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right">
                <span className="text-sm text-rose-400 font-medium">Delete all cached models?</span>
                <Button variant="destructive" size="sm" onClick={handlePurge}>
                  Confirm
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPurgeState("idle")}>
                  Cancel
                </Button>
              </div>
            )}
            {purgeState === "purging" && (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Purging...
              </span>
            )}
          </div>
        </div>

        {/* Model Selector */}
        <div className="glass rounded-xl p-4 border border-white/10 dark:border-white/10 border-black/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Model Selection</span>
            </div>
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-hover border border-white/10 dark:border-white/10 border-black/10 text-sm font-medium transition-all"
              style={{ color: 'var(--text-primary)' }}
            >
              {selectedModel.name}
              <ChevronDown className={cn("h-4 w-4 transition-transform", showModelSelector && "rotate-180")} />
            </button>
          </div>

          {showModelSelector && (
            <div className="grid gap-2 animate-in slide-in-from-top-2 fade-in">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model)}
                  className={cn(
                    "text-left p-3 rounded-lg border transition-all",
                    selectedModel.id === model.id
                      ? "border-teal-500/50 bg-teal-500/10"
                      : "border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{model.name}</div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        model.speed === "Fast" ? "bg-emerald-500/20 text-emerald-400" :
                          model.speed === "Medium" ? "bg-cyan-500/20 text-cyan-400" :
                            "bg-amber-500/20 text-amber-400"
                      )}>
                        {model.speed}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        model.quality === "Best" ? "bg-teal-500/20 text-teal-400" :
                          model.quality === "Better" ? "bg-emerald-500/20 text-emerald-400" :
                            "bg-cyan-500/20 text-cyan-400"
                      )}>
                        {model.quality}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{model.description}</div>
                  <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                    <span>Size: {model.size}</span>
                    <span>•</span>
                    <span>{model.useCase}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 p-2 bg-teal-500/5 border border-teal-500/20 rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {isCached
                ? `${selectedModel.name} is cached. Launch for instant inference.`
                : `${selectedModel.name} will be downloaded (~${selectedModel.size}) on first use.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {status === "idle" || status === "loading" || status === "error" ? (
        <Card className="flex-1 flex flex-col items-center justify-center p-12 text-center glass border border-white/10 dark:border-white/10 border-black/10">
          {status === "idle" && (
            <div className="max-w-md space-y-6 animate-in zoom-in-50 duration-300">
              <Bot className={cn("h-20 w-20 mx-auto transition-colors", isCached ? "text-emerald-400" : "text-teal-400/50")} />

              <div className="space-y-2">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {isCached ? "AI Model Ready" : "Initialize Edge AI"}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isCached
                    ? `${selectedModel.name} found on device. Launch instant inference session.`
                    : `Download ${selectedModel.name} (~${selectedModel.size}) to your browser cache.`
                  }
                </p>
              </div>

              <Button onClick={initializeEngine} size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500">
                <Zap className="mr-2 h-5 w-5" />
                {isCached ? "Launch AI" : "Download & Launch"}
              </Button>

              <div className="text-xs space-y-1" style={{ color: 'var(--text-tertiary)' }}>
                <p>✓ 100% Private • No Server Calls</p>
                <p>✓ WebGPU Accelerated Inference</p>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Warning Banner */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-400 mb-1">Model Download in Progress</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <strong>Do not close or refresh this page</strong> while the model is downloading.
                    You can explore other parts of the app in a new tab if needed.
                  </p>
                </div>
              </div>

              <Loader2 className="h-16 w-16 animate-spin text-teal-400 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Loading {selectedModel.name}...</h3>
                <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>{progress}</p>
              </div>
              <div className="w-64 h-2 bg-white/10 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 animate-in fade-in">
              <AlertTriangle className="h-16 w-16 text-rose-400 mx-auto" />
              <h3 className="text-xl font-semibold text-rose-400">Initialization Failed</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Please check console for details.</p>
              <Button onClick={initializeEngine} variant="outline">
                Retry
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 glass rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Bot className="h-12 w-12 mx-auto text-teal-400" />
                  <p style={{ color: 'var(--text-secondary)' }}>Ask me anything about your data...</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && <Bot className="h-6 w-6 text-teal-400 mt-1 flex-shrink-0" />}
                <div className={cn(
                  "max-w-[80%] rounded-2xl p-4",
                  msg.role === "user"
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                    : "glass border border-white/10 dark:border-white/10 border-black/10"
                )}>
                  <div className="prose prose-sm dark:prose-invert max-w-none" style={{ color: 'var(--text-primary)' }}>
                    {msg.content}
                  </div>

                  {msg.data && msg.columns && (
                    <div className="mt-4 border-t border-white/10 dark:border-white/10 border-black/10 pt-4">
                      <div className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                        Query executed in {msg.executionTime?.toFixed(2)}ms
                      </div>
                      <ResultTable data={msg.data} columns={msg.columns} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="glass rounded-2xl p-4 border border-white/10 dark:border-white/10 border-black/10">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your data..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
                disabled={status !== "ready"}
              />
              <Button
                onClick={handleSend}
                disabled={status !== "ready" || !input.trim()}
                size="sm"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
              >
                {status === "generating" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}