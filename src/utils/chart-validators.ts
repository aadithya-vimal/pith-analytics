// src/utils/chart-validators.ts

type ChartType = "bar" | "bar-h" | "line" | "area" | "scatter" | "heatmap" | "tick";
type Aggregation = "count" | "sum" | "avg" | "min" | "max";

interface ValidationConfig {
  chartType: ChartType;
  xColumn: string;
  yColumn: string;
  aggregation: Aggregation;
  isXNumeric: boolean;
  isYNumeric: boolean;
  numericColumns: string[];
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Checks if a chart type requires a Y-axis column
 */
export function requiresYAxis(chartType: ChartType): boolean {
  return ["scatter", "heatmap"].includes(chartType);
}

/**
 * Checks if a chart type requires numeric Y-axis
 */
export function requiresNumericY(chartType: ChartType, aggregation: Aggregation): boolean {
  // Scatter and heatmap always need numeric Y
  if (["scatter", "heatmap"].includes(chartType)) {
    return true;
  }
  
  // For aggregated charts, numeric Y is required for sum/avg
  if (["sum", "avg"].includes(aggregation)) {
    return true;
  }
  
  return false;
}

/**
 * Main validation function that checks if the current chart configuration is valid
 */
export function validateChartConfiguration(config: ValidationConfig): ValidationResult {
  const { chartType, xColumn, yColumn, aggregation, isYNumeric, numericColumns } = config;

  // Check if table and X column are selected
  if (!xColumn) {
    return {
      isValid: false,
      error: "Please select an X-axis column"
    };
  }

  // Check if Y-axis is required but not provided
  if (requiresYAxis(chartType) && !yColumn) {
    return {
      isValid: false,
      error: `${getChartTypeName(chartType)} requires a Y-axis column`
    };
  }

  // Check if numeric Y is required but not provided
  if (requiresNumericY(chartType, aggregation)) {
    if (!yColumn) {
      return {
        isValid: false,
        error: `${getChartTypeName(chartType)} with ${aggregation} aggregation requires a Y-axis column`
      };
    }
    
    if (!isYNumeric) {
      return {
        isValid: false,
        error: `${getChartTypeName(chartType)} requires a numeric Y-axis column. Please select from: ${numericColumns.join(", ") || "none available"}`
      };
    }
  }

  // For aggregations that need numeric columns (sum, avg)
  if (["sum", "avg"].includes(aggregation) && yColumn && !isYNumeric) {
    return {
      isValid: false,
      error: `${aggregation.toUpperCase()} aggregation requires a numeric column. Available numeric columns: ${numericColumns.join(", ") || "none available"}`
    };
  }

  // Heatmap specific validation
  if (chartType === "heatmap" && !yColumn) {
    return {
      isValid: false,
      error: "Heatmap requires both X and Y axis columns"
    };
  }

  // All validations passed
  return { isValid: true };
}

/**
 * Get user-friendly chart type name
 */
function getChartTypeName(chartType: ChartType): string {
  const names: Record<ChartType, string> = {
    "bar": "Bar Chart",
    "bar-h": "Horizontal Bar Chart",
    "line": "Line Chart",
    "area": "Area Chart",
    "scatter": "Scatter Plot",
    "heatmap": "Heatmap",
    "tick": "Tick Plot"
  };
  return names[chartType] || chartType;
}

/**
 * Get validation error message for display
 */
export function getValidationError(config: ValidationConfig): string | null {
  const result = validateChartConfiguration(config);
  return result.error || null;
}
