// src/components/LoadingFallback.tsx
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
    message?: string;
}

/**
 * Loading fallback component for Suspense boundaries
 */
export function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

/**
 * Full page loading fallback
 */
export function PageLoadingFallback({ message = 'Loading page...' }: LoadingFallbackProps) {
    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-base text-muted-foreground font-medium">{message}</p>
            </div>
        </div>
    );
}
