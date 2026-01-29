// src/core/engine/duckdb.ts
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { log } from '@/utils/logger';

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_eh,
    mainWorker: eh_worker,
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
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

    // 2. Instantiate the worker
    const worker = new Worker(bundle.mainWorker!);
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