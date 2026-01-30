// src/core/engine/duckdb.ts
import * as duckdb from '@duckdb/duckdb-wasm';
import { log } from '@/utils/logger';

// CDN URLs for DuckDB WASM 1.29.0
const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

// Override with specific stable version to ensure consistency
const BUNDLE_URLS: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-mvp.wasm',
    mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-browser-mvp.worker.js',
  },
  eh: {
    mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-eh.wasm',
    mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-browser-eh.worker.js',
  },
};

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;

/**
 * Initializes the local DuckDB WASM instance.
 * This runs entirely in the browser using the user's CPU/RAM.
 */
export const initDuckDB = async () => {
  if (db) return { db, conn };

  try {
    // 1. Select the best bundle for the user's browser
    const bundle = await duckdb.selectBundle(BUNDLE_URLS);

    // 2. Instantiate the worker
    // ⚠️ Security Note: Browsers block 'new Worker(URL)' for cross-origin URLs (CDNs).
    // We must use a Blob workaround to load the worker script.
    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts('${bundle.mainWorker}');`], { type: 'text/javascript' })
    );

    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();

    // 3. Initialize the database
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // 4. Connect
    conn = await db.connect();

    log.success('🦆 Pith Analytics Engine: Online', { component: 'DuckDB' });
    return { db, conn };
  } catch (error) {
    log.error('Failed to initialize DuckDB', error, { component: 'DuckDB' });
    throw error;
  }
};

export const getDB = () => {
  if (!db) throw new Error('Database not initialized. Call initDuckDB() first.');
  return db;
};

export const getConnection = async () => {
  if (!conn) {
    if (!db) await initDuckDB();
    conn = await db!.connect();
  }
  return conn;
}