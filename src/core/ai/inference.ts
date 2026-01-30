// src/core/ai/inference.ts
import * as webllm from "@mlc-ai/web-llm";
import { log } from "@/utils/logger";

// 🚀 AVAILABLE AI MODELS
export interface AIModel {
  id: string;
  name: string;
  size: string;
  description: string;
  useCase: string;
  speed: "Fast" | "Medium" | "Slow";
  quality: "Good" | "Better" | "Best";
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
    name: "Llama 3.2 3B",
    size: "~2GB",
    description: "The sweet spot between speed and intelligence - perfect for most users",
    useCase: "Best for: Writing SQL queries, analyzing trends, answering complex questions about your data. Great all-around choice.",
    speed: "Fast",
    quality: "Better"
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    name: "Llama 3.2 1B",
    size: "~0.6GB",
    description: "Ultra-lightweight model that responds almost instantly",
    useCase: "Best for: Quick questions, simple SQL queries, fast data lookups. Choose this if you have limited storage or want the fastest responses.",
    speed: "Fast",
    quality: "Good"
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi 3.5 Mini",
    size: "~2.3GB",
    description: "Microsoft's coding specialist - excellent at understanding technical queries",
    useCase: "Best for: Complex SQL optimization, technical data transformations, code-heavy analytics. Great if you need precise SQL generation.",
    speed: "Medium",
    quality: "Better"
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f32_1-MLC",
    name: "Qwen 2.5 3B",
    size: "~1.9GB",
    description: "Alibaba's smart model with strong reasoning and multilingual support",
    useCase: "Best for: Deep data analysis, complex reasoning tasks, working with international data. Supports multiple languages fluently.",
    speed: "Medium",
    quality: "Better"
  },
  {
    id: "gemma-2-2b-it-q4f32_1-MLC",
    name: "Gemma 2 2B",
    size: "~1.4GB",
    description: "Google's efficient model - great balance of size and capability",
    useCase: "Best for: General analytics with low memory footprint. Good choice for older devices or when you need to save storage space.",
    speed: "Fast",
    quality: "Good"
  },
  {
    id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
    name: "Mistral 7B",
    size: "~4.2GB",
    description: "The most powerful option - provides the highest quality insights and explanations",
    useCase: "Best for: Complex business intelligence, detailed explanations, advanced analytics. Choose this when quality matters more than speed.",
    speed: "Slow",
    quality: "Best"
  }
];

let engine: webllm.MLCEngine | null = null;

// Load last used model from localStorage, fallback to first model
const getDefaultModel = () => {
  try {
    const saved = localStorage.getItem('pith-ai-last-model');
    if (saved && AVAILABLE_MODELS.find(m => m.id === saved)) {
      return saved;
    }
  } catch (e) {
    // localStorage might be blocked
  }
  return AVAILABLE_MODELS[0].id;
};

let currentModel: string = getDefaultModel();

export interface AIStatus {
  status: "idle" | "loading" | "ready" | "generating" | "error";
  progress?: string;
  progressVal?: number;
}

/**
 * Set the model to use
 */
export const setModel = (modelId: string) => {
  currentModel = modelId;
  try {
    localStorage.setItem('pith-ai-last-model', modelId);
  } catch (e) {
    // localStorage might be blocked
  }
};

/**
 * Get the current model
 */
export const getCurrentModel = () => currentModel;

/**
 * Checks if a specific model is already downloaded in the browser cache.
 */
export const checkCached = async (modelId?: string): Promise<boolean> => {
  try {
    return await webllm.hasModelInCache(modelId || currentModel);
  } catch (e) {
    return false;
  }
};

export const initAI = async (
  onProgress: (report: webllm.InitProgressReport) => void,
  modelId?: string
) => {
  const targetModel = modelId || currentModel;

  // If switching models, unload the current one first
  if (engine && currentModel !== targetModel) {
    await engine.unload();
    engine = null;
  }

  if (engine) return engine;

  try {
    if (!(navigator as any).gpu) {
      throw new Error("WebGPU is not supported. Please use Chrome/Edge.");
    }

    engine = new webllm.MLCEngine();
    engine.setInitProgressCallback(onProgress);

    // This will load from cache if available, or download if not
    await engine.reload(targetModel);
    currentModel = targetModel;

    return engine;
  } catch (err) {
    log.error("AI Init Failed", err, { component: 'AI' });
    throw err;
  }
};

export const generateInsight = async (
  prompt: string,
  context: string,
  onUpdate: (text: string) => void
) => {
  if (!engine) throw new Error("AI Engine not initialized");

  const systemPrompt = `
You are Pith AI, an advanced Data Analyst running locally on the user's device.

Your role is to analyze data and provide conversational, insightful answers - NOT just generate SQL queries.

When the user asks a question:
1. First, provide a clear, natural language answer or insight
2. If SQL is needed to answer the question, write the query in a \`\`\`sql code block
3. After the query executes, interpret the results and explain what they mean in plain English

Guidelines:
- Be conversational and friendly
- Explain trends, patterns, and insights you discover
- Use the schema context to understand the data structure
- For questions like "which employee has the highest salary", answer: "Based on the data, [Name] has the highest salary at $X. Here's the query I used:" followed by the SQL
- Always interpret query results - don't just show raw data
- Use DuckDB SQL dialect

Available Schema:
${context}
  `;

  const messages: webllm.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ];

  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    temperature: 0.7,
  });

  let fullResponse = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullResponse += content;
    onUpdate(fullResponse);
  }

  return fullResponse;
};

export const purgeModel = async () => {
  if (engine) {
    await engine.unload();
    engine = null;
  }

  const keys = await window.caches.keys();
  const deletedModels: string[] = [];

  for (const key of keys) {
    if (key.includes("webllm") || key.includes("Llama") || key.includes("Phi") || key.includes("Qwen") || key.includes("gemma") || key.includes("Mistral")) {
      log.debug(`Purging Cache: ${key}`, { component: 'AI', action: 'purge' });

      // Extract model name from cache key
      const modelMatch = AVAILABLE_MODELS.find(m => key.includes(m.id) || key.includes(m.name.replace(/\s/g, '')));
      if (modelMatch && !deletedModels.includes(modelMatch.name)) {
        deletedModels.push(modelMatch.name);
      }

      await window.caches.delete(key);
    }
  }

  return { count: deletedModels.length, models: deletedModels };
};