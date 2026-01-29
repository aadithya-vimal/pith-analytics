// src/components/visual/MosaicPlot.tsx
import { useEffect, useRef } from "react";
import * as vg from "@uwdata/vgplot";

interface MosaicPlotProps {
  spec: any; // The visualization specification (plot definition)
  className?: string;
}

export function MosaicPlot({ spec, className }: MosaicPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine if 'spec' is a Promise (some vgplot functions return promises)
    // or a direct DOM element
    const renderPlot = async () => {
      if (!containerRef.current) return;
      
      // Clear previous chart
      containerRef.current.innerHTML = "";
      
      try {
        // Render the plot
        const element = await spec;
        
        // Append to our div
        if (element instanceof Element) {
          containerRef.current.appendChild(element);
        } else if (element && element.value instanceof Element) {
           // Handle cases where it returns a reactive value wrapper
           containerRef.current.appendChild(element.value);
        }
      } catch (err) {
        console.error("Failed to render plot:", err);
        containerRef.current.innerHTML = `<div class="text-red-500 text-sm">Error rendering plot</div>`;
      }
    };

    renderPlot();
    
    // Cleanup is handled by DOM removal, but we clear ref on unmount
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [spec]);

  return <div ref={containerRef} className={className} />;
}