// src/views/Visualization.tsx
import { useEffect, useState } from "react";
import * as vg from "@uwdata/vgplot";
import { initMosaic } from "@/core/visual/coordinator";
import { listTables } from "@/core/ingestion/file-manager";
import { getConnection } from "@/core/engine/duckdb";
import { MosaicPlot } from "@/components/visual/MosaicPlot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateChartConfiguration } from "@/utils/chart-validators";
import { log } from "@/utils/logger";
import {
  BarChart3,
  BarChartHorizontal,
  LineChart,
  ScatterChart,
  AreaChart,
  Grid3X3,
  AlignJustify,
  Calculator,
  MousePointer2,
  Palette,
  LayoutTemplate,
  Trash2,
  List
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Standard Tableau10 Palette for Consistency
const COLOR_PALETTE = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
  "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac"
];

type ChartType = "bar" | "bar-h" | "line" | "area" | "scatter" | "heatmap" | "tick";
type Aggregation = "count" | "sum" | "avg" | "min" | "max";

export default function Visualization() {
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [numericColumns, setNumericColumns] = useState<string[]>([]);
  const [colTypes, setColTypes] = useState<Record<string, string>>({});

  // Configuration
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumn, setYColumn] = useState<string>("");
  const [colorColumn, setColorColumn] = useState<string>("");
  const [aggregation, setAggregation] = useState<Aggregation>("count");

  const [plotSpec, setPlotSpec] = useState<any>(null);

  // 🛡️ CUSTOM LEGEND STATE
  // We render the legend ourselves to avoid library crashes
  const [legendItems, setLegendItems] = useState<{ label: string, color: string }[]>([]);

  // 🛡️ VALIDATION STATE
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await initMosaic();
      const t = await listTables();
      setTables(t);
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedTable) return;

    // Reset Everything
    setXColumn("");
    setYColumn("");
    setColorColumn("");
    setPlotSpec(null);
    setLegendItems([]);

    const fetchSchema = async () => {
      try {
        const conn = await getConnection();
        const schema = await conn.query(`DESCRIBE ${selectedTable}`);
        const allCols: string[] = [];
        const numCols: string[] = [];
        const types: Record<string, string> = {};

        for (const row of schema.toArray()) {
          const name = row.column_name;
          const type = String(row.column_type).toUpperCase();
          allCols.push(name);
          types[name] = type;
          if (["INTEGER", "BIGINT", "DOUBLE", "FLOAT", "DECIMAL", "HUGEINT", "REAL"].some(t => type.includes(t))) {
            numCols.push(name);
          }
        }
        setColumns(allCols);
        setNumericColumns(numCols);
        setColTypes(types);
        setXColumn(allCols[0] || "");
        if (numCols.length > 0) setYColumn(numCols[0]);
      } catch (e) {
        log.error("Schema fetch failed", e, { component: 'Visualization' });
      }
    };
    fetchSchema();
  }, [selectedTable]);

  const isNumeric = (col: string) => {
    const type = colTypes[col] || "";
    return ["INTEGER", "BIGINT", "DOUBLE", "FLOAT", "DECIMAL", "HUGEINT", "REAL"].some(t => type.includes(t));
  };

  // 🛡️ REAL-TIME VALIDATION
  // Validate configuration whenever it changes
  useEffect(() => {
    if (!selectedTable || !xColumn) {
      setValidationError(null);
      return;
    }

    const validation = validateChartConfiguration({
      chartType,
      xColumn,
      yColumn,
      aggregation,
      isXNumeric: isNumeric(xColumn),
      isYNumeric: yColumn ? isNumeric(yColumn) : false,
      numericColumns
    });

    setValidationError(validation.isValid ? null : validation.error || null);
  }, [chartType, xColumn, yColumn, aggregation, selectedTable, numericColumns, colTypes]);

  const generatePlot = async () => {
    if (!selectedTable || !xColumn) {
      toast.error("Please select a table and X-Axis column");
      return;
    }

    // 🛡️ PRE-RENDER VALIDATION
    const validation = validateChartConfiguration({
      chartType,
      xColumn,
      yColumn,
      aggregation,
      isXNumeric: isNumeric(xColumn),
      isYNumeric: yColumn ? isNumeric(yColumn) : false,
      numericColumns
    });

    if (!validation.isValid) {
      toast.error("Invalid Configuration", {
        description: validation.error
      });
      return;
    }

    try {
      const directives: any[] = [];
      const table = vg.from(selectedTable);

      // --- 1. HANDLE COLOR DOMAIN MANUALLY ---
      // We fetch the distinct values for the color column first.
      // This allows us to force the chart AND our custom legend to match perfectly.
      if (colorColumn && chartType !== "heatmap") {
        try {
          const conn = await getConnection();
          // Get top 10 values for the legend
          const distinctResult = await conn.query(`
            SELECT DISTINCT "${colorColumn}" 
            FROM "${selectedTable}" 
            ORDER BY 1 
            LIMIT 10
          `);

          const domain = distinctResult.toArray().map((r: any) => String(Object.values(r.toJSON())[0]));

          // Generate Legend Items
          const items = domain.map((label: string, i: number) => ({
            label: label || "null",
            color: COLOR_PALETTE[i % COLOR_PALETTE.length]
          }));
          setLegendItems(items);

          // Force Chart to use this Domain
          directives.push(vg.colorDomain(domain));
          directives.push(vg.colorRange(COLOR_PALETTE));

        } catch (e) {
          console.warn("Could not fetch color domain", e);
        }
      } else {
        setLegendItems([]);
      }

      // --- 2. AGGREGATION LOGIC ---
      const getAgg = (col: string) => {
        if (aggregation === "count") return vg.count();
        if (!isNumeric(col) && aggregation !== "min" && aggregation !== "max") return vg.count();
        if (aggregation === "sum") return vg.sum(col);
        if (aggregation === "avg") return vg.avg(col);
        if (aggregation === "min") return vg.min(col);
        if (aggregation === "max") return vg.max(col);
        return vg.count();
      };

      // --- 3. CHART CONSTRUCTION ---
      if (chartType === "bar") {
        directives.push(vg.rectY(table, {
          x: xColumn,
          y: getAgg(yColumn),
          fill: colorColumn || "steelblue"
        }));
        directives.push(vg.xLabel(xColumn));
        directives.push(vg.yLabel(aggregation === "count" ? "Count" : `${aggregation}(${yColumn})`));
      }
      else if (chartType === "bar-h") {
        directives.push(vg.rectX(table, {
          y: xColumn,
          x: getAgg(yColumn),
          fill: colorColumn || "steelblue"
        }));
        directives.push(vg.yLabel(xColumn));
        directives.push(vg.xLabel(aggregation === "count" ? "Count" : `${aggregation}(${yColumn})`));
      }
      else if (chartType === "line") {
        directives.push(vg.lineY(table, {
          x: xColumn,
          y: getAgg(yColumn),
          stroke: colorColumn || "steelblue"
        }));
        directives.push(vg.xLabel(xColumn));
        directives.push(vg.yLabel(aggregation === "count" ? "Count" : `${aggregation}(${yColumn})`));
      }
      else if (chartType === "area") {
        directives.push(vg.areaY(table, {
          x: xColumn,
          y: getAgg(yColumn),
          fill: colorColumn || "steelblue",
          fillOpacity: 0.6
        }));
        directives.push(vg.xLabel(xColumn));
        directives.push(vg.yLabel(aggregation === "count" ? "Count" : `${aggregation}(${yColumn})`));
      }
      else if (chartType === "scatter") {
        if (!yColumn) throw new Error("Scatter plot requires a Y-Axis column");
        directives.push(vg.dot(table, {
          x: xColumn,
          y: yColumn,
          fill: colorColumn || "steelblue",
          r: 3,
          opacity: 0.6
        }));
        directives.push(vg.xLabel(xColumn));
        directives.push(vg.yLabel(yColumn));
      }
      else if (chartType === "heatmap") {
        if (!yColumn) throw new Error("Heatmap requires a Y-Axis column");
        const xDef = isNumeric(xColumn) ? vg.bin(xColumn) : xColumn;
        const yDef = isNumeric(yColumn) ? vg.bin(yColumn) : yColumn;
        directives.push(vg.rect(table, { x: xDef, y: yDef, fill: vg.count() }));
        directives.push(vg.xLabel(xColumn));
        directives.push(vg.yLabel(yColumn));
        directives.push(vg.colorLegend({ title: "Count" })); // Heatmap uses implicit density, this one is safe
      }
      else if (chartType === "tick") {
        directives.push(vg.tickX(table, {
          x: xColumn,
          stroke: colorColumn || "steelblue"
        }));
        directives.push(vg.xLabel(xColumn));
      }

      // --- 4. GLOBAL SETTINGS ---
      directives.push(vg.width(650));
      directives.push(vg.height(450));
      directives.push(vg.yGrid(true));
      directives.push(vg.marginLeft(50));
      directives.push(vg.marginBottom(40));

      const spec = vg.plot(...directives.filter(Boolean));
      setPlotSpec(spec);
      toast.success("Visualization Rendered");

    } catch (e: any) {
      log.error("Chart rendering error", e, { component: 'Visualization', metadata: { chartType, xColumn, yColumn } });
      const errorMsg = e.message || "Unknown error occurred";
      toast.error("Chart Rendering Failed", {
        description: `Unable to render ${chartType} chart: ${errorMsg}. Please check your data and try a different configuration.`
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      <Card className="w-80 h-full flex flex-col border-r shadow-none rounded-none border-t-0 border-b-0 border-l-0">
        <CardHeader className="border-b pb-4 bg-muted/10">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            Visual Config
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1. Dataset</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
              <option value="" disabled>Select Table...</option>
              {tables.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">2. Chart Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "bar", icon: BarChart3 }, { id: "bar-h", icon: BarChartHorizontal },
                { id: "line", icon: LineChart }, { id: "area", icon: AreaChart },
                { id: "scatter", icon: ScatterChart }, { id: "heatmap", icon: Grid3X3 },
                { id: "tick", icon: AlignJustify }
              ].map((type) => (
                <button key={type.id} onClick={() => setChartType(type.id as ChartType)}
                  className={cn("flex items-center justify-center p-2 rounded-md border hover:bg-accent", chartType === type.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground")}>
                  <type.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4 border-t pt-4 border-dashed">
            <div className="space-y-1.5">
              <span className="text-sm font-medium flex items-center gap-2"><MousePointer2 className="h-3.5 w-3.5" /> X-Axis</span>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={xColumn} onChange={(e) => setXColumn(e.target.value)} disabled={!selectedTable}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {!["scatter", "heatmap", "tick"].includes(chartType) && (
              <div className="space-y-1.5">
                <span className="text-sm font-medium flex items-center gap-2"><Calculator className="h-3.5 w-3.5" /> Aggregation</span>
                <div className="flex bg-muted p-1 rounded-md">
                  {["count", "sum", "avg"].map((agg) => (
                    <button key={agg} onClick={() => setAggregation(agg as Aggregation)}
                      className={cn("flex-1 text-[10px] py-1 rounded-sm capitalize", aggregation === agg ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>
                      {agg}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(aggregation !== "count" || ["scatter", "heatmap"].includes(chartType)) && (
              <div className="space-y-1.5">
                <span className="text-sm font-medium flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5" /> Y-Axis</span>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={yColumn} onChange={(e) => setYColumn(e.target.value)} disabled={!selectedTable}>
                  {numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1.5 pt-2">
              <span className="text-sm font-medium flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Color Group</span>
              <div className="flex gap-2">
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={colorColumn} onChange={(e) => setColorColumn(e.target.value)} disabled={!selectedTable}>
                  <option value="">None</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {colorColumn && <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setColorColumn("")}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </div>
          </div>

          {/* 🛡️ VALIDATION ERROR DISPLAY */}
          {validationError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-xs text-destructive font-medium">{validationError}</p>
            </div>
          )}

          <Button
            onClick={generatePlot}
            className="w-full mt-4"
            size="lg"
            disabled={!selectedTable || !!validationError}
          >
            Render
          </Button>
        </CardContent>
      </Card>

      <div className="flex-1 h-full flex flex-col p-6 gap-6 overflow-hidden">
        {/* Render Canvas */}
        <div className="flex-1 bg-card/50 rounded-xl border border-dashed flex items-center justify-center relative overflow-hidden">
          {plotSpec ? <MosaicPlot spec={plotSpec} /> : <div className="text-muted-foreground">Select data to visualize</div>}
        </div>

        {/* 🛡️ SAFE HTML LEGEND */}
        {legendItems.length > 0 && (
          <div className="h-32 bg-card border rounded-lg p-4 overflow-y-auto animate-in slide-in-from-bottom-4">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <List className="h-3 w-3" /> Legend: {colorColumn}
            </h4>
            <div className="flex flex-wrap gap-4">
              {legendItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}