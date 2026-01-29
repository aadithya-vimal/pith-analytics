// src/core/ingestion/file-manager.ts
import { getDB, getConnection } from "@/core/engine/duckdb";
import * as duckdb from "@duckdb/duckdb-wasm";
import { log } from "@/utils/logger";

export interface IngestionResult {
  tableName: string;
  rowCount: number;
  columns: string[];
}

/**
 * Sanitizes a filename to be a valid SQL table name
 */
const sanitizeTableName = (filename: string): string => {
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9_]/g, "_") // Replace non-alphanumeric with _
    .toLowerCase();
};

/**
 * Ingests a file into DuckDB WASM
 */
export const ingestFile = async (file: File): Promise<IngestionResult> => {
  const db = getDB();
  const conn = await getConnection();
  const tableName = sanitizeTableName(file.name);

  try {
    // 1. Register the file in the WASM Virtual File System
    // We use registerFileHandle if supported (zero-copy), else fallback to buffer
    await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
  } catch (e) {
    log.warn("File handle registration failed, falling back to buffer copy", {
      component: 'FileManager',
      metadata: { fileName: file.name }
    });
    // Fallback: Load entirely into memory (slower for huge files but reliable)
    const buffer = await file.arrayBuffer();
    await db.registerFileBuffer(file.name, new Uint8Array(buffer));
  }

  // 2. Determine file type and run CREATE TABLE
  // DuckDB's read_csv_auto is incredibly smart at guessing schema
  let query = "";
  if (file.name.endsWith(".csv")) {
    query = `CREATE TABLE IF NOT EXISTS ${tableName} AS SELECT * FROM read_csv_auto('${file.name}')`;
  } else if (file.name.endsWith(".json")) {
    query = `CREATE TABLE IF NOT EXISTS ${tableName} AS SELECT * FROM read_json_auto('${file.name}')`;
  } else if (file.name.endsWith(".parquet")) {
    query = `CREATE TABLE IF NOT EXISTS ${tableName} AS SELECT * FROM read_parquet('${file.name}')`;
  } else {
    throw new Error("Unsupported file type. Please use CSV, JSON, or Parquet.");
  }

  // 3. Execute Ingestion
  await conn.query(query);

  // 4. Verify and return stats
  const result = await conn.query(`SELECT count(*) as count FROM ${tableName}`);
  const count = result.toArray()[0].count; // Apache Arrow format

  // Get columns
  const schema = await conn.query(`DESCRIBE ${tableName}`);
  const columns = schema.toArray().map((r: any) => r.column_name);

  return {
    tableName,
    rowCount: Number(count),
    columns,
  };
};

/**
 * Helper to list all tables currently in memory
 */
export const listTables = async () => {
  const conn = await getConnection();
  const result = await conn.query(`SHOW TABLES`);
  return result.toArray().map((r: any) => r.name);
}