import React from 'react';
import type { ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onReset: () => void;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught a critical render failure:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: 400, background: 'var(--bg-card)', padding: 32, borderRadius: 24, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          >
            <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px', color: 'var(--accent-danger)' }}>
              <AlertTriangle size={32} />
            </div>
            
            <h2 className="font-heading" style={{ fontSize: '1.4rem', margin: '0 0 12px', color: 'var(--text-main)' }}>App Recovered</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.5 }}>
              A fatal error occurred internally. We caught the crash to prevent data loss. You can safely return to the Hub.
              <br/><br/>
              <span style={{ fontSize: '0.75rem', opacity: 0.5, fontFamily: 'monospace' }}>{this.state.errorMsg}</span>
            </p>

            <button 
               onClick={() => {
                 this.setState({ hasError: false });
                 this.props.onReset();
               }}
               style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 16, fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
            >
              <Home size={20} /> RETURN TO HUB
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
