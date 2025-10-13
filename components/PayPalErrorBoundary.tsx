'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PayPalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error but don't crash the app
    console.warn('PayPal Error Boundary caught an error:', error);
    console.warn('Error info:', errorInfo);
    
    // Check if it's a DOM manipulation error
    if (error.message.includes('removeChild') || error.message.includes('Node')) {
      console.warn('PayPal DOM manipulation error caught and handled');
      // Don't re-throw, just log and continue
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-4 border border-yellow-500/20 rounded-lg bg-yellow-500/10 text-yellow-400 text-center">
          <div className="mb-2">
            <i className="fas fa-exclamation-triangle text-xl mb-2"></i>
            <h3 className="text-lg font-semibold mb-2">Payment System Temporarily Unavailable</h3>
            <p className="text-sm mb-4">
              We're experiencing a temporary issue with our payment system. Please try refreshing the page or use an alternative payment method.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
