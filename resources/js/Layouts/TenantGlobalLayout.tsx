import React from 'react';
import { Toaster } from "@Tenant/components/ui/toaster";
import { Toaster as Sonner } from "@Tenant/components/ui/sonner";
import { TooltipProvider } from "@Tenant/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@Tenant/hooks/useLanguage";

const queryClient = new QueryClient();

/**
 * ErrorBoundary — catches silent React crashes that produce a blank screen.
 */
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[TenantGlobalLayout] React Error:', error);
        console.error('[TenantGlobalLayout] Component Stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '32px',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                    <div style={{ fontSize: '48px' }}>⚠️</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Something went wrong</h1>
                    <p style={{ color: '#94a3b8', maxWidth: '400px', textAlign: 'center', fontSize: '14px' }}>
                        The application encountered an unexpected error. Please refresh the page or contact support.
                    </p>
                    <pre style={{
                        background: '#1e293b',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f87171',
                        maxWidth: '600px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                    }}>
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function TenantGlobalLayout({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        {children}
                    </TooltipProvider>
                </LanguageProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
