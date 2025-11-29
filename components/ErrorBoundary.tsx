'use client'

import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ERROR BOUNDARY] Caught error:', error, errorInfo);
        // TODO: Send to error tracking service (Sentry, etc.)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black">
                    <div className="text-center max-w-md p-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-mono-60 mb-6">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>

                        {this.state.error && (
                            <details className="text-left mb-6 bg-white/5 rounded-lg p-4">
                                <summary className="cursor-pointer text-sm text-mono-60 mb-2">
                                    Error details
                                </summary>
                                <pre className="text-xs text-red-400 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-mono-20 transition-colors"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
