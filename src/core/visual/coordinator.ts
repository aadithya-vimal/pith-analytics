// src/core/visual/coordinator.ts
import * as vg from "@uwdata/vgplot";
import { getConnection } from "@/core/engine/duckdb";
import { tableFromJSON, Table } from "apache-arrow";
import { log } from "@/utils/logger";

// ---------------------------------------------------------
// 🛡️ CRITICAL PATCHES
// ---------------------------------------------------------

// 1. Monkey-Patch BigInt to safe JSON
// @ts-ignore
BigInt.prototype.toJSON = function () { return Number(this); }

// 2. Monkey-Patch Arrow Table for 'vgplot' compatibility
// This ensures Heatmaps and Scatter plots can find columns.
// @ts-ignore
if (!Table.prototype.toColumns) {
  // @ts-ignore
  Table.prototype.toColumns = function () {
    const columns: Record<string, any[]> = {};
    this.schema.fields.forEach((field: any, i: number) => {
      columns[field.name] = this.getChildAt(i)!.toArray();
    });
    return columns;
  };
}

class PithConnector {
  async query(query: any) {
    const conn = await getConnection();

    // Extract SQL safely
    let sqlString = "";
    if (typeof query === 'string') {
      sqlString = query;
    } else if (query && typeof query.toString === 'function') {
      const str = query.toString();
      if (str === "[object Object]") {
        if (query.sql) sqlString = query.sql;
        else return [];
      } else {
        sqlString = str;
      }
    } else {
      return [];
    }

    sqlString = sqlString.trim();
    // console.log("🎨 Mosaic Query:", sqlString); 

    try {
      const result = await conn.query(sqlString);

      // 🛡️ THE NUCLEAR FIX: DEEP SCRUB
      // We convert the DuckDB result to a plain JSON array.
      // Then we iterate and force-convert EVERY value that looks like a BigInt.
      // This is the only way to be 100% sure.

      const rawRows = result.toArray().map((row) => row.toJSON());

      const cleanRows = rawRows.map((row) => {
        const cleanRow: any = {};
        for (const key in row) {
          let val = row[key];

          // Explicitly catch BigInts
          if (typeof val === 'bigint') {
            cleanRow[key] = Number(val);
          }
          // Catch object-wrapped BigInts (DuckDB sometimes does this)
          else if (val && typeof val === 'object' && val.toString) {
            const str = val.toString();
            // If it looks like a pure integer string, parse it
            if (/^-?\d+$/.test(str) && (val.constructor.name === 'BigInt' || val.constructor.name === 'Integer')) {
              cleanRow[key] = Number(str);
            } else {
              cleanRow[key] = val;
            }
          }
          else {
            cleanRow[key] = val;
          }
        }
        return cleanRow;
      });

      // If empty, return empty list
      if (cleanRows.length === 0) return [];

      // Reconstruct a perfectly clean Arrow Table from the scrubbed data
      // This table now has standard JS Numbers and the .toColumns() method.
      const compatibleTable = tableFromJSON(cleanRows);

      return compatibleTable;

    } catch (err) {
      log.error("Mosaic Query Failed", err, {
        component: 'Mosaic',
        metadata: { query: sqlString }
      });
      throw err;
    }
  }
}

let isInitialized = false;

export const initMosaic = async () => {
  if (isInitialized) return;
  const coordinator = vg.coordinator();
  coordinator.databaseConnector(new PithConnector() as any);
  isInitialized = true;
  log.success("🎨 Mosaic Visualization Engine linked to DuckDB", { component: 'Mosaic' });
};