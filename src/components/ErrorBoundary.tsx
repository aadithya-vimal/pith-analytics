// src/components/ErrorBoundary.tsx
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { log } from '@/utils/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error details
        log.error('React Error Boundary caught an error', error, {
            component: 'ErrorBoundary',
            metadata: {
                componentStack: errorInfo.componentStack,
            },
        });

        // Update state with error details
        this.setState({
            error,
            errorInfo,
        });

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <Card className="max-w-2xl w-full border-destructive/50">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-destructive/10 rounded-full">
                                    <AlertTriangle className="h-12 w-12 text-destructive" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
                            <CardDescription className="text-base">
                                The application encountered an unexpected error. This has been logged for investigation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Error Details (only in development) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground">Error Details:</h3>
                                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-40">
                                        <code className="text-xs text-destructive font-mono">
                                            {this.state.error.toString()}
                                        </code>
                                    </div>
                                    {this.state.errorInfo && (
                                        <details className="text-xs">
                                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                Component Stack
                                            </summary>
                                            <pre className="mt-2 bg-muted p-2 rounded text-[10px] overflow-auto max-h-32">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-center">
                                <Button onClick={this.handleReset} variant="default" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>

                            {/* Help Text */}
                            <p className="text-xs text-center text-muted-foreground">
                                If this problem persists, try refreshing the page or clearing your browser cache.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-based wrapper for functional components
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
): React.FC<P> {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
