'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SFX } from '@/lib/sfx';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable class-based Error Boundary that wraps critical mission-zone components.
 * Prevents a single rendering fault from crashing the entire live event interface.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SensitiveComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[GRSS ErrorBoundary]', error, info.componentStack);
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    SFX.click();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="center-col"
          style={{ minHeight: '100dvh', background: 'var(--bg)', position: 'relative', zIndex: 10 }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="card card-danger t-center"
            style={{ maxWidth: 420, width: '90%', border: '1px solid rgba(255, 45, 85, 0.4)' }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>⚠️</div>
            <h2 className="font-orb t-danger" style={{ fontSize: '1.4rem', marginBottom: 12 }}>
              SYSTEM MALFUNCTION
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.7 }}>
              An unhandled error occurred in the GRSS platform interface.
              {this.state.error?.message && (
                <><br /><code style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{this.state.error.message}</code></>
              )}
            </p>
            <motion.button
              className="btn btn-danger btn-full"
              onClick={this.handleReset}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              RE-INITIALIZE
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
