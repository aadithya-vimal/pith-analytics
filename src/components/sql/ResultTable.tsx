// src/components/sql/ResultTable.tsx
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface ResultTableProps {
  data: any[];
  columns: string[];
}

export function ResultTable({ data, columns }: ResultTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // The Virtualizer Logic
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // Approximate row height in pixels
    overscan: 5,
  });

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No results to display
      </div>
    );
  }

  return (
    <div 
      ref={parentRef} 
      className="h-full w-full overflow-auto border rounded-md bg-card"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex bg-muted border-b font-medium text-xs text-muted-foreground uppercase tracking-wider">
            {columns.map((col, i) => (
                <div 
                    key={col} 
                    className="flex-1 px-4 py-2 truncate border-r last:border-r-0"
                    style={{ minWidth: '150px' }}
                >
                    {col}
                </div>
            ))}
        </div>

        {/* Virtual Rows */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = data[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className={cn(
                "absolute top-0 left-0 w-full flex items-center text-sm hover:bg-muted/50 transition-colors",
                virtualRow.index % 2 === 0 ? "bg-background" : "bg-muted/10"
              )}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
                {columns.map((col, i) => (
                    <div 
                        key={`${virtualRow.index}-${col}`} 
                        className="flex-1 px-4 truncate border-r border-border/50 last:border-r-0"
                        style={{ minWidth: '150px' }}
                    >
                        {String(row[col])}
                    </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}